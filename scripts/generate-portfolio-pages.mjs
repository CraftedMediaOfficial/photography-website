import { promises as fs } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { publishedPortfolioCategories } from "../data/portfolio-data.mjs";
import { getPublishedAlbumsForCategory, publishedPortfolioAlbums } from "../data/portfolio-albums.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const portfolioRoot = join(projectRoot, "portfolio");
const manifestPath = join(portfolioRoot, ".generated-pages.json");
const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const siteUrl = "https://craftedmedia.co.in";
const socialImage = `${siteUrl}/assets/images/library/home-hero-a960548e1ef1/home-hero-1536.webp`;
const jsonLd = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");

function categoryPage(category) {
  const albums = getPublishedAlbumsForCategory(category.slug);
  const canonical = `${siteUrl}/portfolio/${category.slug}/`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(category.description)}" />
    <title>${escapeHtml(category.name)} | Crafted Media Portfolio</title>
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" href="../../favicon.svg" type="image/svg+xml" />
    <meta property="og:type" content="website" /><meta property="og:site_name" content="Crafted Media" /><meta property="og:title" content="${escapeHtml(category.name)} | Crafted Media Portfolio" /><meta property="og:description" content="${escapeHtml(category.description)}" /><meta property="og:url" content="${canonical}" /><meta property="og:image" content="${socialImage}" />
    <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${escapeHtml(category.name)} | Crafted Media Portfolio" /><meta name="twitter:description" content="${escapeHtml(category.description)}" /><meta name="twitter:image" content="${socialImage}" />
    <script type="application/ld+json">${jsonLd({"@context":"https://schema.org","@type":"CollectionPage",name:category.name,url:canonical,description:category.description,isPartOf:{"@type":"WebSite",name:"Crafted Media",url:siteUrl}})}</script>
    <link rel="stylesheet" href="../../style.css" />
    <script src="../../app.js" defer></script>
    <script type="module" src="../portfolio.js"></script>
  </head>
  <body data-page="portfolio" data-base="../../" data-category-slug="${category.slug}">
    <a class="skip-link" href="#main-content">Skip to content</a>
    <main id="main-content" tabindex="-1" data-category-detail>
      <section class="portfolio-detail-hero section--ivory">
        <div class="container portfolio-detail-hero__grid">
          <div data-reveal><p class="eyebrow">Crafted Media portfolio</p><h1 data-category-name>${escapeHtml(category.name)}</h1><p class="lede" data-category-description>${escapeHtml(category.description)}</p></div>
          <figure class="portfolio-detail-cover" data-category-cover data-reveal aria-label="${escapeHtml(category.name)} cover presentation"></figure>
        </div>
      </section>
      <nav class="portfolio-category-nav" aria-label="Portfolio categories"><div class="container" data-category-navigation></div></nav>
      <section class="section section--white portfolio-albums" aria-labelledby="album-title">
        <div class="container">
          <div class="portfolio-albums__heading" data-reveal><div><p class="eyebrow" data-album-count>${albums.length} ${albums.length === 1 ? "story" : "stories"}</p><h2 id="album-title">Stories in this collection.</h2></div><p>Each gallery is shaped as a sequence, giving moments room to breathe instead of reducing them to a dense grid.</p></div>
          <div class="album-grid" data-album-list></div>
          <div class="portfolio-empty" data-album-empty${albums.length ? " hidden" : ""}><h2>The first full stories are being prepared.</h2><p>This category is ready for dates, locations and curated galleries. New work will appear here after it is approved for publication.</p><a class="button button--secondary" href="../">Explore every category</a></div>
        </div>
      </section>
      <section class="section section--ivory" aria-label="Portfolio enquiry"><div class="container"><div class="cta" data-reveal><div><p class="eyebrow">Have a story in mind?</p><h2>Let’s plan how it should feel.</h2><p>Tell us the occasion, date and place. We’ll help shape the right coverage.</p></div><a class="button button--light" href="../../contact/">Check availability</a></div></div></section>
    </main>
  </body>
