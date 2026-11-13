// Service Worker: hält alle Dateien der App vor, damit sie offline funktioniert.
// Version und Dateiliste setzt scripts/build.ts beim Build in die beiden Konstanten ein.
const CACHE = "juravorlage-__VERSION__";
const FILES = __FILES__;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request.mode === "navigate" ? "./" : request, { ignoreSearch: true });
      return cached ?? fetch(request);
    }),
  );
});
