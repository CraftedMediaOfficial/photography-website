import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { generatePortfolioPages } from "./generate-portfolio-pages.mjs";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "dist");
const excluded = new Set([".git", ".github", ".openai", "_content-studio", "_docs", "_media-originals", "dist", "node_modules"]);

async function copy(source, destination) {
  const details = await fs.stat(source);
  if (details.isDirectory()) {
    await fs.mkdir(destination, { recursive: true });
    for (const entry of await fs.readdir(source)) await copy(join(source, entry), join(destination, entry));
    return;
  }
  await fs.copyFile(source, destination);
}

async function build() {
  await generatePortfolioPages();
  try { await fs.rm(output, { recursive: true }); } catch (error) { if (error.code !== "ENOENT") throw error; }
  await fs.mkdir(output, { recursive: true });
  for (const entry of await fs.readdir(root)) if (!excluded.has(entry)) await copy(join(root, entry), join(output, entry));
  console.log("Static production site built in dist/");
}

build().catch((error) => { console.error(error); process.exitCode = 1; });
