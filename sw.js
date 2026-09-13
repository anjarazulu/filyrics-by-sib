// Service worker : permet au site de fonctionner hors-ligne (pages déjà
// visitées) et rend l'application "installable" sur Android.
//
// Il y a maintenant DEUX caches distincts, avec deux rôles différents :
//
// 1) CACHE_NAME  -> les fichiers du site lui-même (HTML/CSS/JS/images
//    locales, et la librairie Supabase désormais hébergée en local dans
//    lib/supabase.js). Stratégie "cache d'abord" : on affiche tout de
//    suite ce qui est déjà en cache, pendant qu'une requête réseau met le
//    cache à jour en arrière-plan pour la prochaine visite.
//
// 2) CACHE_DONNEES -> la dernière réponse connue des tables Supabase
//    (chants, membres, evenements). Stratégie "réseau d'abord" : si le
//    réseau répond, on l'utilise (et on met à jour ce cache) pour avoir
//    les données à jour dès qu'il y a une connexion ; s'il ne répond pas
//    (hors-ligne), on sert la dernière copie enregistrée. Résultat : les
//    chants/membres/événements restent consultables hors-ligne même après
//    avoir complètement fermé puis rouvert l'appli, tant qu'ils ont été
//    chargés au moins une fois avec une connexion.
//
// IMPORTANT : CACHE_DONNEES n'est JAMAIS supprimé quand CACHE_NAME change
// de nom (nouvelle version du site) — sinon les données hors-ligne déjà
// enregistrées sur le téléphone de chaque utilisateur seraient perdues à
// chaque mise à jour de l'appli.

const CACHE_NAME = "FILyrics-1.2";
const CACHE_DONNEES = "FILyrics-donnees";

// Doit correspondre exactement à SUPABASE_URL dans config.js. Si un jour
// le projet Supabase change d'URL, penser à la changer ICI AUSSI.
const SUPABASE_ORIGIN = "https://ivgelvrbrvetqjbpypwz.supabase.co";

// Les seules tables qu'on met en cache pour la lecture hors-ligne (pas les
// requêtes d'écriture, d'authentification ou de stockage de fichiers).
const TABLES_HORS_LIGNE = ["chants", "membres", "evenements"];

const FICHIERS_A_METTRE_EN_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./data.js",
    "./auth.js",
    "./config.js",
    "./lib/supabase.js",
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
            Promise.all(
                noms
                    .filter((n) => n !== CACHE_NAME && n !== CACHE_DONNEES)
                    .map((n) => caches.delete(n))
            )
        )
    );
    self.clients.claim();
});

// Une requête vers /rest/v1/chants, /rest/v1/membres ou /rest/v1/evenements ?
function estRequeteDonneesHorsLigne(url) {
    return (
        url.origin === SUPABASE_ORIGIN &&
        TABLES_HORS_LIGNE.some((table) => url.pathname === "/rest/v1/" + table)
    );
}

// Stratégie "réseau d'abord, cache en secours" pour les données Supabase.
async function repondreAvecDonnees(requete) {
    try {
        const reponseReseau = await fetch(requete);
        // On ne garde en cache que les réponses correctes (200) : pas la
        // peine de mémoriser une éventuelle erreur serveur.
        if (reponseReseau.ok) {
            const clone = reponseReseau.clone();
            caches.open(CACHE_DONNEES).then((cache) => cache.put(requete, clone));
        }
        return reponseReseau;
    } catch (erreurReseau) {
        const reponseCache = await caches.match(requete, { cacheName: CACHE_DONNEES });
        if (reponseCache) return reponseCache;
        throw erreurReseau; // vraiment rien en cache (première utilisation jamais faite en ligne)
    }
}

// Stratégie "cache d'abord, réseau en secours + mise à jour silencieuse"
// pour les fichiers du site lui-même. Comme CACHE_NAME change à chaque
// nouvelle version envoyée, on ne mélange jamais des fichiers d'âges
// différents : soit tout vient de l'ancien cache complet, soit tout vient
// du nouveau, jamais un mélange.
async function repondreAvecFichierDuSite(requete) {
    const reponseCache = await caches.match(requete);
    const recuperation = fetch(requete)
        .then((reponseReseau) => {
            const clone = reponseReseau.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(requete, clone));
            return reponseReseau;
        })
        .catch(() => reponseCache);

    return reponseCache || recuperation;
}

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);

    if (url.origin === self.location.origin) {
        event.respondWith(repondreAvecFichierDuSite(event.request));
        return;
    }

    if (estRequeteDonneesHorsLigne(url)) {
        event.respondWith(repondreAvecDonnees(event.request));
        return;
    }

    // Tout le reste (connexion admin, photos/audio dans Supabase Storage,
    // etc.) : on laisse le navigateur gérer normalement, sans interception.
});