</html>
`;
}

function albumPage(album, category) {
  const canonical = `${siteUrl}/portfolio/${category.slug}/${album.slug}/`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(album.description)}" />
    <title>${escapeHtml(album.name)} | Crafted Media</title>
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" href="../../../favicon.svg" type="image/svg+xml" />
    <meta property="og:type" content="article" /><meta property="og:site_name" content="Crafted Media" /><meta property="og:title" content="${escapeHtml(album.name)} | Crafted Media" /><meta property="og:description" content="${escapeHtml(album.description)}" /><meta property="og:url" content="${canonical}" /><meta property="og:image" content="${socialImage}" />
    <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${escapeHtml(album.name)} | Crafted Media" /><meta name="twitter:description" content="${escapeHtml(album.description)}" /><meta name="twitter:image" content="${socialImage}" />
    <script type="application/ld+json">${jsonLd({"@context":"https://schema.org","@type":"ImageGallery",name:album.name,url:canonical,description:album.description,isPartOf:{"@type":"CollectionPage",name:category.name,url:`${siteUrl}/portfolio/${category.slug}/`}})}</script>
    <link rel="stylesheet" href="../../../style.css" />
    <script src="../../../app.js" defer></script>
    <script type="module" src="../../gallery.js"></script>
  </head>
  <body data-page="portfolio" data-base="../../../" data-category-slug="${category.slug}" data-album-slug="${album.slug}">
    <a class="skip-link" href="#main-content">Skip to content</a>
    <main id="main-content" tabindex="-1" data-album-detail>
      <header class="album-hero section--peacock">
        <div class="container album-hero__inner" data-reveal>
          <p class="eyebrow">${escapeHtml(category.name)} · Featured story</p>
          <h1 data-album-name>${escapeHtml(album.name)}</h1>
          <p data-album-description>${escapeHtml(album.description)}</p>
          <dl class="album-meta"><div><dt>Date</dt><dd data-album-date>${escapeHtml(album.dateLabel)}</dd></div><div><dt>Location</dt><dd data-album-location>${escapeHtml(album.location)}</dd></div><div><dt>Frames</dt><dd data-album-count>${album.photos.length}</dd></div></dl>
        </div>
      </header>
      <section class="section section--ivory album-introduction" aria-labelledby="gallery-title">
        <div class="container album-introduction__inner" data-reveal><div><p class="eyebrow">Curated narrative</p><h2 id="gallery-title">A story told in sequence.</h2></div><p>Select any frame to enter the fullscreen viewer. Use the controls, arrow keys or a horizontal swipe to move through the story.</p></div>
      </section>
      <section class="album-gallery section--white" aria-label="${escapeHtml(album.name)} gallery">
        <div class="container-wide gallery-sequence" data-gallery></div>
      </section>
      <nav class="album-return section--ivory" aria-label="Return to portfolio"><div class="container"><a class="text-link" href="../">Back to ${escapeHtml(category.name)}</a></div></nav>
    </main>
    <dialog class="lightbox" data-lightbox aria-labelledby="lightbox-title">
      <h2 class="visually-hidden" id="lightbox-title">Fullscreen photograph viewer</h2>
      <button class="lightbox__close" type="button" data-lightbox-close aria-label="Close fullscreen viewer">Close</button>
      <button class="lightbox__control lightbox__control--previous" type="button" data-lightbox-previous aria-label="Previous photograph">Previous</button>
      <figure class="lightbox__figure"><div class="lightbox__stage"><img data-lightbox-image alt="" /><p class="lightbox__error" data-lightbox-error hidden>Image unavailable</p></div><figcaption><span data-lightbox-caption></span><span data-lightbox-position></span></figcaption></figure>
      <button class="lightbox__control lightbox__control--next" type="button" data-lightbox-next aria-label="Next photograph">Next</button>
      <div class="lightbox__thumbnails" data-lightbox-thumbnails aria-label="Photograph thumbnails"></div>
    </dialog>
  </body>
</html>
`;
}

export async function generatePortfolioPages() {
  let previous = { categories: [], albums: [] };
  try {
    const stored = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    previous = Array.isArray(stored) ? { categories: stored, albums: [] } : stored;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const categorySlugs = publishedPortfolioCategories.map((category) => category.slug);
  const albumPaths = publishedPortfolioAlbums.map((album) => `${album.category}/${album.slug}`);
  for (const oldSlug of previous.categories || []) {
    if (!categorySlugs.includes(oldSlug)) await fs.rm(join(portfolioRoot, oldSlug), { recursive: true, force: true });
  }
  for (const oldPath of previous.albums || []) {
    if (!albumPaths.includes(oldPath)) await fs.rm(join(portfolioRoot, oldPath), { recursive: true, force: true });
  }

  for (const category of publishedPortfolioCategories) {
    const directory = join(portfolioRoot, category.slug);
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(join(directory, "index.html"), categoryPage(category), "utf8");
  }
  for (const album of publishedPortfolioAlbums) {
    const category = publishedPortfolioCategories.find((item) => item.slug === album.category);
    if (!category) continue;
    const directory = join(portfolioRoot, category.slug, album.slug);
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(join(directory, "index.html"), albumPage(album, category), "utf8");
  }

  const manifest = { categories: categorySlugs, albums: albumPaths };
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  return manifest;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const manifest = await generatePortfolioPages();
  console.log(`Generated ${manifest.categories.length} category pages and ${manifest.albums.length} published album page.`);
}
