import { Router } from 'express';
import pool from './db.js';
import { requireAuth } from './auth.js';

const router = Router();

// ── Helpers ────────────────────────────────────────────────────

async function getGroupRole(groupId, userId) {
  const { rows } = await pool.query(
    `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2`,
    [groupId, userId],
  );
  return rows[0]?.role || null;
}

const wrap = (fn) => async (req, res) => {
  try { await fn(req, res); } catch (e) { res.status(500).json({ error: e.message }); }
};

function toGroup(r) {
  return {
    id: r.id, name: r.name, desc: r.description,
    myRole: r.my_role, memberCount: parseInt(r.member_count || 0),
    createdAt: r.created_at,
  };
}

function toMember(r) {
  return { id: r.id, name: r.name, email: r.email, avatarColor: r.avatar_color, role: r.role };
}

// ── Groups CRUD ────────────────────────────────────────────────

router.get('/', requireAuth, wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT g.*, gm.role AS my_role,
       (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS member_count
     FROM groups g
     JOIN group_members gm ON g.id = gm.group_id
     WHERE gm.user_id = $1
     ORDER BY g.created_at`,
    [req.userId],
  );
  res.json(rows.map(toGroup));
}));

router.post('/', requireAuth, wrap(async (req, res) => {
  const { name, desc = '' } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO groups (name, description, created_by) VALUES ($1, $2, $3) RETURNING *`,
      [name.trim(), desc, req.userId],
    );
    const group = rows[0];
    await client.query(
      `INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'owner')`,
      [group.id, req.userId],
    );
    await client.query('COMMIT');
    res.status(201).json({ id: group.id, name: group.name, desc: group.description, myRole: 'owner', memberCount: 1 });
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}));

router.put('/:id', requireAuth, wrap(async (req, res) => {
  const myRole = await getGroupRole(req.params.id, req.userId);
  if (myRole !== 'owner') return res.status(403).json({ error: 'Not authorized' });
  const { name, desc } = req.body;
  const sets = [], vals = [];
  if (name !== undefined) { sets.push(`name=$${vals.length + 1}`); vals.push(name); }
  if (desc !== undefined) { sets.push(`description=$${vals.length + 1}`); vals.push(desc); }
  if (!sets.length) return res.status(400).json({ error: 'No fields' });
  vals.push(req.params.id);
  const { rows } = await pool.query(
    `UPDATE groups SET ${sets.join(',')} WHERE id=$${vals.length} RETURNING *`,
    vals,
  );
  res.json({ id: rows[0].id, name: rows[0].name, desc: rows[0].description });
}));

router.delete('/:id', requireAuth, wrap(async (req, res) => {
  const myRole = await getGroupRole(req.params.id, req.userId);
  if (myRole !== 'owner') return res.status(403).json({ error: 'Not authorized' });
  await pool.query('DELETE FROM groups WHERE id=$1', [req.params.id]);
  res.status(204).end();
}));

// ── Group Members ──────────────────────────────────────────────

router.get('/:id/members', requireAuth, wrap(async (req, res) => {
  const myRole = await getGroupRole(req.params.id, req.userId);
  if (!myRole) return res.status(403).json({ error: 'Not a member' });
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.avatar_color, gm.role
     FROM group_members gm JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id = $1
     ORDER BY gm.role DESC, u.name`,
    [req.params.id],
  );
  res.json(rows.map(toMember));
}));

router.post('/:id/members', requireAuth, wrap(async (req, res) => {
  const myRole = await getGroupRole(req.params.id, req.userId);
  if (myRole !== 'owner') return res.status(403).json({ error: 'Not authorized' });
  const { email, role = 'member' } = req.body;
  if (!['owner', 'member'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  const { rows: users } = await pool.query(
    `SELECT id, name, email, avatar_color FROM users WHERE LOWER(email) = LOWER($1) AND is_active = true`,
    [email?.trim()],
  );
  if (!users.length) return res.status(404).json({ error: 'Usuario no encontrado' });
  const user = users[0];
  await pool.query(
    `INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)
     ON CONFLICT (group_id, user_id) DO UPDATE SET role = $3`,
    [req.params.id, user.id, role],
  );
  res.status(201).json({ id: user.id, name: user.name, email: user.email, avatarColor: user.avatar_color, role });
}));

router.delete('/:id/members/:userId', requireAuth, wrap(async (req, res) => {
  const myRole = await getGroupRole(req.params.id, req.userId);
  const targetId = parseInt(req.params.userId);
  if (targetId !== req.userId && myRole !== 'owner')
    return res.status(403).json({ error: 'Not authorized' });
  if (targetId === req.userId && myRole === 'owner') {
    const { rows } = await pool.query(
      `SELECT 1 FROM group_members WHERE group_id = $1 AND role = 'owner' AND user_id != $2`,
      [req.params.id, req.userId],
    );
    if (!rows.length) return res.status(400).json({ error: 'No puedes salir: eres el único propietario' });
  }
  await pool.query(
    `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`,
    [req.params.id, targetId],
  );
  res.status(204).end();
}));

export default router;
