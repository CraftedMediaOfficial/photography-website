import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { contactConfig } from "../data/contact.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "about/index.html", "portfolio/index.html", "films/index.html", "services/index.html", "contact/index.html", "portfolio/weddings/index.html", "portfolio/pre-weddings/index.html", "portfolio/cultural-family-events/index.html", "portfolio/corporate-events/index.html", "portfolio/sports-events/index.html", "portfolio/product-photography/index.html", "portfolio/food-photography/index.html", "portfolio/kids-photography/index.html", "portfolio/weddings/before-the-celebration/index.html"];
const canonicalUrls = new Set();
for (const page of pages) {
  const html = await fs.readFile(resolve(root, page), "utf8");
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
  assert.ok(title && title.length > 10, `${page} needs a useful title.`);
  assert.ok(description && description.length > 50, `${page} needs a useful meta description.`);
  assert.ok(canonical?.startsWith("https://craftedmedia.co.in/"), `${page} needs an absolute canonical URL.`);
  assert.ok(!canonicalUrls.has(canonical), `${page} has a duplicate canonical URL.`);
  canonicalUrls.add(canonical);
  for (const marker of ["property=\"og:title\"", "property=\"og:description\"", "property=\"og:url\"", "property=\"og:image\"", "name=\"twitter:card\"", "name=\"twitter:image\"", "application/ld+json"]) assert.ok(html.includes(marker), `${page} is missing ${marker}.`);
  const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.doesNotThrow(() => JSON.parse(json), `${page} structured data is invalid JSON.`);
}
const sitemap = await fs.readFile(resolve(root, "sitemap.xml"), "utf8");
assert.ok(sitemap.includes("https://craftedmedia.co.in/"), "Sitemap must include the homepage.");
for (const url of canonicalUrls) assert.ok(sitemap.includes(`<loc>${url}</loc>`), `Sitemap is missing ${url}.`);
const robots = await fs.readFile(resolve(root, "robots.txt"), "utf8");
assert.ok(robots.includes("Sitemap: https://craftedmedia.co.in/sitemap.xml") && robots.includes("Disallow: /_content-studio/"), "Robots configuration is incomplete.");
assert.equal(contactConfig.phone, "+917558736585", "Approved phone is not configured.");
assert.equal(contactConfig.whatsappNumber, "+917558736585", "Approved WhatsApp number is not configured.");
assert.equal(contactConfig.email, "CinematicNamrata@gmail.com", "Approved email is not configured.");
assert.equal(contactConfig.instagramUrl, "https://www.instagram.com/crafted_media_official/", "Approved Instagram URL is not normalized.");
assert.equal(contactConfig.formEndpoint, null, "Unapproved form endpoint must remain unset.");
const sourceFiles = await Promise.all(["index.html", "about/index.html", "portfolio/index.html", "films/index.html", "services/index.html", "contact/index.html"].map((page) => fs.readFile(resolve(root, page), "utf8")));
assert.ok(sourceFiles.every((html) => !html.includes("googletagmanager") && !html.includes("google-analytics")), "Analytics must remain deferred.");
console.log(`Verified SEO/social metadata, ${pages.length} canonical pages, structured data, sitemap, robots, approved contact links and deferred analytics.`);
