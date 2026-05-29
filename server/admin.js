import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import pool from './db.js';
import { JWT_SECRET, COOKIE_OPTS } from './auth.js';

const router = Router();
const wrap = (fn) => async (req, res) => {
  try { await fn(req, res); } catch (e) { res.status(500).json({ error: e.message }); }
};

// ── requireAdmin middleware ───────────────────────────────────

export async function requireAdmin(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'No autenticado' });
  let userId;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    userId = payload.sub;
  } catch {
    return res.status(401).json({ error: 'Sesión expirada' });
  }
  try {
    const { rows } = await pool.query('SELECT id, role, is_active FROM users WHERE id=$1', [userId]);
    if (!rows.length || !rows[0].is_active)
      return res.status(401).json({ error: 'Cuenta suspendida o eliminada' });
    if (rows[0].role !== 'admin')
      return res.status(403).json({ error: 'Se requieren permisos de administrador' });
    req.userId = userId;
    next();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ── Audit helper ─────────────────────────────────────────────

async function audit(actorId, actorName, action, targetId, targetName, meta = null) {
  await pool.query(
    'INSERT INTO audit_log (actor_id,actor_name,action,target_id,target_name,meta) VALUES ($1,$2,$3,$4,$5,$6)',
    [actorId, actorName, action, targetId ?? null, targetName ?? null, meta ? JSON.stringify(meta) : null],
  );
}

// ── Stats ─────────────────────────────────────────────────────

router.get('/stats', requireAdmin, wrap(async (_req, res) => {
  const { rows: [s] } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users)                                              AS total_users,
      (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days') AS new_week,
      (SELECT COUNT(*) FROM users WHERE is_active = false)                      AS suspended,
      (SELECT COUNT(*) FROM users WHERE role = 'admin')                         AS admins,
      (SELECT COUNT(*) FROM tasks)                                              AS total_tasks,
      (SELECT COUNT(*) FROM projects)                                           AS total_projects
  `);
  res.json({
    totalUsers: Number(s.total_users),
    newWeek: Number(s.new_week),
    suspended: Number(s.suspended),
    admins: Number(s.admins),
    totalTasks: Number(s.total_tasks),
    totalProjects: Number(s.total_projects),
  });
}));

// ── Users ─────────────────────────────────────────────────────

router.get('/users', requireAdmin, wrap(async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT u.id, u.name, u.email, u.role, u.is_active, u.avatar_color, u.created_at,
      (SELECT COUNT(*) FROM tasks   WHERE user_id = u.id)::int AS task_count,
      (SELECT COUNT(*) FROM projects WHERE user_id = u.id)::int AS project_count
    FROM users u
    ORDER BY u.created_at ASC
  `);
  res.json(rows.map((r) => ({
    id: r.id, name: r.name, email: r.email, role: r.role,
    isActive: r.is_active, avatarColor: r.avatar_color,
    createdAt: r.created_at, taskCount: r.task_count, projectCount: r.project_count,
  })));
}));

// PUT /api/admin/users/:id — update role, is_active, name, email
router.put('/users/:id', requireAdmin, wrap(async (req, res) => {
  const targetId = Number(req.params.id);
  const actorId = req.userId;

  // Get actor name for audit log
  const { rows: [actor] } = await pool.query('SELECT name FROM users WHERE id=$1', [actorId]);

  // Prevent admin from changing own role or own active status
  if (targetId === actorId && ('role' in req.body || 'isActive' in req.body))
    return res.status(400).json({ error: 'No puedes cambiar tu propio rol o estado desde el panel de admin' });

  const { name, email, role, isActive, password } = req.body;
  const sets = [], vals = [];
  let i = 1;

  if (name?.trim())      { sets.push(`name=$${i++}`);      vals.push(name.trim()); }
  if (email)             { sets.push(`email=$${i++}`);     vals.push(email.toLowerCase()); }
  if (role !== undefined) {
    if (!['user', 'admin'].includes(role))
      return res.status(400).json({ error: 'Rol inválido' });
    sets.push(`role=$${i++}`); vals.push(role);
  }
  if (isActive !== undefined) { sets.push(`is_active=$${i++}`); vals.push(Boolean(isActive)); }
  if (password) {
    if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    const hash = await bcrypt.hash(password, 10);
    sets.push(`password_hash=$${i++}`); vals.push(hash);
    sets.push(`must_change_password=$${i++}`); vals.push(false);
  }

  if (!sets.length) return res.status(400).json({ error: 'Sin cambios' });

  vals.push(targetId);
  const { rows } = await pool.query(
    `UPDATE users SET ${sets.join(',')} WHERE id=$${i} RETURNING *`, vals,
  );
  if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });

  const updated = rows[0];

  // Audit
  if ('role' in req.body)
    await audit(actorId, actor.name, `role.set_${role}`, targetId, updated.name, { role });
  else if ('isActive' in req.body)
    await audit(actorId, actor.name, isActive ? 'user.activate' : 'user.suspend', targetId, updated.name);
  else
    await audit(actorId, actor.name, 'user.update', targetId, updated.name);

  res.json({
    id: updated.id, name: updated.name, email: updated.email,
    role: updated.role, isActive: updated.is_active, avatarColor: updated.avatar_color,
  });
}));

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAdmin, wrap(async (req, res) => {
  const targetId = Number(req.params.id);
  const actorId = req.userId;

  if (targetId === actorId)
    return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta desde el panel de admin' });

  const { rows: [actor] } = await pool.query('SELECT name FROM users WHERE id=$1', [actorId]);
  const { rows: [target] } = await pool.query('SELECT name FROM users WHERE id=$1', [targetId]);
  if (!target) return res.status(404).json({ error: 'Usuario no encontrado' });

  await pool.query('DELETE FROM users WHERE id=$1', [targetId]);
  await audit(actorId, actor.name, 'user.delete', targetId, target.name);
  res.status(204).end();
}));

// POST /api/admin/users — create user directly (admin flow)
router.post('/users', requireAdmin, wrap(async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  if (!name?.trim() || !email || !password)
    return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
  if (password.length < 6)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  if (!['user', 'admin'].includes(role))
    return res.status(400).json({ error: 'Rol inválido' });

  const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()]);
  if (exists.rows.length)
    return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });

  const { rows: [actor] } = await pool.query('SELECT name FROM users WHERE id=$1', [req.userId]);
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO users (name,email,password_hash,role,must_change_password) VALUES ($1,$2,$3,$4,true) RETURNING *',
    [name.trim(), email.toLowerCase(), hash, role],
  );
  await audit(req.userId, actor.name, 'user.create', rows[0].id, rows[0].name, { role });
  res.status(201).json({
    id: rows[0].id, name: rows[0].name, email: rows[0].email,
    role: rows[0].role, isActive: rows[0].is_active, avatarColor: rows[0].avatar_color,
    createdAt: rows[0].created_at, taskCount: 0, projectCount: 0,
  });
}));

// ── Audit log ─────────────────────────────────────────────────

router.get('/audit', requireAdmin, wrap(async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 200',
  );
  res.json(rows.map((r) => ({
    id: r.id,
    actorId: r.actor_id,
    actorName: r.actor_name,
    action: r.action,
    targetId: r.target_id,
    targetName: r.target_name,
    meta: r.meta,
    createdAt: r.created_at,
  })));
}));

export default router;
