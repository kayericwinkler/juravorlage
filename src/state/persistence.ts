// Einstellungen laden und speichern: URL-Hash (teilbarer Link) vor localStorage vor Defaults.
import { DEFAULT_SETTINGS, type Settings } from "../domain/settings";
import { sanitizeSettings } from "../domain/validate";

const STORAGE_KEY = "juravorlage.settings.v1";
const HASH_KEY = "v1";

const toBase64Url = (text: string): string => {
  const bytes = new TextEncoder().encode(text);
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
};

const fromBase64Url = (encoded: string): string => {
  const binary = atob(encoded.replaceAll("-", "+").replaceAll("_", "/"));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
};

export const encodeSettings = (settings: Settings): string => `${HASH_KEY}=${toBase64Url(JSON.stringify(settings))}`;

export function decodeSettings(hash: string): Settings | undefined {
  const value = new URLSearchParams(hash.replace(/^#/, "")).get(HASH_KEY);
  if (!value) return undefined;
  try {
    return sanitizeSettings(JSON.parse(fromBase64Url(value)));
  } catch {
    return undefined;
  }
}

export function loadSettings(): Settings {
  const fromHash = decodeSettings(location.hash);
  if (fromHash) return fromHash;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return sanitizeSettings(JSON.parse(stored));
  } catch {
    // localStorage nicht verfügbar oder Inhalt defekt: Defaults.
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Privater Modus o. Ä.: Die App funktioniert auch ohne Speicherung.
  }
  history.replaceState(null, "", `#${encodeSettings(settings)}`);
}

export const shareUrl = (settings: Settings): string =>
  `${location.origin}${location.pathname}#${encodeSettings(settings)}`;
