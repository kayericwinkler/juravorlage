// Formatneutrales Dokumentmodell. Exporter (docx, später odt) lesen nur dieses Modell.
import type { FormatSettings, SectionId } from "../domain/settings";

/** Absatzformate neben den Überschriften. Jedes wird zu einer benannten Formatvorlage. */
export type ParagraphStyle =
  | "standard"
  | "verzeichnisueberschrift"
  | "inhaltsverzeichnisueberschrift"
  | "deckblattAutor"
  | "deckblattTitel"
  | "deckblattAngaben"
  | "abkuerzungseintrag"
  | "literatureintrag"
  | "unterschrift";

export interface TextSpan {
  readonly text: string;
  readonly italic?: boolean;
  /** Weicher Zeilenumbruch vor dem Text (kein neuer Absatz). */
  readonly lineBreakBefore?: boolean;
  readonly tabBefore?: boolean;
}

export interface FootnoteRef {
  readonly footnote: readonly TextSpan[];
}

export type Inline = TextSpan | FootnoteRef;

export interface ParagraphBlock {
  readonly kind: "paragraph";
  readonly style: ParagraphStyle;
  readonly content: readonly Inline[];
}

export interface HeadingBlock {
  readonly kind: "heading";
  /** 1 bis HEADING_LEVELS */
  readonly level: number;
  readonly text: string;
}

export interface TocBlock {
  readonly kind: "toc";
}

export type Block = ParagraphBlock | HeadingBlock | TocBlock;

export type PageNumbering = "keine" | "roemisch" | "arabisch";

/** Ein Abschnitt beginnt immer auf einer neuen Seite. */
export interface DocSection {
  readonly id: SectionId;
  readonly pageNumbering: PageNumbering;
  /** Seitenzählung beginnt hier neu bei 1. */
  readonly restartPageNumbers: boolean;
  readonly correctionMargin: boolean;
  readonly blocks: readonly Block[];
}

export interface DocumentModel {
  readonly title: string;
  readonly format: FormatSettings;
  readonly sections: readonly DocSection[];
}

export const isFootnote = (inline: Inline): inline is FootnoteRef => "footnote" in inline;
