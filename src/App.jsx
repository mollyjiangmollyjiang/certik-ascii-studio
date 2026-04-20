import { useState, useEffect, useMemo, useCallback } from 'react';
import { CHAR_SETS, TEXT_STYLES, canvasToAscii, trimAscii } from './lib/engine';
import { useScramble } from './lib/scramble';
import Controls from './components/Controls';
import Output from './components/Output';
import { TopStatusBar, BottomStatusBar } from './components/StatusBar';

const THEME = {
  INK:       '#0A0B0D',
  DEEP:      '#14161A',
  HAIR:      '#2A2E35',
  TYPE:      '#F5F5F0',
  MUTED:     '#6B7280',
  BLUE:      '#C70042',
  BLUE_DEEP: '#9C0033',
};

export default function App() {
  const [mode, setMode] = useState('text');
  const [text, setText] = useState('CERTIK');
  const [textStyle, setTextStyle] = useState('DISPLAY');
  const [imageUrl, setImageUrl] = useState(null);
  const [imageName, setImageName] = useState('');
  const [width, setWidth] = useState(72);
  const [charsetKey, setCharsetKey] = useState('BLOCKS');
  const [customCharset, setCustomCharset] = useState('');
  const [invert, setInvert] = useState(false);
  const [previewSize, setPreviewSize] = useState(12);
  const [ascii, setAscii] = useState('');
  const { displayed, isAnimating } = useScramble(ascii);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Archivo+Black&family=Playfair+Display:ital,wght@0,900;1,900&family=Roboto+Slab:wght@900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch { /* noop */ } };
  }, []);

  const charset = useMemo(() => {
    const base = charsetKey === 'CUSTOM'
      ? (customCharset.length >= 2 ? customCharset : ' .')
      : CHAR_SETS[charsetKey];
    return invert ? base.split('').reverse().join('') : base;
  }, [charsetKey, customCharset, invert]);

  const generateFromText = useCallback(() => {
    if (!text) { setAscii(''); return; }
    const style = TEXT_STYLES.find(s => s.key === textStyle);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const fontSize = 220;
    ctx.font = `${style.weight} ${fontSize}px ${style.font}`;
    const metrics = ctx.measureText(text);
    const pad = 30;
    const w = Math.max(100, Math.ceil(metrics.width) + pad * 2);
    const h = Math.ceil(fontSize * 1.3);
    canvas.width = w;
    canvas.height = h;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, w, h);
    ctx.font = `${style.weight} ${fontSize}px ${style.font}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    if (style.outline) {
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 10;
      ctx.lineJoin = 'round';
      ctx.strokeText(text, w / 2, h / 2);
    } else {
      ctx.fillStyle = 'black';
      ctx.fillText(text, w / 2, h / 2);
    }
    setAscii(trimAscii(canvasToAscii(canvas, width, charset)));
  }, [text, textStyle, width, charset]);

  const generateFromImage = useCallback(() => {
    if (!imageUrl) { setAscii(''); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxDim = 900;
      let iw = img.width, ih = img.height;
      if (iw > maxDim || ih > maxDim) {
        const s = Math.min(maxDim / iw, maxDim / ih);
        iw = Math.floor(iw * s);
        ih = Math.floor(ih * s);
      }
      const canvas = document.createElement('canvas');
      canvas.width = iw;
      canvas.height = ih;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, iw, ih);
      ctx.drawImage(img, 0, 0, iw, ih);
      setAscii(trimAscii(canvasToAscii(canvas, width, charset)));
    };
    img.src = imageUrl;
  }, [imageUrl, width, charset]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (mode === 'text') generateFromText();
      else generateFromImage();
    }, 80);
    return () => clearTimeout(t);
  }, [mode, generateFromText, generateFromImage]);

  const filename = mode === 'text'
    ? (text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'banner')
    : (imageName.replace(/\.[^.]+$/, '') || 'logo');

  return (
    <div
      style={{
        background: THEME.INK,
        color: THEME.TYPE,
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        minHeight: '100vh',
      }}
      className="w-full"
    >
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50,
          backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 3px)`,
        }}
      />
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 51,
          opacity: 0.28, mixBlendMode: 'overlay',
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.22 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="relative max-w-[1500px] mx-auto px-5 md:px-8 py-5">
        <TopStatusBar
          theme={THEME}
          isAnimating={isAnimating}
          charsetKey={charsetKey}
          width={width}
        />

        <header className="mb-5 flex items-end justify-between gap-6">
          <div>
            <div className="text-[10px] tracking-[0.28em] mb-3 flex items-center gap-2" style={{ color: THEME.MUTED }}>
              <span style={{ color: THEME.BLUE }}>◆</span>
              <span>CERTIK // INTERNAL BRANDING ENGINE</span>
            </div>
            <h1
              className="leading-[0.9]"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 800,
                fontSize: 'clamp(44px, 6.5vw, 88px)',
                letterSpacing: '-0.045em',
              }}
            >
              ASCII<span style={{ color: THEME.BLUE }}>.</span>CONV<span style={{ color: THEME.BLUE, animation: 'blink 1s steps(2) infinite' }}>_</span>
            </h1>
            <p className="mt-4 text-[13px] leading-relaxed max-w-[44ch]" style={{ color: THEME.MUTED }}>
              The engine converts text and image into character grids.
              Built for READMEs, CLI splash, socials, and print.
            </p>
          </div>
          <div
            className="hidden md:block text-right text-[10px] leading-[1.6] px-4 py-3"
            style={{ color: THEME.MUTED, border: `1px solid ${THEME.HAIR}`, background: THEME.DEEP }}
          >
            <div style={{ color: THEME.TYPE }}>╔══════════════╗</div>
            <div>║ TEXT → ASCII ║</div>
            <div>║ IMG  → ASCII ║</div>
            <div>║ OUT  → TXT   ║</div>
            <div>║ OUT  → PNG   ║</div>
            <div style={{ color: THEME.TYPE }}>╚══════════════╝</div>
          </div>
        </header>

        <div
          className="grid md:grid-cols-[340px_1fr] gap-0"
          style={{ border: `1px solid ${THEME.HAIR}`, background: THEME.DEEP }}
        >
          <Controls
            theme={THEME}
            mode={mode} setMode={setMode}
            text={text} setText={setText}
            textStyle={textStyle} setTextStyle={setTextStyle}
            imageUrl={imageUrl} setImageUrl={setImageUrl}
            imageName={imageName} setImageName={setImageName}
            width={width} setWidth={setWidth}
            charsetKey={charsetKey} setCharsetKey={setCharsetKey}
            customCharset={customCharset} setCustomCharset={setCustomCharset}
            invert={invert} setInvert={setInvert}
          />
          <Output
            theme={THEME}
            ascii={ascii}
            displayed={displayed}
            isAnimating={isAnimating}
            mode={mode}
            filename={filename}
            previewSize={previewSize}
            setPreviewSize={setPreviewSize}
          />
        </div>

        <BottomStatusBar theme={THEME} />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
