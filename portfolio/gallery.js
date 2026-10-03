import { publishedPortfolioAlbums } from "../data/portfolio-albums.mjs";

const base = document.body.dataset.base || "../../../";
const categorySlug = document.body.dataset.categorySlug;
const albumSlug = document.body.dataset.albumSlug;
const album = publishedPortfolioAlbums.find((item) => item.category === categorySlug && item.slug === albumSlug);
const gallery = document.querySelector("[data-gallery]");
const dialog = document.querySelector("[data-lightbox]");
let activeIndex = 0;
let lastTrigger = null;
let touchStartX = 0;

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
  return srcSet.split(", ").map((candidate) => {
    const [path, descriptor] = candidate.split(" ");
    return `${imageUrl(path)} ${descriptor}`;
  }).join(", ");
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
  dialog.querySelectorAll("[data-thumbnail-index]").forEach((thumbnail) => {
    const current = Number(thumbnail.dataset.thumbnailIndex) === activeIndex;
    thumbnail.setAttribute("aria-current", current ? "true" : "false");
    if (current) thumbnail.scrollIntoView({ block: "nearest", inline: "center" });
  });
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

function renderGallery() {
  const fragment = document.createDocumentFragment();
  const thumbnails = dialog.querySelector("[data-lightbox-thumbnails]");
  const thumbnailFragment = document.createDocumentFragment();

  album.photos.forEach((photo, index) => {
    const figure = document.createElement("figure");
    figure.className = `gallery-frame gallery-frame--${photo.layout}`;
    const button = document.createElement("button");
    button.className = "gallery-frame__button";
    button.type = "button";
    button.setAttribute("aria-label", `Open photograph ${index + 1} of ${album.photos.length}: ${photo.alt}`);
    const image = document.createElement("img");
    image.src = imageUrl(photo.src);
    image.srcset = imageSourceSet(photo.srcSet);
    image.sizes = photo.layout === "wide" ? "(min-width: 70rem) 78vw, 100vw" : "(min-width: 48rem) 50vw, 100vw";
    image.width = photo.width;
    image.height = photo.height;
    image.alt = photo.alt;
    image.loading = index === 0 ? "eager" : "lazy";
    image.decoding = "async";
    const fallback = document.createElement("span");
    fallback.className = "gallery-frame__fallback";
    fallback.dataset.imageFallback = "";
    fallback.hidden = true;
    fallback.textContent = "Photograph unavailable";
    image.addEventListener("error", () => markImageFailure(image, button), { once: true });
    button.addEventListener("click", () => openLightbox(index, button));
    const caption = document.createElement("figcaption");
    caption.textContent = photo.caption;
    button.append(image, fallback);
    figure.append(button, caption);
    fragment.append(figure);

    const thumbnail = document.createElement("button");
    thumbnail.type = "button";
    thumbnail.dataset.thumbnailIndex = String(index);
    thumbnail.setAttribute("aria-label", `View photograph ${index + 1}`);
    const thumbnailImage = document.createElement("img");
    thumbnailImage.src = imageUrl(photo.src);
    thumbnailImage.alt = "";
    thumbnailImage.width = 96;
    thumbnailImage.height = 72;
    thumbnailImage.loading = "lazy";
    thumbnail.append(thumbnailImage);
    thumbnail.addEventListener("click", () => updateLightbox(index));
    thumbnailFragment.append(thumbnail);
  });

  gallery.replaceChildren(fragment);
  thumbnails.replaceChildren(thumbnailFragment);
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
