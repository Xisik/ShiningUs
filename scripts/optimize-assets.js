#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const IMG_ROOT = path.join(ROOT, 'assets', 'img');
const OUT_ROOT = path.join(IMG_ROOT, 'generated');
const INPUT_EXT_RE = /\.(?:png|jpe?g)$/i;
const WIDTHS = [360, 720, 1080, 1440];

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'generated') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile() && INPUT_EXT_RE.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function outputPathFor(inputPath, width) {
  const rel = path.relative(IMG_ROOT, inputPath);
  const parsed = path.parse(rel);
  return path.join(OUT_ROOT, parsed.dir, `${parsed.name}-${width}.webp`);
}

async function convert(inputPath) {
  const image = sharp(inputPath, { failOn: 'none' });
  const metadata = await image.metadata();
  const sourceWidth = metadata.width || 0;
  const targetWidths = sourceWidth > 0 ? WIDTHS : [];

  for (const width of targetWidths) {
    const outPath = outputPathFor(inputPath, width);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await sharp(inputPath, { failOn: 'none' })
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(outPath);
    console.log(`Generated ${path.relative(ROOT, outPath)}`);
  }
}

async function main() {
  fs.rmSync(OUT_ROOT, { recursive: true, force: true });
  fs.mkdirSync(OUT_ROOT, { recursive: true });
  const inputs = walk(IMG_ROOT);
  for (const inputPath of inputs) {
    await convert(inputPath);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
