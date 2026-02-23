/**
 * FightNight OS — Service Worker
 *
 * Strategy:
 *   - Static assets (JS, CSS, fonts, images): Cache-first with network fallback
 *   - HTML pages: Network-first with cache fallback (keeps data fresh)
 *   - API requests (Supabase, Clerk): Network-only (never cache auth/data)
 *
 * Bump CACHE_VERSION to bust cache on major deploys.
 */

const CACHE_VERSION = "fightnight-v1";

const STATIC_EXTENSIONS = /\.(js|css|png|jpg|jpeg|webp|svg|woff|woff2|ttf|ico)$/;

// ── Install: Activate immediately ──
self.addEventListener("install", () => {
  self.skipWaiting();
});

// ── Activate: Clean old caches ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: Route requests to appropriate strategy ──
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API requests (Supabase, Clerk, external services)
  if (
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("clerk.") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Static assets: Cache-first
  if (STATIC_EXTENSIONS.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML pages: Network-first
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Everything else: Network-first
  event.respondWith(networkFirst(request));
});

// ── Cache-first strategy ──
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

// ── Network-first strategy ──
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response("Offline", {
      status: 503,
      headers: { "Content-Type": "text/html" },
    });
  }
}
