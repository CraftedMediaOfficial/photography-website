import { promises as fs } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import vm from "node:vm";

const states = new Set(["draft", "published", "hidden"]);
const imageLayouts = new Set(["standard", "wide", "portrait"]);
const safeSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const moduleUrl = (path) => `${pathToFileURL(path).href}?studio=${Date.now()}-${Math.random()}`;
const clean = (value) => JSON.parse(JSON.stringify(value));
const requiredText = (value, label) => {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} is required.`);
};
const validOrder = (value, label) => {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${label} must be a whole number.`);
};
const validVisibility = (value, label) => {
  if (!states.has(value)) throw new Error(`${label} has an invalid publishing status.`);
};
const validOptionalUrl = (value, label) => {
  if (value == null || value === "") return;
  let url;
  try { url = new URL(value); } catch { throw new Error(`${label} must be a valid URL.`); }
  if (url.protocol !== "https:") throw new Error(`${label} must use HTTPS.`);
};

export function validateContent(content) {
  if (!content || typeof content !== "object") throw new Error("Content payload is missing.");
  for (const key of ["categories", "albums", "films", "testimonials", "homepageFeatured", "about", "contact"]) {
    if (!(key in content)) throw new Error(`Content section ${key} is missing.`);
  }
  const slugs = new Set();
  for (const [index, category] of content.categories.entries()) {
    requiredText(category.name, `Category ${index + 1} name`);
    requiredText(category.slug, `Category ${index + 1} slug`);
    if (!safeSlug.test(category.slug)) throw new Error(`Category slug ${category.slug} is invalid.`);
    if (slugs.has(category.slug)) throw new Error(`Category slug ${category.slug} is duplicated.`);
    slugs.add(category.slug);
    requiredText(category.description, `Category ${category.name} description`);
    validOrder(category.displayOrder, `Category ${category.name} order`);
    validVisibility(category.visibility, `Category ${category.name}`);
  }
  const albumKeys = new Set();
  for (const [index, album] of content.albums.entries()) {
    requiredText(album.name, `Album ${index + 1} name`);
    requiredText(album.slug, `Album ${index + 1} slug`);
    if (!safeSlug.test(album.slug)) throw new Error(`Album slug ${album.slug} is invalid.`);
    const key = `${album.category}/${album.slug}`;
    if (albumKeys.has(key)) throw new Error(`Album ${key} is duplicated.`);
    albumKeys.add(key);
    if (!slugs.has(album.category)) throw new Error(`Album ${album.name} uses an unknown category.`);
    requiredText(album.description, `Album ${album.name} description`);
    validOrder(album.displayOrder, `Album ${album.name} order`);
    validVisibility(album.visibility, `Album ${album.name}`);
    if (!Array.isArray(album.photos)) throw new Error(`Album ${album.name} photos are invalid.`);
    for (const [photoIndex, photo] of album.photos.entries()) {
      requiredText(photo.src, `Photo ${photoIndex + 1} source in ${album.name}`);
      requiredText(photo.alt, `Photo ${photoIndex + 1} alt text in ${album.name}`);
      if (photo.layout && !imageLayouts.has(photo.layout)) throw new Error(`Photo ${photoIndex + 1} layout in ${album.name} is invalid.`);
    }
    if (!Array.isArray(album.videos)) throw new Error(`Album ${album.name} videos are invalid.`);
  }
  for (const [index, film] of content.films.entries()) {
    requiredText(film.title, `Film ${index + 1} title`);
    requiredText(film.type, `Film ${film.title} type`);
    requiredText(film.thumbnail, `Film ${film.title} thumbnail`);
    requiredText(film.description, `Film ${film.title} description`);
    validOrder(film.displayOrder, `Film ${film.title} order`);
    validVisibility(film.visibility, `Film ${film.title}`);
    for (const field of ["destinationUrl", "embedUrl"]) validOptionalUrl(film[field], `${film.title} ${field}`);
  }
  for (const [index, testimonial] of content.testimonials.entries()) {
    requiredText(testimonial.name, `Testimonial ${index + 1} name`);
    requiredText(testimonial.quote, `Testimonial ${index + 1} quote`);
    validOrder(testimonial.displayOrder, `Testimonial ${testimonial.name} order`);
    validVisibility(testimonial.visibility, `Testimonial ${testimonial.name}`);
  }
  if (!Array.isArray(content.homepageFeatured) || content.homepageFeatured.length > 3) throw new Error("Homepage featured work must contain no more than three categories.");
  for (const slug of content.homepageFeatured) if (!slugs.has(slug)) throw new Error(`Homepage feature ${slug} is not a category.`);
  requiredText(content.about.founder?.name, "Founder name");
  requiredText(content.about.founder?.role, "Founder role");
  requiredText(content.about.founder?.introduction, "Founder introduction");
  if (!Array.isArray(content.about.team)) throw new Error("Team must be a list.");
  for (const [index, member] of content.about.team.entries()) {
    requiredText(member.name, `Team member ${index + 1} name`);
    requiredText(member.role, `Team member ${member.name} role`);
    requiredText(member.description, `Team member ${member.name} description`);
  }
  for (const field of ["instagramUrl", "formEndpoint"]) validOptionalUrl(content.contact[field], `Contact ${field}`);
  return content;
}

