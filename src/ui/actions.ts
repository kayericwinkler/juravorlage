// Download, Link kopieren, Zurücksetzen.
import { buildDocument } from "../document/build";
import { DEFAULT_SETTINGS, type Settings } from "../domain/settings";
import { shareUrl } from "../state/persistence";
import type { Store } from "../state/store";

export interface ActionElements {
  readonly download: HTMLButtonElement;
  readonly copyLink: HTMLButtonElement;
  readonly reset: HTMLButtonElement;
  readonly status: HTMLElement;
}

function saveFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: fileName });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function mountActions(el: ActionElements, store: Store<Settings>): void {
  const status = (message: string, isError = false) => {
    el.status.textContent = message;
    el.status.classList.toggle("is-error", isError);
  };

  el.download.addEventListener("click", async () => {
    const settings = store.get();
    if (!settings.sections.some((s) => s.enabled)) return status("Bitte mindestens einen Abschnitt einschalten.", true);
    el.download.disabled = true;
    status("Vorlage wird erstellt …");
    try {
      // Der Exporter (mit der docx-Library) wird erst bei Bedarf geladen.
      const { docxExporter } = await import("../export/docx");
      const { blob, fileName } = await docxExporter.export(buildDocument(settings));
      saveFile(blob, fileName);
      status("Vorlage heruntergeladen.");
    } catch (error) {
      console.error(error);
      status("Die Vorlage konnte nicht erstellt werden.", true);
    } finally {
      el.download.disabled = false;
    }
  });

  el.copyLink.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(store.get()));
      status("Link kopiert.");
    } catch {
      status("Der Link steht in der Adresszeile und kann dort kopiert werden.");
    }
  });

  el.reset.addEventListener("click", () => {
    store.set(DEFAULT_SETTINGS);
    status("Einstellungen zurückgesetzt.");
  });
}
