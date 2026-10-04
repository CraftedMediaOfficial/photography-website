import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { portfolioCategories, publishedPortfolioCategories } from "../data/portfolio-data.mjs";
import { portfolioAlbums, publishedPortfolioAlbums } from "../data/portfolio-albums.mjs";
import { films, publishedFilms } from "../data/films.mjs";
import { faqs, plannedLocationPages, serviceAreas, serviceGroups } from "../data/services.mjs";
import { budgetRanges, contactConfig, coverageOptions, eventTypes } from "../data/contact.mjs";
import { homepageFeatured, testimonials } from "../data/editorial.mjs";
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
  for (const mobilePortfolioRule of ["main { min-width: 0", "grid-template-columns: repeat(2, minmax(0, 1fr))", "font-size: 1rem", ".portfolio-category-nav { min-width: 0", ".album-card > img { width: 100%; height: auto", ".album-meta { min-width: 0", "grid-template-columns: minmax(0, 1fr)"]) if (!css.includes(mobilePortfolioRule)) throw new Error(`Mobile portfolio containment rule ${mobilePortfolioRule} is missing.`);
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
  const filmPage = await fs.readFile(resolve(root, "films/index.html"), "utf8");
  for (const marker of ["films-hero", "film-showreel", "data-showreel", "controls", "playsinline", 'preload="metadata"', "data-video-fallback", "data-film-list", "film-approach", "data-film-dialog"]) if (!filmPage.includes(marker)) throw new Error(`Phase 7 Films page is missing ${marker}.`);
  if (filmPage.includes("autoplay")) throw new Error("Phase 7 film playback must not autoplay.");
  if (!home.includes('href="films/"') || !home.includes("Watch our films")) throw new Error("Homepage showreel CTA is missing.");
  const allowedFilmHosts = new Set(["youtube.com", "www.youtube.com", "youtu.be", "instagram.com", "www.instagram.com", "vimeo.com", "www.vimeo.com", "www.youtube-nocookie.com", "player.vimeo.com"]);
  for (const film of films) {
    for (const field of ["title", "type", "thumbnail", "description", "destinationUrl", "displayOrder", "visibility"]) if (!(field in film)) throw new Error(`Film item ${film.title} is missing ${field}.`);
    await fs.access(resolve(root, film.thumbnail));
    for (const value of [film.destinationUrl, film.embedUrl].filter(Boolean)) {
      const url = new URL(value);
      if (url.protocol !== "https:" || !allowedFilmHosts.has(url.hostname)) throw new Error(`Film item ${film.title} has an unsafe external URL.`);
    }
  }
  if (!films.some((film) => film.visibility === "hidden")) throw new Error("Film data must represent hidden-film behavior.");
  if (publishedFilms.some((film) => film.visibility !== "published") || publishedFilms.length !== 4) throw new Error("Film visibility filtering is incorrect.");
  if (JSON.stringify(publishedFilms.map((film) => film.displayOrder)) !== JSON.stringify([1, 2, 3, 4])) throw new Error("Published film ordering is incorrect.");
  const filmScript = await fs.readFile(resolve(root, "films/films.js"), "utf8");
  for (const behavior of ["safeUrl", "allowedExternalHosts", "allowedEmbedHosts", "noopener noreferrer", "target = \"_blank\"", "showModal", "data-video-fallback", "about:blank"]) if (!filmScript.includes(behavior)) throw new Error(`Film behavior ${behavior} is missing.`);
  const video = await fs.stat(resolve(root, "assets/videos/editorial-motion-study.mp4"));
  if (video.size > 2_000_000) throw new Error("Phase 7 motion study exceeds the lightweight video budget.");
  const servicesPage = await fs.readFile(resolve(root, "services/index.html"), "utf8");
  for (const marker of ["services-hero", "data-service-groups", "service-packages", "service-trust", "service-location", "data-faq-list", "Request pricing", "Check availability", "services.js"]) if (!servicesPage.includes(marker)) throw new Error(`Phase 8 Services page is missing ${marker}.`);
  if (servicesPage.includes("<img")) throw new Error("Phase 8 must not introduce generated imagery.");
  if (serviceGroups.length !== 2 || serviceGroups.flatMap((group) => group.services).length !== 8) throw new Error("Phase 8 must provide four photography and four cinematography services.");
  for (const group of serviceGroups) {
    if (!group.name || !group.introduction || group.services.length !== 4) throw new Error(`Service group ${group.name} is incomplete.`);
    for (const service of group.services) if (!service.name || !service.description) throw new Error(`A service in ${group.name} is incomplete.`);
  }
  const faqText = faqs.map((faq) => `${faq.question} ${faq.answer}`.toLowerCase()).join(" ");
  for (const topic of ["book", "travel", "photography and cinematography", "delivery", "raw", "how many edited", "albums", "destination", "confirmed"]) if (!faqText.includes(topic)) throw new Error(`FAQ topic ${topic} is missing.`);
  if (faqs.length !== 9 || faqs.some((faq) => !faq.question || !faq.answer)) throw new Error("Phase 8 FAQ data is incomplete.");
  if (!serviceAreas.some((area) => area.visibility === "published" && area.name.includes("Bengaluru") && area.name.includes("India") && area.name.includes("Destination"))) throw new Error("Phase 8 service-area statement is missing.");
  const expectedLocationSlugs = ["bengaluru-wedding-photographer", "goa-wedding-photographer", "coorg-pre-wedding-photographer"];
  if (JSON.stringify(plannedLocationPages.map((page) => page.slug)) !== JSON.stringify(expectedLocationSlugs) || plannedLocationPages.some((page) => page.visibility !== "planned")) throw new Error("Future SEO location-page architecture is incorrect.");
  const servicesScript = await fs.readFile(resolve(root, "services/services.js"), "utf8");
  for (const behavior of ["document.createElement(\"details\")", "document.createElement(\"summary\")", "textContent", "visibility === \"published\""]) if (!servicesScript.includes(behavior)) throw new Error(`Accessible service behavior ${behavior} is missing.`);
  for (const faqStyle of [".faq-item summary:focus-visible", "min-height: 4rem", ".faq-item[open] summary::after"]) if (!css.includes(faqStyle)) throw new Error(`FAQ accessibility style ${faqStyle} is missing.`);
  const contactPage = await fs.readFile(resolve(root, "contact/index.html"), "utf8");
  for (const marker of ["contact-hero", "data-contact-methods", "data-enquiry-form", "novalidate", "data-form-status", "data-enquiry-result", "data-whatsapp-link", "data-email-link", "data-copy-enquiry", "contact.js"]) if (!contactPage.includes(marker)) throw new Error(`Phase 9 Contact page is missing ${marker}.`);
  for (const field of ["name", "phone", "email", "eventType", "eventDate", "location", "budget", "coverage", "message", "company"]) if (!contactPage.includes(`name="${field}"`)) throw new Error(`Phase 9 form field ${field} is missing.`);
  if (eventTypes.length !== 10 || budgetRanges.length !== 6 || JSON.stringify(coverageOptions) !== JSON.stringify(["Photography", "Cinematography", "Both"])) throw new Error("Phase 9 enquiry options are incomplete.");
  if (contactConfig.formEndpoint || contactConfig.phone || contactConfig.whatsappNumber || contactConfig.email || contactConfig.instagramUrl) throw new Error("Unapproved production contact configuration must remain unset.");
  const contactScript = await fs.readFile(resolve(root, "contact/contact.js"), "utf8");
  for (const behavior of ["validateField", "aria-invalid", "Choose today or a future date", "buildDraft", "buildWhatsAppUrl", "sendEnquiry", "response.ok", "submitting", "lastFingerprint", "company", "navigator.clipboard", "noopener noreferrer", "Nothing has been sent or stored"]) if (!contactScript.includes(behavior)) throw new Error(`Phase 9 enquiry behavior ${behavior} is missing.`);
  for (const formStyle of [".enquiry-form__two", ".field__error", '[aria-invalid="true"]', ".contact-honeypot", ".form-status--error", ".enquiry-result pre"]) if (!css.includes(formStyle)) throw new Error(`Phase 9 form style ${formStyle} is missing.`);
  if (!css.includes('[hidden] { display: none !important; }')) throw new Error("Hidden contact actions must remain visually hidden until configured.");
  const homeScript = await fs.readFile(resolve(root, "home.js"), "utf8");
  for (const marker of ["homepageFeatured", "testimonials", "publishedPortfolioCategories", "data-home-featured", "data-home-testimonials"]) {
    if (!homeScript.includes(marker) && !home.includes(marker)) throw new Error(`Phase 10 homepage content behavior ${marker} is missing.`);
  }
  if (!Array.isArray(homepageFeatured) || homepageFeatured.length > 3 || homepageFeatured.some((slug) => !portfolioCategories.some((category) => category.slug === slug))) throw new Error("Phase 10 homepage feature selection is invalid.");
  if (!Array.isArray(testimonials)) throw new Error("Phase 10 testimonials content must be a list.");
  const buildScript = await fs.readFile(resolve(root, "scripts/build.mjs"), "utf8");
  if (!buildScript.includes('"_content-studio"') || !buildScript.includes('"_docs"')) throw new Error("Private Content Studio resources must be excluded from the public build.");
  const studioServer = await fs.readFile(resolve(root, "scripts/content-studio.mjs"), "utf8");
  for (const security of ["127.0.0.1", "randomBytes(32)", "request.headers.authorization", "Cross-origin request rejected", "Content-Security-Policy"]) if (!studioServer.includes(security)) throw new Error(`Phase 10 Content Studio security control ${security} is missing.`);
  console.log(`Verified ${pages.length} responsive pages, ${expectedCategories.length} portfolio categories, Phases 6–9 regressions and Phase 10 managed homepage content, private-studio build isolation and security controls.`);
}
verify().catch((error) => { console.error(error); process.exitCode = 1; });
