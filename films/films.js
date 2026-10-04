import { publishedFilms } from "../data/films.mjs";
import { responsivePicture } from "../data/responsive-images.mjs";

const base = document.body.dataset.base || "../";
const filmList = document.querySelector("[data-film-list]");
const showreel = document.querySelector("[data-showreel]");
const fallback = document.querySelector("[data-video-fallback]");
const embedDialog = document.querySelector("[data-film-dialog]");
const allowedExternalHosts = new Set(["youtube.com", "www.youtube.com", "youtu.be", "instagram.com", "www.instagram.com", "vimeo.com", "www.vimeo.com"]);
const allowedEmbedHosts = new Set(["www.youtube-nocookie.com", "player.vimeo.com"]);

function safeUrl(value, allowedHosts) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && allowedHosts.has(url.hostname) ? url : null;
  } catch {
    return null;
  }
}

function addAction(container, film) {
  if (film.videoUrl) {
    const link = document.createElement("a");
    link.className = "text-link";
    link.href = "#showreel";
    link.textContent = "Watch motion study";
    container.append(link);
    return;
  }
  const embed = safeUrl(film.embedUrl, allowedEmbedHosts);
  if (embed) {
    const button = document.createElement("button");
    button.className = "text-link film-card__button";
    button.type = "button";
    button.textContent = "Play film";
    button.addEventListener("click", () => openEmbed(film, embed));
    container.append(button);
    return;
  }
  const destination = safeUrl(film.destinationUrl, allowedExternalHosts);
  if (destination) {
    const link = document.createElement("a");
    link.className = "text-link";
    link.href = destination.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Watch on external platform";
    container.append(link);
    return;
  }
  const unavailable = document.createElement("span");
  unavailable.className = "film-card__unavailable";
  unavailable.textContent = "Film link awaiting approval";
  container.append(unavailable);
}

function openEmbed(film, url) {
  const frame = embedDialog.querySelector("iframe");
  frame.src = url.href;
  frame.title = film.title;
  embedDialog.querySelector("[data-film-dialog-title]").textContent = film.title;
  embedDialog.showModal();
}

function closeEmbed() {
  const frame = embedDialog.querySelector("iframe");
  frame.src = "about:blank";
  embedDialog.close();
}

function renderFilms() {
  if (!filmList) return;
  const fragment = document.createDocumentFragment();
  publishedFilms.forEach((film, index) => {
    const article = document.createElement("article");
    article.className = "film-card";
    const visual = document.createElement("div");
    visual.className = "film-card__visual";
    const { picture } = responsivePicture(film.thumbnail, { base, alt: "", sizes: "(min-width: 64rem) 52vw, 100vw", loading: index === 0 ? "eager" : "lazy", priority: index === 0 });
    const badge = document.createElement("span");
    badge.textContent = film.duration || "Preview pending";
    visual.append(picture, badge);
    const content = document.createElement("div");
    content.className = "film-card__content";
    const type = document.createElement("p");
    type.className = "eyebrow";
    type.textContent = film.type;
    const title = document.createElement("h3");
    title.textContent = film.title;
    const description = document.createElement("p");
    description.textContent = film.description;
    content.append(type, title, description);
    addAction(content, film);
    article.append(visual, content);
    fragment.append(article);
  });
  filmList.replaceChildren(fragment);
}

showreel?.addEventListener("error", () => {
  showreel.hidden = true;
  fallback.hidden = false;
}, true);
embedDialog?.querySelector("[data-film-dialog-close]").addEventListener("click", closeEmbed);
embedDialog?.addEventListener("cancel", (event) => { event.preventDefault(); closeEmbed(); });
embedDialog?.addEventListener("click", (event) => { if (event.target === embedDialog) closeEmbed(); });
renderFilms();
