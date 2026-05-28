import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cookieParser from 'cookie-parser';
import pool from './db.js';
import authRouter, { requireAuth } from './auth.js';
import adminRouter from './admin.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3001;

// ── Auth & Admin ──────────────────────────────────────────────

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

// ── Serializers ───────────────────────────────────────────────

function toProject(r) {
  return { id: r.id, name: r.name, desc: r.description, color: r.color, status: r.status, due: r.due };
}

function toTask(r) {
  return {
    id: r.id, title: r.title, desc: r.description,
    status: r.status, priority: r.priority,
    project: r.project_id,
    due: r.due, tags: r.tags ?? [], subtasks: r.subtasks ?? null, comments: r.comments,
  };
}

// ── Error wrapper ─────────────────────────────────────────────

const wrap = (fn) => async (req, res) => {
  try { await fn(req, res); } catch (e) { res.status(500).json({ error: e.message }); }
};

// ── Projects ──────────────────────────────────────────────────

app.get('/api/projects', requireAuth, wrap(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM projects WHERE user_id=$1 ORDER BY created_at', [req.userId],
  );
  res.json(rows.map(toProject));
}));

app.post('/api/projects', requireAuth, wrap(async (req, res) => {
  const { name, desc = '', color = 'oklch(72% 0.13 285)', status = 'activo', due = '—' } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO projects (user_id,name,description,color,status,due) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [req.userId, name, desc, color, status, due],
  );
  res.status(201).json(toProject(rows[0]));
}));

app.put('/api/projects/:id', requireAuth, wrap(async (req, res) => {
  const MAP = { name: 'name', desc: 'description', color: 'color', status: 'status', due: 'due' };
  const { sets, vals } = buildUpdate(MAP, req.body);
  if (!sets.length) return res.status(400).json({ error: 'No fields' });
  vals.push(req.userId, req.params.id);
  const { rows } = await pool.query(
    `UPDATE projects SET ${sets.join(',')} WHERE user_id=$${vals.length - 1} AND id=$${vals.length} RETURNING *`,
    vals,
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(toProject(rows[0]));
}));

app.delete('/api/projects/:id', requireAuth, wrap(async (req, res) => {
  await pool.query('DELETE FROM projects WHERE user_id=$1 AND id=$2', [req.userId, req.params.id]);
  res.status(204).end();
}));

// ── Tasks ─────────────────────────────────────────────────────

app.get('/api/tasks', requireAuth, wrap(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM tasks WHERE user_id=$1 ORDER BY created_at', [req.userId],
  );
  res.json(rows.map(toTask));
}));

app.post('/api/tasks', requireAuth, wrap(async (req, res) => {
  const {
    title, desc = '', status = 'new', priority = 'med',
    project = null, due = '—', tags = [], subtasks = null, comments = 0,
  } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO tasks (user_id,title,description,status,priority,project_id,due,tags,subtasks,comments)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [req.userId, title, desc, status, priority, project || null, due, tags, subtasks, comments],
  );
  res.status(201).json(toTask(rows[0]));
}));

app.put('/api/tasks/:id', requireAuth, wrap(async (req, res) => {
  const MAP = {
    title: 'title', desc: 'description', status: 'status', priority: 'priority',
    project: 'project_id', due: 'due', tags: 'tags', subtasks: 'subtasks', comments: 'comments',
  };
  const body = { ...req.body };
  if ('project' in body) body.project = body.project || null;
  const { sets, vals } = buildUpdate(MAP, body);
  if (!sets.length) return res.status(400).json({ error: 'No fields' });
  vals.push(req.userId, req.params.id);
  const { rows } = await pool.query(
    `UPDATE tasks SET ${sets.join(',')} WHERE user_id=$${vals.length - 1} AND id=$${vals.length} RETURNING *`,
    vals,
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(toTask(rows[0]));
}));

app.delete('/api/tasks/:id', requireAuth, wrap(async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE user_id=$1 AND id=$2', [req.userId, req.params.id]);
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
app.get('*', (_req, res) => res.sendFile(join(__dirname, '../dist/index.html')));

// ── Start ─────────────────────────────────────────────────────

app.listen(PORT, () => console.log(`API  →  http://localhost:${PORT}/api`));
