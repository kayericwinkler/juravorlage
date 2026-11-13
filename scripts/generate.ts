// Erzeugt Beispieldokumente ohne Browser: bun scripts/generate.ts
import { buildDocument } from "../src/document/build";
import { DEFAULT_SETTINGS, type Settings } from "../src/domain/settings";
import { docxExporter } from "../src/export/docx";

const variants: Record<string, Settings> = {
  standard: DEFAULT_SETTINGS,
  passau: { ...DEFAULT_SETTINGS, romanCase: "gross", pageNumberAlign: "rechts" },
  numerisch: {
    ...DEFAULT_SETTINGS,
    font: "Arial",
    textPt: 11,
    numbering: "numerisch",
    margins: { ...DEFAULT_SETTINGS.margins, correction: 60, correctionSide: "links" },
  },
};

for (const [name, settings] of Object.entries(variants)) {
  const { blob } = await docxExporter.export(buildDocument(settings));
  await Bun.write(`out/${name}.docx`, blob);
  console.log(`out/${name}.docx`);
}
