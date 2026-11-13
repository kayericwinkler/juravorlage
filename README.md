# Jura-Vorlage

Erstellt im Browser eine vorformatierte Word-Vorlage (.docx) für juristische Haus- und Seminararbeiten.
Formatvorgaben des Lehrstuhls einstellen, Abschnitte wählen und sortieren, herunterladen.
Die Datei entsteht vollständig im Browser; es werden keine Daten übertragen.

## Entwicklung

```bash
bun install
bun run dev      # Entwicklungsserver
bun run check    # Typprüfung
bun run build    # statischer Build nach dist/
bun run sample   # Beispieldokumente nach out/
```

Veröffentlicht wird über GitHub Pages: Jeder Push auf `main` baut und veröffentlicht `dist/`
(`.github/workflows/deploy.yml`). In den Repository-Einstellungen muss unter „Pages“ als Quelle
„GitHub Actions“ gewählt sein. Die Links zu Anleitung und Quellcode stehen in `src/config.ts`.

## Aufbau

```
src/
  domain/     Einstellungen: Typen, Defaults, Validierung
  state/      Store, Speicherung (localStorage, Link mit Einstellungen)
  content/    Platzhaltertexte je Abschnitt
  document/   Einstellungen → formatneutrales Dokumentmodell
  export/     Exporter-Schnittstelle; docx/ ist das einzige Modul mit der docx-Library
  ui/         Formular, Abschnittsliste, Aktionen, Icons
```

Abhängigkeiten: [docx](https://github.com/dolanmiu/docx) (MIT), [Lucide](https://lucide.dev) (ISC).

## Lizenz

MIT, siehe [LICENSE](LICENSE).
