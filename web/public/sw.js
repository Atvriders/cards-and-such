/* Cards and Such service worker — basic offline-first for static assets,
   network-first for API/WebSocket-adjacent requests, with a graceful
   navigation fallback that lets the SPA render the /offline route when
   the network is unreachable. */
const CACHE_NAME = "cards-and-such-v2";
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

// The page asks the waiting worker to activate immediately when the user
// clicks "Refresh" on the update banner. Without this, the new worker
// would sit in `waiting` until every tab using the old version closed.
self.addEventListener("message", (event) => {
  if (event && event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

/** True if the request is a top-level page navigation (HTML document). */
function isNavigationRequest(req) {
  if (req.mode === "navigate") return true;
  const accept = req.headers.get("accept") || "";
  return req.method === "GET" && accept.includes("text/html");
}

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

  // Navigation requests: try network first so users get fresh HTML, but
  // fall back to the cached SPA shell when offline. The SPA's router
  // will render /offline (or the requested path) once it boots.
  if (isNavigationRequest(req)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Refresh the cached shell on every successful navigation hit.
          if (res && res.status === 200 && res.type === "basic") {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", clone));
          }
          return res;
        })
        .catch(async () => {
          const cached =
            (await caches.match(req)) ||
            (await caches.match("/index.html")) ||
            (await caches.match("/"));
          return (
            cached ||
            new Response(
              "<!doctype html><meta charset=utf-8><title>Offline</title><p>Offline.",
              { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
            )
          );
        }),
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
