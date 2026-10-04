import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const routes = ["index.html", "about/index.html", "portfolio/index.html", "films/index.html", "services/index.html", "contact/index.html", "portfolio/weddings/index.html", "portfolio/pre-weddings/index.html", "portfolio/cultural-family-events/index.html", "portfolio/corporate-events/index.html", "portfolio/sports-events/index.html", "portfolio/product-photography/index.html", "portfolio/food-photography/index.html", "portfolio/kids-photography/index.html", "portfolio/weddings/before-the-celebration/index.html", "404.html"];
const forbidden = /(?:lorem ipsum|TODO|debugger\b|AIza[0-9A-Za-z_-]{20,}|ghp_[0-9A-Za-z]{20,}|sk-[0-9A-Za-z]{20,}|BEGIN (?:RSA|OPENSSH|EC) PRIVATE KEY)/i;

for (const route of routes) {
  const html = await fs.readFile(resolve(root, route), "utf8");
  assert.match(html, /<html lang="en">/, `${route} needs a language declaration`);
  assert.match(html, /<main\b/, `${route} needs a main landmark`);
  assert.match(html, /rel="icon"[^>]+favicon\.svg/, `${route} needs the production favicon`);
  assert.doesNotMatch(html, forbidden, `${route} contains debug or secret-like content`);
  if (route !== "404.html") {
    assert.match(html, /<title>[^<]{10,}<\/title>/, `${route} needs a useful title`);
    assert.match(html, /meta name="description"/, `${route} needs a description`);
  }
}
const sourceFiles = [];
async function walk(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (["node_modules", ".git", "dist", "_media-originals"].includes(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (/\.(html|js|mjs|css|json|svg)$/.test(entry.name)) sourceFiles.push(path);
  }
}
await walk(root);
for (const file of sourceFiles) {
  if (file.endsWith("/scripts/verify-phase13.mjs")) continue;
  assert.doesNotMatch(await fs.readFile(file, "utf8"), forbidden, `${file} contains debug or secret-like content`);
}
const dist = resolve(root, "dist");
assert.ok((await fs.readdir(dist)).includes("favicon.svg"), "Production build must include the favicon");
for (const privatePath of ["_content-studio", "_docs", "_media-originals"]) {
  try { await fs.access(resolve(dist, privatePath)); assert.fail(`${privatePath} must not ship in dist`); } catch (error) { if (error.code !== "ENOENT") throw error; }
}
const app = await fs.readFile(resolve(root, "app.js"), "utf8");
const css = await fs.readFile(resolve(root, "style.css"), "utf8");
for (const marker of ["aria-expanded", "Escape", "focus", "prefers-reduced-motion"]) assert.ok(app.includes(marker) || css.includes(marker), `Accessibility behavior ${marker} is missing`);
const contact = await fs.readFile(resolve(root, "contact/contact.js"), "utf8");
assert.match(contact, /lastFingerprint|company/, "Enquiry abuse controls are missing");
console.log(`Phase 13 launch QA verified ${routes.length} routes, favicon/build isolation, accessibility hooks, content hygiene and secret-pattern safety.`);
