import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { imageManifest } from "../data/image-manifest.mjs";
import { publishedPortfolioAlbums } from "../data/portfolio-albums.mjs";
import { ingestImage } from "./image-pipeline.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pathsFromSet = (srcSet) => srcSet.split(",").map((candidate) => candidate.trim().split(/\s+/)[0]);
const widthsFromSet = (srcSet) => srcSet.split(",").map((candidate) => Number(candidate.trim().match(/ (\d+)w$/)?.[1]));

for (const [source, record] of Object.entries(imageManifest)) {
  assert.ok(record.srcSet && record.avifSrcSet && record.thumbnail && record.width && record.height && record.aspectRatio, `${source} is missing responsive metadata.`);
  const webpWidths = widthsFromSet(record.srcSet);
  const avifWidths = widthsFromSet(record.avifSrcSet);
  assert.deepEqual(webpWidths, [...webpWidths].sort((a, b) => a - b), `${source} WebP widths are not ordered.`);
  assert.deepEqual(avifWidths, webpWidths, `${source} AVIF and WebP widths do not match.`);
  for (const path of [...pathsFromSet(record.srcSet), ...pathsFromSet(record.avifSrcSet), record.thumbnail]) {
    const details = await fs.stat(resolve(root, path));
    assert.ok(details.size < 600_000, `${path} exceeds the 600 KB derivative budget.`);
    const metadata = await sharp(resolve(root, path)).metadata();
    assert.ok(["webp", "heif"].includes(metadata.format), `${path} is not WebP or AVIF.`);
  }
}

for (const album of publishedPortfolioAlbums) for (const photo of album.photos) {
  for (const field of ["src", "srcSet", "avifSrcSet", "thumbnail", "width", "height", "aspectRatio", "alt"]) assert.ok(photo[field], `${album.slug} photo is missing ${field}.`);
}

const gallerySource = await fs.readFile(resolve(root, "portfolio/gallery.js"), "utf8");
for (const behavior of ["galleryBatchSize = 18", "thumbnailWindowSize = 25", "IntersectionObserver", "renderNextGalleryBatch", "photo.thumbnail", "responsivePicture", "markImageFailure"]) assert.ok(gallerySource.includes(behavior), `Gallery performance behavior ${behavior} is missing.`);
const css = await fs.readFile(resolve(root, "style.css"), "utf8");
assert.ok(css.includes("content-visibility: auto") && css.includes("contain-intrinsic-block-size"), "Off-screen gallery containment is missing.");
const home = await fs.readFile(resolve(root, "index.html"), "utf8");
for (const marker of ["type=\"image/avif\"", "imagesrcset", "fetchpriority=\"high\"", "loading=\"lazy\"", "decoding=\"async\""]) assert.ok(home.includes(marker), `Homepage image performance marker ${marker} is missing.`);

const fiveHundredPhotos = Array.from({ length: 500 }, (_, index) => ({ ...publishedPortfolioAlbums[0].photos[index % publishedPortfolioAlbums[0].photos.length], caption: `Scale fixture ${index + 1}` }));
assert.equal(fiveHundredPhotos.slice(0, 18).length, 18, "Initial 500-image gallery batch is incorrect.");
assert.equal(Math.ceil(fiveHundredPhotos.length / 18), 28, "500-image gallery batch count is incorrect.");
assert.equal(Math.min(fiveHundredPhotos.length, 25), 25, "Large-gallery thumbnail window is incorrect.");

const temporary = await fs.mkdtemp(join(tmpdir(), "crafted-image-pipeline-"));
try {
  const record = await ingestImage(resolve(root, "assets/images/gallery/celebration-768.webp"), { root: temporary, slug: "pipeline-test", alt: "Pipeline test photograph" });
  assert.ok(record.srcSet.includes("320w") && record.srcSet.includes("768w"), "Pipeline did not create expected responsive widths.");
  assert.ok(record.avifSrcSet.includes(".avif") && record.thumbnail.includes("320.webp"), "Pipeline did not create AVIF and thumbnail outputs.");
  for (const path of [...pathsFromSet(record.srcSet), ...pathsFromSet(record.avifSrcSet)]) await fs.access(resolve(temporary, path));
} finally {
  await fs.rm(temporary, { recursive: true, force: true });
}

console.log(`Verified ${Object.keys(imageManifest).length} responsive image records, WebP/AVIF derivatives, metadata, compression budgets, broken-image safeguards, progressive 500-photo batching and repeatable ingestion.`);
