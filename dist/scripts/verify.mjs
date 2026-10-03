import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "about/index.html", "portfolio/index.html", "films/index.html", "services/index.html", "contact/index.html", "404.html"];

async function verify() {
  for (const page of pages) {
    const html = await fs.readFile(resolve(root, page), "utf8");
    if (!html.includes("<main") || !html.includes("app.js") || !html.includes("style.css")) throw new Error(`${page} is missing baseline page structure.`);
  }
  const script = await fs.readFile(resolve(root, "app.js"), "utf8");
  for (const route of ["about/", "portfolio/", "films/", "services/", "contact/"]) if (!script.includes(`\"${route}\"`)) throw new Error(`Navigation route ${route} is missing.`);
  console.log(`Verified ${pages.length} pages, shared navigation, and local assets.`);
}

verify().catch((error) => { console.error(error); process.exitCode = 1; });
