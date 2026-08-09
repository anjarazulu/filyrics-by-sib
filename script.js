const main = document.querySelector("main");
const accueilHTML = main.innerHTML; // contenu statique de la page d'accueil, capturé avant tout chargement

let chants = [];
let membres = [];
let evenements = [];

async function actualiserDonnees() {
    [chants, membres, evenements] = await Promise.all([
        chargerChants(),
        chargerMembres(),
        chargerEvenements()
    ]);
}

// ---------------------------------------------------------------------
// ACCUEIL
// ---------------------------------------------------------------------

function afficherAccueil(push = true) {
    main.innerHTML = accueilHTML;
    if (push) history.pushState({ view: "accueil" }, "", "#accueil");
}

// ---------------------------------------------------------------------
// PAROLES
// ---------------------------------------------------------------------

function afficherParoles(push = true) {
    let contenu = "<h2>Liste des chants</h2>";

    if (estConnecte()) {
        contenu += `<button class="btn-admin" data-action="form-chant">+ Ajouter un chant</button>`;
    }

    chants.forEach(chant => {
        contenu += `
        <div class="chant">
            <h3>${chant.titre}</h3>
            <div class="actions-chant">
                <button data-action="chant" data-id="${chant.id}">Lire les paroles</button>
                ${estConnecte() ? `
                    <button class="btn-admin btn-petit" data-action="form-chant" data-id="${chant.id}">Modifier</button>
                    <button class="btn-danger btn-petit" data-action="supprimer-chant" data-id="${chant.id}">Supprimer</button>
                ` : ""}
            </div>
        </div>`;
    });

    contenu += `<button data-action="accueil">Retour à l'accueil</button>`;
    main.innerHTML = contenu;
    if (push) history.pushState({ view: "paroles" }, "", "#paroles");
}

function afficherChant(id, push = true) {
    const chant = chants.find(c => c.id === id);
    if (!chant) { afficherParoles(push); return; }

    main.innerHTML = `
    <section class="page-chant">
        <h2>${chant.titre}</h2>
        <p><strong>Auteur :</strong> ${chant.auteur || ""}</p>
        <p><strong>Compositeur :</strong> ${chant.compositeur || ""}</p>
        <p><strong>Tonalité :</strong> ${chant.tonalite || ""}</p>
        <p class="paroles">${chant.paroles || ""}</p>
        ${estConnecte() ? `
            <div class="actions-chant" style="justify-content:center;">
                <button class="btn-admin btn-petit" data-action="form-chant" data-id="${chant.id}">Modifier</button>
                <button class="btn-danger btn-petit" data-action="supprimer-chant" data-id="${chant.id}">Supprimer</button>
            </div>
        ` : ""}
        <button data-action="paroles">Retour aux paroles</button>
    </section>`;
    if (push) history.pushState({ view: "chant", id }, "", "#chant-" + id);
}

function afficherFormulaireChant(id, push = true) {
    const chant = id ? chants.find(c => c.id === id) : null;

    main.innerHTML = `
    <h2>${chant ? "Modifier le chant" : "Ajouter un chant"}</h2>
    <form id="form-chant" class="form-admin">
        <label>Titre
            <input type="text" name="titre" required value="${chant ? echapper(chant.titre) : ""}">
        </label>
        <label>Auteur
            <input type="text" name="auteur" value="${chant ? echapper(chant.auteur || "") : ""}">
        </label>
        <label>Compositeur
            <input type="text" name="compositeur" value="${chant ? echapper(chant.compositeur || "") : ""}">
        </label>
        <label>Tonalité
            <input type="text" name="tonalite" value="${chant ? echapper(chant.tonalite || "") : ""}">
        </label>
        <label>Paroles
            <textarea name="paroles" rows="10" required>${chant ? chant.paroles || "" : ""}</textarea>
        </label>
        <p class="erreur-form" id="erreur-form-chant"></p>
        <button type="submit" class="btn-admin">${chant ? "Enregistrer" : "Ajouter"}</button>
        <button type="button" data-action="paroles">Annuler</button>
    </form>`;

    document.getElementById("form-chant").addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const valeurs = {
            titre: fd.get("titre").trim(),
            auteur: fd.get("auteur").trim(),
            compositeur: fd.get("compositeur").trim(),
            tonalite: fd.get("tonalite").trim(),
            paroles: fd.get("paroles")
        };
        try {
            if (chant) {
                await modifierChant(chant.id, valeurs);
            } else {
                await ajouterChant(valeurs);
            }
            await actualiserDonnees();
            afficherParoles();
        } catch (err) {
            document.getElementById("erreur-form-chant").textContent = "Erreur : " + err.message;
        }
    });

    if (push) history.pushState({ view: "form-chant", id }, "", "#form-chant");
}

