// Einstieg: verbindet Store, Speicherung und die UI-Module.
import { DOCS_URL, REPO_URL } from "./config";
import { registerServiceWorker } from "./pwa/register";
import { loadSettings, saveSettings } from "./state/persistence";
import { createStore } from "./state/store";
import { mountActions } from "./ui/actions";
import { mountIcons } from "./ui/icons";
import { mountSectionsPanel } from "./ui/sections-panel";
import { mountSettingsPanel } from "./ui/settings-panel";

const byId = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} fehlt`);
  return el as T;
};

function showLink(id: string, url: string): void {
  if (!url) return;
  const link = byId<HTMLAnchorElement>(id);
  link.href = url;
  link.hidden = false;
}

const store = createStore(loadSettings());
store.subscribe(saveSettings);

mountIcons(document);
showLink("docs-link", DOCS_URL);
showLink("repo-link", REPO_URL);
mountSettingsPanel(byId<HTMLFormElement>("settings-form"), store);
mountSectionsPanel(byId("sections-list"), store);
mountActions(
  { download: byId("download"), copyLink: byId("copy-link"), reset: byId("reset"), status: byId("status") },
  store,
);

// Ein geöffneter Link mit anderen Einstellungen (Hash-Wechsel) wird übernommen.
window.addEventListener("hashchange", () => store.set(loadSettings()));

registerServiceWorker();
