import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cookieParser from 'cookie-parser';
import pool from './db.js';
import { migrate } from './migrate.js';
import authRouter, { requireAuth } from './auth.js';
import adminRouter from './admin.js';
import groupsRouter from './groups.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3001;

// ── Auth, Admin & Groups ──────────────────────────────────────

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/groups', groupsRouter);

// ── User search ───────────────────────────────────────────────

app.get('/api/users', requireAuth, wrap(async (req, res) => {
  const q = (req.query.q || '').trim();
  const { rows } = await pool.query(
    `SELECT id, name, email, avatar_color FROM users
     WHERE is_active = true AND id != $1
       AND (name ILIKE $2 OR email ILIKE $2)
     ORDER BY name LIMIT 10`,
    [req.userId, `%${q}%`],
  );
  res.json(rows.map((r) => ({ id: r.id, name: r.name, email: r.email, avatarColor: r.avatar_color })));
}));

// ── Serializers ───────────────────────────────────────────────

function toProject(r) {
  return {
    id: r.id, name: r.name, desc: r.description,
    color: r.color, status: r.status, due: r.due,
    role: r.my_role,
  };
}

function toTask(r) {
  return {
    id: r.id, title: r.title, desc: r.description,
    status: r.status, priority: r.priority,
    project: r.project_id,
    due: r.due, tags: r.tags ?? [],
    subtasks: Array.isArray(r.subtasks) ? r.subtasks : null,
    comments: Array.isArray(r.comments) ? r.comments : [],
    assignedTo: r.assigned_to ? { id: r.assigned_to, name: r.au_name, color: r.au_color } : null,
  };
}

// ── Error wrapper ─────────────────────────────────────────────

function wrap(fn) {
  return async (req, res) => {
    try { await fn(req, res); } catch (e) { res.status(500).json({ error: e.message }); }
  };
}

// ── Helper: fetch single task with assignee ───────────────────

async function fetchTask(id) {
  const { rows } = await pool.query(
    `SELECT t.*, au.name AS au_name, au.avatar_color AS au_color
     FROM tasks t LEFT JOIN users au ON au.id = t.assigned_to
     WHERE t.id = $1`,
    [id],
  );
  return rows[0] ? toTask(rows[0]) : null;
}

// ── Helper: check project role ────────────────────────────────

async function getProjectRole(projectId, userId) {
  const { rows } = await pool.query(
    `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
    [projectId, userId],
  );
  return rows[0]?.role || null;
}

// ── Projects ──────────────────────────────────────────────────

app.get('/api/projects', requireAuth, wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT p.*, pm.role AS my_role
     FROM projects p
     JOIN project_members pm ON p.id = pm.project_id
     WHERE pm.user_id = $1
     ORDER BY p.created_at`,
    [req.userId],
  );
  res.json(rows.map(toProject));
}));

app.post('/api/projects', requireAuth, wrap(async (req, res) => {
  const { name, desc = '', color = 'oklch(72% 0.13 285)', status = 'activo', due = '—' } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'INSERT INTO projects (user_id,name,description,color,status,due) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.userId, name, desc, color, status, due],
    );
    const proj = rows[0];
    await client.query(
      `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'owner')`,
      [proj.id, req.userId],
    );
    await client.query('COMMIT');
    res.status(201).json({ ...toProject(proj), role: 'owner' });
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}));

