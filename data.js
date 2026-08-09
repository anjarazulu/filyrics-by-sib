// Toutes les fonctions qui communiquent avec la base de données Supabase
// (lecture des chants/membres/événements, ajout, modification, suppression,
// et upload des photos dans le stockage).

// ---------- Lecture ----------

async function chargerChants() {
    const { data, error } = await sb.from("chants").select("*").order("id");
    if (error) {
        console.error("Erreur chargement chants:", error);
        return [];
    }
    return data;
}

async function chargerMembres() {
    const { data, error } = await sb.from("membres").select("*").order("id");
    if (error) {
        console.error("Erreur chargement membres:", error);
        return [];
    }
    return data;
}

async function chargerEvenements() {
    const { data, error } = await sb.from("evenements").select("*").order("id");
    if (error) {
        console.error("Erreur chargement evenements:", error);
        return [];
    }
    return data;
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
    const { error } = await sb.from("membres").insert(membre);
    if (error) throw error;
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
