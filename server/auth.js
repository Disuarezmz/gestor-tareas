import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import pool from './db.js';

const router = Router();
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';
export const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function sign(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}

function toUser(r) {
  return {
    id: r.id, name: r.name, email: r.email,
    avatarColor: r.avatar_color, role: r.role, isActive: r.is_active,
    mustChangePassword: r.must_change_password,
  };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email || !password)
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    if (password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()]);
    if (exists.rows.length)
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });

    // First registered user becomes admin
    const { rows: [{ count }] } = await pool.query('SELECT COUNT(*) FROM users');
    const role = count === '0' ? 'admin' : 'user';

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING *',
      [name.trim(), email.toLowerCase(), hash, role],
    );
    res.cookie('token', sign(rows[0].id), COOKIE_OPTS);
    res.status(201).json(toUser(rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });

    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email.toLowerCase()]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash)))
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });

    if (!rows[0].is_active)
      return res.status(403).json({ error: 'Tu cuenta está suspendida. Contacta con el administrador.' });

    res.cookie('token', sign(rows[0].id), COOKIE_OPTS);
    res.json(toUser(rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token', COOKIE_OPTS);
  res.status(204).end();
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id=$1', [req.userId]);
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(toUser(rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/auth/me
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const sets = [], vals = [];
    let i = 1;
    if (name?.trim()) { sets.push(`name=$${i++}`); vals.push(name.trim()); }
    if (email) {
      const dup = await pool.query('SELECT id FROM users WHERE email=$1 AND id!=$2', [email.toLowerCase(), req.userId]);
      if (dup.rows.length) return res.status(409).json({ error: 'Ese email ya está en uso' });
      sets.push(`email=$${i++}`); vals.push(email.toLowerCase());
    }
    if (!sets.length) return res.status(400).json({ error: 'Sin cambios' });
    vals.push(req.userId);
    const { rows } = await pool.query(
      `UPDATE users SET ${sets.join(',')} WHERE id=$${i} RETURNING *`, vals,
    );
    res.json(toUser(rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/auth/me/force-password — first-login forced change, no current password needed
router.put('/me/force-password', requireAuth, async (req, res) => {
  try {
    const { next } = req.body;
    if (!next) return res.status(400).json({ error: 'Falta la nueva contraseña' });
    if (next.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    const { rows } = await pool.query('SELECT must_change_password FROM users WHERE id=$1', [req.userId]);
    if (!rows.length || !rows[0].must_change_password)
      return res.status(403).json({ error: 'No se requiere cambio de contraseña' });

    const hash = await bcrypt.hash(next, 10);
    const { rows: updated } = await pool.query(
      'UPDATE users SET password_hash=$1, must_change_password=false WHERE id=$2 RETURNING *',
      [hash, req.userId],
    );
    res.json(toUser(updated[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/auth/me/password
router.put('/me/password', requireAuth, async (req, res) => {
  try {
    const { current, next } = req.body;
    if (!current || !next) return res.status(400).json({ error: 'Faltan campos' });
    if (next.length < 6) return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });

    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id=$1', [req.userId]);
    if (!(await bcrypt.compare(current, rows[0].password_hash)))
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });

    const hash = await bcrypt.hash(next, 10);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.userId]);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/auth/me
router.delete('/me', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [req.userId]);
    res.clearCookie('token', COOKIE_OPTS);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Middleware ────────────────────────────────────────────────

export async function requireAuth(req, res, next) {
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
    const { rows } = await pool.query('SELECT id, is_active FROM users WHERE id=$1', [userId]);
    if (!rows.length || !rows[0].is_active) {
      res.clearCookie('token', COOKIE_OPTS);
      return res.status(401).json({ error: 'Cuenta suspendida o eliminada' });
    }
    req.userId = userId;
    next();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export default router;
