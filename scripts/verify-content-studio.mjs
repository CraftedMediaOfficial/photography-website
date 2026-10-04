import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { loadContent, validateContent } from "./content-store.mjs";
import { startContentStudio } from "./content-studio.mjs";

const root = resolve(new URL("..", import.meta.url).pathname);
const temporaryRoot = await fs.mkdtemp(join(tmpdir(), "crafted-content-studio-"));
let server;

try {
  await fs.cp(join(root, "data"), join(temporaryRoot, "data"), { recursive: true });
  await fs.mkdir(join(temporaryRoot, "assets/uploads"), { recursive: true });
  const original = await loadContent(temporaryRoot);
  validateContent(original);
  const session = await startContentStudio({ root: temporaryRoot, port: 0, token: "test-session-token", silent: true });
  server = session.server;
  const base = `http://127.0.0.1:${session.port}`;
  const authorization = { Authorization: "Bearer test-session-token" };

  assert.equal((await fetch(`${base}/api/content`)).status, 401, "Unauthenticated API access must be rejected.");
  const contentResponse = await fetch(`${base}/api/content`, { headers: authorization });
  assert.equal(contentResponse.status, 200, "Authenticated content read must succeed.");
  const content = await contentResponse.json();
  assert.ok(content.categories.length >= 8 && content.albums.length >= 3, "Content library must load categories and albums.");

  const invalid = structuredClone(content);
  invalid.categories[1].slug = invalid.categories[0].slug;
  const invalidResponse = await fetch(`${base}/api/content`, { method: "PUT", headers: { ...authorization, "Content-Type": "application/json" }, body: JSON.stringify(invalid) });
  assert.equal(invalidResponse.status, 400, "Invalid duplicate slugs must be rejected.");

  content.about.founder.name = "Studio persistence test";
  content.homepageFeatured = [content.categories[1].slug, content.categories[0].slug];
  content.testimonials.push({ name: "Test client", context: "Test event", quote: "A persistence fixture.", displayOrder: 1, visibility: "draft" });
  content.albums[0].photos.reverse();
  const saveResponse = await fetch(`${base}/api/content`, { method: "PUT", headers: { ...authorization, "Content-Type": "application/json" }, body: JSON.stringify(content) });
  assert.equal(saveResponse.status, 200, "Authenticated content update must succeed.");
  const persisted = await loadContent(temporaryRoot);
  assert.equal(persisted.about.founder.name, "Studio persistence test", "About changes must persist.");
  assert.deepEqual(persisted.homepageFeatured, content.homepageFeatured, "Homepage selection must persist in order.");
  assert.equal(persisted.testimonials.at(-1).visibility, "draft", "Publishing state must persist.");
  assert.equal(persisted.albums[0].photos[0].src, content.albums[0].photos[0].src, "Photo order must persist.");

  const uploadBody = JSON.stringify({ name: "owner-photo.png", type: "image/png", data: Buffer.from("phase-10-owner-image-fixture").toString("base64") });
  assert.equal((await fetch(`${base}/api/assets`, { method: "POST", headers: { "Content-Type": "application/json" }, body: uploadBody })).status, 401, "Unauthenticated upload must be rejected.");
  const uploadResponse = await fetch(`${base}/api/assets`, { method: "POST", headers: { ...authorization, "Content-Type": "application/json" }, body: uploadBody });
  assert.equal(uploadResponse.status, 201, "Authenticated supported image upload must succeed.");
  const upload = await uploadResponse.json();
  await fs.access(join(temporaryRoot, upload.path));
  console.log("Verified Phase 10 token authorization, content CRUD, validation, ordering, visibility, homepage selection, persistence and protected image ingestion.");
} finally {
  if (server) await new Promise((resolveClose) => server.close(resolveClose));
  await fs.rm(temporaryRoot, { recursive: true, force: true });
}
