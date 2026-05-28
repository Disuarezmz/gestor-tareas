import pool from './db.js';

// Cada entrada es idempotente (IF NOT EXISTS / IF EXISTS).
// Añadir nuevas migraciones al final de la lista.
const migrations = [
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS role                 TEXT    NOT NULL DEFAULT 'user'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active            BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false`,
];

export async function migrate() {
  for (const sql of migrations) {
    await pool.query(sql);
  }
  console.log(`Migrations OK (${migrations.length})`);
}
