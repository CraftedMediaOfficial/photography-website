import { promises as fs } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { publishedPortfolioCategories } from "../data/portfolio-data.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const portfolioRoot = join(projectRoot, "portfolio");
const manifestPath = join(portfolioRoot, ".generated-pages.json");

function categoryPage(category) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${category.description.replaceAll('"', "&quot;")}" />
    <title>${category.name} | Crafted Media Portfolio</title>
    <link rel="stylesheet" href="../../style.css" />
    <script src="../../app.js" defer></script>
    <script type="module" src="../portfolio.js"></script>
  </head>
  <body data-page="portfolio" data-base="../../" data-category-slug="${category.slug}">
    <a class="skip-link" href="#main-content">Skip to content</a>
    <main id="main-content" tabindex="-1" data-category-detail>
      <section class="portfolio-detail-hero section--ivory">
        <div class="container portfolio-detail-hero__grid">
          <div data-reveal><p class="eyebrow">Crafted Media portfolio</p><h1 data-category-name>${category.name}</h1><p class="lede" data-category-description>${category.description}</p></div>
          <figure class="portfolio-detail-cover" data-category-cover data-reveal aria-label="${category.name} cover presentation"></figure>
        </div>
      </section>
      <nav class="portfolio-category-nav" aria-label="Portfolio categories"><div class="container" data-category-navigation></div></nav>
      <section class="section section--white portfolio-albums" aria-labelledby="album-title">
        <div class="container portfolio-empty" data-reveal><p class="eyebrow" data-album-count>Albums arrive in Phase 6</p><h2 id="album-title">The first full stories are being prepared.</h2><p>This category is ready for albums, dates, locations and curated galleries. Phase 6 will introduce the complete viewing experience.</p><a class="button button--secondary" href="../">Explore every category</a></div>
      </section>
      <section class="section section--ivory" aria-label="Portfolio enquiry"><div class="container"><div class="cta" data-reveal><div><p class="eyebrow">Have a story in mind?</p><h2>Let’s plan how it should feel.</h2><p>Tell us the occasion, date and place. We’ll help shape the right coverage.</p></div><a class="button button--light" href="../../contact/">Check availability</a></div></div></section>
    </main>
  </body>
</html>
`;
}

export async function generatePortfolioPages() {
  let previousSlugs = [];
  try {
    previousSlugs = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const activeSlugs = publishedPortfolioCategories.map((category) => category.slug);
  for (const oldSlug of previousSlugs) {
    if (!activeSlugs.includes(oldSlug)) await fs.rm(join(portfolioRoot, oldSlug), { recursive: true, force: true });
  }
  for (const category of publishedPortfolioCategories) {
    const directory = join(portfolioRoot, category.slug);
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(join(directory, "index.html"), categoryPage(category), "utf8");
  }
  await fs.writeFile(manifestPath, JSON.stringify(activeSlugs, null, 2) + "\n", "utf8");
  return activeSlugs;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const slugs = await generatePortfolioPages();
  console.log(`Generated ${slugs.length} portfolio category pages.`);
}
