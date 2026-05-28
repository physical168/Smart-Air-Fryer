const cacheName = "atelierkitchen-smart-fryer-v6";
const cacheAssets = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "data/recipes.json",
  "assets/icon.png",
  "assets/nav/home.svg",
  "assets/nav/favorites.svg",
  "assets/nav/list.svg",
  "assets/nav/history.svg",
  "assets/detail/temp.svg",
  "assets/detail/time.svg",
  "manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(cacheAssets))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(cacheName).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
