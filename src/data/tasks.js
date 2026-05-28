import { wfTokens } from '../constants/tokens.js';

export const PROJECTS = [
  { id: 'rediseno', name: 'Rediseño app', color: wfTokens.hueExec, done: 8, total: 14, status: 'activo', due: 'hoy', desc: 'Diseño y rediseño de la app iOS, foco en onboarding y home.' },
  { id: 'marketing', name: 'Marketing Q3', color: wfTokens.hueWait, done: 3, total: 9, status: 'activo', due: 'mañana', desc: 'Campaña, landing, copy y demo para clientes.' },
  { id: 'backend', name: 'Backend v2', color: wfTokens.hueNew, done: 5, total: 11, status: 'activo', due: '03 jun', desc: 'Migración a Postgres 16 + nuevo auth.' },
  { id: 'personal', name: 'Personal', color: wfTokens.hueDone, done: 2, total: 4, status: 'activo', due: '—', desc: 'Cosas mías: dominios, ideas, etc.' },
  { id: 'ideas', name: 'Ideas', color: 'oklch(70% 0.05 280)', done: 0, total: 7, status: 'pausa', due: '—', desc: 'Cajón de ideas sin asignar a proyecto.' },
];

export const TASKS = [
  { id: 1,  title: 'Cerrar onboarding rediseño',  priority: 'high', status: 'exec', due: 'hoy',     project: 'rediseno', tags: ['ux', 'ios'],           subtasks: [3, 5], comments: 5, desc: 'Revisar el flujo completo de onboarding y cerrar todos los pendientes antes de la entrega al cliente.' },
  { id: 2,  title: 'Revisar PR #482',              priority: 'med',  status: 'exec', due: 'hoy',     project: 'backend',  tags: ['code-review'],          subtasks: null,   comments: 3, desc: 'Revisar la pull request del módulo de autenticación OAuth con los cambios de sesión.' },
  { id: 3,  title: 'Llamada con diseño',           priority: 'med',  status: 'wait', due: 'hoy 16:00', project: 'rediseno', tags: ['meeting'],            subtasks: null,   comments: 0, desc: 'Sync semanal con el equipo de diseño. Revisar avances del sprint.' },
  { id: 4,  title: 'Diseño cabecera landing',      priority: 'med',  status: 'exec', due: '28 may',  project: 'marketing', tags: ['marketing', 'ux'],     subtasks: [1, 3], comments: 1, desc: 'Crear los distintos concepts para la cabecera de la nueva landing de Q3.' },
  { id: 5,  title: 'Test e2e checkout',            priority: 'med',  status: 'new',  due: '29 may',  project: 'backend',  tags: ['qa'],                   subtasks: [2, 6], comments: 0, desc: 'Tests de extremo a extremo del flujo completo de pago con Stripe.' },
  { id: 6,  title: 'Aprobación legal copy',        priority: 'high', status: 'wait', due: '30 may',  project: 'marketing', tags: ['legal'],               subtasks: null,   comments: 1, desc: 'Enviar el copy de la campaña al equipo legal para revisión y validación.' },
  { id: 7,  title: 'Demo cliente Acme',            priority: 'high', status: 'new',  due: '31 may',  project: 'marketing', tags: ['sales'],               subtasks: null,   comments: 0, desc: 'Presentar la nueva plataforma al equipo directivo de Acme Corp.' },
  { id: 8,  title: 'Migrar a Postgres 16',         priority: 'high', status: 'exec', due: '02 jun',  project: 'backend',  tags: ['backend', 'infra'],     subtasks: [4, 7], comments: 8, desc: 'Migración de la base de datos a Postgres 16 con estrategia zero-downtime.' },
  { id: 9,  title: 'Release v2.4',                 priority: 'med',  status: 'new',  due: '03 jun',  project: 'backend',  tags: ['release'],              subtasks: null,   comments: 2, desc: 'Preparar changelog, tags y publicar la versión 2.4 de la API.' },
  { id: 10, title: 'Refactor módulo auth',         priority: 'high', status: 'new',  due: '03 jun',  project: 'backend',  tags: ['tech-debt'],            subtasks: [0, 4], comments: 0, desc: 'Refactorizar el módulo de autenticación para mejorar la seguridad y el mantenimiento.' },
  { id: 11, title: 'Comprar dominio',              priority: 'low',  status: 'new',  due: '—',       project: 'personal', tags: ['ops'],                  subtasks: null,   comments: 0, desc: 'Registrar el dominio para el proyecto personal.' },
  { id: 12, title: 'Sketch onboarding v1',         priority: 'high', status: 'done', due: '22 may',  project: 'rediseno', tags: ['ux'],                   subtasks: null,   comments: 4, desc: 'Primera versión de los sketches del flujo de onboarding. Completada.' },
  { id: 13, title: 'Setup CI nuevo',               priority: 'med',  status: 'done', due: '24 may',  project: 'backend',  tags: ['infra'],                subtasks: null,   comments: 0, desc: 'Configuración del pipeline de CI/CD con GitHub Actions. Completado.' },
  { id: 14, title: 'Bug: select se cierra',        priority: 'high', status: 'new',  due: '28 may',  project: 'rediseno', tags: ['bug', 'ux'],            subtasks: null,   comments: 2, desc: 'El componente select se cierra inesperadamente al hacer scroll dentro del modal.' },
  { id: 15, title: 'Investigar libs de gráficos',  priority: 'med',  status: 'new',  due: '—',       project: 'backend',  tags: ['research'],             subtasks: null,   comments: 1, desc: 'Evaluar opciones: Recharts, Victory, Visx, D3. Decidir cuál usar para el dashboard.' },
];

export const projectById = (id) => PROJECTS.find((p) => p.id === id);
