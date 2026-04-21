import { useRef, useState } from 'react';
import { Type, ImageIcon, Upload, Check, X } from 'lucide-react';
import { CHAR_SETS, TEXT_STYLES } from '../lib/engine';

const CHARSET_KEYS = [
  'GRADIENT', 'BLOCKS', 'DOTS',
  'BINARY',   'DETAILED', 'CUSTOM',
  'FORMAL',   'AUDIT',    'THEOREM',
];

export default function Controls({
  theme,
  mode, setMode,
  text, setText,
  textStyle, setTextStyle,
  imageUrl, setImageUrl,
  imageName, setImageName,
  cols, setCols,
  rows, setRows,
  charsetKey, setCharsetKey,
  customCharset, setCustomCharset,
  invert, setInvert,
  foreground, setForeground,
  background, setBackground,
}) {
  const { INK, DEEP, HAIR, TYPE, MUTED, BLUE } = theme;
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setImageUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <aside className="p-5 md:p-6 md:h-full md:overflow-y-auto" style={{ borderRight: `1px solid ${HAIR}`, background: DEEP }}>
      <Section label="01 // MODE" muted={MUTED}>
        <div className="grid grid-cols-2 gap-0" style={{ border: `1px solid ${HAIR}` }}>
          <Toggle active={mode === 'text'} onClick={() => setMode('text')} ink={INK} type={TYPE} hair={HAIR}>
            <Type size={12} strokeWidth={2.5} />
            <span>TEXT</span>
          </Toggle>
          <Toggle active={mode === 'image'} onClick={() => setMode('image')} ink={INK} type={TYPE} hair={HAIR} borderLeft>
            <ImageIcon size={12} strokeWidth={2.5} />
            <span>IMAGE</span>
          </Toggle>
        </div>
      </Section>

      <Section label="02 // INPUT" muted={MUTED}>
        {mode === 'text' ? (
          <>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: BLUE }}>▸</span>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={24}
                placeholder="your text"
                style={{
                  background: INK, border: `1px solid ${HAIR}`, color: TYPE,
                  fontFamily: 'inherit', letterSpacing: '0.06em',
                }}
                className="w-full pl-8 pr-3 py-2.5 text-sm font-semibold uppercase outline-none focus:border-white/30"
              />
            </div>
            <div className="mt-3">
              <div className="text-[10px] tracking-[0.2em] mb-2" style={{ color: MUTED }}>STYLE</div>
              <div className="grid grid-cols-4 gap-0" style={{ border: `1px solid ${HAIR}` }}>
                {TEXT_STYLES.map((s, i) => (
                  <button
                    key={s.key}
                    onClick={() => setTextStyle(s.key)}
                    style={{
                      background: textStyle === s.key ? TYPE : 'transparent',
                      color: textStyle === s.key ? INK : TYPE,
                      borderRight: i < TEXT_STYLES.length - 1 ? `1px solid ${HAIR}` : 'none',
                    }}
                    className="px-2 py-2.5 text-[10px] tracking-[0.16em] font-semibold transition-colors hover:bg-white/5"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `1px dashed ${dragging ? BLUE : HAIR}`,
              background: dragging ? 'rgba(199,0,66,0.06)' : INK,
            }}
            className="cursor-pointer px-4 py-8 text-center transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files[0])}
              className="hidden"
            />
            {imageUrl ? (
              <div className="flex items-center gap-3">
                <img src={imageUrl} alt="" className="w-10 h-10 object-contain" style={{ border: `1px solid ${HAIR}`, background: '#fff' }} />
                <div className="flex-1 text-left overflow-hidden">
                  <div className="text-[11px] font-semibold truncate">{imageName}</div>
                  <div className="text-[10px] tracking-[0.15em]" style={{ color: MUTED }}>TAP TO REPLACE</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setImageUrl(null); setImageName(''); }}
                  style={{ border: `1px solid ${HAIR}`, background: 'transparent' }}
                  className="p-1.5 hover:bg-white/5"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={18} className="mx-auto mb-3" strokeWidth={1.8} style={{ color: MUTED }} />
                <div className="text-[11px] tracking-[0.2em] font-semibold">DROP IMAGE</div>
                <div className="text-[10px] mt-1 tracking-[0.15em]" style={{ color: MUTED }}>OR CLICK TO BROWSE</div>
              </>
            )}
          </div>
        )}
      </Section>

      <Section label="03 // CHARSET" muted={MUTED}>
        <div className="grid grid-cols-3 gap-0" style={{ border: `1px solid ${HAIR}` }}>
          {CHARSET_KEYS.map((k, i) => (
            <button
              key={k}
              onClick={() => setCharsetKey(k)}
              style={{
                background: charsetKey === k ? TYPE : 'transparent',
                color: charsetKey === k ? INK : TYPE,
                borderRight: (i + 1) % 3 !== 0 ? `1px solid ${HAIR}` : 'none',
                borderTop: i >= 3 ? `1px solid ${HAIR}` : 'none',
              }}
              className="px-1.5 py-2 text-[9.5px] tracking-[0.1em] font-semibold hover:bg-white/5"
            >
              {k}
            </button>
          ))}
        </div>
        {charsetKey === 'CUSTOM' && (
          <input
            value={customCharset}
            onChange={(e) => setCustomCharset(e.target.value)}
            placeholder="dense → sparse"
            style={{ background: INK, border: `1px solid ${HAIR}`, color: TYPE }}
            className="w-full mt-2 px-3 py-2 text-sm outline-none"
          />
        )}
        <div
          className="mt-2 px-3 py-2 text-[13px] overflow-hidden whitespace-nowrap"
          style={{ background: INK, border: `1px solid ${HAIR}`, color: MUTED, letterSpacing: '0.12em' }}
        >
          {(charsetKey === 'CUSTOM' ? customCharset : CHAR_SETS[charsetKey]) || '—'}
        </div>
      </Section>

      <Section label="04 // COLORS" muted={MUTED}>
        <div className="grid grid-cols-2 gap-2">
          <ColorField label="FG" value={foreground} onChange={setForeground} ink={INK} hair={HAIR} type={TYPE} muted={MUTED} />
          <ColorField label="BG" value={background} onChange={setBackground} ink={INK} hair={HAIR} type={TYPE} muted={MUTED} />
        </div>
      </Section>

      <Section label="05 // GRID" muted={MUTED}>
        <div className="flex items-center justify-between text-[10px] tracking-[0.18em]" style={{ color: MUTED }}>
          <span>COLS</span><span style={{ color: TYPE }}>{cols}</span>
        </div>
        <input
          type="range"
          min={20}
          max={160}
          value={cols}
          onChange={(e) => setCols(+e.target.value)}
          className="w-full mt-1"
          style={{ accentColor: BLUE }}
        />
        <div className="flex items-center justify-between text-[10px] tracking-[0.18em] mt-2" style={{ color: MUTED }}>
          <span>ROWS</span><span style={{ color: TYPE }}>{rows}</span>
        </div>
        <input
          type="range"
          min={20}
          max={120}
          value={rows}
          onChange={(e) => setRows(+e.target.value)}
          className="w-full mt-1"
          style={{ accentColor: BLUE }}
        />
      </Section>

      <Section label="06 // OPTIONS" muted={MUTED}>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            style={{
              width: 16, height: 16,
              border: `1px solid ${invert ? BLUE : HAIR}`,
              background: invert ? BLUE : 'transparent',
              display: 'grid', placeItems: 'center',
            }}
          >
            {invert && <Check size={10} color={TYPE} strokeWidth={3} />}
          </div>
          <input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} className="hidden" />
          <span className="text-[11px] tracking-[0.12em] font-medium">INVERT TONAL MAPPING</span>
        </label>
      </Section>

    </aside>
  );
}

