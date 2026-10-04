import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadContent, saveContent } from "./content-store.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const studioRoot = join(projectRoot, "_content-studio");
const mediaTypes = new Map([[".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".js", "text/javascript; charset=utf-8"]]);
const uploadTypes = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"], ["image/avif", ".avif"]]);

const securityHeaders = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
};

function reply(response, status, body, type = "application/json; charset=utf-8") {
  response.writeHead(status, { ...securityHeaders, "Content-Type": type });
  response.end(type.startsWith("application/json") ? JSON.stringify(body) : body);
}

async function readJson(request, maximumBytes = 25_000_000) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maximumBytes) throw Object.assign(new Error("Request is too large."), { statusCode: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw Object.assign(new Error("Request body is not valid JSON."), { statusCode: 400 }); }
}

const slugFileName = (name) => name.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "photo";

export async function startContentStudio({ root = projectRoot, port = 4174, token = randomBytes(32).toString("hex"), silent = false } = {}) {
  const server = createServer(async (request, response) => {
    const origin = `http://127.0.0.1:${server.address()?.port || port}`;
    const url = new URL(request.url, origin);
    const suppliedToken = request.headers.authorization?.replace(/^Bearer\s+/i, "") || url.searchParams.get("token");
    const authenticated = suppliedToken === token;
    try {
      if (url.pathname.startsWith("/api/")) {
        if (request.headers.origin && request.headers.origin !== origin) return reply(response, 403, { error: "Cross-origin request rejected." });
        if (!authenticated) return reply(response, 401, { error: "Content Studio session is not authorized." });
        if (url.pathname === "/api/content" && request.method === "GET") return reply(response, 200, await loadContent(root));
        if (url.pathname === "/api/content" && request.method === "PUT") return reply(response, 200, await saveContent(root, await readJson(request)));
        if (url.pathname === "/api/assets" && request.method === "POST") {
          const upload = await readJson(request);
          const extension = uploadTypes.get(upload.type);
          if (!extension) return reply(response, 400, { error: "Use a JPG, PNG, WebP or AVIF image." });
          if (typeof upload.data !== "string" || !/^[A-Za-z0-9+/=]+$/.test(upload.data)) return reply(response, 400, { error: "Image data is invalid." });
          const bytes = Buffer.from(upload.data, "base64");
          if (!bytes.length || bytes.length > 20_000_000) return reply(response, 400, { error: "Image must be between 1 byte and 20 MB." });
          const directory = join(resolve(root), "assets/uploads");
          await fs.mkdir(directory, { recursive: true });
          const filename = `${Date.now()}-${slugFileName(upload.name)}${extension}`;
          await fs.writeFile(join(directory, filename), bytes, { flag: "wx" });
          return reply(response, 201, { path: `assets/uploads/${filename}` });
        }
        return reply(response, 404, { error: "API route not found." });
      }
      const path = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
      if (!mediaTypes.has(extname(path))) return reply(response, 404, "Not found", "text/plain; charset=utf-8");
      const file = resolve(studioRoot, path);
      if (!file.startsWith(`${studioRoot}/`)) return reply(response, 404, "Not found", "text/plain; charset=utf-8");
      return reply(response, 200, await fs.readFile(file), mediaTypes.get(extname(file)));
    } catch (error) {
      return reply(response, error.statusCode || 400, { error: error.message || "Content Studio request failed." });
    }
  });
  await new Promise((resolveStart, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolveStart);
  });
  const actualPort = server.address().port;
  if (!silent) {
    process.stdout.write(`\nCrafted Media Content Studio\n${"─".repeat(36)}\nOpen: http://127.0.0.1:${actualPort}/?token=${token}\n\nLocal access only. The studio is not part of the public website build.\nPress Ctrl+C to stop.\n\n`);
  }
  return { server, token, port: actualPort, url: `http://127.0.0.1:${actualPort}/?token=${token}` };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startContentStudio().catch((error) => { console.error(error); process.exitCode = 1; });
}
