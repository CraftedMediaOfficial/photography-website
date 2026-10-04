import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const targetWidths = [320, 640, 960, 1280, 1600, 2048];
const supportedFormats = new Set(["jpeg", "png", "webp", "avif", "tiff"]);
const safeSlug = (value) => String(value || basename(value || "photo", extname(value || "")))
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72) || "photo";
const publicPath = (root, path) => relative(root, path).split(sep).join("/");

export async function ingestImage(inputPath, { root = projectRoot, slug, alt = "" } = {}) {
  const source = resolve(inputPath);
  const bytes = await fs.readFile(source);
  if (!bytes.length || bytes.length > 50_000_000) throw new Error("Source image must be between 1 byte and 50 MB.");
  const probe = sharp(bytes, { failOn: "warning", limitInputPixels: 80_000_000 });
  const metadata = await probe.metadata();
  if (!supportedFormats.has(metadata.format) || !metadata.width || !metadata.height) throw new Error("Unsupported or unreadable source image.");
  const rotated = [5, 6, 7, 8].includes(metadata.orientation);
  const sourceWidth = rotated ? metadata.height : metadata.width;
  const sourceHeight = rotated ? metadata.width : metadata.height;
  const widths = targetWidths.filter((width) => width < sourceWidth);
  widths.push(Math.min(sourceWidth, targetWidths.at(-1)));
  const uniqueWidths = [...new Set(widths)].sort((a, b) => a - b);
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
  const name = safeSlug(slug || basename(source, extname(source)));
  const directory = join(resolve(root), "assets/images/library", `${name}-${hash}`);
  await fs.mkdir(directory, { recursive: true });

  const webp = [];
  const avif = [];
  for (const width of uniqueWidths) {
    const height = Math.max(1, Math.round(sourceHeight * (width / sourceWidth)));
    const webpFile = join(directory, `${name}-${width}.webp`);
    const avifFile = join(directory, `${name}-${width}.avif`);
    await Promise.all([
      sharp(bytes, { failOn: "warning", limitInputPixels: 80_000_000 }).autoOrient().resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 5, smartSubsample: true }).toFile(webpFile),
      sharp(bytes, { failOn: "warning", limitInputPixels: 80_000_000 }).autoOrient().resize({ width, withoutEnlargement: true }).avif({ quality: 68, effort: 3, chromaSubsampling: "4:4:4" }).toFile(avifFile)
    ]);
    webp.push({ path: publicPath(root, webpFile), width, height });
    avif.push({ path: publicPath(root, avifFile), width, height });
  }
  const largest = webp.at(-1);
  const thumbnail = webp[0];
  return {
    src: largest.path,
    srcSet: webp.map((item) => `${item.path} ${item.width}w`).join(", "),
    avifSrcSet: avif.map((item) => `${item.path} ${item.width}w`).join(", "),
    thumbnail: thumbnail.path,
    width: largest.width,
    height: largest.height,
    aspectRatio: Number((largest.width / largest.height).toFixed(6)),
    alt,
    caption: "",
    layout: largest.width / largest.height > 1.3 ? "wide" : largest.width / largest.height < 0.85 ? "portrait" : "standard",
    sourceHash: hash
  };
}

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : null;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const input = argument("input");
  if (!input) throw new Error("Usage: npm run images -- --input path/to/photo.jpg [--slug story-name] [--alt description]");
  const result = await ingestImage(input, { slug: argument("slug"), alt: argument("alt") || "" });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
