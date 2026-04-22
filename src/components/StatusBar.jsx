import { useClock } from '../lib/clock';
import { MONO_STACK } from '../lib/fonts';

export function TopStatusBar({ theme, isAnimating, isFirstVisit, charsetKey, cols, rows }) {
  const { DEEP, HAIR, TYPE, MUTED, BLUE } = theme;
  const clock = useClock();
  const statusLabel = isFirstVisit ? 'welcome ✦' : (isAnimating ? 'weaving' : 'READY');

  return (
    <div
      className="flex items-center justify-between text-[10px] tracking-[0.22em] mb-4 px-4 py-2.5"
      style={{ background: DEEP, border: `1px solid ${HAIR}`, color: MUTED, fontFamily: MONO_STACK }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span style={{ color: BLUE }}>◆</span>
        <span>CERTIK</span>
        <span className="hidden sm:inline">//</span>
        <span className="hidden sm:inline">INTERNAL BRANDING ENGINE</span>
        <span>//</span>
        <span
          style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isAnimating ? BLUE : '#22C55E',
            boxShadow: `0 0 10px ${isAnimating ? BLUE : '#22C55E'}`,
            animation: 'pulse 2.4s ease-in-out infinite',
            flexShrink: 0,
          }}
        />
        <span
          key={statusLabel}
          style={{
            color: TYPE,
            animation: 'fadeIn 0.4s ease',
          }}
        >
          {statusLabel}
        </span>
        <span>//</span>
        <span>ASCII-CONV v1.0</span>
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
      style={{ background: DEEP, border: `1px solid ${HAIR}`, color: MUTED, fontFamily: MONO_STACK }}
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
