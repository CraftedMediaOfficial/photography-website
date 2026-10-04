import { publishedPortfolioAlbums } from "../data/portfolio-albums.mjs";
import { responsivePicture, sourceSetWithBase } from "../data/responsive-images.mjs";

const base = document.body.dataset.base || "../../../";
const categorySlug = document.body.dataset.categorySlug;
const albumSlug = document.body.dataset.albumSlug;
const album = publishedPortfolioAlbums.find((item) => item.category === categorySlug && item.slug === albumSlug);
const gallery = document.querySelector("[data-gallery]");
const dialog = document.querySelector("[data-lightbox]");
let activeIndex = 0;
let lastTrigger = null;
let touchStartX = 0;
const galleryBatchSize = 18;
const thumbnailWindowSize = 25;
let renderedCount = 0;
let galleryObserver = null;

function renderUnavailable() {
  const main = document.querySelector("main");
  document.title = "Story not found | Crafted Media";
  const section = document.createElement("section");
  section.className = "placeholder";
  const label = document.createElement("p");
  label.className = "eyebrow";
  label.textContent = "Portfolio story";
  const title = document.createElement("h1");
  title.textContent = "This story is not available.";
  const copy = document.createElement("p");
  copy.textContent = "It may still be in draft, hidden, or no longer published.";
  const link = document.createElement("a");
  link.className = "button button--primary";
  link.href = "../";
  link.textContent = "Return to the collection";
  section.append(label, title, copy, link);
  main.replaceChildren(section);
  dialog?.remove();
}

function imageUrl(path) {
  return `${base}${path}`;
}

function imageSourceSet(srcSet) {
  return sourceSetWithBase(srcSet, base);
}

function markImageFailure(image, container) {
  image.hidden = true;
  container.classList.add("is-broken");
  const fallback = container.querySelector("[data-image-fallback]");
  if (fallback) fallback.hidden = false;
}

function updateLightbox(index) {
  activeIndex = (index + album.photos.length) % album.photos.length;
  const photo = album.photos[activeIndex];
  const image = dialog.querySelector("[data-lightbox-image]");
  const error = dialog.querySelector("[data-lightbox-error]");
  error.hidden = true;
  image.hidden = false;
  image.alt = photo.alt;
  image.srcset = imageSourceSet(photo.srcSet);
  image.sizes = "100vw";
  image.src = imageUrl(photo.src);
  image.onerror = () => {
    image.hidden = true;
    error.hidden = false;
  };
  dialog.querySelector("[data-lightbox-caption]").textContent = photo.caption;
  dialog.querySelector("[data-lightbox-position]").textContent = `${activeIndex + 1} / ${album.photos.length}`;
  renderThumbnailWindow();
}

function renderThumbnailWindow() {
  const container = dialog.querySelector("[data-lightbox-thumbnails]");
  const radius = Math.floor(thumbnailWindowSize / 2);
  const start = Math.max(0, Math.min(activeIndex - radius, album.photos.length - thumbnailWindowSize));
  const end = Math.min(album.photos.length, start + thumbnailWindowSize);
  const fragment = document.createDocumentFragment();
  for (let index = start; index < end; index += 1) {
    const photo = album.photos[index];
    const thumbnail = document.createElement("button");
    thumbnail.type = "button";
    thumbnail.dataset.thumbnailIndex = String(index);
    thumbnail.setAttribute("aria-label", `View photograph ${index + 1}`);
    thumbnail.setAttribute("aria-current", index === activeIndex ? "true" : "false");
    const thumbnailImage = document.createElement("img");
    thumbnailImage.src = imageUrl(photo.thumbnail || photo.src);
    thumbnailImage.alt = "";
    thumbnailImage.width = 96;
    thumbnailImage.height = 72;
    thumbnailImage.loading = "lazy";
    thumbnailImage.decoding = "async";
    thumbnail.append(thumbnailImage);
    thumbnail.addEventListener("click", () => updateLightbox(index));
    fragment.append(thumbnail);
  }
  container.replaceChildren(fragment);
  container.querySelector('[aria-current="true"]')?.scrollIntoView({ block: "nearest", inline: "center" });
}

