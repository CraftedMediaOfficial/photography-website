import { createReadStream, promises as fs } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
const { stat } = fs;
const root = process.cwd(); const types = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".webp": "image/webp", ".mp4": "video/mp4" };
createServer(async (request, response) => { const url = new URL(request.url, "http://localhost"); let pathname = normalize(decodeURIComponent(url.pathname)).replace(/^[/\\]+/, ""); let file = join(root, pathname || "index.html"); try { if ((await stat(file)).isDirectory()) file = join(file, "index.html"); } catch { file = join(root, "404.html"); response.statusCode = 404; } response.setHeader("Content-Type", `${types[extname(file)] || "application/octet-stream"}; charset=utf-8`); createReadStream(file).pipe(response); }).listen(4173, () => console.log("Local site: http://localhost:4173"));
