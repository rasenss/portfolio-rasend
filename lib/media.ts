import fs from "node:fs";

/**
 * Reads the width/height of an image (PNG, JPEG, WebP, GIF, AVIF, SVG) or the first page of a
 * PDF straight from the file's bytes, so the layout can reserve the right space without anyone
 * typing the size in. Returns width / height, or null if the file can't be read.
 */
export function mediaRatio(file: string): number | null {
  try {
    const buf = fs.readFileSync(file);
    const size = readSize(buf, file.toLowerCase());
    if (!size || size.w <= 0 || size.h <= 0) return null;
    return size.w / size.h;
  } catch {
    return null;
  }
}

type Size = { w: number; h: number };

function readSize(b: Buffer, name: string): Size | null {
  if (name.endsWith(".pdf")) return pdf(b);
  if (name.endsWith(".svg")) return svg(b.toString("utf8"));
  // PNG
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  // GIF
  if (b.length > 10 && b.toString("ascii", 0, 3) === "GIF") return { w: b.readUInt16LE(6), h: b.readUInt16LE(8) };
  // WebP
  if (b.length > 30 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return webp(b);
  // JPEG
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) return jpeg(b);
  // AVIF / HEIF: the "ispe" box holds the size
  const ispe = b.indexOf("ispe");
  if (ispe > 0 && ispe + 16 <= b.length) return { w: b.readUInt32BE(ispe + 8), h: b.readUInt32BE(ispe + 12) };
  return null;
}

function webp(b: Buffer): Size | null {
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const b1 = b[22], b2 = b[23], b3 = b[24];
    return { w: 1 + (((b1 & 0x3f) << 8) | b[21]), h: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)) };
  }
  if (chunk === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  return null;
}

function jpeg(b: Buffer): Size | null {
  let i = 2;
  let orientation = 1;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = b[i + 1];
    if (marker === 0xff) {
      i++;
      continue;
    }
    const len = b.readUInt16BE(i + 2);
    // EXIF orientation: phone photos are often stored sideways and turned upright when shown
    if (marker === 0xe1 && b.toString("ascii", i + 4, i + 8) === "Exif") orientation = exifOrientation(b, i + 10) ?? 1;
    const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      const h = b.readUInt16BE(i + 5);
      const w = b.readUInt16BE(i + 7);
      return orientation >= 5 ? { w: h, h: w } : { w, h };
    }
    i += 2 + len;
  }
  return null;
}

function exifOrientation(b: Buffer, tiff: number): number | null {
  try {
    const le = b.toString("ascii", tiff, tiff + 2) === "II";
    const u16 = (o: number) => (le ? b.readUInt16LE(o) : b.readUInt16BE(o));
    const u32 = (o: number) => (le ? b.readUInt32LE(o) : b.readUInt32BE(o));
    const ifd = tiff + u32(tiff + 4);
    const count = u16(ifd);
    for (let n = 0; n < count; n++) {
      const entry = ifd + 2 + n * 12;
      if (u16(entry) === 0x0112) return u16(entry + 8);
    }
  } catch {
    /* unreadable EXIF: assume upright */
  }
  return null;
}

function svg(text: string): Size | null {
  const vb = text.match(/viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (vb) return { w: parseFloat(vb[1]), h: parseFloat(vb[2]) };
  const w = text.match(/<svg[^>]*\swidth\s*=\s*["']([\d.]+)/i);
  const h = text.match(/<svg[^>]*\sheight\s*=\s*["']([\d.]+)/i);
  return w && h ? { w: parseFloat(w[1]), h: parseFloat(h[1]) } : null;
}

/** First page size from the PDF's MediaBox (turned if the page is rotated) */
function pdf(b: Buffer): Size | null {
  const text = b.toString("latin1");
  const box = text.match(/\/MediaBox\s*\[\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\]/);
  if (!box) return null;
  const w = Math.abs(parseFloat(box[3]) - parseFloat(box[1]));
  const h = Math.abs(parseFloat(box[4]) - parseFloat(box[2]));
  const rotate = text.match(/\/Rotate\s+(-?\d+)/);
  const turned = rotate && Math.abs(parseInt(rotate[1], 10)) % 180 === 90;
  return turned ? { w: h, h: w } : { w, h };
}
