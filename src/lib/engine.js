export const CHAR_SETS = {
  GRADIENT: '@%#*+=-:. ',
  BLOCKS:   '█▓▒░ ',
  DOTS:     '●•∙· ',
  BINARY:   '10 ',
  DETAILED: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
  FORMAL:   '∀∃∈⊆⊇∧∨¬⇒□ ',
  AUDIT:    '{}[]()<>=!&|+-*/# ',
  THEOREM:  '∎■□▪▫· ',
};

export const TEXT_STYLES = [
  { key: 'DISPLAY', label: 'DISPLAY', font: '"Archivo Black", sans-serif', weight: 400 },
  { key: 'SERIF',   label: 'SERIF',   font: '"Playfair Display", serif',   weight: 900 },
  { key: 'SLAB',    label: 'SLAB',    font: '"Roboto Slab", serif',        weight: 900 },
  { key: 'OUTLINE', label: 'OUTLINE', font: '"Archivo Black", sans-serif', weight: 400, outline: true },
];

export const SCRAMBLE_POOL = '@#*+=-:.01█▓▒░█▓▒░·•●';

export function canvasToAscii(canvas, widthChars, charset, fixedHeight, contrast = 0.5) {
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
  const img = ctx.getImageData(0, 0, srcW, srcH).data;
  const lastIdx = charset.length - 1;
  // contrast 0.5 = linear; >0.5 = smoothstep S-curve pushing values toward 0/1
  // (HARSH); <0.5 = anchored exponent curve that preserves 0/1 but steepens
  // the mid-range (SOFT — middle stays mid-gray, extremes stay extreme, so
  // pure-white background does not bleed into charset).
  const strength = (contrast - 0.5) * 2; // [-1, 1]
  const enhance = strength >= 0;
  const absStrength = Math.abs(strength);
  const invK = enhance ? 1 : 1 / (1 + absStrength * 2); // SOFT: k in [1,3], exponent = 1/k

  let result = '';
  for (let cy = 0; cy < heightChars; cy++) {
    for (let cx = 0; cx < widthChars; cx++) {
      let sum = 0, count = 0;
      const x0 = Math.floor(cx * cellW);
      const y0 = Math.floor(cy * cellH);
      const x1 = Math.min(srcW, Math.floor((cx + 1) * cellW));
      const y1 = Math.min(srcH, Math.floor((cy + 1) * cellH));
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * srcW + x) * 4;
          const a = img[i + 3] / 255;
          const b = (img[i] * 0.299 + img[i + 1] * 0.587 + img[i + 2] * 0.114) / 255;
          sum += b * a + (1 - a);
          count++;
        }
      }
      const avg = count > 0 ? sum / count : 1;
      let adjusted;
      if (enhance) {
        const sCurve = avg * avg * (3 - 2 * avg);
        adjusted = avg + (sCurve - avg) * strength;
      } else {
        const d = avg - 0.5;
        adjusted = 0.5 + Math.sign(d) * Math.pow(Math.abs(d), invK) * 0.5;
      }
      const idx = Math.min(lastIdx, Math.max(0, Math.floor(adjusted * charset.length)));
      result += charset[idx];
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
