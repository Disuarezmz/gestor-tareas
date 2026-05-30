import pool from './db.js';

// Cada entrada es idempotente (IF NOT EXISTS / IF EXISTS).
// Añadir nuevas migraciones al final de la lista.
const migrations = [
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS role                 TEXT    NOT NULL DEFAULT 'user'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active            BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false`,
  `CREATE TABLE IF NOT EXISTS groups (
    id          SERIAL      PRIMARY KEY,
    name        TEXT        NOT NULL,
    description TEXT        NOT NULL DEFAULT '',
    created_by  INTEGER     REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS group_members (
    group_id  INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role      TEXT    NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
  )`,
  `CREATE TABLE IF NOT EXISTS project_members (
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role       TEXT    NOT NULL DEFAULT 'viewer',
    invited_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (project_id, user_id)
  )`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL`,
  `INSERT INTO project_members (project_id, user_id, role)
   SELECT id, user_id, 'owner' FROM projects
   ON CONFLICT (project_id, user_id) DO NOTHING`,
  // PostgreSQL no permite subqueries en USING; se usa columna temporal.
  `DO $$
   DECLARE col_type text;
   BEGIN
     SELECT pg_catalog.format_type(atttypid, atttypmod) INTO col_type
     FROM pg_catalog.pg_attribute
     WHERE attrelid = 'tasks'::regclass AND attname = 'subtasks' AND attnum > 0;
     IF col_type = 'integer[]' THEN
       ALTER TABLE tasks ADD COLUMN subtasks_jsonb JSONB;
       UPDATE tasks SET subtasks_jsonb = (
         CASE
           WHEN subtasks IS NULL OR cardinality(subtasks) < 2 OR subtasks[2] <= 0 THEN NULL
           ELSE (
             SELECT jsonb_agg(jsonb_build_object(
               'id', i,
               'title', 'Subtarea ' || i::text,
               'done', i <= subtasks[1]
             ))
             FROM generate_series(1, subtasks[2]) AS i
           )
         END
       );
       ALTER TABLE tasks DROP COLUMN subtasks;
       ALTER TABLE tasks RENAME COLUMN subtasks_jsonb TO subtasks;
     END IF;
   END $$`,
  `DO $$
   DECLARE col_type text;
   BEGIN
     SELECT pg_catalog.format_type(atttypid, atttypmod) INTO col_type
     FROM pg_catalog.pg_attribute
     WHERE attrelid = 'tasks'::regclass AND attname = 'comments' AND attnum > 0;
     IF col_type = 'integer' THEN
       ALTER TABLE tasks ALTER COLUMN comments TYPE JSONB USING '[]'::jsonb;
       ALTER TABLE tasks ALTER COLUMN comments SET DEFAULT '[]'::jsonb;
     END IF;
   END $$`,
];

export async function migrate() {
  for (const sql of migrations) {
    await pool.query(sql);
  }
  console.log(`Migrations OK (${migrations.length})`);
}