async function gererSuppressionChant(id) {
    if (!confirm("Supprimer définitivement ce chant ?")) return;
    await supprimerChant(id);
    await actualiserDonnees();
    afficherParoles();
}

// ---------------------------------------------------------------------
// GALERIE (MEMBRES)
// ---------------------------------------------------------------------

function afficherGalerie(push = true) {
    let contenu = `<h2>Galerie</h2>`;

    if (estConnecte()) {
        contenu += `<button class="btn-admin" data-action="form-membre">+ Ajouter un membre</button>`;
    }

    contenu += `<div class="galerie">`;

    membres.forEach((membre, index) => {
        contenu += `
        <div class="membre">
            <div class="photo-wrapper">
                <img class="photo-principale" src="${membre.photo || "images/default.png"}" alt="${membre.nom}" onerror="this.onerror=null; this.src='images/default.png';">
                ${membre.photo2 ? `<img class="photo-secondaire" src="${membre.photo2}" alt="${membre.nom}">` : ''}
            </div>
            <p>${membre.nom}</p>
            <button class="toggle-description" data-index="${index}">▾</button>
            <div class="description-membre" id="description-${index}" hidden>
                <p>${membre.description || ""}</p>
            </div>
            ${estConnecte() ? `
                <div class="actions-chant">
                    <button class="btn-admin btn-petit" data-action="form-membre" data-id="${membre.id}">Modifier</button>
                    <button class="btn-danger btn-petit" data-action="supprimer-membre" data-id="${membre.id}">Supprimer</button>
                </div>
            ` : ""}
        </div>`;
    });

    contenu += `</div><button data-action="accueil">Retour à l'accueil</button>`;
    main.innerHTML = contenu;
    if (push) history.pushState({ view: "galerie" }, "", "#galerie");
}

function afficherFormulaireMembre(id, push = true) {
    const membre = id ? membres.find(m => m.id === id) : null;

    main.innerHTML = `
    <h2>${membre ? "Modifier le membre" : "Ajouter un membre"}</h2>
    <form id="form-membre" class="form-admin">
        <label>Nom
            <input type="text" name="nom" required value="${membre ? echapper(membre.nom) : ""}">
        </label>
        <label>Photo principale ${membre ? "(laisser vide pour garder la photo actuelle)" : ""}
            <input type="file" name="photo" accept="image/*">
        </label>
        ${membre && membre.photo ? `<p class="apercu-actuel">Photo actuelle : <img src="${membre.photo}" class="miniature"></p>` : ""}
        <label>Photo secondaire (optionnelle, effet de fondu)
            <input type="file" name="photo2" accept="image/*">
        </label>
        ${membre && membre.photo2 ? `<p class="apercu-actuel">Photo actuelle : <img src="${membre.photo2}" class="miniature"></p>` : ""}
        <label>Description
            <textarea name="description" rows="5">${membre ? membre.description || "" : ""}</textarea>
        </label>
        <p class="erreur-form" id="erreur-form-membre"></p>
        <button type="submit" class="btn-admin">${membre ? "Enregistrer" : "Ajouter"}</button>
        <button type="button" data-action="galerie">Annuler</button>
    </form>`;

    document.getElementById("form-membre").addEventListener("submit", async (e) => {
        e.preventDefault();
        const boutonSubmit = e.target.querySelector("button[type=submit]");
        boutonSubmit.disabled = true;
        boutonSubmit.textContent = "Envoi en cours...";
        const fd = new FormData(e.target);
        try {
            const fichierPhoto = fd.get("photo");
            const fichierPhoto2 = fd.get("photo2");

            const valeurs = {
                nom: fd.get("nom").trim(),
                description: fd.get("description")
            };
            if (fichierPhoto && fichierPhoto.size > 0) {
                valeurs.photo = await uploaderPhoto(fichierPhoto);
            } else if (!membre) {
                valeurs.photo = null;
            }
            if (fichierPhoto2 && fichierPhoto2.size > 0) {
                valeurs.photo2 = await uploaderPhoto(fichierPhoto2);
            }

            if (membre) {
                await modifierMembre(membre.id, valeurs);
            } else {
                await ajouterMembre(valeurs);
            }
            await actualiserDonnees();
            afficherGalerie();
        } catch (err) {
            document.getElementById("erreur-form-membre").textContent = "Erreur : " + err.message;
            boutonSubmit.disabled = false;
            boutonSubmit.textContent = membre ? "Enregistrer" : "Ajouter";
        }
    });

    if (push) history.pushState({ view: "form-membre", id }, "", "#form-membre");
}

