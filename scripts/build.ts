// Statischer Build nach dist/: bündeln, public/ kopieren, Manifest- und Icon-Links einsetzen.
import { cp, rm } from "node:fs/promises";

const OUT = "dist";

const HEAD_LINKS = `
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
await Bun.write(htmlPath, html.replace("</head>", HEAD_LINKS.trimStart()));

console.log(`Build fertig: ${OUT}/`);