app.put('/api/projects/:id', requireAuth, wrap(async (req, res) => {
  const MAP = { name: 'name', desc: 'description', color: 'color', status: 'status', due: 'due' };
  const { sets, vals } = buildUpdate(MAP, req.body);
  if (!sets.length) return res.status(400).json({ error: 'No fields' });
  vals.push(req.userId, req.params.id);
  const uIdx = vals.length - 1;
  const pIdx = vals.length;
  const { rows } = await pool.query(
    `UPDATE projects SET ${sets.join(',')}
     WHERE id=$${pIdx} AND EXISTS (
       SELECT 1 FROM project_members WHERE project_id=$${pIdx} AND user_id=$${uIdx} AND role='owner'
     ) RETURNING *`,
    vals,
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found or not authorized' });
  const role = await getProjectRole(req.params.id, req.userId);
  res.json({ ...toProject(rows[0]), role });
}));

app.delete('/api/projects/:id', requireAuth, wrap(async (req, res) => {
  const { rowCount } = await pool.query(
    `DELETE FROM projects WHERE id=$1 AND EXISTS (
       SELECT 1 FROM project_members WHERE project_id=$1 AND user_id=$2 AND role='owner'
     )`,
    [req.params.id, req.userId],
  );
  if (!rowCount) return res.status(403).json({ error: 'Not authorized or not found' });
  res.status(204).end();
}));

// ── Project Members ────────────────────────────────────────────

app.get('/api/projects/:id/members', requireAuth, wrap(async (req, res) => {
  const myRole = await getProjectRole(req.params.id, req.userId);
  if (!myRole) return res.status(403).json({ error: 'Not a member' });
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.avatar_color, pm.role
     FROM project_members pm JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = $1
     ORDER BY pm.role DESC, u.name`,
    [req.params.id],
  );
  res.json(rows.map((r) => ({ id: r.id, name: r.name, email: r.email, avatarColor: r.avatar_color, role: r.role })));
}));

app.post('/api/projects/:id/members', requireAuth, wrap(async (req, res) => {
  const myRole = await getProjectRole(req.params.id, req.userId);
  if (myRole !== 'owner') return res.status(403).json({ error: 'Not authorized' });
  const { email, groupId, role = 'viewer' } = req.body;
  if (!['editor', 'viewer'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

  if (groupId) {
    const { rows: members } = await pool.query(
      `SELECT u.id FROM group_members gm JOIN users u ON u.id = gm.user_id
       WHERE gm.group_id = $1 AND u.is_active = true`,
      [groupId],
    );
    for (const m of members) {
      await pool.query(
        `INSERT INTO project_members (project_id, user_id, role, invited_by)
         VALUES ($1, $2, $3, $4) ON CONFLICT (project_id, user_id) DO NOTHING`,
        [req.params.id, m.id, role, req.userId],
      );
    }
    return res.status(201).json({ added: members.length });
  }

  const { rows: users } = await pool.query(
    `SELECT id, name, email, avatar_color FROM users WHERE LOWER(email) = LOWER($1) AND is_active = true`,
    [email?.trim()],
  );
  if (!users.length) return res.status(404).json({ error: 'Usuario no encontrado' });
  const user = users[0];
  await pool.query(
    `INSERT INTO project_members (project_id, user_id, role, invited_by)
     VALUES ($1, $2, $3, $4) ON CONFLICT (project_id, user_id) DO UPDATE SET role = $3`,
    [req.params.id, user.id, role, req.userId],
  );
  res.status(201).json({ id: user.id, name: user.name, email: user.email, avatarColor: user.avatar_color, role });
}));

app.put('/api/projects/:id/members/:userId', requireAuth, wrap(async (req, res) => {
  const myRole = await getProjectRole(req.params.id, req.userId);
  if (myRole !== 'owner') return res.status(403).json({ error: 'Not authorized' });
  const { role } = req.body;
  if (!['owner', 'editor', 'viewer'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  await pool.query(
    `UPDATE project_members SET role = $1 WHERE project_id = $2 AND user_id = $3`,
    [role, req.params.id, req.params.userId],
  );
  res.json({ role });
}));

app.delete('/api/projects/:id/members/:userId', requireAuth, wrap(async (req, res) => {
  const myRole = await getProjectRole(req.params.id, req.userId);
  const targetId = parseInt(req.params.userId);
  if (targetId !== req.userId && myRole !== 'owner')
    return res.status(403).json({ error: 'Not authorized' });
  if (targetId === req.userId && myRole === 'owner') {
    const { rows } = await pool.query(
      `SELECT 1 FROM project_members WHERE project_id=$1 AND role='owner' AND user_id!=$2`,
      [req.params.id, req.userId],
    );
    if (!rows.length) return res.status(400).json({ error: 'No puedes salir: eres el único propietario' });
  }
  await pool.query(
    `DELETE FROM project_members WHERE project_id=$1 AND user_id=$2`,
    [req.params.id, targetId],
  );
  res.status(204).end();
}));

// ── Tasks ─────────────────────────────────────────────────────

app.get('/api/tasks', requireAuth, wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT DISTINCT t.*, au.name AS au_name, au.avatar_color AS au_color
     FROM tasks t
     LEFT JOIN users au ON au.id = t.assigned_to
     LEFT JOIN project_members pm ON t.project_id = pm.project_id AND pm.user_id = $1
     WHERE t.user_id = $1 OR (t.project_id IS NOT NULL AND pm.user_id IS NOT NULL)
     ORDER BY t.created_at`,
    [req.userId],
  );
  res.json(rows.map(toTask));
}));