function Section({ label, children, muted }) {
  return (
    <div className="mb-5">
      <div className="text-[10px] tracking-[0.22em] mb-2.5 font-semibold" style={{ color: muted }}>{label}</div>
      {children}
    </div>
  );
}

function Toggle({ active, onClick, children, ink, type, hair, borderLeft }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? type : 'transparent',
        color: active ? ink : type,
        borderLeft: borderLeft ? `1px solid ${hair}` : 'none',
      }}
      className="flex items-center justify-center gap-2 py-3 text-[10px] tracking-[0.18em] font-semibold transition-colors hover:bg-white/5"
    >
      {children}
    </button>
  );
}

function ColorField({ label, value, onChange, ink, hair, type, muted }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.2em] mb-1.5" style={{ color: muted }}>{label}</div>
      <div className="flex items-center gap-2">
        <label
          style={{
            position: 'relative',
            width: 32, height: 32,
            background: value,
            border: `1px solid ${hair}`,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              position: 'absolute', inset: 0,
              opacity: 0, width: '100%', height: '100%',
              cursor: 'pointer', border: 'none', padding: 0,
            }}
          />
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={7}
          spellCheck={false}
          style={{ background: ink, border: `1px solid ${hair}`, color: type }}
          className="w-full px-2 py-1.5 text-[11px] uppercase outline-none focus:border-white/30"
        />
      </div>
    </div>
  );
}
