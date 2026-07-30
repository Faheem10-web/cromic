const CACHE_NAME = "cromic-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/site.webmanifest",
  "/favicon.ico",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/icons/android-192.png",
  "/icons/android-512.png",
  "/icons/apple-touch-icon-180.png",
  "/icons/maskable-192.png",
  "/icons/maskable-512.png",
  "/icons/safari-pinned-tab.svg",
  "/assets/white.logo.png",
  "/assets/logo.png",
  "/assets/flogo.png"
];

// Install Event — Pre-cache static shell assets
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("Failed to pre-cache some assets:", err);
      });
    })
  );
});

// Activate Event — Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — Intelligent caching strategies
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests and browser extension / cross-origin analytics requests
  if (req.method !== "GET" || !url.origin.includes(self.location.origin)) {
    return;
  }

  // Navigation / HTML page requests (Network First -> Cache Fallback)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => {
          return caches.match(req).then((cached) => {
            return cached || caches.match("/");
          });
        })
    );
    return;
  }

  // Static Assets (JS, CSS, Images, Fonts) — Cache First -> Network Fallback
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ico|mp4)$/) ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/assets/")
  ) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        if (cachedRes) {
          // Stale-while-revalidate update in background
          fetch(req).then((netRes) => {
            if (netRes && netRes.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, netRes));
            }
          }).catch(() => {});
          return cachedRes;
        }

        return fetch(req).then((netRes) => {
          if (netRes && netRes.status === 200) {
            const resClone = netRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return netRes;
        });
      })
    );
    return;
  }

  // Default Stale While Revalidate
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      const fetchPromise = fetch(req).then((netRes) => {
        if (netRes && netRes.status === 200) {
          const resClone = netRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return netRes;
      }).catch(() => cachedRes);

      return cachedRes || fetchPromise;
    })
  );
});
