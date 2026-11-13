// Fachliche Typen der Einstellungen. Keine Abhängigkeit zu UI oder Export.

export const FONTS = ["Times New Roman", "Arial", "Calibri"] as const;
export type FontFamily = (typeof FONTS)[number];

export const NUMBERING_SCHEMES = ["juristisch", "numerisch"] as const;
export type NumberingScheme = (typeof NUMBERING_SCHEMES)[number];

export const LINE_SPACINGS = [1, 1.15, 1.5, 2] as const;
export type LineSpacing = (typeof LINE_SPACINGS)[number];

export const SIDES = ["links", "rechts"] as const;
export type Side = (typeof SIDES)[number];

export const ROMAN_CASES = ["klein", "gross"] as const;
export type RomanCase = (typeof ROMAN_CASES)[number];

export const PAGE_NUMBER_ALIGNS = ["zentriert", "rechts"] as const;
export type PageNumberAlign = (typeof PAGE_NUMBER_ALIGNS)[number];

export const SECTION_IDS = [
  "deckblatt",
  "sachverhalt",
  "inhaltsverzeichnis",
  "abkuerzungsverzeichnis",
  "literaturverzeichnis",
  "haupttext",
  "eigenstaendigkeitserklaerung",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_LABELS: Readonly<Record<SectionId, string>> = {
  deckblatt: "Deckblatt",
  sachverhalt: "Sachverhalt",
  inhaltsverzeichnis: "Inhaltsverzeichnis",
  abkuerzungsverzeichnis: "Abkürzungsverzeichnis",
  literaturverzeichnis: "Literaturverzeichnis",
  haupttext: "Haupttext",
  eigenstaendigkeitserklaerung: "Eigenständigkeitserklärung",
};

/** Seitenränder in Millimetern. Der Korrekturrand gilt nur im Haupttext. */
export interface Margins {
  readonly top: number;
  readonly bottom: number;
  /** Seitlicher Rand ohne Korrekturrand (beide Seiten außerhalb des Haupttexts). */
  readonly side: number;
  readonly correction: number;
  readonly correctionSide: Side;
}

export interface SectionEntry {
  readonly id: SectionId;
  readonly enabled: boolean;
}

/** Alles außer der Abschnittsliste: reine Formatangaben. */
export interface FormatSettings {
  readonly font: FontFamily;
  readonly textPt: number;
  readonly footnotePt: number;
  readonly lineSpacing: LineSpacing;
  /** Zeilenabstand der Fußnoten (Formatvorlage „FootnoteText“). */
  readonly footnoteLineSpacing: LineSpacing;
  readonly margins: Margins;
  readonly numbering: NumberingScheme;
  /** Schreibweise der römischen Seitenzahlen vor dem Haupttext. */
  readonly romanCase: RomanCase;
  readonly pageNumberAlign: PageNumberAlign;
}

export interface Settings extends FormatSettings {
  /** Reihenfolge = Reihenfolge im Dokument. Enthält jede SectionId genau einmal. */
  readonly sections: readonly SectionEntry[];
}

export const HEADING_LEVELS = 7;

export const DEFAULT_SETTINGS: Settings = {
  font: "Times New Roman",
  textPt: 12,
  footnotePt: 10,
  lineSpacing: 1.5,
  footnoteLineSpacing: 1,
  margins: { top: 20, bottom: 20, side: 20, correction: 70, correctionSide: "rechts" },
  numbering: "juristisch",
  romanCase: "klein",
  pageNumberAlign: "zentriert",
  sections: SECTION_IDS.map((id) => ({ id, enabled: true })),
};
