import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const iconDir = join(root, "src-tauri", "icons");
const size = 256;

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);

  length.writeUInt32BE(data.length);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function setPixel(image, x, y, color) {
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  const index = (y * size + x) * 4;
  image[index] = color[0];
  image[index + 1] = color[1];
  image[index + 2] = color[2];
  image[index + 3] = color[3];
}

function fillRect(image, x, y, width, height, color) {
  for (let row = y; row < y + height; row += 1) {
    for (let col = x; col < x + width; col += 1) {
      setPixel(image, col, row, color);
    }
  }
}

function fillRoundedRect(image, x, y, width, height, radius, color) {
  for (let row = y; row < y + height; row += 1) {
    for (let col = x; col < x + width; col += 1) {
      const left = col - x;
      const right = x + width - 1 - col;
      const top = row - y;
      const bottom = y + height - 1 - row;
      const cornerX = Math.min(left, right);
      const cornerY = Math.min(top, bottom);

      if (cornerX >= radius || cornerY >= radius) {
        setPixel(image, col, row, color);
        continue;
      }

      const dx = radius - cornerX;
      const dy = radius - cornerY;
      if (dx * dx + dy * dy <= radius * radius) {
        setPixel(image, col, row, color);
      }
    }
  }
}

function createPng() {
  const image = Buffer.alloc(size * size * 4, 0);

  fillRoundedRect(image, 0, 0, size, size, 48, [22, 35, 31, 255]);
  fillRoundedRect(image, 70, 36, 108, 132, 8, [247, 251, 248, 255]);
  fillRect(image, 88, 64, 80, 8, [138, 160, 154, 255]);
  fillRect(image, 88, 88, 92, 8, [138, 160, 154, 255]);
  fillRect(image, 88, 112, 68, 8, [138, 160, 154, 255]);
  fillRoundedRect(image, 48, 54, 118, 132, 8, [223, 233, 230, 255]);
  fillRect(image, 66, 86, 72, 8, [138, 160, 154, 255]);
  fillRect(image, 66, 110, 86, 8, [138, 160, 154, 255]);
  fillRect(image, 66, 134, 60, 8, [138, 160, 154, 255]);
  fillRoundedRect(image, 34, 82, 188, 118, 16, [244, 201, 93, 255]);
  fillRect(image, 34, 82, 90, 28, [246, 196, 83, 255]);
  fillRoundedRect(image, 68, 60, 124, 42, 12, [246, 196, 83, 255]);
  fillRect(image, 62, 158, 132, 12, [22, 35, 31, 255]);

  const rawRows = [];
  for (let row = 0; row < size; row += 1) {
    rawRows.push(Buffer.from([0]));
    rawRows.push(image.subarray(row * size * 4, (row + 1) * size * 4));
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(Buffer.concat(rawRows))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function createIco(png) {
  const header = Buffer.alloc(6);
  const directory = Buffer.alloc(16);

  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  directory[0] = 0;
  directory[1] = 0;
  directory[2] = 0;
  directory[3] = 0;
  directory.writeUInt16LE(1, 4);
  directory.writeUInt16LE(32, 6);
  directory.writeUInt32LE(png.length, 8);
  directory.writeUInt32LE(header.length + directory.length, 12);

  return Buffer.concat([header, directory, png]);
}

const png = createPng();
await mkdir(iconDir, { recursive: true });
await writeFile(join(iconDir, "icon.png"), png);
await writeFile(join(iconDir, "icon.ico"), createIco(png));
console.log(`Generated Tauri icons in ${iconDir}`);
