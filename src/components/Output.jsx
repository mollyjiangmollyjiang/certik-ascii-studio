import { useState } from 'react';
import { Copy, Download, Check, Code } from 'lucide-react';

const MONO_STACK = '"JetBrains Mono", "Cascadia Code", "Fira Code", "SF Mono", "Menlo", "Consolas", "DejaVu Sans Mono", "Noto Sans Mono", monospace';

export default function Output({
  theme,
  ascii,
  displayed,
  isAnimating,
  mode,
  filename,
  foreground,
  background,
}) {
  const { INK, DEEP, HAIR, TYPE, MUTED, BLUE } = theme;
  const [copied, setCopied] = useState(false);

  const lineCount = ascii ? ascii.split('\n').length : 0;
  const colCount  = ascii ? Math.max(...ascii.split('\n').map(l => l.length)) : 0;
  const charCount = ascii.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(ascii);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleDownloadSvg = () => {
    if (!ascii) return;
    const lines = ascii.split('\n');
    const fontSize = 12;
    const charWidth = fontSize * 0.6;
    const lineHeight = fontSize * 1.15;
    const padding = fontSize;
    const maxLen = Math.max(...lines.map(l => l.length));
    const svgWidth = Math.ceil(maxLen * charWidth + padding * 2);
    const svgHeight = Math.ceil(lines.length * lineHeight + padding * 2);
    const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`;
    svg += `<rect width="${svgWidth}" height="${svgHeight}" fill="${background}"/>`;
    lines.forEach((line, i) => {
      const y = padding + (i + 1) * lineHeight - lineHeight * 0.25;
      svg += `<text x="${padding}" y="${y}" font-family='${MONO_STACK}' font-size="${fontSize}" fill="${foreground}" xml:space="preserve">${escape(line)}</text>`;
    });
    svg += '</svg>';
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.svg`;
    a.click();
    URL.revokeObjectURL(url);
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
    const maxLen = Math.max(...lines.map(l => l.length));
    const pad = 56;
    const w = Math.ceil(charWidth * maxLen) + pad * 2;
    const h = Math.ceil(lineHeight * lines.length) + pad * 2;
    canvas.width = w;
    canvas.height = h;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = foreground;
    ctx.font = `500 ${fontSize}px ${MONO_STACK}`;
    ctx.textBaseline = 'top';
    lines.forEach((line, i) => ctx.fillText(line, pad, pad + i * lineHeight));
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${filename}.png`;
    a.click();
  };

  return (
    <section className="flex flex-col min-h-[600px] md:min-h-0" style={{ background: INK }}>
      <div
        className="flex items-center justify-between gap-4 px-5 py-3"
        style={{ borderBottom: `1px solid ${HAIR}`, background: DEEP }}
      >
        <div className="flex items-center gap-4 text-[10px] tracking-[0.18em] flex-wrap" style={{ color: MUTED }}>
          <span className="font-semibold" style={{ color: TYPE }}>OUTPUT</span>
          <span>//</span>
          <span>{colCount}×{lineCount} grid</span>
          <span>//</span>
          <span>{charCount.toLocaleString()} characters</span>
          {isAnimating && (<><span>//</span><span style={{ color: BLUE }}>thinking...</span></>)}
        </div>

        <div className="flex items-stretch flex-shrink-0" style={{ border: `1px solid ${HAIR}` }}>
          <ExportButton onClick={handleCopy} disabled={!ascii} type={TYPE} hair={HAIR}>
            {copied ? <Check size={11} strokeWidth={2.5} /> : <Copy size={11} strokeWidth={2.5} />}
            <span>{copied ? 'COPIED' : 'COPY'}</span>
          </ExportButton>
          <ExportButton onClick={handleDownloadSvg} disabled={!ascii} type={TYPE} hair={HAIR} borderLeft>
            <Code size={11} strokeWidth={2.5} />
            <span>.SVG</span>
          </ExportButton>
          <ExportButton onClick={handleDownloadPng} disabled={!ascii} type={TYPE} hair={HAIR} borderLeft primary blue={BLUE}>
            <Download size={11} strokeWidth={2.5} />
            <span>.PNG</span>
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
              fontSize: '12px',
              lineHeight: 1.08,
              color: foreground,
              whiteSpace: 'pre',
              letterSpacing: '0',
              margin: 0,
              textShadow: isAnimating ? `0 0 8px rgba(199,0,66,0.4)` : 'none',
              transition: 'text-shadow 200ms',
            }}
          >
            {displayed}
          </pre>
        ) : (
          <div className="h-full grid place-items-center text-center" style={{ color: MUTED }}>
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

function ExportButton({ onClick, disabled, children, type, hair, borderLeft, primary, blue }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: primary ? (disabled ? '#1F2937' : blue) : 'transparent',
        color: primary ? '#fff' : type,
        borderLeft: borderLeft ? `1px solid ${hair}` : 'none',
        opacity: disabled && !primary ? 0.35 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] tracking-[0.16em] font-semibold transition-all ${primary && !disabled ? 'hover:brightness-110' : 'hover:bg-white/5'}`}
    >
      {children}
    </button>
  );
}
