export const wfTokens = {
  bg: '#14141a',
  surface: '#1c1c24',
  surfaceHi: '#23232f',
  surfaceLo: '#101015',
  border: '#353545',
  borderSoft: '#26262f',
  text: '#e6e6ee',
  textMuted: '#9b9bac',
  textDim: '#6e6e7c',
  hueNew:  'oklch(72% 0.09 235)',
  hueWait: 'oklch(78% 0.11 80)',
  hueExec: 'oklch(72% 0.13 320)',
  hueDone: 'oklch(70% 0.09 150)',
  hueHigh: 'oklch(72% 0.16 25)',
  hueMed:  'oklch(76% 0.11 75)',
  hueLow:  'oklch(70% 0.05 245)',
};

export const stateColor = (k) => ({
  new:  wfTokens.hueNew,
  wait: wfTokens.hueWait,
  exec: wfTokens.hueExec,
  done: wfTokens.hueDone,
})[k];
