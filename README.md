# Jura-Vorlage

Jura-Vorlage erstellt eine vorformatierte Word-Vorlage (.docx) für juristische Haus- und Seminararbeiten.
Du stellst die Formatvorgaben deines Lehrstuhls ein (Schrift, Zeilenabstand, Seitenränder, Korrekturrand,
Gliederung, Seitenzahlen), wählst und sortierst die Abschnitte und lädst die Datei herunter. Sie enthält
Deckblatt, Verzeichnisse, ein automatisches Inhaltsverzeichnis, Formatvorlagen für alle Textarten und
Platzhalter für deinen Text.

Die App läuft direkt im Browser, ohne Installation und ohne Anmeldung. Die Datei entsteht auf deinem Gerät;
es werden keine Daten übertragen.

[![App starten](https://img.shields.io/badge/App_starten-1f3a5f?style=for-the-badge)](https://kayericwinkler.github.io/juravorlage/)

Ausführliche Beschreibung: folgt.

## English

Jura-Vorlage generates a pre-formatted Word template (.docx) for German law term papers. Set your chair's
formatting rules (font, line spacing, margins, correction margin, heading numbering, page numbers), choose
and reorder the sections, and download the file. It runs entirely in the browser: nothing to install, no
account, and no data leaves your device. The user interface is in German.

[Open the app](https://kayericwinkler.github.io/juravorlage/)

## Development

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev      # dev server
bun run check    # type check
bun run build    # static build into dist/
bun run sample   # sample documents into out/
```

The dev server reflects source changes immediately. `dist/` only changes when you run the build again.

Deployment uses GitHub Pages: every push to `main` builds and publishes `dist/`
(`.github/workflows/deploy.yml`). In the repository settings, the Pages source must be set to
"GitHub Actions". The links to the documentation and the source code are set in `src/config.ts`.

### Structure

```
src/
  domain/     settings: types, defaults, validation
  state/      store, persistence (localStorage, shareable link)
  content/    placeholder text per section
  document/   settings → format-neutral document model
  export/     exporter interface; docx/ is the only module that uses the docx library
  ui/         form, section list, actions, icons
```

Dependencies: [docx](https://github.com/dolanmiu/docx) (MIT), [Lucide](https://lucide.dev) (ISC).

### License

MIT, see [LICENSE](LICENSE).

---

Made by [Rechtschreiber](https://rechtschreiber.pro "Coaching für Jura-Hausarbeiten, Fachlektorat und professionelles Ghostwriting").
