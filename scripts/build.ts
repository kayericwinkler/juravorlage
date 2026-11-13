// Statischer Build nach dist/: bündeln, public/ kopieren, PWA-Links und Service-Worker-Dateiliste einsetzen.
import { cp, readdir, rm } from "node:fs/promises";

const OUT = "dist";

const PWA_HEAD = `
    <link rel="manifest" href="./manifest.webmanifest" />
    <link rel="icon" href="./icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="./icon-192.png" />
  </head>`;

await rm(OUT, { recursive: true, force: true });

const result = await Bun.build({ entrypoints: ["./index.html"], outdir: OUT, minify: true, splitting: true });
if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

await cp("public", OUT, { recursive: true });

const htmlPath = `${OUT}/index.html`;
const html = await Bun.file(htmlPath).text();
if (!html.includes("</head>")) throw new Error("index.html ohne </head>");
await Bun.write(htmlPath, html.replace("</head>", PWA_HEAD.trimStart()));

// Alle ausgelieferten Dateien in den Service Worker eintragen; die Version ändert sich mit jedem Inhalt.
const files = (await readdir(OUT, { recursive: true, withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name !== "sw.js" && entry.name !== ".DS_Store")
  .map((entry) => `${entry.parentPath}/${entry.name}`.slice(OUT.length + 1))
  .sort();

const hasher = new Bun.CryptoHasher("sha256");
for (const file of files) hasher.update(await Bun.file(`${OUT}/${file}`).arrayBuffer());
const version = hasher.digest("hex").slice(0, 12);

const precache = ["./", ...files.filter((file) => file !== "index.html")];
const swPath = `${OUT}/sw.js`;
const sw = (await Bun.file(swPath).text())
  .replace("__VERSION__", version)
  .replace("__FILES__", JSON.stringify(precache));
await Bun.write(swPath, sw);

console.log(`Build ${version}: ${files.length + 1} Dateien in ${OUT}/`);
