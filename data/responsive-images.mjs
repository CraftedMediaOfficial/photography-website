import { imageManifest } from "./image-manifest.mjs";

export function sourceSetWithBase(srcSet, base) {
  return srcSet.split(",").map((candidate) => {
    const [path, descriptor] = candidate.trim().split(/\s+/);
    return `${base}${path} ${descriptor}`;
  }).join(", ");
}

export function responsivePicture(source, { base = "", alt = "", sizes = "100vw", loading = "lazy", priority = false } = {}) {
  const record = typeof source === "string" ? imageManifest[source] : source;
  const picture = document.createElement("picture");
  picture.className = "responsive-picture";
  const image = document.createElement("img");
  const fallbackSource = typeof source === "string" ? source : source.src;
  if (record?.avifSrcSet) {
    const avif = document.createElement("source");
    avif.type = "image/avif";
    avif.srcset = sourceSetWithBase(record.avifSrcSet, base);
    avif.sizes = sizes;
    picture.append(avif);
  }
  if (record?.srcSet) image.srcset = sourceSetWithBase(record.srcSet, base);
  image.src = `${base}${record?.src || fallbackSource}`;
  image.sizes = sizes;
  image.width = record?.width || 1536;
  image.height = record?.height || 1024;
  image.alt = alt;
  image.loading = loading;
  image.decoding = "async";
  if (priority) image.fetchPriority = "high";
  picture.append(image);
  return { picture, image, record };
}

