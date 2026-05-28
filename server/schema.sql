-- Schema for gestor-tareas
-- Run once: psql -d gestor_tareas -f server/schema.sql

CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL      PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  color       TEXT        NOT NULL DEFAULT 'oklch(72% 0.13 285)',
  status      TEXT        NOT NULL DEFAULT 'activo',
  due         TEXT        NOT NULL DEFAULT '—',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL      PRIMARY KEY,
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  status      TEXT        NOT NULL DEFAULT 'new',
  priority    TEXT        NOT NULL DEFAULT 'med',
  project_id  INTEGER     REFERENCES projects(id) ON DELETE SET NULL,
  due         TEXT        NOT NULL DEFAULT '—',
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  subtasks    INTEGER[],
  comments    INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Seed data (idempotent) ────────────────────────────────────

INSERT INTO projects (id, name, description, color, status, due) VALUES
  (1, 'Rediseño app',  'Diseño y rediseño de la app iOS, foco en onboarding y home.',  'oklch(72% 0.13 320)', 'activo', 'hoy'),
  (2, 'Marketing Q3',  'Campaña, landing, copy y demo para clientes.',                  'oklch(78% 0.11 80)',  'activo', 'mañana'),
  (3, 'Backend v2',    'Migración a Postgres 16 + nuevo auth.',                         'oklch(72% 0.09 235)', 'activo', '03 jun'),
  (4, 'Personal',      'Cosas mías: dominios, ideas, etc.',                             'oklch(70% 0.09 150)', 'activo', '—'),
  (5, 'Ideas',         'Cajón de ideas sin asignar a proyecto.',                        'oklch(70% 0.05 280)', 'pausa',  '—')
ON CONFLICT (id) DO NOTHING;

SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));

INSERT INTO tasks (id, title, description, status, priority, project_id, due, tags, subtasks, comments) VALUES
  (1,  'Cerrar onboarding rediseño',   'Revisar el flujo completo de onboarding y cerrar todos los pendientes antes de la entrega al cliente.',  'exec', 'high', 1, 'hoy',       ARRAY['ux','ios'],          ARRAY[3,5], 5),
  (2,  'Revisar PR #482',              'Revisar la pull request del módulo de autenticación OAuth con los cambios de sesión.',                    'exec', 'med',  3, 'hoy',       ARRAY['code-review'],       NULL,       3),
  (3,  'Llamada con diseño',           'Sync semanal con el equipo de diseño. Revisar avances del sprint.',                                      'wait', 'med',  1, 'hoy 16:00', ARRAY['meeting'],            NULL,       0),
  (4,  'Diseño cabecera landing',      'Crear los distintos concepts para la cabecera de la nueva landing de Q3.',                               'exec', 'med',  2, '28 may',    ARRAY['marketing','ux'],    ARRAY[1,3], 1),
  (5,  'Test e2e checkout',            'Tests de extremo a extremo del flujo completo de pago con Stripe.',                                      'new',  'med',  3, '29 may',    ARRAY['qa'],                ARRAY[2,6], 0),
  (6,  'Aprobación legal copy',        'Enviar el copy de la campaña al equipo legal para revisión y validación.',                               'wait', 'high', 2, '30 may',    ARRAY['legal'],             NULL,       1),
  (7,  'Demo cliente Acme',            'Presentar la nueva plataforma al equipo directivo de Acme Corp.',                                        'new',  'high', 2, '31 may',    ARRAY['sales'],             NULL,       0),
  (8,  'Migrar a Postgres 16',         'Migración de la base de datos a Postgres 16 con estrategia zero-downtime.',                             'exec', 'high', 3, '02 jun',    ARRAY['backend','infra'],   ARRAY[4,7], 8),
  (9,  'Release v2.4',                 'Preparar changelog, tags y publicar la versión 2.4 de la API.',                                         'new',  'med',  3, '03 jun',    ARRAY['release'],           NULL,       2),
  (10, 'Refactor módulo auth',         'Refactorizar el módulo de autenticación para mejorar la seguridad y el mantenimiento.',                  'new',  'high', 3, '03 jun',    ARRAY['tech-debt'],         ARRAY[0,4], 0),
  (11, 'Comprar dominio',              'Registrar el dominio para el proyecto personal.',                                                        'new',  'low',  4, '—',         ARRAY['ops'],               NULL,       0),
  (12, 'Sketch onboarding v1',         'Primera versión de los sketches del flujo de onboarding. Completada.',                                   'done', 'high', 1, '22 may',    ARRAY['ux'],                NULL,       4),
  (13, 'Setup CI nuevo',               'Configuración del pipeline de CI/CD con GitHub Actions. Completado.',                                    'done', 'med',  3, '24 may',    ARRAY['infra'],             NULL,       0),
  (14, 'Bug: select se cierra',        'El componente select se cierra inesperadamente al hacer scroll dentro del modal.',                       'new',  'high', 1, '28 may',    ARRAY['bug','ux'],          NULL,       2),
  (15, 'Investigar libs de gráficos',  'Evaluar opciones: Recharts, Victory, Visx, D3. Decidir cuál usar para el dashboard.',                   'new',  'med',  3, '—',         ARRAY['research'],          NULL,       1)
ON CONFLICT (id) DO NOTHING;

SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));
