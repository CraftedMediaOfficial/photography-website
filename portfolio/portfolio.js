import { publishedPortfolioCategories } from "../data/portfolio-data.mjs";

const base = document.body.dataset.base || "../";
const list = document.querySelector("[data-portfolio-list]");
const detail = document.querySelector("[data-category-detail]");
const slug = document.body.dataset.categorySlug;

function addCover(container, category, detailView = false) {
  if (category.coverImage) {
    const image = document.createElement("img");
    image.src = `${base}${category.coverImage}`;
    image.alt = detailView ? `Editorial cover for ${category.name}` : "";
    image.width = category.slug === "weddings" ? 1536 : 1122;
    image.height = category.slug === "weddings" ? 1024 : 1402;
    image.loading = detailView ? "eager" : "lazy";
    container.append(image);
    container.classList.add("has-image");
    return;
  }
  const mark = document.createElement("span");
  mark.className = "portfolio-mark";
  mark.textContent = category.name.split(/\s|&/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("");
  mark.setAttribute("aria-hidden", "true");
  container.append(mark);
}

function renderListing() {
  if (!list) return;
  const fragment = document.createDocumentFragment();
  publishedPortfolioCategories.forEach((category, index) => {
    const card = document.createElement("a");
    card.className = "portfolio-card";
    card.href = `./${category.slug}/`;
    const cover = document.createElement("span");
    cover.className = "portfolio-card__cover";
    addCover(cover, category);
    const content = document.createElement("span");
    content.className = "portfolio-card__content";
    const number = document.createElement("span");
    number.className = "portfolio-card__number";
    number.textContent = String(index + 1).padStart(2, "0");
    const title = document.createElement("span");
    title.className = "portfolio-card__title";
    title.textContent = category.name;
    const description = document.createElement("span");
    description.className = "portfolio-card__description";
    description.textContent = category.description;
    content.append(number, title, description);
    card.append(cover, content);
    fragment.append(card);
  });
  list.replaceChildren(fragment);
}

function renderInvalidCategory() {
  const main = document.querySelector("main");
  document.title = "Portfolio not found | Crafted Media";
  main.className = "portfolio-not-found";
  const section = document.createElement("section");
  section.className = "placeholder";
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Portfolio";
  const title = document.createElement("h1");
  title.textContent = "This collection is not available.";
  const copy = document.createElement("p");
  copy.textContent = "It may be unpublished, hidden or no longer at this address.";
  const link = document.createElement("a");
  link.className = "button button--primary";
  link.href = "../";
  link.textContent = "View all portfolios";
  section.append(eyebrow, title, copy, link);
  main.replaceChildren(section);
}

function renderDetail() {
  if (!detail || !slug) return;
  const category = publishedPortfolioCategories.find((item) => item.slug === slug);
  if (!category) {
    renderInvalidCategory();
    return;
  }

  document.title = `${category.name} | Crafted Media Portfolio`;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.content = category.description;
  document.querySelector("[data-category-name]").textContent = category.name;
  document.querySelector("[data-category-description]").textContent = category.description;

  const cover = document.querySelector("[data-category-cover]");
  addCover(cover, category, true);

  const categoryNavigation = document.querySelector("[data-category-navigation]");
  const navigationFragment = document.createDocumentFragment();
  publishedPortfolioCategories.forEach((item) => {
    const link = document.createElement("a");
    link.href = `../${item.slug}/`;
    link.textContent = item.name;
    if (item.slug === slug) link.setAttribute("aria-current", "page");
    navigationFragment.append(link);
  });
  categoryNavigation.replaceChildren(navigationFragment);

  const albumCount = document.querySelector("[data-album-count]");
  albumCount.textContent = category.albums.length
    ? `${category.albums.length} ${category.albums.length === 1 ? "story" : "stories"}`
    : "Albums arrive in Phase 6";
}

renderListing();
renderDetail();
