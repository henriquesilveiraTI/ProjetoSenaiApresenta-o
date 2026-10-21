import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = path.join(root, "Erro Neon Futurista.png");
const publicDir = path.join(root, "apps", "web", "public");
const iconsDir = path.join(publicDir, "icons");

await mkdir(iconsDir, { recursive: true });

const trimmed = await sharp(source)
  .flatten({ background: "#000000" })
  .trim({ background: "#000000", threshold: 12 })
  .png()
  .toBuffer();

const meta = await sharp(trimmed).metadata();
console.log(`Logo recortada: ${meta.width}x${meta.height}`);

/**
 * Converte o fundo preto em transparência preservando o brilho verde.
 * O alpha cresce suavemente em luminosidades baixas para evitar halo duro.
 */
const { data, info } = await sharp(trimmed)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let index = 0; index < data.length; index += 4) {
  const brightness = Math.max(
    data[index] ?? 0,
    data[index + 1] ?? 0,
    data[index + 2] ?? 0,
  );
  const alpha =
    brightness <= 8
      ? 0
      : Math.min(255, Math.round(((brightness - 8) / 40) * 255));
  data[index + 3] = alpha;
}

const transparentLogo = await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png()
  .toBuffer();

const markData = Buffer.from(data);
for (let index = 0; index < markData.length; index += 4) {
  const brightness = Math.max(
    markData[index] ?? 0,
    markData[index + 1] ?? 0,
    markData[index + 2] ?? 0,
  );
  const alpha =
    brightness <= 48
      ? 0
      : Math.min(255, Math.round(((brightness - 48) / 32) * 255));
  markData[index + 3] = alpha;
}

const transparentMark = await sharp(markData, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png()
  .toBuffer();

async function renderIcon(size, coverage, relativePath) {
  const logoWidth = Math.round(size * coverage);
  const logo = await sharp(trimmed)
    .resize({ width: logoWidth, withoutEnlargement: false })
    .toBuffer();
  const logoMeta = await sharp(logo).metadata();
  const left = Math.round((size - (logoMeta.width ?? logoWidth)) / 2);
  const top = Math.round((size - (logoMeta.height ?? logoWidth / 2)) / 2);
  const target = path.join(publicDir, relativePath);

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: "#000000",
    },
  })
    .composite([{ input: logo, left, top }])
    .png({ compressionLevel: 9 })
    .toFile(target);

  console.log(`Gerado: public/${relativePath}`);
}

await renderIcon(192, 0.86, "icons/icon-192.png");
await renderIcon(512, 0.86, "icons/icon-512.png");
await renderIcon(512, 0.68, "icons/maskable-512.png");
await renderIcon(180, 0.88, "apple-touch-icon.png");
await renderIcon(64, 0.9, "favicon.png");

await sharp(transparentLogo)
  .resize({ width: 1400 })
  .png({ compressionLevel: 9 })
  .toFile(path.join(publicDir, "logo-error.png"));

await sharp(transparentMark)
  .resize({ width: 900 })
  .png({ compressionLevel: 9 })
  .toFile(path.join(publicDir, "logo-mark.png"));

await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 3,
    background: "#070909",
  },
})
  .composite([
    {
      input: await sharp(trimmed).resize({ width: 900 }).toBuffer(),
      left: 150,
      top: 210,
    },
  ])
  .png({ compressionLevel: 9 })
  .toFile(path.join(publicDir, "og-image.png"));

console.log("Logo principal e imagem Open Graph geradas.");
