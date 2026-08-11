// Service worker : permet au site de fonctionner hors-ligne (pages déjà
// visitées) et rend l'application "installable" sur Android.
// Il ne met en cache QUE les fichiers du site lui-même (HTML/CSS/JS/images
// locales) — jamais les requêtes vers Supabase, pour que les chants,
// membres et événements restent toujours à jour dès qu'il y a du réseau.

const CACHE_NAME = "feo-iray-v1";

const FICHIERS_A_METTRE_EN_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./data.js",
    "./auth.js",
    "./config.js",
    "./images/logo.png",
    "./images/default.png",
    "./images/icon-192.png",
    "./images/icon-512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(FICHIERS_A_METTRE_EN_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((noms) =>
            Promise.all(noms.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((reponseCache) => {
            const recuperation = fetch(event.request)
                .then((reponseReseau) => {
                    const clone = reponseReseau.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return reponseReseau;
                })
                .catch(() => reponseCache);

            return reponseCache || recuperation;
        })
    );
});
