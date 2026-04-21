export const CHAR_SETS = {
  GRADIENT:     '@%#*+=-:. ',
  BLOCKS:       '█▓▒░ ',
  'HALF-BLOCK': '█▓▒░▘▝▖▗▀▄▌▐ ',
  DOTS:         '●•∙· ',
  BINARY:       '10 ',
  DETAILED:     '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
  FORMAL:       '∀∃∈⊆⊇∧∨¬⇒□ ',
  AUDIT:        '{}[]()<>=!&|+-*/# ',
  THEOREM:      '∎■□▪▫· ',
};

export const TEXT_STYLES = [
  { key: 'LOGO',    label: 'LOGO',    font: '"Orbitron", sans-serif',    weight: 900 },
  { key: 'DISPLAY', label: 'DISPLAY', font: '"Satoshi", sans-serif',     weight: 900 },
  { key: 'SERIF',   label: 'SERIF',   font: '"Playfair Display", serif', weight: 900 },
  { key: 'OUTLINE', label: 'OUTLINE', font: '"Orbitron", sans-serif',    weight: 900, outline: true },
];

export const SCRAMBLE_POOL = '@#*+=-:.01█▓▒░█▓▒░·•●';

export function canvasToAscii(canvas, widthChars, charset, fixedHeight) {
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
      const idx = Math.min(lastIdx, Math.max(0, Math.floor(avg * charset.length)));
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
