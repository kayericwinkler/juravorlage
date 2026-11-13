// Einstellungen + Platzhalter → Dokumentmodell. Hier liegen die Regeln für Seitenzählung und Korrekturrand.
import { PLACEHOLDERS } from "../content/placeholders";
import type { Settings } from "../domain/settings";
import type { DocSection, DocumentModel } from "./model";

export function buildDocument(settings: Settings): DocumentModel {
  const { sections: entries, ...format } = settings;
  const enabled = entries.filter((e) => e.enabled);
  const mainIndex = enabled.findIndex((e) => e.id === "haupttext");

  const sections: DocSection[] = enabled.map(({ id }, index) => {
    // Vor dem Haupttext römisch, ab dem Haupttext arabisch. Ohne Haupttext bleibt alles römisch.
    const arabic = mainIndex >= 0 && index >= mainIndex;
    return {
      id,
      // Das Deckblatt zählt mit, zeigt aber keine Seitenzahl.
      pageNumbering: id === "deckblatt" ? "keine" : arabic ? "arabisch" : "roemisch",
      restartPageNumbers: index === 0 || index === mainIndex,
      correctionMargin: id === "haupttext",
      blocks: PLACEHOLDERS[id],
    };
  });

  return { title: "Hausarbeit", format, sections };
}
