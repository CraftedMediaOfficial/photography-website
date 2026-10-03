import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
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
  console.log(`Verified ${pages.length} responsive pages, Phase 3 homepage, Phase 4 About content/data, optimized imagery, keyboard focus and reduced-motion support.`);
}
verify().catch((error) => { console.error(error); process.exitCode = 1; });
