// Mehrstufige Überschriften-Nummerierung, verknüpft mit den Formatvorlagen Überschrift 1–7.
import { AlignmentType, LevelFormat, LevelSuffix, type ILevelsOptions, type INumberingOptions } from "docx";
import { HEADING_LEVELS, type FormatSettings, type NumberingScheme } from "../../domain/settings";
import { mmToTwip } from "./units";

export const HEADING_NUMBERING = "ueberschriften";

type LevelDef = Pick<ILevelsOptions, "format" | "text"> & { readonly start?: number };

const JURISTISCH: readonly LevelDef[] = [
  { format: LevelFormat.UPPER_LETTER, text: "%1." },
  { format: LevelFormat.UPPER_ROMAN, text: "%2." },
  { format: LevelFormat.DECIMAL, text: "%3." },
  { format: LevelFormat.LOWER_LETTER, text: "%4)" },
  // "aa)": Buchstabenzählung ab 27 ergibt aa, bb, cc … (Word und LibreOffice).
  { format: LevelFormat.LOWER_LETTER, text: "%5)", start: 27 },
  { format: LevelFormat.DECIMAL, text: "(%6)" },
  { format: LevelFormat.LOWER_LETTER, text: "(%7)" },
];

const NUMERISCH: readonly LevelDef[] = Array.from({ length: HEADING_LEVELS }, (_, i) => ({
  format: LevelFormat.DECIMAL,
  text: Array.from({ length: i + 1 }, (_, k) => `%${k + 1}`).join(".") + (i === 0 ? "." : ""),
}));

// Platz für die Nummer vor dem Überschriftentext, in mm bei 12 pt.
const NUMBER_WIDTH_MM: Readonly<Record<NumberingScheme, readonly number[]>> = {
  juristisch: [10, 10, 10, 10, 10, 10, 10],
  numerisch: [10, 10, 13, 16, 20, 23, 27],
};

/** Breite der Nummernspalte je Ebene (Index 0 = Ebene 1) in Twip. */
export const numberWidths = (format: FormatSettings): readonly number[] =>
  NUMBER_WIDTH_MM[format.numbering].map((mm) => mmToTwip((mm * format.textPt) / 12));

export function headingNumbering(format: FormatSettings): INumberingOptions {
  const defs = format.numbering === "juristisch" ? JURISTISCH : NUMERISCH;
  const widths = numberWidths(format);
  const levels: ILevelsOptions[] = defs.map((def, level) => ({
    level,
    format: def.format,
    text: def.text,
    start: def.start ?? 1,
    alignment: AlignmentType.LEFT,
    suffix: LevelSuffix.TAB,
    style: { paragraph: { indent: { left: widths[level], hanging: widths[level] } } },
  }));
  return { config: [{ reference: HEADING_NUMBERING, levels }] };
}
