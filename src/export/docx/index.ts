// DOCX-Exporter. Einziges Modul (mit seinen Nachbarn in diesem Ordner), das die Library „docx“ kennt.
import { Document, Packer, type ISectionOptions } from "docx";
import { estimatePageNumbersWith } from "docx/layout";
import type { DocumentModel } from "../../document/model";
import type { Exporter } from "../exporter";
import { ContentWriter } from "./content";
import { sectionFooter, sectionProperties } from "./layout";
import { headingNumbering } from "./numbering";
import { documentStyles } from "./styles";

export function createDocument(model: DocumentModel): Document {
  const { format } = model;
  const writer = new ContentWriter();

  const sections: ISectionOptions[] = model.sections.map((section, index) => {
    const footer = sectionFooter(section, format);
    return {
      properties: sectionProperties(section, format, index === 0),
      ...(footer ? { footers: { default: footer } } : {}),
      children: writer.blocks(section.blocks),
    };
  });

  return new Document({
    creator: "juravorlage",
    title: model.title,
    // Schätzt die Seitenzahlen, damit das Inhaltsverzeichnis schon beim ersten Öffnen stimmt (ohne Rückfrage von Word).
    pageNumbers: estimatePageNumbersWith({ guess: true }),
    hyphenation: { autoHyphenation: true },
    styles: documentStyles(format),
    numbering: headingNumbering(format),
    footnotes: writer.footnotes,
    sections,
  });
}

export const docxExporter: Exporter = {
  async export(model) {
    return { blob: await Packer.toBlob(createDocument(model)), fileName: "Hausarbeit-Vorlage.docx" };
  },
};
