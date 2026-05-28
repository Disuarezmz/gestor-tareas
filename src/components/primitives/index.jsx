import { useWF } from '../../contexts/ThemeContext.jsx';
import { wfTokens, stateColor } from '../../constants/tokens.js';
import { I } from '../../constants/icons.js';

export function HW({ children, size = 18, color, style }) {
  return (
    <span
      style={{
        fontFamily: '"Caveat", cursive',
        fontWeight: 500,
        fontSize: size,
        color: color || wfTokens.text,
        letterSpacing: 0.2,
        lineHeight: 1,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Mono({ children, size = 10, color, style }) {
  return (
    <span
      style={{
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: size,
        color: color || wfTokens.textDim,
        letterSpacing: 0.2,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function SB({ children, dashed, hi, style, ...props }) {
  return (
    <div
      style={{
        border: `1px ${dashed ? 'dashed' : 'solid'} ${wfTokens.border}`,
        borderRadius: 6,
        background: hi ? wfTokens.surfaceHi : wfTokens.surface,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function L({ w = '80%', h = 6, c, style }) {
  return (
    <div
      style={{
        width: typeof w === 'number' ? `${w}%` : w,
        height: h,
        borderRadius: 2,
        background: c || wfTokens.border,
        ...style,
      }}
    />
  );
}

export function Lines({ widths = [90, 70, 80], h = 5, gap = 4, c }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {widths.map((w, i) => (
        <L key={i} w={w} h={h} c={c} />
      ))}
    </div>
  );
}

export function Stripe({ h = 100, label, style }) {
  return (
    <div
      style={{
        height: h,
        background: `repeating-linear-gradient(135deg, ${wfTokens.surfaceHi} 0 6px, ${wfTokens.surface} 6px 12px)`,
        border: `1px dashed ${wfTokens.border}`,
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {label && <Mono color={wfTokens.textMuted}>{label}</Mono>}
    </div>
  );
}

export function Pill({ children, c, fill, style }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 7px',
        borderRadius: 999,
        border: `1px solid ${c || wfTokens.border}`,
        background: fill
          ? `color-mix(in oklch, ${c || wfTokens.border} 18%, transparent)`
          : 'transparent',
        color: c || wfTokens.textMuted,
        fontSize: 9,
        fontFamily: '"JetBrains Mono", monospace',
        letterSpacing: 0.3,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Dot({ c, size = 7, style }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: 999,
        background: c || wfTokens.border,
        ...style,
      }}
    />
  );
}

export function StateDot({ k, size = 7 }) {
  return <Dot c={stateColor(k)} size={size} />;
}

export function StatePill({ k }) {
  const { states } = useWF();
  return (
    <Pill c={stateColor(k)} fill>
      <Dot c={stateColor(k)} size={6} />
      {states[k]}
    </Pill>
  );
}

export function Prio({ level }) {
  const map = {
    high: ['Alta', wfTokens.hueHigh],
    med: ['Media', wfTokens.hueMed],
    low: ['Baja', wfTokens.hueLow],
  };
  const [label, c] = map[level] || map.low;
  return <Pill c={c}>{label}</Pill>;
}

export function Tag({ children, c }) {
  return (
    <Pill c={c || wfTokens.textDim} style={{ borderStyle: 'dashed' }}>
      #{children}
    </Pill>
  );
}

export function Btn({ children, primary, ghost, style, w, onClick }) {
  const { accent } = useWF();
  const bg = primary ? accent : ghost ? 'transparent' : wfTokens.surfaceHi;
  const fg = primary ? '#0e0e14' : ghost ? wfTokens.textMuted : wfTokens.text;
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '5px 11px',
        borderRadius: 5,
        background: bg,
        color: fg,
        border: ghost
          ? `1px solid ${wfTokens.border}`
          : primary
            ? `1px solid ${accent}`
            : `1px solid ${wfTokens.border}`,
        fontSize: 10,
        fontWeight: 500,
        width: w,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Check({ done, size = 10, onClick, style }) {
  const { accent } = useWF();
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: 3,
        border: `1px solid ${done ? accent : wfTokens.border}`,
        background: done
          ? `color-mix(in oklch, ${accent} 25%, transparent)`
          : 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.1s, background 0.1s',
        ...style,
      }}
    >
      {done && (
        <span style={{ color: accent, fontSize: size - 2, lineHeight: 1 }}>
          ✓
        </span>
      )}
    </div>
  );
}

export function Ic({ d, size = 12, c, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={c || wfTokens.textMuted}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d={d} />
    </svg>
  );
}

export function Page({ children, style }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: wfTokens.bg,
        color: wfTokens.text,
        fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
        fontSize: 11,
        lineHeight: 1.4,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
