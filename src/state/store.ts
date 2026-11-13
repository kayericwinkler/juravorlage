// Minimaler Store: ein Wert, Abonnenten, unveränderliche Updates.

export type Listener<T> = (value: T) => void;

export interface Store<T> {
  get(): T;
  set(value: T): void;
  update(fn: (value: T) => T): void;
  /** Ruft den Listener bei jeder Änderung auf. Rückgabe: Abmelden. */
  subscribe(listener: Listener<T>): () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<Listener<T>>();
  const set = (next: T) => {
    if (next === value) return;
    value = next;
    for (const l of listeners) l(value);
  };
  return {
    get: () => value,
    set,
    update: (fn) => set(fn(value)),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
