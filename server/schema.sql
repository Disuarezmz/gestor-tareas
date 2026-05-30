-- Schema for gestor-tareas — solo se ejecuta en instalación limpia (volumen vacío).
-- Las migraciones incrementales las gestiona server/migrate.js en cada arranque.

CREATE TABLE IF NOT EXISTS users (
  id                   SERIAL      PRIMARY KEY,
  name                 TEXT        NOT NULL,
  email                TEXT        NOT NULL UNIQUE,
  password_hash        TEXT        NOT NULL,
  avatar_color         TEXT        NOT NULL DEFAULT 'oklch(72% 0.13 210)',
  role                 TEXT        NOT NULL DEFAULT 'user',
  is_active            BOOLEAN     NOT NULL DEFAULT true,
  must_change_password BOOLEAN     NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL      PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  color       TEXT        NOT NULL DEFAULT 'oklch(72% 0.13 285)',
  status      TEXT        NOT NULL DEFAULT 'activo',
  due         TEXT        NOT NULL DEFAULT '—',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL      PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  status      TEXT        NOT NULL DEFAULT 'new',
  priority    TEXT        NOT NULL DEFAULT 'med',
  project_id  INTEGER     REFERENCES projects(id) ON DELETE SET NULL,
  due         TEXT        NOT NULL DEFAULT '—',
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  subtasks    JSONB,
  comments    JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id          SERIAL      PRIMARY KEY,
  actor_id    INTEGER     REFERENCES users(id) ON DELETE SET NULL,
  actor_name  TEXT        NOT NULL,
  action      TEXT        NOT NULL,
  target_id   INTEGER,
  target_name TEXT,
  meta        JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
