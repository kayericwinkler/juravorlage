// Platzhalterinhalte je Abschnitt. Nur Text, keine Formatangaben.
import type { SectionId } from "../domain/settings";
import { isFootnote, type Block, type Inline, type ParagraphStyle, type TextSpan } from "../document/model";

// In den Texten dieser Datei steht ~ für ein geschütztes Leerzeichen (kein Umbruch, z. B. „§~433“, „S.~12“).
const nbsp = (text: string): string => text.replaceAll("~", "\u00a0");
const span = (s: TextSpan): TextSpan => ({ ...s, text: nbsp(s.text) });

const para = (style: ParagraphStyle, ...content: (Inline | string)[]): Block => ({
  kind: "paragraph",
  style,
  content: content.map((c) =>
    typeof c === "string" ? { text: nbsp(c) } : isFootnote(c) ? { footnote: c.footnote.map(span) } : span(c),
  ),
});
const heading = (level: number, text: string): Block => ({ kind: "heading", level, text: nbsp(text) });
const italic = (text: string): Inline => ({ text, italic: true });
const std = (...content: (Inline | string)[]) => para("standard", ...content);

const FLIESSTEXT =
  "Hier steht der Text der Bearbeitung. Dieser Absatz ist ein Platzhalter für die Formatvorlage „Standard“: Blocksatz, eingestellter Zeilenabstand und 6~pt Abstand nach dem Absatz.";

const deckblatt: Block[] = [
  para("deckblattAutor", "Vorname Nachname"),
  para("deckblattAutor", "Musterstraße 1"),
  para("deckblattAutor", "12345 Musterstadt"),
  para("deckblattAutor", "Matrikelnummer: 1234567"),
  para("deckblattAutor", "3.~Fachsemester"),
  para("deckblattTitel", "Hausarbeit in der Übung im", {
    text: "Bürgerlichen Recht für Fortgeschrittene",
    lineBreakBefore: true,
  }),
  para("deckblattAngaben", "bei Prof.~Dr.~Vorname Nachname"),
  para("deckblattAngaben", "Lehrstuhl für Bürgerliches Recht"),
  para("deckblattAngaben", "Wintersemester 2026/2027"),
];

const sachverhalt: Block[] = [
  para("verzeichnisueberschrift", "Sachverhalt"),
  std("Hier steht der Sachverhalt aus der Aufgabenstellung. A verkauft B am 1.~März ein gebrauchtes Fahrrad für 300~Euro. Bei der Übergabe stellt sich heraus, dass …"),
  std("Wie ist die Rechtslage?"),
];

const inhaltsverzeichnis: Block[] = [para("inhaltsverzeichnisueberschrift", "Inhaltsverzeichnis"), { kind: "toc" }];

const abk = (kurz: string, lang: string) => para("abkuerzungseintrag", kurz, { text: lang, tabBefore: true });
const abkuerzungsverzeichnis: Block[] = [
  para("verzeichnisueberschrift", "Abkürzungsverzeichnis"),
  abk("a.~A.", "andere Ansicht"),
  abk("h.~M.", "herrschende Meinung"),
  abk("Rn.", "Randnummer"),
  std("Im Übrigen wird verwiesen auf: ", italic("Kirchner, Hildebert"), ", Abkürzungsverzeichnis der Rechtssprache, bearbeitet von Eike Böttcher, 11.~Aufl., Berlin 2024."),
];

// Alphabetisch nach Verfasser; in Word über „Sortieren“ neu sortierbar (ein Absatz je Eintrag).
const literaturverzeichnis: Block[] = [
  para("verzeichnisueberschrift", "Literaturverzeichnis"),
  para(
    "literatureintrag",
    italic("Beispiel, Bernd"),
    ", Titel des Beitrags, in: Herausgeber, Hans (Hrsg.), Festschrift für Vorname Nachname zum 70.~Geburtstag, Berlin 2023, S.~101–120.",
  ),
  para(
    "literatureintrag",
    italic("Mustermann, Max"),
    " (Hrsg.), Kommentar zum Bürgerlichen Gesetzbuch, Band~2, 5.~Aufl., München 2025 (zit.: ",
    italic("Bearbeiter"),
    ", in: Mustermann, BGB, §~… Rn.~…).",
  ),
  para("literatureintrag", italic("Musterfrau, Erika"), ", Titel des Aufsatzes, NJW 2024, S.~1234–1240."),
];

const haupttext: Block[] = [
  heading(1, "Anspruch des A gegen B aus §~433~II~BGB"),
  std(
    "A könnte gegen B einen Anspruch auf Zahlung des Kaufpreises aus §~433~II~BGB haben.",
    {
      footnote: [
        { text: "Vgl. BGH, Urt.~v.~01.01.2024 – V~ZR~1/23, NJW 2024, 123 (125) Rn.~12; " },
        { text: "Bearbeiter", italic: true },
        { text: ", in: Mustermann, BGB, §~433 Rn.~5; " },
        { text: "Musterfrau", italic: true },
        { text: ", NJW 2024, 1234 (1236)." },
      ],
    },
  ),
  heading(2, "Anspruch entstanden"),
  std(FLIESSTEXT),
  heading(3, "Einigung"),
  heading(4, "Angebot"),
  heading(5, "Abgabe"),
  heading(6, "Willentliche Entäußerung"),
  heading(7, "In Richtung auf den Empfänger"),
  std("B hat das Angebot willentlich in Richtung auf A entäußert."),
  heading(5, "Zugang"),
  heading(4, "Annahme"),
  heading(2, "Ergebnis"),
  heading(1, "Anspruch des A gegen B aus §~812~I~1 Alt.~1~BGB"),
  std(FLIESSTEXT),
];

const eigenstaendigkeitserklaerung: Block[] = [
  para("verzeichnisueberschrift", "Eigenständigkeitserklärung"),
  std(
    "Hiermit versichere ich, dass ich die vorliegende Arbeit selbstständig verfasst und keine anderen als die angegebenen Quellen und Hilfsmittel benutzt habe. Alle Stellen, die wörtlich oder sinngemäß aus Veröffentlichungen entnommen sind, habe ich als solche kenntlich gemacht.",
  ),
  para("unterschrift", "Ort, Datum"),
  para("unterschrift", "Unterschrift"),
];

export const PLACEHOLDERS: Readonly<Record<SectionId, readonly Block[]>> = {
  deckblatt,
  sachverhalt,
  inhaltsverzeichnis,
  abkuerzungsverzeichnis,
  literaturverzeichnis,
  haupttext,
  eigenstaendigkeitserklaerung,
};
