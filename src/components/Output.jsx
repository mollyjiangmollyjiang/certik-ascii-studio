import { useState } from 'react';
import { Copy, Download, Check, FileText } from 'lucide-react';

export default function Output({
  theme,
  ascii,
  displayed,
  isAnimating,
  mode,
  filename,
  previewSize,
  setPreviewSize,
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

  const handleDownloadTxt = () => {
    const blob = new Blob([ascii], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
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
    ctx.font = `500 ${fontSize}px "JetBrains Mono", monospace`;
    const charWidth = ctx.measureText('M').width;
    const maxLen = Math.max(...lines.map(l => l.length));
    const pad = 56;
    const w = Math.ceil(charWidth * maxLen) + pad * 2;
    const h = Math.ceil(lineHeight * lines.length) + pad * 2;
    canvas.width = w;
    canvas.height = h;
    ctx.fillStyle = '#0A0B0D';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#F5F5F0';
    ctx.font = `500 ${fontSize}px "JetBrains Mono", monospace`;
    ctx.textBaseline = 'top';
    lines.forEach((line, i) => ctx.fillText(line, pad, pad + i * lineHeight));
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${filename}.png`;
    a.click();
  };

  return (
    <section className="flex flex-col" style={{ background: INK, minHeight: 600 }}>
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: `1px solid ${HAIR}`, background: DEEP }}
      >
        <div className="flex items-center gap-4 text-[10px] tracking-[0.18em]" style={{ color: MUTED }}>
          <span className="font-semibold" style={{ color: TYPE }}>OUTPUT</span>
          <span>//</span>
          <span>GRID {colCount}×{lineCount}</span>
          <span>//</span>
          <span>{charCount.toLocaleString()} CHARS</span>
          {isAnimating && (<><span>//</span><span style={{ color: BLUE }}>SCANNING...</span></>)}
        </div>

        <div className="flex items-center gap-2 text-[10px] tracking-[0.18em]" style={{ color: MUTED }}>
          ZOOM
          <input
            type="range"
            min={6}
            max={20}
            value={previewSize}
            onChange={(e) => setPreviewSize(+e.target.value)}
            className="w-20"
            style={{ accentColor: BLUE }}
          />
        </div>
      </div>

      <div
        className="flex-1 overflow-auto p-6 md:p-10"
        style={{
          background: INK,
          backgroundImage: `radial-gradient(ellipse at center, rgba(199,0,66,0.05) 0%, transparent 60%)`,
        }}
      >
        {displayed ? (
          <pre
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: `${previewSize}px`,
              lineHeight: 1.08,
              color: TYPE,
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
                {mode === 'text' ? '> awaiting text input' : '> awaiting image drop'}
                <span style={{ color: BLUE, animation: 'blink 1s steps(2) infinite' }}>_</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-stretch" style={{ borderTop: `1px solid ${HAIR}`, background: DEEP }}>
        <ExportButton onClick={handleCopy} disabled={!ascii} type={TYPE} hair={HAIR}>
          {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2.5} />}
          <span>{copied ? 'COPIED' : 'COPY'}</span>
        </ExportButton>
        <ExportButton onClick={handleDownloadTxt} disabled={!ascii} type={TYPE} hair={HAIR} borderLeft>
          <FileText size={13} strokeWidth={2.5} />
          <span>EXPORT .TXT</span>
        </ExportButton>
        <ExportButton onClick={handleDownloadPng} disabled={!ascii} type={TYPE} hair={HAIR} borderLeft primary blue={BLUE}>
          <Download size={13} strokeWidth={2.5} />
          <span>EXPORT .PNG</span>
        </ExportButton>
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
        flex: primary ? 1.3 : 1,
      }}
      className={`flex items-center justify-center gap-2 py-4 text-[10.5px] tracking-[0.18em] font-semibold transition-all ${primary && !disabled ? 'hover:brightness-110' : 'hover:bg-white/5'}`}
    >
      {children}
    </button>
  );
}
