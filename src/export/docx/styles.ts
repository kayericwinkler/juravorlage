// Formatvorlagen. Alles basiert auf „Standard“; definiert wird nur, was davon abweicht.
import { AlignmentType, type IParagraphStyleOptions, type IStylesOptions } from "docx";
import type { ParagraphStyle } from "../../document/model";
import { HEADING_LEVELS, type FormatSettings } from "../../domain/settings";
import { HEADING_NUMBERING, numberWidths } from "./numbering";
import { lineSpacing, mmToTwip, ptToHalfPt, ptToTwip } from "./units";

interface StyleRef {
  readonly id: string;
  /** Anzeigename in Word */
  readonly name: string;
}

export const PARAGRAPH_STYLES: Readonly<Record<Exclude<ParagraphStyle, "standard">, StyleRef>> = {
  verzeichnisueberschrift: { id: "Verzeichnisueberschrift", name: "Verzeichnisüberschrift" },
  inhaltsverzeichnisueberschrift: { id: "Inhaltsverzeichnisueberschrift", name: "Inhaltsverzeichnisüberschrift" },
  deckblattAutor: { id: "DeckblattAutor", name: "Deckblatt Autor" },
  deckblattTitel: { id: "DeckblattTitel", name: "Deckblatt Titel" },
  deckblattAngaben: { id: "DeckblattAngaben", name: "Deckblatt Angaben" },
  abkuerzungseintrag: { id: "Abkuerzungseintrag", name: "Abkürzungseintrag" },
  literatureintrag: { id: "Literatureintrag", name: "Literatureintrag" },
  unterschrift: { id: "Unterschrift", name: "Unterschrift" },
};

export const FOOTNOTE_STYLE = "FootnoteText";
export const FOOTER_STYLE = "Footer";
export const headingStyleId = (level: number): string => `Heading${level}`;

const COMPACT = lineSpacing(1.15);

function heading(i: number): IParagraphStyleOptions {
  return {
    id: headingStyleId(i + 1),
    name: `heading ${i + 1}`,
    basedOn: "Normal",
    next: "Normal",
    quickFormat: true,
    run: { bold: i < 3, italics: i >= 5 },
    paragraph: {
      alignment: AlignmentType.LEFT,
      keepNext: true,
      keepLines: true,
      spacing: { before: ptToTwip(i === 0 ? 18 : 12), after: ptToTwip(6) },
      outlineLevel: i,
      numbering: { reference: HEADING_NUMBERING, level: i },
    },
  };
}

function tocEntry(i: number, widths: readonly number[]): IParagraphStyleOptions {
  const hanging = widths[i] ?? 0;
  return {
    id: `TOC${i + 1}`,
    name: `toc ${i + 1}`,
    basedOn: "Normal",
    next: "Normal",
    run: { bold: i === 0 },
    paragraph: {
      alignment: AlignmentType.LEFT,
      spacing: { before: ptToTwip(i === 0 ? 10 : 4), after: 0, line: COMPACT },
      indent: { left: mmToTwip(5 * i) + hanging, hanging },
    },
  };
}

export function documentStyles(format: FormatSettings): IStylesOptions {
  const s = PARAGRAPH_STYLES;
  const widths = numberWidths(format);
  const textSize = ptToHalfPt(format.textPt);
  const levels = Array.from({ length: HEADING_LEVELS }, (_, i) => i);

  const paragraphStyles: IParagraphStyleOptions[] = [
    ...levels.map(heading),
    ...levels.map((i) => tocEntry(i, widths)),
    {
      ...s.verzeichnisueberschrift,
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { bold: true, size: textSize + 4 },
      paragraph: { alignment: AlignmentType.LEFT, keepNext: true, spacing: { after: ptToTwip(12) }, outlineLevel: 0 },
    },
    {
      // Eigene Vorlage ohne Gliederungsebene, damit das Inhaltsverzeichnis sich nicht selbst aufführt.
      ...s.inhaltsverzeichnisueberschrift,
      basedOn: s.verzeichnisueberschrift.id,
      next: "Normal",
      paragraph: { outlineLevel: 9 },
    },
    {
      ...s.deckblattAutor,
      basedOn: "Normal",
      quickFormat: true,
      paragraph: { alignment: AlignmentType.LEFT, spacing: { after: 0, line: COMPACT } },
    },
    {
      ...s.deckblattTitel,
      basedOn: "Normal",
      next: s.deckblattAngaben.id,
      quickFormat: true,
      run: { bold: true, size: textSize + 8 },
      paragraph: { alignment: AlignmentType.CENTER, spacing: { before: ptToTwip(120), after: ptToTwip(24), line: COMPACT } },
    },
    {
      ...s.deckblattAngaben,
      basedOn: "Normal",
      quickFormat: true,
      paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 0, line: COMPACT } },
    },
    {
      ...s.abkuerzungseintrag,
      basedOn: "Normal",
      quickFormat: true,
      paragraph: { alignment: AlignmentType.LEFT, indent: { left: mmToTwip(30), hanging: mmToTwip(30) } },
    },
    {
      ...s.literatureintrag,
      basedOn: "Normal",
      quickFormat: true,
      paragraph: { indent: { left: mmToTwip(10), hanging: mmToTwip(10) } },
    },
    {
      ...s.unterschrift,
      basedOn: "Normal",
      quickFormat: true,
      paragraph: { alignment: AlignmentType.LEFT, spacing: { before: ptToTwip(36), after: 0 } },
    },
    {
      id: FOOTNOTE_STYLE,
      name: "footnote text",
      basedOn: "Normal",
      run: { size: ptToHalfPt(format.footnotePt) },
      // Hängender Einzug: Der Tab nach dem Fußnotenzeichen springt auf den Einzug, der Text steht bündig.
      paragraph: { spacing: { after: 0, line: lineSpacing(1) }, indent: { left: mmToTwip(5), hanging: mmToTwip(5) } },
    },
    {
      id: FOOTER_STYLE,
      name: "footer",
      basedOn: "Normal",
      paragraph: { spacing: { after: 0, line: lineSpacing(1) } },
    },
  ];

  return {
    default: {
      document: {
        run: { font: format.font, size: textSize, language: { value: "de-DE" } },
        paragraph: {
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: ptToTwip(6), line: lineSpacing(format.lineSpacing) },
        },
      },
    },
    paragraphStyles,
  };
}
