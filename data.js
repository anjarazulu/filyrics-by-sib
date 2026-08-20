// Toutes les fonctions qui communiquent avec la base de données Supabase
// (lecture des chants/membres/événements, ajout, modification, suppression,
// et upload des photos dans le stockage).

// ---------- Lecture ----------

// ---------- Cache local (pour l'accès hors-ligne) ----------
// À chaque chargement réussi, on garde une copie locale des données.
// Si Supabase est injoignable (pas de réseau, serveur en panne...), on sert
// cette dernière copie connue plutôt que de bloquer l'appli.
function sauvegarderCacheLocal(cle, donnees) {
    try {
        localStorage.setItem(cle, JSON.stringify(donnees));
    } catch (e) {
        // stockage plein ou indisponible : pas grave, on continue sans cache
    }
}

function lireCacheLocal(cle) {
    try {
        const brut = localStorage.getItem(cle);
        return brut ? JSON.parse(brut) : [];
    } catch (e) {
        return [];
    }
}

async function chargerChants() {
    const { data, error } = await sb.from("chants").select("*").order("id");
    if (error) {
        console.error("Erreur chargement chants:", error);
        if (typeof afficherOverlayHorsLigne === "function") afficherOverlayHorsLigne();
        return lireCacheLocal("cache_chants");
    }
    sauvegarderCacheLocal("cache_chants", data);
    if (typeof masquerOverlayHorsLigne === "function") masquerOverlayHorsLigne();
    return data;
}

async function chargerMembres() {
    const { data, error } = await sb.from("membres").select("*").order("id");
    if (error) {
        console.error("Erreur chargement membres:", error);
        if (typeof afficherOverlayHorsLigne === "function") afficherOverlayHorsLigne();
        return lireCacheLocal("cache_membres");
    }
    sauvegarderCacheLocal("cache_membres", data);
    if (typeof masquerOverlayHorsLigne === "function") masquerOverlayHorsLigne();
    return data;
}

async function chargerEvenements() {
    const { data, error } = await sb.from("evenements").select("*").order("id");
    if (error) {
        console.error("Erreur chargement evenements:", error);
        if (typeof afficherOverlayHorsLigne === "function") afficherOverlayHorsLigne();
        return lireCacheLocal("cache_evenements");
    }
    sauvegarderCacheLocal("cache_evenements", data);
    if (typeof masquerOverlayHorsLigne === "function") masquerOverlayHorsLigne();
    return data;
}

// ---------- Compteur de vues ----------
// Incrémente le nombre de vues d'un chant. "vuesActuelles" est la valeur
// connue avant l'incrément (pour éviter un aller-retour supplémentaire).
async function incrementerVues(id, vuesActuelles) {
    const { error } = await sb.from("chants").update({ vues: (vuesActuelles || 0) + 1 }).eq("id", id);
    if (error) {
        console.error("Erreur incrémentation vues:", error);
    }
}

// ---------- Compression d'image ----------
// Redimensionne et recompresse une image côté navigateur avant l'upload,
// mais seulement si elle est assez grande pour que ça vaille le coup et
// seulement si le résultat est effectivement plus léger (sinon on garde
// l'original pour ne jamais perdre en qualité inutilement).
function compresserImage(fichier, dimensionMax = 1600, qualite = 0.85) {
    return new Promise((resolve) => {
        if (!fichier || !fichier.type || !fichier.type.startsWith("image/") || fichier.type === "image/svg+xml") {
            resolve(fichier);
            return;
        }
        // En dessous de ce poids, l'image est déjà légère : pas besoin de compresser.
        if (fichier.size < 700 * 1024) {
            resolve(fichier);
            return;
        }
        const lecteur = new FileReader();
        lecteur.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;
                if (width > dimensionMax || height > dimensionMax) {
                    if (width > height) {
                        height = Math.round(height * (dimensionMax / width));
                        width = dimensionMax;
                    } else {
                        width = Math.round(width * (dimensionMax / height));
                        height = dimensionMax;
                    }
                }
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                canvas.getContext("2d").drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (!blob || blob.size >= fichier.size) {
                        resolve(fichier); // la compression n'aide pas ici, on garde l'original
                        return;
                    }
                    resolve(new File([blob], fichier.name, { type: "image/jpeg" }));
                }, "image/jpeg", qualite);
            };
            img.onerror = () => resolve(fichier);
            img.src = e.target.result;
        };
        lecteur.onerror = () => resolve(fichier);
        lecteur.readAsDataURL(fichier);
    });
}

// ---------- Upload de photo ----------
// Envoie un fichier dans le bucket "photos" et renvoie son URL publique.
async function uploaderPhoto(fichier) {
    const extension = fichier.name.split(".").pop();
    const nomFichier = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

    const { error } = await sb.storage.from("photos").upload(nomFichier, fichier);
    if (error) {
        console.error("Erreur upload photo:", error);
        throw error;
    }

    const { data } = sb.storage.from("photos").getPublicUrl(nomFichier);
    return data.publicUrl;
}

// ---------- Chants ----------

async function ajouterChant(chant) {
    const { error } = await sb.from("chants").insert(chant);
    if (error) throw error;
}

async function modifierChant(id, chant) {
    const { error } = await sb.from("chants").update(chant).eq("id", id);
    if (error) throw error;
}

async function supprimerChant(id) {
    const { error } = await sb.from("chants").delete().eq("id", id);
    if (error) throw error;
}

// ---------- Membres ----------

async function ajouterMembre(membre) {
    const { data, error } = await sb.from("membres").insert(membre).select().single();
    if (error) throw error;
    return data;
}

async function modifierMembre(id, membre) {
    const { error } = await sb.from("membres").update(membre).eq("id", id);
    if (error) throw error;
}

async function supprimerMembre(id) {
    const { error } = await sb.from("membres").delete().eq("id", id);
    if (error) throw error;
}

// ---------- Evenements ----------

async function ajouterEvenement(evenement) {
    const { error } = await sb.from("evenements").insert(evenement);
    if (error) throw error;
}

async function modifierEvenement(id, evenement) {
    const { error } = await sb.from("evenements").update(evenement).eq("id", id);
    if (error) throw error;
}

async function supprimerEvenement(id) {
    const { error } = await sb.from("evenements").delete().eq("id", id);
    if (error) throw error;
            }