app.post('/api/tasks', requireAuth, wrap(async (req, res) => {
  const {
    title, desc = '', status = 'new', priority = 'med',
    project = null, due = '—', tags = [], subtasks = null, comments = [],
    assignedTo = null,
  } = req.body;

  if (project) {
    const role = await getProjectRole(project, req.userId);
    if (!role || !['owner', 'editor'].includes(role))
      return res.status(403).json({ error: 'No tienes acceso para crear tareas en este proyecto' });
  }

  const { rows } = await pool.query(
    `INSERT INTO tasks (user_id,title,description,status,priority,project_id,due,tags,subtasks,comments,assigned_to)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
    [req.userId, title, desc, status, priority, project || null, due, tags,
     subtasks !== null ? JSON.stringify(subtasks) : null,
     JSON.stringify(Array.isArray(comments) ? comments : []),
     assignedTo || null],
  );
  const task = await fetchTask(rows[0].id);
  res.status(201).json(task);
}));

app.put('/api/tasks/:id', requireAuth, wrap(async (req, res) => {
  const MAP = {
    title: 'title', desc: 'description', status: 'status', priority: 'priority',
    project: 'project_id', due: 'due', tags: 'tags', subtasks: 'subtasks',
    comments: 'comments', assignedTo: 'assigned_to',
  };
  const body = { ...req.body };
  if ('project' in body) body.project = body.project || null;
  if ('assignedTo' in body) body.assignedTo = body.assignedTo || null;
  if ('subtasks' in body && body.subtasks !== null) body.subtasks = JSON.stringify(body.subtasks);
  if ('comments' in body && Array.isArray(body.comments)) body.comments = JSON.stringify(body.comments);
  const { sets, vals } = buildUpdate(MAP, body);
  if (!sets.length) return res.status(400).json({ error: 'No fields' });
  vals.push(req.userId, req.params.id);
  const uIdx = vals.length - 1;
  const tIdx = vals.length;
  const { rows } = await pool.query(
    `UPDATE tasks SET ${sets.join(',')}
     WHERE id=$${tIdx} AND (
       user_id=$${uIdx}
       OR EXISTS (
         SELECT 1 FROM project_members pm
         WHERE pm.project_id = tasks.project_id
           AND pm.user_id = $${uIdx}
           AND pm.role IN ('owner','editor')
       )
     ) RETURNING id`,
    vals,
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found or not authorized' });
  const task = await fetchTask(rows[0].id);
  res.json(task);
}));

app.delete('/api/tasks/:id', requireAuth, wrap(async (req, res) => {
  const { rowCount } = await pool.query(
    `DELETE FROM tasks
     WHERE id=$1 AND (
       user_id=$2
       OR EXISTS (
         SELECT 1 FROM project_members pm
         WHERE pm.project_id = tasks.project_id
           AND pm.user_id = $2
           AND pm.role IN ('owner','editor')
       )
     )`,
    [req.params.id, req.userId],
  );
  if (!rowCount) return res.status(403).json({ error: 'Not authorized or not found' });
  res.status(204).end();
}));

// ── Helpers ───────────────────────────────────────────────────

function buildUpdate(map, body) {
  const sets = [], vals = [];
  let i = 1;
  for (const [k, col] of Object.entries(map)) {
    if (k in body) { sets.push(`${col}=$${i++}`); vals.push(body[k]); }
  }
  return { sets, vals };
}

// ── Static (production) ───────────────────────────────────────

app.use(express.static(join(__dirname, '../dist')));
app.get('/{*path}', (_req, res) => res.sendFile(join(__dirname, '../dist/index.html')));

// ── Start ─────────────────────────────────────────────────────

migrate()
  .then(() => app.listen(PORT, () => console.log(`API  →  http://localhost:${PORT}/api`)))
  .catch((e) => { console.error('Migration failed:', e.message); process.exit(1); });
