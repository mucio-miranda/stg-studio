import sharp from "sharp";
import { readdir } from "node:fs/promises";

const folder = new URL("../public/images/", import.meta.url);
for (const file of await readdir(folder)) {
  if (!file.endsWith(".png")) continue;
  const width = file === "hero.png" || file === "banner.png" ? 2400 : 1400;
  const result = await sharp(new URL(file, folder).pathname)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(new URL(file.replace(".png", ".webp"), folder).pathname);
  console.log(`${file}: ${result.width} × ${result.height}, ${Math.round(result.size / 1024)} KB`);
}