function openLightbox(index, trigger) {
  lastTrigger = trigger;
  updateLightbox(index);
  dialog.showModal();
  document.body.classList.add("lightbox-open");
  dialog.querySelector("[data-lightbox-close]").focus();
}

function closeLightbox() {
  if (dialog.open) dialog.close();
}

function createGalleryFrame(photo, index) {
    const figure = document.createElement("figure");
    figure.className = `gallery-frame gallery-frame--${photo.layout}`;
    const button = document.createElement("button");
    button.className = "gallery-frame__button";
    button.type = "button";
    button.setAttribute("aria-label", `Open photograph ${index + 1} of ${album.photos.length}: ${photo.alt}`);
    const sizes = photo.layout === "wide" ? "(min-width: 70rem) 78vw, 100vw" : "(min-width: 48rem) 50vw, 100vw";
    const { picture, image } = responsivePicture(photo, { base, alt: photo.alt, sizes, loading: index === 0 ? "eager" : "lazy", priority: index === 0 });
    const fallback = document.createElement("span");
    fallback.className = "gallery-frame__fallback";
    fallback.dataset.imageFallback = "";
    fallback.hidden = true;
    fallback.textContent = "Photograph unavailable";
    image.addEventListener("error", () => markImageFailure(image, button), { once: true });
    button.addEventListener("click", () => openLightbox(index, button));
    const caption = document.createElement("figcaption");
    caption.textContent = photo.caption;
    button.append(picture, fallback);
    figure.append(button, caption);
    return figure;
}

function renderNextGalleryBatch() {
  const end = Math.min(album.photos.length, renderedCount + galleryBatchSize);
  const fragment = document.createDocumentFragment();
  for (let index = renderedCount; index < end; index += 1) fragment.append(createGalleryFrame(album.photos[index], index));
  gallery.querySelector("[data-gallery-sentinel]")?.before(fragment);
  renderedCount = end;
  const more = gallery.querySelector("[data-gallery-more]");
  if (more) more.hidden = renderedCount >= album.photos.length;
  if (renderedCount >= album.photos.length) galleryObserver?.disconnect();
}

function renderGallery() {
  const sentinel = document.createElement("div");
  sentinel.className = "gallery-load-more";
  sentinel.dataset.gallerySentinel = "";
  const more = document.createElement("button");
  more.className = "button button--secondary";
  more.type = "button";
  more.dataset.galleryMore = "";
  more.textContent = "Load more photographs";
  more.addEventListener("click", renderNextGalleryBatch);
  sentinel.append(more);
  gallery.replaceChildren(sentinel);
  renderNextGalleryBatch();
  if ("IntersectionObserver" in window && renderedCount < album.photos.length) {
    galleryObserver = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) renderNextGalleryBatch(); }, { rootMargin: "800px 0px" });
    galleryObserver.observe(sentinel);
  }
}

if (!album || !gallery || !dialog) {
  renderUnavailable();
} else {
  renderGallery();
  dialog.querySelector("[data-lightbox-close]").addEventListener("click", closeLightbox);
  dialog.querySelector("[data-lightbox-previous]").addEventListener("click", () => updateLightbox(activeIndex - 1));
  dialog.querySelector("[data-lightbox-next]").addEventListener("click", () => updateLightbox(activeIndex + 1));
  dialog.addEventListener("click", (event) => { if (event.target === dialog) closeLightbox(); });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("lightbox-open");
    lastTrigger?.focus();
  });
  document.addEventListener("keydown", (event) => {
    if (!dialog.open) return;
    if (event.key === "ArrowLeft") updateLightbox(activeIndex - 1);
    if (event.key === "ArrowRight") updateLightbox(activeIndex + 1);
    if (event.key === "Escape") closeLightbox();
  });
  dialog.addEventListener("touchstart", (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  dialog.addEventListener("touchend", (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) < 45) return;
    updateLightbox(activeIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });
}
