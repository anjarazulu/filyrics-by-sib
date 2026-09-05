// Service worker : permet au site de fonctionner hors-ligne (pages déjà
// visitées) et rend l'application "installable" sur Android.
// Il ne met en cache QUE les fichiers du site lui-même (HTML/CSS/JS/images
// locales) — jamais les requêtes vers Supabase, pour que les chants,
// membres et événements restent toujours à jour dès qu'il y a du réseau.

const CACHE_NAME = "FILyrics-v6";

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
    // Pas de skipWaiting() automatique ici : une nouvelle version reste "en
    // attente" tant que l'utilisateur n'a pas cliqué sur "Actualiser" (voir
    // le message "nouvelle-version-disponible" dans script.js). Ça évite de
    // changer les fichiers sous les pieds de quelqu'un qui est en train de
    // remplir un formulaire.
});

self.addEventListener("message", (event) => {
    if (event.data === "activer-nouvelle-version") {
        self.skipWaiting();
    }
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((noms) =>
            Promise.all(noms.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
        )
    );
    self.clients.claim();
});

// Stratégie "cache d'abord, réseau en secours + mise à jour silencieuse" :
// la page s'affiche instantanément avec ce qui est déjà en cache (important
// avec une connexion lente/instable), pendant qu'une requête réseau met le
// cache à jour en arrière-plan pour la prochaine visite. Comme le numéro de
// CACHE_NAME ci-dessus change à chaque nouvelle version envoyée, on ne
// mélange jamais des fichiers d'âges différents : soit tout vient de
// l'ancien cache complet, soit tout vient du nouveau, jamais un mélange.
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
