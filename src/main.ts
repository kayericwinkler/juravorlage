// Einstieg: verbindet Store, Speicherung und die UI-Module.
import { DOCS_URL, REPO_URL } from "./config";
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

// Tooltips: Hover/Fokus laufen über CSS; per Tap (Touch) wird zusätzlich .is-open umgeschaltet.
document.addEventListener("click", (e) => {
  const button = (e.target as Element).closest<HTMLElement>(".tip-btn");
  for (const tip of document.querySelectorAll<HTMLElement>(".tip.is-open")) {
    if (tip !== button?.parentElement) tip.classList.remove("is-open");
  }
  button?.parentElement?.classList.toggle("is-open");
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  for (const tip of document.querySelectorAll(".tip.is-open")) tip.classList.remove("is-open");
  const active = document.activeElement as HTMLElement | null;
  if (active?.classList.contains("tip-btn")) active.blur();
});
