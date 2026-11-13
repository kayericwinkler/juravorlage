// Seitenlayout je Abschnitt: Ränder, Seitenzählung, Fußzeile.
import { AlignmentType, Footer, NumberFormat, PageNumber, Paragraph, SectionType, TextRun, type ISectionPropertiesOptions } from "docx";
import type { DocSection } from "../../document/model";
import type { FormatSettings } from "../../domain/settings";
import { FOOTER_STYLE } from "./styles";
import { mmToTwip } from "./units";

const A4 = { width: mmToTwip(210), height: mmToTwip(297) };

interface SideMargins {
  readonly left: number;
  readonly right: number;
}

function sideMargins(section: DocSection, format: FormatSettings): SideMargins {
  const { side, correction, correctionSide } = format.margins;
  if (!section.correctionMargin) return { left: side, right: side };
  return correctionSide === "links" ? { left: correction, right: side } : { left: side, right: correction };
}

/** Abstand der Fußzeile zur Blattkante: lässt Luft zwischen Text/Fußnoten und Seitenzahl. */
const footerDistanceMm = (format: FormatSettings): number => Math.max(4, Math.min(8, format.margins.bottom - 12));

export function sectionProperties(section: DocSection, format: FormatSettings, isFirst: boolean): ISectionPropertiesOptions {
  const { left, right } = sideMargins(section, format);
  const roman = format.romanCase === "gross" ? NumberFormat.UPPER_ROMAN : NumberFormat.LOWER_ROMAN;
  return {
    ...(isFirst ? {} : { type: SectionType.NEXT_PAGE }),
    page: {
      size: A4,
      margin: {
        top: mmToTwip(format.margins.top),
        bottom: mmToTwip(format.margins.bottom),
        left: mmToTwip(left),
        right: mmToTwip(right),
        footer: mmToTwip(footerDistanceMm(format)),
      },
      pageNumbers: {
        formatType: section.pageNumbering === "arabisch" ? NumberFormat.DECIMAL : roman,
        ...(section.restartPageNumbers ? { start: 1 } : {}),
      },
    },
  };
}

/** Fußzeile mit Seitenzahl; undefined für Abschnitte ohne Seitenzahl. */
export function sectionFooter(section: DocSection, format: FormatSettings): Footer | undefined {
  if (section.pageNumbering === "keine") return undefined;
  const { left, right } = sideMargins(section, format);
  const { side } = format.margins;
  return new Footer({
    children: [
      new Paragraph({
        style: FOOTER_STYLE,
        alignment: format.pageNumberAlign === "rechts" ? AlignmentType.RIGHT : AlignmentType.CENTER,
        // Negativer Einzug gleicht den Korrekturrand aus: Die Seitenzahl steht auf jeder Seite an derselben Stelle.
        indent: { left: mmToTwip(side - left), right: mmToTwip(side - right) },
        children: [new TextRun({ children: [PageNumber.CURRENT] })],
      }),
    ],
  });
}