async function gererSuppressionMembre(id) {
    if (!confirm("Supprimer définitivement ce membre ?")) return;
    await supprimerMembre(id);
    await actualiserDonnees();
    afficherGalerie();
}

// ---------------------------------------------------------------------
// EVENEMENTS
// ---------------------------------------------------------------------

function genererCarrouselPhotos(e) {
    const photos = e.photos && e.photos.length > 0 ? e.photos : [];
    if (photos.length === 0) return '';

    const imgTag = (src) =>
        `<img src="${src}" alt="${e.titre}" onerror="this.onerror=null; this.src='images/default.png';">`;

    if (photos.length === 1) {
        return `<div class="scroll-photos scroll-photos-fixe">${imgTag(photos[0])}</div>`;
    }

    const suite = photos.map(imgTag).join('') + photos.map(imgTag).join('');
    return `<div class="scroll-photos"><div class="scroll-track">${suite}</div></div>`;
}

function afficherEvenements(push = true) {
    const passes = evenements.filter(e => e.statut === "passe");
    const futurs = evenements.filter(e => e.statut === "futur");

    let contenu = `<h2>Événements</h2>`;

    if (estConnecte()) {
        contenu += `<button class="btn-admin" data-action="form-evenement">+ Ajouter un événement</button>`;
    }

    const rendreBloc = (e) => `
        <div class="evenement">
            ${genererCarrouselPhotos(e)}
            <h4>${e.titre}</h4>
            <p class="date-evenement">${e.date_evenement || ""}</p>
            <p>${e.description || ""}</p>
            ${estConnecte() ? `
                <div class="actions-chant" style="justify-content:center;">
                    <button class="btn-admin btn-petit" data-action="form-evenement" data-id="${e.id}">Modifier</button>
                    <button class="btn-danger btn-petit" data-action="supprimer-evenement" data-id="${e.id}">Supprimer</button>
                </div>
            ` : ""}
        </div>`;

    if (futurs.length > 0) {
        contenu += `<h3 class="sous-titre-evenement">À venir</h3><div class="liste-evenements">`;
        futurs.forEach(e => { contenu += rendreBloc(e); });
        contenu += `</div>`;
    }

    if (passes.length > 0) {
        contenu += `<h3 class="sous-titre-evenement">Passés</h3><div class="liste-evenements">`;
        passes.forEach(e => { contenu += rendreBloc(e); });
        contenu += `</div>`;
    }

    contenu += `<button data-action="accueil">Retour à l'accueil</button>`;
    main.innerHTML = contenu;
    if (push) history.pushState({ view: "evenements" }, "", "#evenements");
}

