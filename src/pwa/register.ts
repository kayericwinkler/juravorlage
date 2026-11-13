// Registriert den Service Worker. Der Entwicklungsserver liefert keinen aus; dort passiert nichts.
export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", async () => {
    try {
      const response = await fetch("./sw.js", { method: "HEAD" });
      if (!response.ok || !response.headers.get("content-type")?.includes("javascript")) return;
      await navigator.serviceWorker.register("./sw.js");
    } catch {
      // Offline-Fähigkeit ist optional.
    }
  });
}
