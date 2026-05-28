// Main app — theme provider, tweaks, canvas

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "oklch(75% 0.13 210)",
  "stateNew": "Nueva",
  "stateWait": "En espera",
  "stateExec": "En ejecución",
  "stateDone": "Finalizada",
  "sidebar": true,
  "mainView": "kanban"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  // Push accent to CSS var so non-context callers (heatmap etc) pick it up
  React.useEffect(() => {
    document.documentElement.style.setProperty('--wf-accent', tweaks.accent);
  }, [tweaks.accent]);

  const themeValue = React.useMemo(() => ({
    accent: tweaks.accent,
    states: {
      new: tweaks.stateNew,
      wait: tweaks.stateWait,
      exec: tweaks.stateExec,
      done: tweaks.stateDone,
    },
    sidebar: tweaks.sidebar,
    mainView: tweaks.mainView,
  }), [tweaks]);

  // Pick which kanban variant lives in the "main view" slot of all chrome
  // (When tweaks.mainView changes, the canvas reorders so that view's section moves to top)
  const sectionOrder = React.useMemo(() => {
    const order = ['dashboard','kanban','list','calendar','task-detail','task-create','projects','settings'];
    const idx = order.indexOf(tweaks.mainView);
    if (idx > 0) { const [item] = order.splice(idx, 1); order.unshift(item); }
    return order;
  }, [tweaks.mainView]);

  const sections = {
    'dashboard': (
      <DCSection id="dashboard" title="Dashboard / Inicio" subtitle="Pantalla de bienvenida — vistas resumen, foco, métricas">
        <DCArtboard id="dash-a" label="A · Cuadrícula clásica" width={1280} height={800}><DashboardA /></DCArtboard>
        <DCArtboard id="dash-b" label="B · Foco del día + agenda" width={1280} height={800}><DashboardB /></DCArtboard>
        <DCArtboard id="dash-c" label="C · Heatmap anual" width={1280} height={800}><DashboardC /></DCArtboard>
        <DCArtboard id="dash-d" label="D · Modo foco" width={1280} height={800}><DashboardD /></DCArtboard>
      </DCSection>
    ),
    'kanban': (
      <DCSection id="kanban" title="Tablero Kanban" subtitle="Vista principal — 4 estados, varios tratamientos">
        <DCArtboard id="kan-a" label="A · Clásico 4 columnas" width={1280} height={800}><KanbanA /></DCArtboard>
        <DCArtboard id="kan-b" label="B · Swim-lanes por proyecto" width={1280} height={800}><KanbanB /></DCArtboard>
        <DCArtboard id="kan-c" label="C · Compacto / denso" width={1280} height={800}><KanbanC /></DCArtboard>
        <DCArtboard id="kan-d" label="D · Mosaico (tamaño = prioridad)" width={1280} height={800}><KanbanD /></DCArtboard>
      </DCSection>
    ),
    'list': (
      <DCSection id="list" title="Lista de tareas" subtitle="Vistas alternativas planas">
        <DCArtboard id="list-a" label="A · Tabla densa" width={1280} height={800}><ListA /></DCArtboard>
        <DCArtboard id="list-b" label="B · Tarjetas apiladas" width={1280} height={800}><ListB /></DCArtboard>
        <DCArtboard id="list-c" label="C · Agrupado por fecha" width={1280} height={800}><ListC /></DCArtboard>
        <DCArtboard id="list-d" label="D · Timeline vertical" width={1280} height={800}><ListD /></DCArtboard>
      </DCSection>
    ),
    'calendar': (
      <DCSection id="calendar" title="Calendario" subtitle="Varias vistas conmutables: día / semana / mes / año">
        <DCArtboard id="cal-a" label="A · Mes (grid)" width={1280} height={800}><CalendarA /></DCArtboard>
        <DCArtboard id="cal-b" label="B · Semana (timeline)" width={1280} height={800}><CalendarB /></DCArtboard>
        <DCArtboard id="cal-c" label="C · Año (panorámica)" width={1280} height={800}><CalendarC /></DCArtboard>
        <DCArtboard id="cal-d" label="D · Día foco" width={1280} height={800}><CalendarD /></DCArtboard>
      </DCSection>
    ),
    'task-detail': (
      <DCSection id="task-detail" title="Detalle de tarea" subtitle="Tres formatos de cómo abrir una tarea">
        <DCArtboard id="det-a" label="A · Panel lateral" width={1280} height={800}><DetailA /></DCArtboard>
        <DCArtboard id="det-b" label="B · Página completa" width={1280} height={800}><DetailB /></DCArtboard>
        <DCArtboard id="det-c" label="C · Modal centrado" width={1280} height={800}><DetailC /></DCArtboard>
      </DCSection>
    ),
    'task-create': (
      <DCSection id="task-create" title="Crear / editar tarea" subtitle="Cómo añadir una tarea rápido y con detalle">
        <DCArtboard id="cre-a" label="A · Modal formulario" width={1280} height={800}><CreateA /></DCArtboard>
        <DCArtboard id="cre-b" label="B · Command bar (lenguaje natural)" width={1280} height={800}><CreateB /></DCArtboard>
        <DCArtboard id="cre-c" label="C · Página + preview" width={1280} height={800}><CreateC /></DCArtboard>
      </DCSection>
    ),
    'projects': (
      <DCSection id="projects" title="Lista de proyectos" subtitle="Cómo ves todos tus proyectos juntos">
        <DCArtboard id="prj-a" label="A · Grid de cards" width={1280} height={800}><ProjectsA /></DCArtboard>
        <DCArtboard id="prj-b" label="B · Tabla detallada" width={1280} height={800}><ProjectsB /></DCArtboard>
        <DCArtboard id="prj-c" label="C · Constelación (atrevido)" width={1280} height={800}><ProjectsC /></DCArtboard>
      </DCSection>
    ),
    'settings': (
      <DCSection id="settings" title="Configuración" subtitle="Ajustes generales">
        <DCArtboard id="set-a" label="A · Sidebar interno" width={1280} height={800}><SettingsA /></DCArtboard>
        <DCArtboard id="set-b" label="B · Tabs horizontales" width={1280} height={800}><SettingsB /></DCArtboard>
      </DCSection>
    ),
  };

  return (
    <WFTheme.Provider value={themeValue}>
      <DesignCanvas>
        {sectionOrder.map(k => React.cloneElement(sections[k], { key: k }))}
      </DesignCanvas>

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Tema">
          <window.TweakColor
            label="Color de acento"
            value={tweaks.accent}
            options={[
              'oklch(72% 0.13 285)', // violeta
              'oklch(75% 0.13 210)', // cian
              'oklch(78% 0.13 145)', // lima
              'oklch(76% 0.13 60)',  // ámbar
              'oklch(70% 0.15 25)',  // coral
            ]}
            onChange={v => setTweak('accent', v)}
          />
          <window.TweakToggle
            label="Mostrar sidebar de proyectos"
            value={tweaks.sidebar}
            onChange={v => setTweak('sidebar', v)}
          />
        </window.TweakSection>

        <window.TweakSection label="Vista principal">
          <window.TweakSelect
            label="Sección al inicio"
            value={tweaks.mainView}
            options={[
              { value: 'dashboard', label: 'Dashboard' },
              { value: 'kanban', label: 'Tablero Kanban' },
              { value: 'list', label: 'Lista' },
              { value: 'calendar', label: 'Calendario' },
              { value: 'task-detail', label: 'Detalle de tarea' },
              { value: 'task-create', label: 'Crear / editar' },
              { value: 'projects', label: 'Proyectos' },
              { value: 'settings', label: 'Configuración' },
            ]}
            onChange={v => setTweak('mainView', v)}
          />
        </window.TweakSection>

        <window.TweakSection label="Nombres de los estados">
          <window.TweakText label="Nueva" value={tweaks.stateNew} onChange={v => setTweak('stateNew', v)} />
          <window.TweakText label="En espera" value={tweaks.stateWait} onChange={v => setTweak('stateWait', v)} />
          <window.TweakText label="En ejecución" value={tweaks.stateExec} onChange={v => setTweak('stateExec', v)} />
          <window.TweakText label="Finalizada" value={tweaks.stateDone} onChange={v => setTweak('stateDone', v)} />
        </window.TweakSection>
      </window.TweaksPanel>
    </WFTheme.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
