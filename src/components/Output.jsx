import { useState } from 'react';
import { Copy, Download, Check, Code } from 'lucide-react';
import { MONO_STACK } from '../lib/fonts';

// Per-charset letter-spacing in em. DOTS/BINARY override any mode default
// so their characters don't visually clump horizontally (monospace cells
// are tall, so ● adjacent to ● reads as a horizontal bar without space).
function getSpacingEm(mode, charsetKey) {
  if (charsetKey === 'DOTS')   return 0.3;
  if (charsetKey === 'BINARY') return 0.2;
  if (mode === 'text')         return 0.05;
  return 0;
}

export default function Output({
  theme,
  ascii,
  displayed,
  isAnimating,
  mode,
  charsetKey,
  filename,
  foreground,
  background,
}) {
  const { INK, DEEP, HAIR, TYPE, MUTED, BLUE } = theme;
  const [copyStatus, setCopyStatus] = useState('idle');
  const [svgStatus, setSvgStatus] = useState('idle');
  const [pngStatus, setPngStatus] = useState('idle');

  const lineCount = ascii ? ascii.split('\n').length : 0;
  const colCount  = ascii ? Math.max(...ascii.split('\n').map(l => l.length)) : 0;
  const charCount = ascii.length;
  const spacingEm = getSpacingEm(mode, charsetKey);

  const handleCopy = () => {
    navigator.clipboard.writeText(ascii);
    setCopyStatus('success');
    setTimeout(() => setCopyStatus('idle'), 1500);
  };

  const handleDownloadSvg = () => {
    if (!ascii) return;
    const lines = ascii.split('\n');
    const fontSize = 14;
    const measure = document.createElement('canvas').getContext('2d');
    measure.font = `500 ${fontSize}px ${MONO_STACK}`;
    const charWidth = measure.measureText('M').width;
    const advance = charWidth + fontSize * spacingEm;
    const lineHeight = fontSize * 1.15;
    const padding = fontSize;
    const maxLen = Math.max(...lines.map(l => l.length), 1);
    const svgWidth = Math.ceil(maxLen * advance + padding * 2);
    const svgHeight = Math.ceil(lines.length * lineHeight + padding * 2);
    const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`;
    svg += `<rect width="${svgWidth}" height="${svgHeight}" fill="${background}"/>`;
    // One <g> per non-space glyph: transparent <rect> hitbox + <text>.
    // Figma treats each <g> as an independent group, so each character is
    // selectable/editable on its own in Figma.
    lines.forEach((line, rowIdx) => {
      const textY = padding + (rowIdx + 1) * lineHeight - lineHeight * 0.25;
      const rectY = padding + rowIdx * lineHeight;
      for (let colIdx = 0; colIdx < line.length; colIdx++) {
        const ch = line[colIdx];
        if (ch === ' ') continue;
        const x = padding + colIdx * advance;
        svg += `<g>`;
        svg += `<rect x="${x}" y="${rectY}" width="${advance}" height="${lineHeight}" fill="transparent"/>`;
        svg += `<text x="${x}" y="${textY}" font-family='${MONO_STACK}' font-size="${fontSize}" fill="${foreground}" xml:space="preserve">${escape(ch)}</text>`;
        svg += `</g>`;
      }
    });
    svg += '</svg>';

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.svg`;
    a.click();
    URL.revokeObjectURL(url);

    setSvgStatus('success');
    setTimeout(() => setSvgStatus('idle'), 1500);
  };

  const handleDownloadPng = () => {
    const lines = ascii.split('\n');
    if (!lines.length) return;
    const fontSize = 18;
    const lineHeight = fontSize * 1.15;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `500 ${fontSize}px ${MONO_STACK}`;
    const charWidth = ctx.measureText('M').width;
    const advance = charWidth + fontSize * spacingEm;
    const maxLen = Math.max(...lines.map(l => l.length));
    const pad = 56;
    const w = Math.ceil(advance * maxLen) + pad * 2;
    const h = Math.ceil(lineHeight * lines.length) + pad * 2;
    canvas.width = w;
    canvas.height = h;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = foreground;
    ctx.font = `500 ${fontSize}px ${MONO_STACK}`;
    ctx.textBaseline = 'top';
    // Draw char-by-char so spacing matches the <pre> preview and the SVG
    // export, which also use `advance` per column.
    lines.forEach((line, rowIdx) => {
      const y = pad + rowIdx * lineHeight;
      for (let colIdx = 0; colIdx < line.length; colIdx++) {
        const ch = line[colIdx];
        if (ch === ' ') continue;
        ctx.fillText(ch, pad + colIdx * advance, y);
      }
    });
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${filename}.png`;
    a.click();

    setPngStatus('success');
    setTimeout(() => setPngStatus('idle'), 1500);
  };

  return (
    <section className="flex flex-col min-h-[600px] md:min-h-0 min-w-0 overflow-hidden" style={{ background: INK }}>
      <div
        className="flex items-center justify-between gap-3 sm:gap-4 px-5 py-3 flex-wrap"
        style={{ borderBottom: `1px solid ${HAIR}`, background: DEEP }}
      >
        <div
          className="flex items-center gap-3 sm:gap-4 text-[10px] tracking-[0.18em] flex-wrap min-w-0"
          style={{ color: MUTED, fontFamily: MONO_STACK }}
        >
          <span className="font-semibold" style={{ color: TYPE }}>OUTPUT</span>
          <span>//</span>
          <span>{colCount}×{lineCount} grid</span>
          <span>//</span>
          <span>{charCount.toLocaleString()} characters</span>
          {isAnimating && (<><span>//</span><span style={{ color: BLUE }}>thinking...</span></>)}
        </div>

        <div className="flex items-stretch flex-shrink-0" style={{ border: `1px solid ${HAIR}` }}>
          <ExportButton
            onClick={handleCopy}
            disabled={!ascii}
            success={copyStatus === 'success'}
            type={TYPE}
            hair={HAIR}
          >
            {copyStatus === 'success'
              ? <Check size={11} strokeWidth={2.5} />
              : <Copy size={11} strokeWidth={2.5} />}
            <span>{copyStatus === 'success' ? 'copied ✓' : 'COPY'}</span>
          </ExportButton>
          <ExportButton
            onClick={handleDownloadSvg}
            disabled={!ascii}
            success={svgStatus === 'success'}
            type={TYPE}
            hair={HAIR}
            borderLeft
          >
            {svgStatus === 'success'
              ? <Check size={11} strokeWidth={2.5} />
              : <Code size={11} strokeWidth={2.5} />}
            <span>{svgStatus === 'success' ? '✓' : '.SVG'}</span>
          </ExportButton>
          <ExportButton
            onClick={handleDownloadPng}
            disabled={!ascii}
            success={pngStatus === 'success'}
            type={TYPE}
            hair={HAIR}
            borderLeft
            primary
            blue={BLUE}
          >
            {pngStatus === 'success'
              ? <Check size={11} strokeWidth={2.5} />
              : <Download size={11} strokeWidth={2.5} />}
            <span>{pngStatus === 'success' ? '✓' : '.PNG'}</span>
          </ExportButton>
        </div>
      </div>

      <div
        className="flex-1 overflow-auto p-6 md:p-10"
        style={{
          background: background,
          backgroundImage: `radial-gradient(ellipse at center, rgba(199,0,66,0.05) 0%, transparent 60%)`,
        }}
      >
        {displayed ? (
          <pre
            style={{
              fontFamily: MONO_STACK,
              fontSize: '10px',
              lineHeight: 1.08,
              color: foreground,
              background: background,
              whiteSpace: 'pre',
              letterSpacing: `${spacingEm}em`,
              margin: 0,
              textShadow: isAnimating ? `0 0 8px rgba(199,0,66,0.4)` : 'none',
              transition: 'text-shadow 200ms',
            }}
          >
            {displayed}
          </pre>
        ) : (
          <div
            className="h-full grid place-items-center text-center"
            style={{ color: MUTED, fontFamily: MONO_STACK }}
          >
            <div>
              <div className="text-[10px] tracking-[0.22em] mb-2">NO SIGNAL</div>
              <div className="text-[11px] tracking-[0.12em]">
                {mode === 'text' ? '> waiting for you' : '> drop anything here'}
                <span style={{ color: BLUE, animation: 'blink 1.6s steps(2) infinite' }}>_</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ExportButton({ onClick, disabled, success, children, type, hair, borderLeft, primary, blue }) {
  const blocked = disabled || success;
  return (
    <button
      onClick={onClick}
      disabled={blocked}
      style={{
        background: primary ? (disabled && !success ? '#1F2937' : blue) : 'transparent',
        color: primary ? '#fff' : type,
        borderLeft: borderLeft ? `1px solid ${hair}` : 'none',
        opacity: success ? 0.6 : (disabled && !primary ? 0.35 : 1),
        cursor: success ? 'default' : (disabled ? 'not-allowed' : 'pointer'),
      }}
      className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] tracking-[0.16em] font-semibold transition-all ${primary && !blocked ? 'hover:brightness-110' : !blocked ? 'hover:bg-white/5' : ''}`}
    >
      {children}
    </button>
  );
}
