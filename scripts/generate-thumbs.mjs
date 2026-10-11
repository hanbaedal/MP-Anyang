/**
 * public/images/*.jpg → public/images/thumbs/ (max width 720, JPEG q=72)
 * Run: npm run thumbs
 */
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.join(process.cwd(), "public", "images");
const outDir = path.join(root, "thumbs");
const MAX_WIDTH = 720;

const files = (await readdir(root)).filter((name) => /\.(jpe?g|png|webp)$/i.test(name));
await mkdir(outDir, { recursive: true });

for (const name of files) {
  const input = path.join(root, name);
  const output = path.join(outDir, name.replace(/\.(png|webp)$/i, ".jpg"));
  await sharp(input)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(output);
  console.log("thumb", name);
}

console.log(`Done: ${files.length} thumbnails in public/images/thumbs/`);
