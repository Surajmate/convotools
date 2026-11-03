import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("..", import.meta.url);
const source = await readFile(new URL("js/converter-catalog.js", root), "utf8");
const match = source.match(/window\.convoConverterCatalog = (\[.*\]);/);
if (!match) throw new Error("Could not read the source converter catalog.");

const catalog = JSON.parse(match[1]).filter((converter) =>
  converter.category !== "ai" &&
  !/^ai-/i.test(converter.id) &&
  !/\bai\b/i.test(converter.name) &&
  converter.source !== "ai" &&
  converter.target !== "ai",
).map(({ id, name, category, source: input, target }) => ({
  id,
  name,
  category,
  source: input,
  target,
}));

const file = new URL("src/data/converters.json", root);
await mkdir(dirname(fileURLToPath(file)), { recursive: true });
await writeFile(file, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
const assets = [
  ["node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs", "public/pdf.worker.min.mjs"],
  ["node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.js", "public/ffmpeg/ffmpeg-core.js"],
  ["node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.wasm", "public/ffmpeg/ffmpeg-core.wasm"],
];
for (const [sourcePath, targetPath] of assets) {
  const targetFile = new URL(targetPath, root);
  await mkdir(dirname(fileURLToPath(targetFile)), { recursive: true });
  await copyFile(new URL(sourcePath, root), targetFile);
}
console.log(`Generated ${catalog.length} non-AI converters.`);
