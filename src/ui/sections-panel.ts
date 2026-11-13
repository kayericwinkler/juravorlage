// Rechte Spalte: Abschnitte ein-/ausschalten und sortieren.
import { SECTION_LABELS, type SectionEntry, type SectionId, type Settings } from "../domain/settings";
import type { Store } from "../state/store";
import { icon, type IconName } from "./icons";
import { makeSortable } from "./sortable";

type Action = "up" | "down" | "toggle" | "drag";

function iconButton(name: IconName, label: string, action: Action, className = ""): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `icon-button ${className}`.trim();
  button.dataset.action = action;
  button.title = label;
  button.setAttribute("aria-label", label);
  button.append(icon(name));
  return button;
}

function renderItem(entry: SectionEntry, index: number, count: number): HTMLLIElement {
  const label = SECTION_LABELS[entry.id];
  const li = document.createElement("li");
  li.dataset.id = entry.id;
  li.classList.toggle("is-off", !entry.enabled);

  const text = document.createElement("span");
  text.className = "section-label";
  text.textContent = label;

  const up = iconButton("chevron-up", `${label} nach oben`, "up");
  up.disabled = index === 0;
  const down = iconButton("chevron-down", `${label} nach unten`, "down");
  down.disabled = index === count - 1;

  const toggle = document.createElement("label");
  toggle.className = "switch";
  toggle.title = `${label} ${entry.enabled ? "ausschalten" : "einschalten"}`;
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = entry.enabled;
  checkbox.dataset.action = "toggle";
  checkbox.setAttribute("aria-label", `${label} in die Vorlage aufnehmen`);
  toggle.append(checkbox, document.createElement("span"));

  li.append(iconButton("grip-vertical", `${label} verschieben`, "drag", "drag-handle"), text, up, down, toggle);
  return li;
}

export function mountSectionsPanel(list: HTMLElement, store: Store<Settings>): void {
  const setSections = (fn: (sections: readonly SectionEntry[]) => readonly SectionEntry[]) =>
    store.update((s) => ({ ...s, sections: fn(s.sections) }));

  const move = (id: SectionId, delta: number) =>
    setSections((sections) => {
      const from = sections.findIndex((e) => e.id === id);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= sections.length) return sections;
      const next = [...sections];
      next.splice(to, 0, ...next.splice(from, 1));
      return next;
    });

  const render = (settings: Settings) => {
    // Fokus über das Neuzeichnen hinweg erhalten (Tastaturbedienung).
    const active = document.activeElement as HTMLElement | null;
    const focusId = active?.closest<HTMLElement>("[data-id]")?.dataset.id;
    const focusAction = active?.dataset.action;

    const { sections } = settings;
    list.replaceChildren(...sections.map((entry, i) => renderItem(entry, i, sections.length)));

    if (focusId && focusAction && list.contains(active) === false) {
      const target = list.querySelector<HTMLElement>(`[data-id="${focusId}"] [data-action="${focusAction}"]`);
      if (target && !(target as HTMLButtonElement).disabled) target.focus();
      else list.querySelector<HTMLElement>(`[data-id="${focusId}"] [data-action="drag"]`)?.focus();
    }
  };

  list.addEventListener("click", (e) => {
    const button = (e.target as Element).closest<HTMLElement>("button[data-action]");
    const id = button?.closest<HTMLElement>("[data-id]")?.dataset.id as SectionId | undefined;
    if (!button || !id) return;
    if (button.dataset.action === "up") move(id, -1);
    if (button.dataset.action === "down") move(id, 1);
  });

  list.addEventListener("change", (e) => {
    const checkbox = e.target as HTMLInputElement;
    const id = checkbox.closest<HTMLElement>("[data-id]")?.dataset.id;
    if (checkbox.dataset.action !== "toggle" || !id) return;
    setSections((sections) => sections.map((s) => (s.id === id ? { ...s, enabled: checkbox.checked } : s)));
  });

  // Griff per Tastatur: Pfeiltasten verschieben den Eintrag.
  list.addEventListener("keydown", (e) => {
    const handle = (e.target as Element).closest<HTMLElement>('[data-action="drag"]');
    const id = handle?.closest<HTMLElement>("[data-id]")?.dataset.id as SectionId | undefined;
    if (!id || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
    e.preventDefault();
    move(id, e.key === "ArrowUp" ? -1 : 1);
  });

  makeSortable(list, {
    handle: ".drag-handle",
    onReorder: (order) =>
      setSections((sections) => {
        const next = order.map((id) => sections.find((s) => s.id === id)).filter((s): s is SectionEntry => !!s);
        const unchanged = next.length !== sections.length || next.every((s, i) => s === sections[i]);
        return unchanged ? sections : next;
      }),
  });

  render(store.get());
  store.subscribe(render);
}
