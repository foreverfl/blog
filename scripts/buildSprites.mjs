import sharp from "sharp";
import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const ICON_DIR = path.resolve("node_modules/@mapbox/maki/icons");
const OUT_DIR = path.resolve("public/sprites");
const ICON_SIZE = 24; // px per icon
const COLS = 20; // icons per row

async function build(pixelRatio = 1) {
  const suffix = pixelRatio === 1 ? "" : `@${pixelRatio}x`;
  const size = ICON_SIZE * pixelRatio;

  const files = (await readdir(ICON_DIR)).filter((f) => f.endsWith(".svg"));
  files.sort();

  const rows = Math.ceil(files.length / COLS);
  const width = COLS * size;
  const height = rows * size;

  const composites = [];
  const json = {};

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const name = file.replace(".svg", "");
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = col * size;
    const y = row * size;

    const svg = await readFile(path.join(ICON_DIR, file));
    const png = await sharp(svg, { density: 72 * pixelRatio })
      .resize(size, size)
      .png()
      .toBuffer();

    composites.push({ input: png, left: x, top: y });
    json[name] = {
      width: size,
      height: size,
      x,
      y,
      pixelRatio,
    };
  }

  const sheet = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();

  await writeFile(path.join(OUT_DIR, `sprite${suffix}.png`), sheet);
  await writeFile(
    path.join(OUT_DIR, `sprite${suffix}.json`),
    JSON.stringify(json, null, 2),
  );

  console.log(
    `sprite${suffix}: ${files.length} icons, ${width}x${height}px, ${(sheet.length / 1024).toFixed(0)}KB`,
  );
}

if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });

// Build 1x and 2x (for retina)
await build(1);
await build(2);
console.log("Done!");
