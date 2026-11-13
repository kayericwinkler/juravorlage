// Linke Spalte: Formular ↔ Store. Ränder werden in cm angezeigt und in mm gespeichert.
import { FONTS, LINE_SPACINGS, type Settings } from "../domain/settings";
import { LIMITS, sanitizeSettings } from "../domain/validate";
import type { Store } from "../state/store";

const MARGIN_FIELDS = ["top", "bottom", "side", "correction"] as const;
const PT_FIELDS = ["textPt", "footnotePt"] as const;
const SPACING_FIELDS = ["lineSpacing", "footnoteLineSpacing"] as const;
const RADIO_FIELDS = ["numbering", "romanCase", "pageNumberAlign"] as const;

const formatNumber = (n: number) => String(Math.round(n * 100) / 100);

function fillSelect(select: HTMLSelectElement, options: readonly { value: string; label: string }[]): void {
  // Ein evtl. vorhandenes <button><selectedcontent> (Select-Styling) bleibt erhalten.
  for (const old of select.querySelectorAll("option")) old.remove();
  select.append(...options.map(({ value, label }) => new Option(label, value)));
}

export function mountSettingsPanel(form: HTMLFormElement, store: Store<Settings>): void {
  const input = (name: string) => form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement;
  const radios = (name: string) => form.elements.namedItem(name) as RadioNodeList;

  fillSelect(input("font") as HTMLSelectElement, FONTS.map((f) => ({ value: f, label: f })));
  for (const name of SPACING_FIELDS) {
    fillSelect(
      input(name) as HTMLSelectElement,
      LINE_SPACINGS.map((v) => ({ value: String(v), label: `${v.toLocaleString("de-DE", { minimumFractionDigits: 1 })} x` })),
    );
  }
  for (const name of PT_FIELDS) Object.assign(input(name), { min: LIMITS[name].min, max: LIMITS[name].max });
  for (const name of MARGIN_FIELDS) {
    Object.assign(input(name), { min: LIMITS.marginMm.min / 10, max: LIMITS.marginMm.max / 10 });
  }

  const write = (s: Settings) => {
    // Das gerade bearbeitete Feld nicht überschreiben, sonst springt der Cursor beim Tippen.
    const set = (name: string, value: string) => {
      const el = input(name);
      if (el !== document.activeElement && el.value !== value) el.value = value;
    };
    set("font", s.font);
    for (const name of SPACING_FIELDS) set(name, String(s[name]));
    for (const name of PT_FIELDS) set(name, formatNumber(s[name]));
    for (const name of MARGIN_FIELDS) set(name, formatNumber(s.margins[name] / 10));
    radios("correctionSide").value = s.margins.correctionSide;
    for (const name of RADIO_FIELDS) radios(name).value = s[name];
  };

  const read = (current: Settings): Settings => {
    const number = (name: string, fallback: number, factor = 1) => {
      const value = (input(name) as HTMLInputElement).valueAsNumber;
      return Number.isFinite(value) ? value * factor : fallback;
    };
    const m = current.margins;
    return sanitizeSettings({
      ...current,
      font: input("font").value,
      lineSpacing: Number(input("lineSpacing").value),
      footnoteLineSpacing: Number(input("footnoteLineSpacing").value),
      textPt: number("textPt", current.textPt),
      footnotePt: number("footnotePt", current.footnotePt),
      margins: {
        top: number("top", m.top, 10),
        bottom: number("bottom", m.bottom, 10),
        side: number("side", m.side, 10),
        correction: number("correction", m.correction, 10),
        correctionSide: radios("correctionSide").value,
      },
      numbering: radios("numbering").value,
      romanCase: radios("romanCase").value,
      pageNumberAlign: radios("pageNumberAlign").value,
    });
  };

  form.addEventListener("input", () => store.update(read));
  // Nach dem Verlassen eines Feldes den bereinigten Wert anzeigen (z. B. bei Eingaben außerhalb der Grenzen).
  form.addEventListener("focusout", () => queueMicrotask(() => write(store.get())));
  form.addEventListener("submit", (e) => e.preventDefault());

  write(store.get());
  store.subscribe(write);
}
