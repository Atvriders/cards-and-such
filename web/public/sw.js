/* Cards and Such service worker — basic offline-first for static assets,
   network-first for API/WebSocket-adjacent requests. */
const CACHE_NAME = "cards-and-such-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Don't intercept WebSockets or non-http(s) schemes.
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Network-first for API calls — fall back to cache only if offline.
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/ws")) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req).then((r) => r || Response.error())),
    );
    return;
  }

  // Cache-first (offline-first) for everything else; update cache on hit.
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => cached || caches.match("/index.html"));
      return cached || fetchPromise;
    }),
  );
});
