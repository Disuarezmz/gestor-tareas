import { createContext, useContext } from 'react';

export const WFTheme = createContext({
  accent: 'oklch(72% 0.13 285)',
  states: { new: 'Nueva', wait: 'En espera', exec: 'En ejecución', done: 'Finalizada' },
  sidebar: true,
  mainView: 'kanban',
});

export const useWF = () => useContext(WFTheme);
