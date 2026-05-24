import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const brandBg = "#17443f";

const source = await readFile(join(publicDir, "icon.svg"));

// Transparent-corner icons (purpose "any"): keep the rounded SVG as-is.
const anyIcons = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 }
];

// Opaque full-bleed icons: flatten onto the brand background so corners are
// not transparent. iOS apple-touch-icon and maskable icons require this.
const opaqueIcons = [
  { file: "apple-icon.png", size: 180 },
  { file: "icon-maskable-512.png", size: 512 }
];

for (const { file, size } of anyIcons) {
  const png = await sharp(source, { density: 384 }).resize(size, size).png().toBuffer();
  await writeFile(join(publicDir, file), png);
  console.log(`wrote public/${file} (${size}x${size})`);
}

for (const { file, size } of opaqueIcons) {
  const png = await sharp(source, { density: 384 })
    .resize(size, size)
    .flatten({ background: brandBg })
    .png()
    .toBuffer();
  await writeFile(join(publicDir, file), png);
  console.log(`wrote public/${file} (${size}x${size}, opaque)`);
}