function afficherFormulaireEvenement(id, push = true) {
    const evenement = id ? evenements.find(e => e.id === id) : null;
    const photosExistantes = evenement && evenement.photos ? [...evenement.photos] : [];

    main.innerHTML = `
    <h2>${evenement ? "Modifier l'événement" : "Ajouter un événement"}</h2>
    <form id="form-evenement" class="form-admin">
        <label>Titre
            <input type="text" name="titre" required value="${evenement ? echapper(evenement.titre) : ""}">
        </label>
        <label>Date (texte libre, ex : "06 Septembre 2026")
            <input type="text" name="date_evenement" value="${evenement ? echapper(evenement.date_evenement || "") : ""}">
        </label>
        <label>Statut
            <select name="statut">
                <option value="passe" ${evenement && evenement.statut === "passe" ? "selected" : ""}>Passé</option>
                <option value="futur" ${evenement && evenement.statut === "futur" ? "selected" : ""}>À venir</option>
            </select>
        </label>
        <label>Description
            <textarea name="description" rows="5">${evenement ? evenement.description || "" : ""}</textarea>
        </label>
        <div id="photos-existantes">
            ${photosExistantes.map((p, i) => `
                <span class="miniature-wrapper">
                    <img src="${p}" class="miniature">
                    <button type="button" class="retirer-photo" data-index="${i}">×</button>
                </span>
            `).join("")}
        </div>
        <label>Ajouter des photos
            <input type="file" name="photos" accept="image/*" multiple>
        </label>
        <p class="erreur-form" id="erreur-form-evenement"></p>
        <button type="submit" class="btn-admin">${evenement ? "Enregistrer" : "Ajouter"}</button>
        <button type="button" data-action="evenements">Annuler</button>
    </form>`;

    document.querySelectorAll(".retirer-photo").forEach(btn => {
        btn.addEventListener("click", () => {
            const i = Number(btn.dataset.index);
            photosExistantes.splice(i, 1);
            afficherFormulaireEvenement(id, false);
        });
    });

    document.getElementById("form-evenement").addEventListener("submit", async (e) => {
        e.preventDefault();
        const boutonSubmit = e.target.querySelector("button[type=submit]");
        boutonSubmit.disabled = true;
        boutonSubmit.textContent = "Envoi en cours...";
        const fd = new FormData(e.target);
        try {
            const nouveauxFichiers = fd.getAll("photos").filter(f => f && f.size > 0);
            const nouvellesUrls = [];
            for (const fichier of nouveauxFichiers) {
                nouvellesUrls.push(await uploaderPhoto(fichier));
            }

            const valeurs = {
                titre: fd.get("titre").trim(),
                date_evenement: fd.get("date_evenement").trim(),
                statut: fd.get("statut"),
                description: fd.get("description"),
                photos: [...photosExistantes, ...nouvellesUrls]
            };

            if (evenement) {
                await modifierEvenement(evenement.id, valeurs);
            } else {
                await ajouterEvenement(valeurs);
            }
            await actualiserDonnees();
            afficherEvenements();
        } catch (err) {
            document.getElementById("erreur-form-evenement").textContent = "Erreur : " + err.message;
            boutonSubmit.disabled = false;
            boutonSubmit.textContent = evenement ? "Enregistrer" : "Ajouter";
        }
    });

    if (push) history.pushState({ view: "form-evenement", id }, "", "#form-evenement");
}

async function gererSuppressionEvenement(id) {
    if (!confirm("Supprimer définitivement cet événement ?")) return;
    await supprimerEvenement(id);
    await actualiserDonnees();
    afficherEvenements();
}

// ---------------------------------------------------------------------
// CONNEXION ADMIN
// ---------------------------------------------------------------------

function afficherConnexion(push = true) {
    main.innerHTML = `
    <h2>Connexion</h2>
    <form id="form-connexion" class="form-admin">
        <label>Email
            <input type="email" name="email" required>
        </label>
        <label>Mot de passe
            <input type="password" name="motdepasse" required>
        </label>
        <p class="erreur-form" id="erreur-connexion"></p>
        <button type="submit" class="btn-admin">Se connecter</button>
        <button type="button" data-action="accueil">Annuler</button>
    </form>`;

    document.getElementById("form-connexion").addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const resultat = await seConnecter(fd.get("email").trim(), fd.get("motdepasse"));
        if (resultat.succes) {
            afficherAccueil();
        } else {
            document.getElementById("erreur-connexion").textContent = resultat.message;
        }
    });

    if (push) history.pushState({ view: "connexion" }, "", "#connexion");
}

