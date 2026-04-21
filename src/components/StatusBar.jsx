import { useClock } from '../lib/clock';

export function TopStatusBar({ theme, isAnimating, charsetKey, cols, rows }) {
  const { DEEP, HAIR, TYPE, MUTED, BLUE } = theme;
  const clock = useClock();

  return (
    <div
      className="flex items-center justify-between text-[10px] tracking-[0.22em] mb-4 px-4 py-2.5"
      style={{ background: DEEP, border: `1px solid ${HAIR}`, color: MUTED }}
    >
      <div className="flex items-center gap-3">
        <span
          style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isAnimating ? BLUE : '#22C55E',
            boxShadow: `0 0 10px ${isAnimating ? BLUE : '#22C55E'}`,
            animation: 'pulse 1.6s ease-in-out infinite',
          }}
        />
        <span style={{ color: TYPE }}>{isAnimating ? 'RESOLVING' : 'READY'}</span>
        <span>//</span>
        <span>CERTIK ASCII-CONV / v1.0</span>
      </div>
      <div className="hidden md:flex items-center gap-3">
        <span>CHARSET:{charsetKey}</span>
        <span>//</span>
        <span>C:{cols}</span>
        <span>//</span>
        <span>R:{rows}</span>
        <span>//</span>
        <span>T:{clock}</span>
      </div>
    </div>
  );
}

export function BottomStatusBar({ theme }) {
  const { DEEP, HAIR, TYPE, MUTED, BLUE } = theme;

  return (
    <div
      className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-[10px] tracking-[0.22em] px-4 py-2.5"
      style={{ background: DEEP, border: `1px solid ${HAIR}`, color: MUTED }}
    >
      <div className="flex gap-3">
        <span>ENGINE:</span>
        <span style={{ color: TYPE }}>CANVAS → LUMINANCE → CHAR MAP</span>
      </div>
      <div className="flex gap-3 items-center">
        <span style={{ color: BLUE }}>◆</span>
        <span>CERTIK</span>
        <span>//</span>
        <span>BRANDING KIT</span>
        <span>//</span>
        <span>INTERNAL</span>
      </div>
    </div>
  );
}
