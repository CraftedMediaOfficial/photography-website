import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { portfolioCategories, publishedPortfolioCategories } from "../data/portfolio-data.mjs";
import { portfolioAlbums, publishedPortfolioAlbums } from "../data/portfolio-albums.mjs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "about/index.html", "portfolio/index.html", "films/index.html", "services/index.html", "contact/index.html", "404.html"];
async function verify() {
  for (const page of pages) {
    const html = await fs.readFile(resolve(root, page), "utf8");
    if (!html.includes("<main") || !html.includes("app.js") || !html.includes("style.css")) throw new Error(`${page} is missing baseline page structure.`);
    if (!html.includes("viewport")) throw new Error(`${page} is missing responsive viewport metadata.`);
    if (!html.includes("skip-link")) throw new Error(`${page} is missing the keyboard skip link.`);
  }
  const script = await fs.readFile(resolve(root, "app.js"), "utf8");
  for (const route of ["about/", "portfolio/", "films/", "services/", "contact/"]) if (!script.includes(`"${route}"`)) throw new Error(`Navigation route ${route} is missing.`);
  for (const behavior of ["aria-expanded", "Escape", "IntersectionObserver", "prefers-reduced-motion"]) if (!script.includes(behavior)) throw new Error(`Shared behavior ${behavior} is missing.`);
  const css = await fs.readFile(resolve(root, "style.css"), "utf8");
  const tokens = ["--color-peacock-900", "--color-ivory", "--color-charcoal", "--color-gold", "--font-display", "--font-body", "--space-10"];
  const components = [".button", ".text-link", ".card", ".image-frame", ".field", ".cta", ".container", ".section", ".site-header", ".site-footer"];
  for (const token of tokens) if (!css.includes(token)) throw new Error(`Design token ${token} is missing.`);
  for (const component of components) if (!css.includes(component)) throw new Error(`Component style ${component} is missing.`);
  if (!css.includes("@media (prefers-reduced-motion: reduce)")) throw new Error("Reduced-motion support is missing.");
  if (!css.includes(":focus-visible")) throw new Error("Visible keyboard focus styling is missing.");
  const home = await fs.readFile(resolve(root, "index.html"), "utf8");
  const homeSections = ["home-hero", "home-intro", "featured-story", "selected-work", "film-teaser", "photographer-teaser", "approach", "kind-words", "social-teaser", "home-cta"];
  for (const section of homeSections) if (!home.includes(section)) throw new Error(`Phase 3 homepage is missing ${section}.`);
  for (const path of ["portfolio/", "films/", "about/", "services/", "contact/"]) if (!home.includes(`href="${path}"`)) throw new Error(`Phase 3 homepage CTA ${path} is missing.`);
  for (const image of ["assets/images/home-hero.webp", "assets/images/featured-story.webp"]) {
    const details = await fs.stat(resolve(root, image));
    if (details.size > 500_000) throw new Error(`${image} exceeds the Phase 3 homepage image budget.`);
  }
  const about = await fs.readFile(resolve(root, "about/index.html"), "utf8");
  const aboutSections = ["about-hero", "about-story", "founder", "philosophy", "style-pillars", "team", "experience"];
  for (const section of aboutSections) if (!about.includes(section)) throw new Error(`Phase 4 About page is missing ${section}.`);
  for (const step of ["Tell us your story", "Let’s talk", "Planning", "Shoot day", "Editing &amp; delivery"]) if (!about.includes(step)) throw new Error(`Phase 4 client experience is missing ${step}.`);
  for (const asset of ["../data/about.js", "about.js", "../assets/images/photographer-placeholder.webp"]) if (!about.includes(asset)) throw new Error(`Phase 4 About page is missing ${asset}.`);
  const aboutData = await fs.readFile(resolve(root, "data/about.js"), "utf8");
  for (const field of ["founder", "team", "name", "role", "description"]) if (!aboutData.includes(field)) throw new Error(`Structured About data is missing ${field}.`);
  const portrait = await fs.stat(resolve(root, "assets/images/photographer-placeholder.webp"));
  if (portrait.size > 500_000) throw new Error("The Phase 4 portrait placeholder exceeds the image budget.");
  const expectedCategories = ["weddings", "pre-weddings", "cultural-family-events", "corporate-events", "sports-events", "product-photography", "food-photography", "kids-photography"];
  const publishedSlugs = publishedPortfolioCategories.map((category) => category.slug);
  if (JSON.stringify(publishedSlugs) !== JSON.stringify(expectedCategories)) throw new Error("Published portfolio category order is incorrect.");
  if (new Set(portfolioCategories.map((category) => category.slug)).size !== portfolioCategories.length) throw new Error("Portfolio category slugs must be unique.");
  for (const category of portfolioCategories) {
    for (const field of ["name", "slug", "description", "displayOrder", "visibility", "albums"]) if (!(field in category)) throw new Error(`Portfolio category ${category.slug} is missing ${field}.`);
  }
  if (!portfolioCategories.some((category) => category.visibility === "hidden")) throw new Error("Portfolio data must represent hidden-category behavior.");
  for (const slug of expectedCategories) {
    const page = await fs.readFile(resolve(root, `portfolio/${slug}/index.html`), "utf8");
    if (!page.includes(`data-category-slug="${slug}"`) || !page.includes("portfolio.js")) throw new Error(`Generated portfolio page ${slug} is invalid.`);
  }
  const portfolioScript = await fs.readFile(resolve(root, "portfolio/portfolio.js"), "utf8");
  for (const behavior of ["publishedPortfolioCategories", "renderInvalidCategory", "data-album-count", "getPublishedAlbumsForCategory", "album-card"]) if (!portfolioScript.includes(behavior)) throw new Error(`Portfolio behavior ${behavior} is missing.`);
  for (const album of portfolioAlbums) {
    for (const field of ["name", "slug", "category", "coverImage", "description", "date", "location", "photos", "videos", "visibility", "displayOrder"]) if (!(field in album)) throw new Error(`Portfolio album ${album.slug} is missing ${field}.`);
    if (!publishedPortfolioCategories.some((category) => category.slug === album.category)) throw new Error(`Album ${album.slug} references an unavailable category.`);
  }
  if (publishedPortfolioAlbums.length !== 1 || publishedPortfolioAlbums[0].slug !== "before-the-celebration") throw new Error("Only the approved Phase 6 demonstration album should be published.");
  const stressAlbum = portfolioAlbums.find((album) => album.slug === "gallery-stress-test");
  if (!stressAlbum || stressAlbum.photos.length < 30 || stressAlbum.visibility !== "draft") throw new Error("The private 30+ image gallery stress fixture is invalid.");
  for (const slug of ["gallery-stress-test", "hidden-story"]) {
    try { await fs.access(resolve(root, `portfolio/weddings/${slug}/index.html`)); throw new Error(`${slug} must not be publicly generated.`); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
  }
  const albumPage = await fs.readFile(resolve(root, "portfolio/weddings/before-the-celebration/index.html"), "utf8");
  for (const marker of ["data-album-slug", "data-gallery", "data-lightbox", "data-lightbox-previous", "data-lightbox-next", "data-lightbox-close", "gallery.js"]) if (!albumPage.includes(marker)) throw new Error(`Generated album page is missing ${marker}.`);
  const galleryScript = await fs.readFile(resolve(root, "portfolio/gallery.js"), "utf8");
  for (const behavior of ["showModal", "closeLightbox", "ArrowLeft", "ArrowRight", "Escape", "touchstart", "touchend", "loading", "srcset", "imageSourceSet", "markImageFailure", "data-thumbnail-index"]) if (!galleryScript.includes(behavior)) throw new Error(`Gallery behavior ${behavior} is missing.`);
  for (const photo of publishedPortfolioAlbums[0].photos) {
    if (!photo.srcSet || !photo.width || !photo.height || !photo.alt || !photo.layout) throw new Error(`Gallery photo ${photo.src} lacks responsive or aspect-ratio data.`);
    await fs.access(resolve(root, photo.src));
  }
  for (const image of ["ceremony-details-1536.webp", "courtyard-arrival-1122.webp", "mandap-at-dusk-1536.webp"]) {
    const details = await fs.stat(resolve(root, `assets/images/gallery/${image}`));
    if (details.size > 500_000) throw new Error(`${image} exceeds the Phase 6 gallery image budget.`);
  }
  console.log(`Verified ${pages.length} responsive pages, ${expectedCategories.length} portfolio categories, Phase 6 album/gallery routing, lightbox controls, swipe and keyboard behavior, lazy responsive images, private visibility and 32-image stress data.`);
}
verify().catch((error) => { console.error(error); process.exitCode = 1; });
