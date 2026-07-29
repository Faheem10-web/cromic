import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let c = (crc ^ buf[i]) & 0xff;
    for (let k = 0; k < 8; k++) {
      crc = (crc >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
      c >>>= 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const typeAndData = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crcBuf]);
}

function createPng(width, height, drawFn) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    raw[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = a;
    }
  }
  const idatData = zlib.deflateSync(raw, { level: 9 });
  const idat = makeChunk('IDAT', idatData);
  const iend = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

function drawCromicLogo(x, y, w, h, isMaskable = false) {
  const nx = (x / w) * 2 - 1; // -1 to 1
  const ny = (y / h) * 2 - 1; // -1 to 1

  // Scale for maskable safe area (80% box => scale by 0.72)
  const scale = isMaskable ? 0.72 : 0.85;
  const sx = nx / scale;
  const sy = ny / scale;

  // Background: Pure Black #000000
  let r = 0, g = 0, b = 0, a = 255;

  // Eyewear frame geometry (left lens & right lens + bridge + temples)
  const distLeftLens = Math.sqrt(Math.pow(sx + 0.35, 2) + Math.pow(sy * 1.3, 2));
  const distRightLens = Math.sqrt(Math.pow(sx - 0.35, 2) + Math.pow(sy * 1.3, 2));

  // Lens rings
  const isLeftRing = distLeftLens >= 0.22 && distLeftLens <= 0.36;
  const isRightRing = distRightLens >= 0.22 && distRightLens <= 0.36;

  // Bridge connecting lenses
  const isBridge = Math.abs(sx) <= 0.18 && Math.abs(sy + 0.05) <= 0.04;

  // Temples extensions
  const isLeftTemple = sx <= -0.55 && sx >= -0.75 && Math.abs(sy + 0.08) <= 0.035;
  const isRightTemple = sx >= 0.55 && sx <= 0.75 && Math.abs(sy + 0.08) <= 0.035;

  if (isLeftRing || isRightRing || isBridge || isLeftTemple || isRightTemple) {
    r = 255;
    g = 255;
    b = 255;
    a = 255;
  }

  return [r, g, b, a];
}

const iconsDir = path.join(rootDir, 'public', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

const sizes = [
  { name: 'favicon-16.png', size: 16 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-48.png', size: 48 },
  { name: 'mstile-150.png', size: 150 },
  { name: 'apple-touch-icon-180.png', size: 180 },
  { name: 'android-192.png', size: 192 },
  { name: 'android-512.png', size: 512 },
  { name: 'maskable-192.png', size: 192, maskable: true },
  { name: 'maskable-512.png', size: 512, maskable: true },
];

sizes.forEach(({ name, size, maskable }) => {
  const buf = createPng(size, size, (x, y, w, h) => drawCromicLogo(x, y, w, h, maskable));
  fs.writeFileSync(path.join(iconsDir, name), buf);
  if (size === 32 && !maskable) {
    fs.writeFileSync(path.join(rootDir, 'public', 'favicon.ico'), buf);
  }
});

// Safari pinned tab SVG
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="#000000"/>
  <circle cx="180" cy="256" r="80" stroke="#ffffff" stroke-width="28" fill="none"/>
  <circle cx="332" cy="256" r="80" stroke="#ffffff" stroke-width="28" fill="none"/>
  <rect x="230" y="242" width="52" height="28" fill="#ffffff"/>
</svg>`;
fs.writeFileSync(path.join(iconsDir, 'safari-pinned-tab.svg'), svgContent);

console.log('All luxury PWA icons generated successfully in public/icons/ and public/favicon.ico!');
