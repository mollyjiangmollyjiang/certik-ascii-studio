export const CHAR_SETS = {
  GRADIENT:     '@%#*+=-:. ',
  BLOCKS:       '█▓▒░ ',
  'HALF-BLOCK': '█▓▒░▘▝▖▗▀▄▌▐ ',
  DOTS:         '●•∙· ',
  BINARY:       '10 ',
  DETAILED:     '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
  FORMAL:       '∀∃∮∑∏∫⊕⊗⊆⊇∈∉∧∨¬⇒⇔≡≠≤≥ ',
  AUDIT:        '@#$%^&*{}[]()<>/\\|~=!?:;.,+- ',
  THEOREM:      '∎■□▪▫· ',
};

export const TEXT_STYLES = [
  { key: 'DISPLAY',  label: 'DISPLAY',  font: '"Satoshi", sans-serif',     weight: 900 },
  { key: 'ORBITRON', label: 'ORBITRON', font: '"Orbitron", sans-serif',    weight: 900 },
  { key: 'SERIF',    label: 'SERIF',    font: '"Playfair Display", serif', weight: 900 },
];

export const SCRAMBLE_POOL = '@#*+=-:.01█▓▒░█▓▒░·•●';

function toGrayscale(imageData) {
  const { data, width, height } = imageData;
  const pixels = new Float32Array(width * height);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    const a = data[i + 3] / 255;
    const r = data[i]     / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    // composite over white so transparent pixels read as background
    pixels[j] = lum * a + (1 - a);
  }
  return pixels;
}

function applyAutoLevels(pixels) {
  const BUCKETS = 256;
  const hist = new Uint32Array(BUCKETS);
  for (let i = 0; i < pixels.length; i++) {
    const b = Math.min(BUCKETS - 1, Math.max(0, Math.floor(pixels[i] * BUCKETS)));
    hist[b]++;
  }
  const total = pixels.length;
  // more aggressive clipping: 5% / 95% percentiles
  const loThresh = total * 0.05;
  const hiThresh = total * 0.95;
  let lo = 0, hi = BUCKETS - 1, cum = 0;
  for (let i = 0; i < BUCKETS; i++) {
    cum += hist[i];
    if (cum >= loThresh) { lo = i; break; }
  }
  cum = 0;
  for (let i = 0; i < BUCKETS; i++) {
    cum += hist[i];
    if (cum >= hiThresh) { hi = i; break; }
  }
  const loVal = lo / BUCKETS;
  const hiVal = hi / BUCKETS;
  const range = hiVal - loVal;
  if (range < 0.01) return pixels;
  const out = new Float32Array(pixels.length);
  for (let i = 0; i < pixels.length; i++) {
    const s = (pixels[i] - loVal) / range;
    out[i] = s < 0 ? 0 : (s > 1 ? 1 : s);
  }
  return out;
}

function applySCurve(pixels) {
  // Ken Perlin's smootherstep applied twice — extreme dark/light separation
  // for low-contrast inputs. First pass boosts to strong S; second pass
  // pushes plateaus even flatter at 0/1 and steepens the transition again.
  const out = new Float32Array(pixels.length);
  for (let i = 0; i < pixels.length; i++) {
    let x = pixels[i];
    x = x * x * x * (x * (x * 6 - 15) + 10);
    x = x * x * x * (x * (x * 6 - 15) + 10);
    out[i] = x;
  }
  return out;
}

export function canvasToAscii(
  canvas,
  widthChars,
  charset,
  fixedHeight,
  invert = false,
  isolateSubject = false,
  subjectThreshold = 0.65,
  enhanceContrast = true,
) {
  const ctx = canvas.getContext('2d');
  const srcW = canvas.width;
  const srcH = canvas.height;
  const cellW = srcW / widthChars;
  let heightChars, cellH;
  if (fixedHeight && fixedHeight > 0) {
    heightChars = fixedHeight;
    cellH = srcH / heightChars;
  } else {
    cellH = cellW * 2;
    heightChars = Math.max(1, Math.floor(srcH / cellH));
  }

  const imageData = ctx.getImageData(0, 0, srcW, srcH);
  let pixels = toGrayscale(imageData);
  pixels = applyAutoLevels(pixels);
  if (enhanceContrast) pixels = applySCurve(pixels);

  const lastIdx = charset.length - 1;
  let result = '';
  for (let cy = 0; cy < heightChars; cy++) {
    for (let cx = 0; cx < widthChars; cx++) {
      let sum = 0, count = 0;
      const x0 = Math.floor(cx * cellW);
      const y0 = Math.floor(cy * cellH);
      const x1 = Math.min(srcW, Math.floor((cx + 1) * cellW));
      const y1 = Math.min(srcH, Math.floor((cy + 1) * cellH));
      for (let y = y0; y < y1; y++) {
        const rowOffset = y * srcW;
        for (let x = x0; x < x1; x++) {
          sum += pixels[rowOffset + x];
          count++;
        }
      }
      let avg = count > 0 ? sum / count : 1;
      if (invert) avg = 1 - avg;
      if (isolateSubject && avg > subjectThreshold) {
        result += ' ';
      } else {
        const idx = Math.min(lastIdx, Math.max(0, Math.floor(avg * charset.length)));
        result += charset[idx];
      }
    }
    result += '\n';
  }
  return result;
}

export function trimAscii(ascii) {
  let lines = ascii.split('\n');
  const isBlank = (l) => /^\s*$/.test(l);
  let top = 0, bot = lines.length;
  while (top < bot && isBlank(lines[top])) top++;
  while (bot > top && isBlank(lines[bot - 1])) bot--;
  lines = lines.slice(top, bot);
  if (!lines.length) return '';
  let minLead = Infinity, maxEnd = 0;
  lines.forEach(l => {
    const lead = l.match(/^\s*/)[0].length;
    const end = l.replace(/\s+$/, '').length;
    if (end > 0) minLead = Math.min(minLead, lead);
    maxEnd = Math.max(maxEnd, end);
  });
  if (!isFinite(minLead)) minLead = 0;
  return lines.map(l => l.slice(minLead, maxEnd).padEnd(maxEnd - minLead, ' ')).join('\n');
}
