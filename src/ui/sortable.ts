// Sortieren einer Liste per Ziehen am Griff. Pointer-Events, daher auch auf Touch-Geräten.

export interface SortableOptions {
  /** Selektor des Griffs innerhalb eines Listeneintrags. */
  readonly handle: string;
  /** Wird nach dem Loslassen mit den data-id-Werten in neuer Reihenfolge aufgerufen. */
  onReorder(order: string[]): void;
}

const DRAGGING = "is-dragging";

export function makeSortable(list: HTMLElement, options: SortableOptions): void {
  list.addEventListener("pointerdown", (down) => {
    const handle = (down.target as Element).closest<HTMLElement>(options.handle);
    const item = handle?.closest<HTMLElement>("[data-id]");
    if (!handle || !item || down.button !== 0) return;

    down.preventDefault();
    item.classList.add(DRAGGING);

    const move = (e: PointerEvent) => {
      for (const other of list.children) {
        if (other === item) continue;
        const rect = other.getBoundingClientRect();
        if (e.clientY < rect.top || e.clientY > rect.bottom) continue;
        const before = e.clientY < rect.top + rect.height / 2;
        list.insertBefore(item, before ? other : other.nextSibling);
        break;
      }
    };

    const end = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", end);
      document.removeEventListener("pointercancel", end);
      item.classList.remove(DRAGGING);
      options.onReorder([...list.children].map((el) => (el as HTMLElement).dataset.id ?? ""));
    };

    // Am Dokument lauschen, nicht am Griff: Beim Umhängen des Eintrags im DOM ginge eine Pointer-Capture verloren.
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", end);
    document.addEventListener("pointercancel", end);
  });
}
