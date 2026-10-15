// ==============================================================================
// TELEFON MAĞAZASI YÖNETİM SİSTEMİ - CUSTOM SERVICE WORKER
// ==============================================================================
// Offline-First POS ve Statik Varlık Önbellekleme Mimarisi
// ==============================================================================

const CACHE_NAME = "phone-store-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/dashboard/pos",
  "/manifest.json",
  "/favicon.ico"
];

// 1. Kurulum (Install Event) - Statik Varlıkların Önbelleğe Alınması
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Ön bellek varlıkları yüklenirken uyarı:", err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Aktivasyon (Activate Event) - Eski Cache Temizliği
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. İstek Yakalama (Fetch Event) - Cache-First & Network-First Stratejisi
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API veya Supabase isteklerini Service Worker önbelleğine alma (doğrudan ağa gitsin)
  if (url.pathname.startsWith("/api/") || url.hostname.includes("supabase.co")) {
    return;
  }

  // Statik varlıklar (JS, CSS, Font, Resim): Cache-First
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Sayfa Gezinmeleri: Network-First (Çevrimdışı ise Cache'den dön)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return caches.match("/dashboard/pos");
        });
      })
    );
  }
});
