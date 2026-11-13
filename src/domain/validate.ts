// Macht aus beliebigen Daten (URL, localStorage) gültige Settings.
import {
  DEFAULT_SETTINGS,
  FONTS,
  LINE_SPACINGS,
  NUMBERING_SCHEMES,
  PAGE_NUMBER_ALIGNS,
  ROMAN_CASES,
  SECTION_IDS,
  SIDES,
  type SectionEntry,
  type SectionId,
  type Settings,
} from "./settings";

export const LIMITS = {
  textPt: { min: 8, max: 16 },
  footnotePt: { min: 6, max: 14 },
  marginMm: { min: 5, max: 100 },
} as const;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

const oneOf = <T>(allowed: readonly T[], v: unknown, fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback;

const num = (v: unknown, range: { min: number; max: number }, fallback: number): number =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(range.max, Math.max(range.min, v)) : fallback;

function sections(v: unknown): readonly SectionEntry[] {
  const seen = new Set<SectionId>();
  const result: SectionEntry[] = [];
  for (const entry of Array.isArray(v) ? v : []) {
    if (!isRecord(entry)) continue;
    const id = entry.id as SectionId;
    if (!SECTION_IDS.includes(id) || seen.has(id)) continue;
    seen.add(id);
    result.push({ id, enabled: entry.enabled !== false });
  }
  // Fehlende Abschnitte hinten anhängen, damit die Liste immer vollständig ist.
  for (const entry of DEFAULT_SETTINGS.sections) if (!seen.has(entry.id)) result.push(entry);
  return result;
}

export function sanitizeSettings(input: unknown): Settings {
  const d = DEFAULT_SETTINGS;
  if (!isRecord(input)) return d;
  const m = isRecord(input.margins) ? input.margins : {};
  return {
    font: oneOf(FONTS, input.font, d.font),
    textPt: num(input.textPt, LIMITS.textPt, d.textPt),
    footnotePt: num(input.footnotePt, LIMITS.footnotePt, d.footnotePt),
    lineSpacing: oneOf(LINE_SPACINGS, input.lineSpacing, d.lineSpacing),
    footnoteLineSpacing: oneOf(LINE_SPACINGS, input.footnoteLineSpacing, d.footnoteLineSpacing),
    margins: {
      top: num(m.top, LIMITS.marginMm, d.margins.top),
      bottom: num(m.bottom, LIMITS.marginMm, d.margins.bottom),
      side: num(m.side, LIMITS.marginMm, d.margins.side),
      correction: num(m.correction, LIMITS.marginMm, d.margins.correction),
      correctionSide: oneOf(SIDES, m.correctionSide, d.margins.correctionSide),
    },
    numbering: oneOf(NUMBERING_SCHEMES, input.numbering, d.numbering),
    romanCase: oneOf(ROMAN_CASES, input.romanCase, d.romanCase),
    pageNumberAlign: oneOf(PAGE_NUMBER_ALIGNS, input.pageNumberAlign, d.pageNumberAlign),
    sections: sections(input.sections),
  };
}
