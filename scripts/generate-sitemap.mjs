import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("..", import.meta.url);
const catalog = JSON.parse(await readFile(new URL("src/data/converters.json", root), "utf8"));
const toolsSource = await readFile(new URL("src/data/tools.ts", root), "utf8");
const toolSlugs = [...toolsSource.matchAll(/slug: "([^"]+)"/g)].map((match) => match[1]);
const paths = [
  "/",
  "/converters.html",
  ...toolSlugs.map((slug) => `/${slug}.html`),
  ...catalog.map((converter) => `/converter/${converter.id}`),
];
const entries = paths.map((path) => `  <url><loc>https://convotools.in${path}</loc></url>`).join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
const publicFile = new URL("public/sitemap.xml", root);
await mkdir(dirname(fileURLToPath(publicFile)), { recursive: true });
await writeFile(publicFile, sitemap, "utf8");
await writeFile(new URL("sitemap.xml", root), sitemap, "utf8");
console.log(`Generated sitemap with ${paths.length} URLs.`);