async function loadAbout(root) {
  const source = await fs.readFile(join(root, "data/about.js"), "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: "data/about.js", timeout: 1000 });
  return clean(context.window.CRAFTED_MEDIA_ABOUT);
}

export async function loadContent(rootDirectory) {
  const root = resolve(rootDirectory);
  const [categories, albums, films, editorial, contact, about] = await Promise.all([
    import(moduleUrl(join(root, "data/portfolio-data.mjs"))),
    import(moduleUrl(join(root, "data/portfolio-albums.mjs"))),
    import(moduleUrl(join(root, "data/films.mjs"))),
    import(moduleUrl(join(root, "data/editorial.mjs"))),
    import(moduleUrl(join(root, "data/contact.mjs"))),
    loadAbout(root)
  ]);
  return clean({
    categories: categories.portfolioCategories,
    albums: albums.portfolioAlbums,
    films: films.films,
    testimonials: editorial.testimonials,
    homepageFeatured: editorial.homepageFeatured,
    about,
    contact: contact.contactConfig
  });
}

const json = (value) => JSON.stringify(value, null, 2);
const filesFor = (content) => {
  const albumsByCategory = new Map(content.categories.map((category) => [category.slug, []]));
  [...content.albums].sort((a, b) => a.displayOrder - b.displayOrder).forEach((album) => albumsByCategory.get(album.category)?.push(album.slug));
  const categories = content.categories.map((category) => ({ ...category, albums: albumsByCategory.get(category.slug) || [] }));
  return {
    "data/portfolio-data.mjs": `export const portfolioCategories = ${json(categories)};\n\nexport const publishedPortfolioCategories = portfolioCategories\n  .filter((category) => category.visibility === "published")\n  .sort((a, b) => a.displayOrder - b.displayOrder);\n`,
    "data/portfolio-albums.mjs": `export const portfolioAlbums = ${json(content.albums)};\n\nexport const publishedPortfolioAlbums = portfolioAlbums\n  .filter((album) => album.visibility === "published")\n  .sort((a, b) => a.displayOrder - b.displayOrder);\n\nexport function getPublishedAlbumsForCategory(categorySlug) {\n  return publishedPortfolioAlbums.filter((album) => album.category === categorySlug);\n}\n`,
    "data/films.mjs": `export const films = ${json(content.films)};\n\nexport const publishedFilms = films\n  .filter((film) => film.visibility === "published")\n  .sort((a, b) => a.displayOrder - b.displayOrder);\n`,
    "data/editorial.mjs": `export const homepageFeatured = ${json(content.homepageFeatured)};\n\nexport const testimonials = ${json(content.testimonials)};\n`,
    "data/about.js": `window.CRAFTED_MEDIA_ABOUT = ${json(content.about)};\n`,
    "data/contact.mjs": `export const contactConfig = ${json(content.contact)};\n\nexport const eventTypes = [\n  "Wedding",\n  "Pre-Wedding",\n  "Engagement",\n  "Cultural Event",\n  "Corporate",\n  "Product",\n  "Food",\n  "Kids",\n  "Brand Shoot",\n  "Other"\n];\n\nexport const budgetRanges = [\n  "₹25k–₹50k",\n  "₹50k–₹1L",\n  "₹1L–₹2L",\n  "₹2L–₹5L",\n  "₹5L+",\n  "Let’s Discuss"\n];\n\nexport const coverageOptions = ["Photography", "Cinematography", "Both"];\n`
  };
};

export async function saveContent(rootDirectory, submittedContent) {
  const root = resolve(rootDirectory);
  const content = validateContent(clean(submittedContent));
  const entries = Object.entries(filesFor(content));
  const temporary = [];
  try {
    for (const [relativePath, source] of entries) {
      const destination = join(root, relativePath);
      const temp = `${destination}.studio-${process.pid}-${Date.now()}`;
      await fs.mkdir(dirname(destination), { recursive: true });
      await fs.writeFile(temp, source, { encoding: "utf8", mode: 0o600 });
      temporary.push([temp, destination]);
    }
    for (const [temp, destination] of temporary) await fs.rename(temp, destination);
  } catch (error) {
    await Promise.all(temporary.map(([temp]) => fs.rm(temp, { force: true })));
    throw error;
  }
  return loadContent(root);
}
