// Draws the app icon (a kalimba: wood board, bridge, metal tines) as PNGs.
// Run: node tools/make-icons.mjs
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

function png(size) {
  const px = new Uint8Array(size * size * 3);
  const set = (x, y, [r, g, b]) => { const i = (y * size + x) * 3; px[i] = r; px[i + 1] = g; px[i + 2] = b; };
  const s = size / 512;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const t = y / size; // background: warm wood gradient
    set(x, y, [Math.round(196 - 40 * t), Math.round(140 - 36 * t), Math.round(92 - 30 * t)]);
  }
  const rect = (x0, y0, x1, y1, col) => {
    for (let y = Math.round(y0 * s); y < Math.round(y1 * s); y++)
      for (let x = Math.round(x0 * s); x < Math.round(x1 * s); x++) set(x, y, typeof col === 'function' ? col(x / s - x0, x1 - x0) : col);
  };
  const metal = (dx, w) => { const v = Math.round(250 - 70 * Math.abs(dx / w - 0.45)); return [v, v, v + 2]; };
  // 9 tines, centre longest; rounded tips via a half-disc.
  const n = 9, w = 30, gap = 10, total = n * w + (n - 1) * gap, left = (512 - total) / 2;
  for (let i = 0; i < n; i++) {
    const rank = Math.abs(i - (n - 1) / 2);
    const len = 300 - rank * 40;
    const x0 = left + i * (w + gap), y0 = 120, y1 = y0 + len;
    rect(x0, y0, x0 + w, y1, metal);
    for (let y = Math.round(y1 * s); y < Math.round((y1 + w / 2) * s); y++)
      for (let x = Math.round(x0 * s); x < Math.round((x0 + w) * s); x++) {
        const cx = (x0 + w / 2) * s, r = (w / 2) * s;
        if ((x - cx) ** 2 + (y - y1 * s) ** 2 <= r * r) set(x, y, metal(x / s - x0, w));
      }
  }
  rect(70, 112, 442, 140, [214, 216, 220]); // bridge
  rect(70, 136, 442, 140, [150, 152, 156]);

  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) { raw[y * (size * 3 + 1)] = 0; Buffer.from(px.buffer, y * size * 3, size * 3).copy(raw, y * (size * 3 + 1) + 1); }
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = 0xffffffff; for (const v of b) c = crcTable[(c ^ v) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]])
  writeFileSync(new URL(`../icons/${name}`, import.meta.url), png(size));
console.log('icons written');
