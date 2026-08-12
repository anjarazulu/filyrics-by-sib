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

function normaliserTexte(texte) {
    return String(texte || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // retire les accents pour une recherche plus tolérante
}

function rendreListeChants(filtre = "") {
    const filtreNormalise = normaliserTexte(filtre);
    const chantsFiltres = filtreNormalise
        ? chants.filter(c => normaliserTexte(c.titre).includes(filtreNormalise) || normaliserTexte(c.auteur).includes(filtreNormalise))
        : chants;

    if (chantsFiltres.length === 0) {
        return `<p class="aucun-resultat">Aucun chant ne correspond à ta recherche.</p>`;
    }

    return chantsFiltres.map(chant => `
        <div class="chant">
            <h3>${chant.titre} <span class="badge-vues" title="Nombre de vues">👁 ${chant.vues || 0}</span></h3>
            <div class="actions-chant">
                <button data-action="chant" data-id="${chant.id}">Lire les paroles</button>
                ${estConnecte() ? `
                    <button class="btn-admin btn-petit" data-action="form-chant" data-id="${chant.id}">Modifier</button>
                    <button class="btn-danger btn-petit" data-action="supprimer-chant" data-id="${chant.id}">Supprimer</button>
                ` : ""}
            </div>
        </div>`).join("");
}

function afficherParoles(push = true) {
    let contenu = `
        <h2>Liste des chants</h2>
        <input type="search" id="recherche-chants" class="barre-recherche" placeholder="🔎 Rechercher un chant...">
    `;

    if (estConnecte()) {
        contenu += `<button class="btn-admin" data-action="form-chant">+ Ajouter un chant</button>`;
    }

    contenu += `<div id="liste-chants">${rendreListeChants()}</div>`;
    contenu += `<button data-action="accueil">Retour à l'accueil</button>`;
    main.innerHTML = contenu;

    document.getElementById("recherche-chants").addEventListener("input", (e) => {
        document.getElementById("liste-chants").innerHTML = rendreListeChants(e.target.value);
    });

    if (push) history.pushState({ view: "paroles" }, "", "#paroles");
}

function afficherChant(id, push = true) {
    const chant = chants.find(c => c.id === id);
    if (!chant) { afficherParoles(push); return; }

    const vuesAvant = chant.vues || 0;
    chant.vues = vuesAvant + 1;
    incrementerVues(id, vuesAvant); // mise à jour en base, en arrière-plan

    main.innerHTML = `
    <section class="page-chant">
        <h2>${chant.titre}</h2>
        <p class="compteur-vues">👁 ${chant.vues} vue${chant.vues > 1 ? "s" : ""}</p>
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
        const zoneErreur = document.getElementById("erreur-form-chant");
        zoneErreur.textContent = "";
        const fd = new FormData(e.target);
        const valeurs = {
            titre: fd.get("titre").trim(),
            auteur: fd.get("auteur").trim(),
            compositeur: fd.get("compositeur").trim(),
            tonalite: fd.get("tonalite").trim(),
            paroles: fd.get("paroles")
        };

        if (!valeurs.titre) {
            zoneErreur.textContent = "Le titre ne peut pas être vide.";
            return;
        }
        if (!fd.get("paroles") || !fd.get("paroles").trim()) {
            zoneErreur.textContent = "Les paroles ne peuvent pas être vides.";
            return;
        }

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
            <div class="description-membre" id="description-${index}">
                <div class="description-inner">
                    <p>${membre.description || ""}</p>
                </div>
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
        <label>Rôle (ex : Chef de chœur, Choriste, Trésorier...)
            <input type="text" name="role" value="${membre ? echapper(membre.role || "") : ""}">
        </label>
        <label>Niveau hiérarchique
            <select name="niveau">
                <option value="1" ${membre && membre.niveau === 1 ? "selected" : ""}>1 — Direction</option>
                <option value="2" ${membre && membre.niveau === 2 ? "selected" : ""}>2 — Chef de pupitre</option>
                <option value="3" ${!membre || membre.niveau === 3 || !membre.niveau ? "selected" : ""}>3 — Choriste</option>
            </select>
        </label>
        <label>Pupitre (laisser vide pour la direction)
            <select name="pupitre">
                <option value="" ${membre && !membre.pupitre ? "selected" : ""}>—</option>
                <option value="Soprano" ${membre && membre.pupitre === "Soprano" ? "selected" : ""}>Soprano</option>
                <option value="Alto" ${membre && membre.pupitre === "Alto" ? "selected" : ""}>Alto</option>
                <option value="Tenor" ${membre && membre.pupitre === "Tenor" ? "selected" : ""}>Ténor</option>
                <option value="Musicien" ${membre && membre.pupitre === "Musicien" ? "selected" : ""}>Musicien</option>
            </select>
        </label>
        <p class="erreur-form" id="erreur-form-membre"></p>
        <button type="submit" class="btn-admin">${membre ? "Enregistrer" : "Ajouter"}</button>
        <button type="button" data-action="galerie">Annuler</button>
    </form>`;

    document.getElementById("form-membre").addEventListener("submit", async (e) => {
        e.preventDefault();
        const zoneErreur = document.getElementById("erreur-form-membre");
        zoneErreur.textContent = "";
        const boutonSubmit = e.target.querySelector("button[type=submit]");
        const fd = new FormData(e.target);

        const nom = fd.get("nom").trim();
        if (!nom) {
            zoneErreur.textContent = "Le nom ne peut pas être vide.";
            return;
        }

        const fichierPhoto = fd.get("photo");
        const fichierPhoto2 = fd.get("photo2");

        for (const [fichier, label] of [[fichierPhoto, "photo principale"], [fichierPhoto2, "photo secondaire"]]) {
            if (fichier && fichier.size > 0) {
                if (!fichier.type.startsWith("image/")) {
                    zoneErreur.textContent = `Le fichier "${label}" doit être une image.`;
                    return;
                }
                if (fichier.size > 15 * 1024 * 1024) {
                    zoneErreur.textContent = `L'image "${label}" dépasse 15 Mo, choisis un fichier plus léger.`;
                    return;
                }
            }
        }

        boutonSubmit.disabled = true;
        boutonSubmit.textContent = "Envoi en cours...";
        try {
            const valeurs = {
                nom: nom,
                description: fd.get("description"),
                role: fd.get("role").trim(),
                niveau: Number(fd.get("niveau")),
                pupitre: fd.get("pupitre") || null
            };
            if (fichierPhoto && fichierPhoto.size > 0) {
                valeurs.photo = await uploaderPhoto(await compresserImage(fichierPhoto));
            } else if (!membre) {
                valeurs.photo = null;
            }
            if (fichierPhoto2 && fichierPhoto2.size > 0) {
                valeurs.photo2 = await uploaderPhoto(await compresserImage(fichierPhoto2));
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

    const rendreBloc = (e, estProchain = false) => `
        <div class="evenement ${estProchain ? "evenement-prochain" : ""}">
            ${estProchain ? `<span class="badge-prochain">Prochain événement</span>` : ""}
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
        futurs.forEach((e, i) => { contenu += rendreBloc(e, i === 0); });
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
        const zoneErreur = document.getElementById("erreur-form-evenement");
        zoneErreur.textContent = "";
        const boutonSubmit = e.target.querySelector("button[type=submit]");
        const fd = new FormData(e.target);

        const titre = fd.get("titre").trim();
        if (!titre) {
            zoneErreur.textContent = "Le titre ne peut pas être vide.";
            return;
        }

        const nouveauxFichiers = fd.getAll("photos").filter(f => f && f.size > 0);
        for (const fichier of nouveauxFichiers) {
            if (!fichier.type.startsWith("image/")) {
                zoneErreur.textContent = `Le fichier "${fichier.name}" n'est pas une image.`;
                return;
            }
            if (fichier.size > 15 * 1024 * 1024) {
                zoneErreur.textContent = `L'image "${fichier.name}" dépasse 15 Mo, choisis un fichier plus léger.`;
                return;
            }
        }

        boutonSubmit.disabled = true;
        boutonSubmit.textContent = "Envoi en cours...";
        try {
            const nouvellesUrls = [];
            for (const fichier of nouveauxFichiers) {
                nouvellesUrls.push(await uploaderPhoto(await compresserImage(fichier)));
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
// HIERARCHIE ET ROLES
// ---------------------------------------------------------------------

function carteMembre(membre) {
    return `
    <div class="carte-hierarchie">
        <img src="${membre.photo || "images/default.png"}" alt="${membre.nom}" onerror="this.onerror=null; this.src='images/default.png';">
        <p class="nom-hierarchie">${membre.nom}</p>
        <p class="role-hierarchie">${membre.role || ""}</p>
    </div>`;
}

function afficherHierarchie(push = true) {
    const direction = membres.filter(m => m.niveau === 1);
    const chefsDePupitre = membres.filter(m => m.niveau === 2);
    const choristes = membres.filter(m => m.niveau === 3 || !m.niveau);

    const ordrePupitres = ["Soprano", "Alto", "Tenor", "Musicien"];
    const pupitresPresents = ordrePupitres.filter(p =>
        chefsDePupitre.some(m => m.pupitre === p) || choristes.some(m => m.pupitre === p)
    );
    const sansPupitre = choristes.filter(m => !m.pupitre || !ordrePupitres.includes(m.pupitre));

    let contenu = `<h2>Hiérarchie et rôles</h2>`;

    if (membres.length === 0) {
        contenu += `<p class="aucun-resultat">Aucun membre enregistré pour le moment.</p>`;
    } else {
        if (direction.length > 0) {
            contenu += `
            <div class="niveau-hierarchie niveau-direction">
                ${direction.map(carteMembre).join("")}
            </div>`;
        }

        if (pupitresPresents.length > 0) {
            contenu += `<div class="pupitres-hierarchie">`;
            pupitresPresents.forEach(pupitre => {
                const chef = chefsDePupitre.find(m => m.pupitre === pupitre);
                const membresPupitre = choristes.filter(m => m.pupitre === pupitre);

                contenu += `
                <div class="colonne-pupitre">
                    <h3>${pupitre === "Tenor" ? "Ténor" : pupitre}</h3>
                    ${chef ? `<div class="niveau-hierarchie niveau-chef">${carteMembre(chef)}</div>` : ""}
                    <div class="niveau-hierarchie niveau-choristes">
                        ${membresPupitre.map(carteMembre).join("")}
                    </div>
                </div>`;
            });
            contenu += `</div>`;
        }

        if (sansPupitre.length > 0) {
            contenu += `
            <h3 class="sous-titre-evenement">Autres membres</h3>
            <div class="niveau-hierarchie niveau-choristes">
                ${sansPupitre.map(carteMembre).join("")}
            </div>`;
        }
    }

    if (estConnecte()) {
        contenu += `<p class="astuce-admin">Pour modifier les rôles, niveaux et pupitres, va dans Galerie → Modifier un membre.</p>`;
    }

    contenu += `<button data-action="accueil">Retour à l'accueil</button>`;
    main.innerHTML = contenu;
    if (push) history.pushState({ view: "hierarchie" }, "", "#hierarchie");
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
            <span class="champ-mdp">
                <input type="password" name="motdepasse" id="champ-motdepasse" required>
                <button type="button" id="toggle-mdp" aria-label="Afficher le mot de passe">👁</button>
            </span>
        </label>
        <p class="erreur-form" id="erreur-connexion"></p>
        <button type="submit" class="btn-admin">Se connecter</button>
        <button type="button" data-action="accueil">Annuler</button>
    </form>`;

    document.getElementById("toggle-mdp").addEventListener("click", () => {
        const champ = document.getElementById("champ-motdepasse");
        const bouton = document.getElementById("toggle-mdp");
        const visible = champ.type === "text";
        champ.type = visible ? "password" : "text";
        bouton.textContent = visible ? "👁" : "🙈";
        bouton.setAttribute("aria-label", visible ? "Afficher le mot de passe" : "Masquer le mot de passe");
    });

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
    } else if (hash === "hierarchie") {
        afficherHierarchie(false);
        history.replaceState({ view: "hierarchie" }, "", "#hierarchie");
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
    } else if (state.view === "hierarchie") {
        afficherHierarchie(false);
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
        const estOuvert = descDiv.classList.toggle("ouvert");
        btn.textContent = estOuvert ? "▴" : "▾";
        return;
    }

    const action = btn.dataset.action;
    const id = btn.dataset.id ? Number(btn.dataset.id) : null;

    if (action === "chant") afficherChant(id);
    else if (action === "paroles") afficherParoles();
    else if (action === "accueil") afficherAccueil();
    else if (action === "galerie") afficherGalerie();
    else if (action === "evenements") afficherEvenements();
    else if (action === "hierarchie") afficherHierarchie();
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
    main.innerHTML = `
        <div class="chargement">
            <div class="spinner"></div>
            <p>Chargement...</p>
        </div>`;
    await initAuth();
    await actualiserDonnees();
    onChangementConnexion();
    initDepuisHash();
}

demarrer();