function onChangementConnexion() {
    const lien = document.getElementById("lien-connexion");
    if (!lien) return;
    lien.textContent = estConnecte() ? "Déconnexion" : "Connexion";
}

// ---------------------------------------------------------------------
// UTILITAIRE
// ---------------------------------------------------------------------

function echapper(texte) {
    return String(texte).replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------
// ROUTAGE
// ---------------------------------------------------------------------

function initDepuisHash() {
    const hash = location.hash.replace("#", "");

    if (hash.startsWith("chant-")) {
        const id = Number(hash.replace("chant-", ""));
        const existe = chants.some(c => c.id === id);
        if (existe) {
            afficherChant(id, false);
            history.replaceState({ view: "chant", id }, "", "#chant-" + id);
            return;
        }
    } else if (hash === "paroles") {
        afficherParoles(false);
        history.replaceState({ view: "paroles" }, "", "#paroles");
        return;
    } else if (hash === "galerie") {
        afficherGalerie(false);
        history.replaceState({ view: "galerie" }, "", "#galerie");
        return;
    } else if (hash === "evenements") {
        afficherEvenements(false);
        history.replaceState({ view: "evenements" }, "", "#evenements");
        return;
    }

    afficherAccueil(false);
    history.replaceState({ view: "accueil" }, "", "#accueil");
}

window.addEventListener("popstate", (e) => {
    const state = e.state;
    if (!state || state.view === "accueil") {
        afficherAccueil(false);
    } else if (state.view === "paroles") {
        afficherParoles(false);
    } else if (state.view === "chant") {
        afficherChant(state.id, false);
    } else if (state.view === "galerie") {
        afficherGalerie(false);
    } else if (state.view === "evenements") {
        afficherEvenements(false);
    } else if (state.view === "connexion") {
        afficherConnexion(false);
    }
});

document.addEventListener("click", function (e) {
    const lienConnexion = e.target.closest("#lien-connexion");
    if (lienConnexion) {
        e.preventDefault();
        if (estConnecte()) {
            seDeconnecter().then(() => afficherAccueil());
        } else {
            afficherConnexion();
        }
        return;
    }

    const btn = e.target.closest("button");
    if (!btn) return;

    const texte = btn.textContent.trim().toLowerCase();

    if (btn.classList.contains("toggle-description")) {
        const index = btn.dataset.index;
        const descDiv = document.getElementById(`description-${index}`);
        descDiv.hidden = !descDiv.hidden;
        btn.textContent = descDiv.hidden ? "▾" : "▴";
        return;
    }

    const action = btn.dataset.action;
    const id = btn.dataset.id ? Number(btn.dataset.id) : null;

    if (action === "chant") afficherChant(id);
    else if (action === "paroles") afficherParoles();
    else if (action === "accueil") afficherAccueil();
    else if (action === "galerie") afficherGalerie();
    else if (action === "evenements") afficherEvenements();
    else if (action === "form-chant") afficherFormulaireChant(id);
    else if (action === "supprimer-chant") gererSuppressionChant(id);
    else if (action === "form-membre") afficherFormulaireMembre(id);
    else if (action === "supprimer-membre") gererSuppressionMembre(id);
    else if (action === "form-evenement") afficherFormulaireEvenement(id);
    else if (action === "supprimer-evenement") gererSuppressionEvenement(id);
    else if (texte.includes("parole")) afficherParoles();
    else if (texte.includes("galerie")) afficherGalerie();
    else if (texte.includes("événement")) afficherEvenements();
});

// ---------------------------------------------------------------------
// DEMARRAGE
// ---------------------------------------------------------------------

async function demarrer() {
    main.innerHTML = `<p style="text-align:center;padding:60px 0;">Chargement...</p>`;
    await initAuth();
    await actualiserDonnees();
    onChangementConnexion();
    initDepuisHash();
}

demarrer();
