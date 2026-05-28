import 'dotenv/config';
import express from 'express';
import pool from './db.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ── Serializers ───────────────────────────────────────────────

function toProject(r) {
  return { id: r.id, name: r.name, desc: r.desc, color: r.color, status: r.status, due: r.due };
}

function toTask(r) {
  return {
    id: r.id, title: r.title, desc: r.desc,
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

app.get('/api/projects', wrap(async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM projects ORDER BY created_at');
  res.json(rows.map(toProject));
}));

app.post('/api/projects', wrap(async (req, res) => {
  const { name, desc = '', color = 'oklch(72% 0.13 285)', status = 'activo', due = '—' } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO projects (name, desc, color, status, due) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [name, desc, color, status, due],
  );
  res.status(201).json(toProject(rows[0]));
}));

app.put('/api/projects/:id', wrap(async (req, res) => {
  const MAP = { name: 'name', desc: 'desc', color: 'color', status: 'status', due: 'due' };
  const { sets, vals } = buildUpdate(MAP, req.body);
  if (!sets.length) return res.status(400).json({ error: 'No fields' });
  vals.push(req.params.id);
  const { rows } = await pool.query(
    `UPDATE projects SET ${sets.join(',')} WHERE id=$${vals.length} RETURNING *`, vals,
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(toProject(rows[0]));
}));

app.delete('/api/projects/:id', wrap(async (req, res) => {
  await pool.query('DELETE FROM projects WHERE id=$1', [req.params.id]);
  res.status(204).end();
}));

// ── Tasks ─────────────────────────────────────────────────────

app.get('/api/tasks', wrap(async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM tasks ORDER BY created_at');
  res.json(rows.map(toTask));
}));

app.post('/api/tasks', wrap(async (req, res) => {
  const {
    title, desc = '', status = 'new', priority = 'med',
    project = null, due = '—', tags = [], subtasks = null, comments = 0,
  } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO tasks (title, desc, status, priority, project_id, due, tags, subtasks, comments)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [title, desc, status, priority, project || null, due, tags, subtasks, comments],
  );
  res.status(201).json(toTask(rows[0]));
}));

app.put('/api/tasks/:id', wrap(async (req, res) => {
  const MAP = {
    title: 'title', desc: 'desc', status: 'status', priority: 'priority',
    project: 'project_id', due: 'due', tags: 'tags', subtasks: 'subtasks', comments: 'comments',
  };
  const body = { ...req.body };
  if ('project' in body) body.project = body.project || null;
  const { sets, vals } = buildUpdate(MAP, body);
  if (!sets.length) return res.status(400).json({ error: 'No fields' });
  vals.push(req.params.id);
  const { rows } = await pool.query(
    `UPDATE tasks SET ${sets.join(',')} WHERE id=$${vals.length} RETURNING *`, vals,
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(toTask(rows[0]));
}));

app.delete('/api/tasks/:id', wrap(async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
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

// ── Start ─────────────────────────────────────────────────────

app.listen(PORT, () => console.log(`API  →  http://localhost:${PORT}/api`));
