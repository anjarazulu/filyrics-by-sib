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

// Affiche un bandeau discret quand une nouvelle version de l'app est prête
// (déclenché depuis l'enregistrement du service worker dans index.html).
// L'utilisateur choisit lui-même le moment de recharger, plutôt que de voir
// les fichiers changer sous ses pieds pendant une saisie.
function afficherBanniereMiseAJour(nouveauWorker) {
    if (document.getElementById("banniere-maj")) return;

    const banniere = document.createElement("div");
    banniere.id = "banniere-maj";
    banniere.className = "banniere-maj";
    banniere.innerHTML = `
        <span>Une nouvelle version de l'application est disponible.</span>
        <button type="button" id="bouton-maj">Actualiser</button>
    `;
    document.body.appendChild(banniere);

    document.getElementById("bouton-maj").addEventListener("click", () => {
        nouveauWorker.postMessage("activer-nouvelle-version");
    });
}

// ---------------------------------------------------------------------
// MENTIONS LÉGALES / CONFIDENTIALITÉ
// ---------------------------------------------------------------------

function afficherMentionsLegales(push = true) {
    definirTitre("Mentions légales");
    main.innerHTML = `
    <h2>Mentions légales &amp; confidentialité</h2>
    <div class="page-texte">
        <h3>Éditeur du site</h3>
        <p>Ce site est édité par Lyrics Feo Iray Gospel. Pour toute question, contactez
        <a href="mailto:anjara26s.zulu@gmail.com">anjara26s.zulu@gmail.com</a> ou au 034 09 605 65 / 037 63 820 16.</p>

        <h3>Données hébergées</h3>
        <p>Les chants, photos, fichiers audio et informations sur les membres sont hébergés via Supabase
        (base de données et stockage de fichiers). Aucune donnée n'est vendue ni partagée avec des tiers à des fins publicitaires.</p>

        <h3>Photos et informations sur les membres</h3>
        <p>Les photos et descriptions affichées dans la Galerie et la Hiérarchie sont publiées avec l'accord des personnes concernées.
        Toute personne peut demander la modification ou le retrait de sa photo ou de sa description en contactant l'adresse ci-dessus.</p>

        <h3>Cookies et stockage local</h3>
        <p>Le site n'utilise pas de cookies publicitaires ou de traceurs tiers. Une seule préférence est enregistrée sur l'appareil
        (le choix du mode clair/sombre), via le stockage local du navigateur, uniquement pour mémoriser ce réglage d'une visite à l'autre.</p>

        <h3>Accès administrateur</h3>
        <p>L'ajout et la modification des chants, membres et événements sont réservés aux comptes administrateurs, protégés par mot de passe.</p>
    </div>
    <button data-action="accueil">Retour à l'accueil</button>`;

    if (push) history.pushState({ view: "mentions" }, "", "#mentions");
}

// ---------------------------------------------------------------------
// UTILITAIRES D'INTERFACE (toasts, confirmation, titre d'onglet, debounce)
// ---------------------------------------------------------------------

// Notification discrète en bas de l'écran, remplace les changements d'état
// silencieux : confirme visuellement qu'une action admin a bien abouti.
function afficherToast(message, type = "succes") {
    let conteneur = document.getElementById("zone-toasts");
    if (!conteneur) {
        conteneur = document.createElement("div");
        conteneur.id = "zone-toasts";
        conteneur.setAttribute("aria-live", "polite");
        document.body.appendChild(conteneur);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    conteneur.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("visible"));
    setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => toast.remove(), 250);
    }, 3200);
}

// Remplace window.confirm() par une popup stylée, cohérente avec le reste de
// l'app. Retourne une promesse résolue à true (confirmé) ou false (annulé).
function confirmerAction(message, libelleConfirmer = "Confirmer") {
    return new Promise(resolve => {
        const fond = document.createElement("div");
        fond.className = "modale-confirmation-fond";
        fond.innerHTML = `
            <div class="modale-confirmation" role="alertdialog" aria-modal="true" aria-describedby="texte-modale-confirmation">
                <p id="texte-modale-confirmation">${echapperHTML(message)}</p>
                <div class="modale-confirmation-actions">
                    <button type="button" class="btn-petit btn-annuler-modale">Annuler</button>
                    <button type="button" class="btn-danger btn-petit btn-confirmer-modale">${echapperHTML(libelleConfirmer)}</button>
                </div>
            </div>`;
        document.body.appendChild(fond);
        document.body.classList.add("modale-ouverte");

        const boutonConfirmer = fond.querySelector(".btn-confirmer-modale");
        const boutonAnnuler = fond.querySelector(".btn-annuler-modale");
        boutonConfirmer.focus();

        function fermer(resultat) {
            document.removeEventListener("keydown", surEchap);
            document.body.classList.remove("modale-ouverte");
            fond.remove();
            resolve(resultat);
        }
        function surEchap(e) {
            if (e.key === "Escape") fermer(false);
        }

        fond.addEventListener("click", (e) => { if (e.target === fond) fermer(false); });
        boutonAnnuler.addEventListener("click", () => fermer(false));
        boutonConfirmer.addEventListener("click", () => fermer(true));
        document.addEventListener("keydown", surEchap);
    });
}

// Met à jour le titre d'onglet du navigateur selon la page affichée : plus
// lisible dans l'historique/les favoris, et meilleur pour le partage.
function definirTitre(suffixe) {
    document.title = suffixe ? `${suffixe} — Lyrics Feo Iray` : "Lyrics Feo Iray Gospel";
}

// Attend que l'utilisateur arrête de taper avant d'exécuter la fonction
// (évite de refiltrer la liste à chaque frappe pendant la recherche).
function debounce(fonction, delaiMs = 300) {
    let temporisateur;
    return (...args) => {
        clearTimeout(temporisateur);
        temporisateur = setTimeout(() => fonction(...args), delaiMs);
    };
}

// ---------------------------------------------------------------------
// ACCUEIL
// ---------------------------------------------------------------------

function afficherAccueil(push = true) {
    definirTitre("");
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

function rendreListeChants(filtre = "", champRecherche = "tout") {
    const filtreNormalise = normaliserTexte(filtre);

    const chantsFiltres = !filtreNormalise ? chants : chants.filter(chant => {
        const titre = normaliserTexte(chant.titre);
        const auteurCompositeur = normaliserTexte(`${chant.auteur || ""} ${chant.compositeur || ""}`);
        const paroles = normaliserTexte(retirerAccords(chant.paroles));

        if (champRecherche === "titre") return titre.includes(filtreNormalise);
        if (champRecherche === "auteur") return auteurCompositeur.includes(filtreNormalise);
        if (champRecherche === "paroles") return paroles.includes(filtreNormalise);
        return titre.includes(filtreNormalise) || auteurCompositeur.includes(filtreNormalise) || paroles.includes(filtreNormalise);
    });

    if (chantsFiltres.length === 0) {
        return `<p class="aucun-resultat">Aucun chant ne correspond à ta recherche.</p>`;
    }

    return chantsFiltres.map(chant => `
        <div class="chant">
            <h3>${echapperHTML(chant.titre)} ${estConnecte() ? `<span class="badge-vues" title="Nombre de vues">${chant.vues || 0} vue${(chant.vues || 0) > 1 ? "s" : ""}</span>` : ""}</h3>
            <div class="actions-chant">
                <button data-action="chant" data-id="${chant.id}">Lire les paroles</button>
                ${estConnecte() ? `
                    <button class="btn-admin btn-petit" data-action="form-chant" data-id="${chant.id}">Modifier</button>
                    <button class="btn-danger btn-petit" data-action="supprimer-chant" data-id="${chant.id}">Supprimer</button>
                ` : ""}
            </div>
        </div>`).join("");
}

// ---------- Blocs de paroles (couplet / refrain / bridge) ----------
// Les paroles sont stockées en base comme un simple texte (colonne "paroles"),
// mais structuré avec des balises de section du type "[Couplet]", "[Refrain]"
// ou "[Bridge]" en début de ligne. Cela évite toute migration de la base de
// données tout en permettant un éditeur par blocs côté admin et un affichage
// stylé par type de section côté lecture.

const TYPES_BLOC_PAROLES = ["Couplet", "Refrain", "Bridge"];

// Échappement HTML complet (contenu ET attributs) : protège contre l'injection
// de balises via un titre, un nom, une description... saisis par un admin ou
// mal formatés. À utiliser systématiquement autour de tout texte venant de la
// base de données avant de l'insérer dans innerHTML.
function echapperHTML(texte) {
    return String(texte ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// ---------- Accords (au-dessus des paroles) ----------
// Un accord est stocké directement dans le texte d'un bloc, juste avant la
// lettre/le mot où il doit apparaître, sous la forme "[NomAccord]" (ex :
// "Voa[C]hy ny [G]fiadanana"). Comme un accord est toujours à l'intérieur
// d'une ligne (jamais seul sur sa propre ligne), il ne peut pas être confondu
// avec une balise de section ("[Couplet]", "[Refrain]", "[Bridge]"), qui elle
// occupe toujours une ligne entière.

// Retire uniquement les balises d'accords d'un texte (utilisé pour la
// recherche dans les paroles, où les noms d'accords ne doivent pas polluer
// les résultats).
function retirerAccords(texte) {
    return String(texte || "").replace(/\[([^\[\]]+)\]/g, "");
}

// Découpe une ligne en segments { chord, texte } : chaque segment porte le
// nom de l'accord qui le précède (ou null s'il n'y en a pas). C'est cette
// segmentation — plutôt qu'un calcul de position en nombre de caractères —
// qui permet d'afficher chaque accord juste au-dessus de son mot sans créer
// de grands blancs artificiels quand les accords sont espacés.
function segmenterLigneAccords(ligne) {
    const regex = /\[([^\[\]]+)\]/g;
    const marqueurs = [];
    let correspondance;

    while ((correspondance = regex.exec(ligne)) !== null) {
        marqueurs.push({ index: correspondance.index, longueur: correspondance[0].length, nom: correspondance[1].trim() });
    }

    if (marqueurs.length === 0) {
        return [{ chord: null, texte: ligne }];
    }

    const segments = [];
    if (marqueurs[0].index > 0) {
        segments.push({ chord: null, texte: ligne.slice(0, marqueurs[0].index) });
    }
    marqueurs.forEach((marqueur, i) => {
        const debutTexte = marqueur.index + marqueur.longueur;
        const finTexte = i + 1 < marqueurs.length ? marqueurs[i + 1].index : ligne.length;
        segments.push({ chord: marqueur.nom, texte: ligne.slice(debutTexte, finTexte) });
    });

    return segments;
}

// Construit le HTML d'une ligne avec ses accords positionnés juste au-dessus
// du fragment de texte auquel ils s'appliquent (et non plus par comptage de
// caractères, qui produisait de grands espaces vides).
function rendreLigneAvecAccordsHTML(ligne) {
    const segments = segmenterLigneAccords(ligne);
    const aDesAccords = segments.some(s => s.chord);

    if (!aDesAccords) {
        return echapperHTML(ligne) || "&nbsp;";
    }

    return segments.map(segment => {
        const texte = echapperHTML(segment.texte) || "\u00A0";
        const nomAccord = segment.chord ? `<span class="nom-accord">${echapperHTML(segment.chord)}</span>` : "";
        return `<span class="segment-accord">${nomAccord}<span class="segment-parole">${texte}</span></span>`;
    }).join("");
}

// Transforme le texte brut stocké en base en tableau de blocs { type, contenu }.
function parserParoles(texte) {
    const brut = String(texte || "").replace(/\r\n/g, "\n").trim();
    if (!brut) return [];

    const regexBalise = /^\[(Couplet|Refrain|Bridge)\]\s*$/i;
    const lignes = brut.split("\n");

    // Si aucune balise n'est présente (anciens chants enregistrés avant cette
    // fonctionnalité), on traite tout le texte comme un unique couplet afin
    // de ne rien perdre et de rester rétro-compatible.
    if (!lignes.some(l => regexBalise.test(l.trim()))) {
        return [{ type: "Couplet", contenu: brut }];
    }

    const blocs = [];
    let blocCourant = null;

    lignes.forEach(ligne => {
        const correspondance = ligne.trim().match(regexBalise);
        if (correspondance) {
            if (blocCourant) blocs.push(blocCourant);
            const type = TYPES_BLOC_PAROLES.find(t => t.toLowerCase() === correspondance[1].toLowerCase());
            blocCourant = { type, contenu: "" };
        } else if (blocCourant) {
            blocCourant.contenu += (blocCourant.contenu ? "\n" : "") + ligne;
        }
        // les lignes avant la toute première balise (rares) sont ignorées
    });
    if (blocCourant) blocs.push(blocCourant);

    return blocs
        .map(b => ({ type: b.type, contenu: b.contenu.trim() }))
        .filter(b => b.contenu);
}

// Reconstruit le texte à stocker en base à partir du tableau de blocs.
function serialiserBlocsParoles(blocs) {
    return blocs
        .filter(b => b.contenu && b.contenu.trim())
        .map(b => `[${b.type}]\n${b.contenu.trim()}`)
        .join("\n\n");
}

// Construit le HTML affiché sur la page de lecture d'un chant, avec un style
// distinct par type de section. Les couplets sont numérotés automatiquement
// selon leur ordre d'apparition. Si "avecAccords" est vrai, chaque ligne
// contenant au moins un accord est découpée en fragments, chaque accord
// s'affichant juste au-dessus du fragment de texte qui le suit — sans
// créer d'espace inutile entre deux accords éloignés sur la même ligne.
function rendreParolesHTML(texte, avecAccords = false) {
    const blocs = parserParoles(texte);
    if (blocs.length === 0) return "";

    let compteurCouplet = 0;

    return blocs.map(bloc => {
        let classe = "couplet";
        let etiquette = bloc.type;

        if (bloc.type === "Couplet") {
            compteurCouplet++;
            classe = "couplet";
            etiquette = `Couplet ${compteurCouplet}`;
        } else if (bloc.type === "Refrain") {
            classe = "refrain";
            etiquette = "Refrain";
        } else if (bloc.type === "Bridge") {
            classe = "bridge";
            etiquette = "Bridge";
        }

        const lignes = bloc.contenu.split("\n");
        let contenuHTML;

        if (avecAccords) {
            contenuHTML = lignes.map(ligne => {
                const contenuLigne = rendreLigneAvecAccordsHTML(ligne);
                const aDesAccords = segmenterLigneAccords(ligne).some(s => s.chord);
                return `<div class="ligne-parole${aDesAccords ? " ligne-avec-accord" : ""}">${contenuLigne}</div>`;
            }).join("");
        } else {
            contenuHTML = lignes
                .map(ligne => echapperHTML(retirerAccords(ligne)))
                .join("<br>");
        }

        return `
        <div class="section-parole ${classe}">
            <span class="etiquette-section">${etiquette}</span>
            <div class="contenu-section${avecAccords ? " avec-accords" : ""}">${contenuHTML}</div>
        </div>`;
    }).join("");
}

function afficherParoles(push = true) {
    definirTitre("Paroles");
    let contenu = `
        <h2>Liste des chants</h2>
        <div class="mini-loader"><span></span><span></span><span></span></div>
        <div class="zone-recherche">
            <input type="search" id="recherche-chants" class="barre-recherche" placeholder="Rechercher un chant...">
            <select id="champ-recherche" class="select-recherche">
                <option value="tout">Tout</option>
                <option value="titre">Titre</option>
                <option value="auteur">Auteur / Compositeur</option>
                <option value="paroles">Paroles</option>
            </select>
        </div>
    `;

    if (estConnecte()) {
        contenu += `<button class="btn-admin" data-action="form-chant">+ Ajouter un chant</button>`;
    }

    contenu += `<div id="liste-chants">${rendreListeChants()}</div>`;
    contenu += `<button data-action="accueil">Retour à l'accueil</button>`;
    main.innerHTML = contenu;

    const champRecherche = document.getElementById("recherche-chants");
    const selectChamp = document.getElementById("champ-recherche");

    function rafraichirListe() {
        document.getElementById("liste-chants").innerHTML = rendreListeChants(champRecherche.value, selectChamp.value);
    }

    champRecherche.addEventListener("input", debounce(rafraichirListe, 300));
    selectChamp.addEventListener("change", rafraichirListe);

    if (push) history.pushState({ view: "paroles" }, "", "#paroles");
}

function afficherChant(id, push = true) {
    const chant = chants.find(c => c.id === id);
    if (!chant) { afficherParoles(push); return; }

    definirTitre(chant.titre);
    const vuesAvant = chant.vues || 0;
    chant.vues = vuesAvant + 1;
    incrementerVues(id, vuesAvant); // mise à jour en base, en arrière-plan

    // Un bouton "Afficher les accords" est toujours proposé ; il n'a d'effet
    // visuel que si des accords ont été renseignés dans les paroles. L'état
    // repart à "masqué" à chaque ouverture de chant.
    let accordsVisibles = false;

    main.innerHTML = `
    <section class="page-chant">
        <h2>${echapperHTML(chant.titre)}</h2>
        <div class="mini-loader"><span></span><span></span><span></span></div>
        ${estConnecte() ? `<p class="compteur-vues">${chant.vues} vue${chant.vues > 1 ? "s" : ""}</p>` : ""}
        <p><strong>Auteur :</strong> ${echapperHTML(chant.auteur || "")}</p>
        <p><strong>Compositeur :</strong> ${echapperHTML(chant.compositeur || "")}</p>
        <p><strong>Tonalité :</strong> ${echapperHTML(chant.tonalite || "")}</p>
        ${chant.audio ? `
            <div class="lecteur-audio-conteneur">
                <audio controls preload="none" class="lecteur-audio" src="${echapperHTML(chant.audio)}"></audio>
            </div>
        ` : ""}
        <div class="barre-outils-paroles">
            <button type="button" id="toggle-accords" class="btn-petit btn-toggle-accords">Afficher les accords</button>
        </div>
        <div class="paroles" id="zone-paroles">${rendreParolesHTML(chant.paroles, accordsVisibles)}</div>
        ${estConnecte() ? `
            <div class="actions-chant" style="justify-content:center;">
                <button class="btn-admin btn-petit" data-action="form-chant" data-id="${chant.id}">Modifier</button>
                <button class="btn-danger btn-petit" data-action="supprimer-chant" data-id="${chant.id}">Supprimer</button>
            </div>
        ` : ""}
        <button data-action="paroles">Retour aux paroles</button>
    </section>`;

    const boutonAccords = document.getElementById("toggle-accords");
    boutonAccords.addEventListener("click", () => {
        accordsVisibles = !accordsVisibles;
        boutonAccords.textContent = accordsVisibles ? "Masquer les accords" : "Afficher les accords";
        boutonAccords.classList.toggle("actif", accordsVisibles);
        document.getElementById("zone-paroles").innerHTML = rendreParolesHTML(chant.paroles, accordsVisibles);
    });

    if (push) history.pushState({ view: "chant", id }, "", "#chant-" + id);
}

function afficherFormulaireChant(id, push = true) {
    const chant = id ? chants.find(c => c.id === id) : null;
    definirTitre(chant ? "Modifier un chant" : "Ajouter un chant");

    // État local de l'éditeur par blocs : tableau de { type, contenu }.
    // Pré-rempli à partir des paroles existantes (ou un couplet vide par défaut).
    let blocsParoles = chant ? parserParoles(chant.paroles) : [];
    if (blocsParoles.length === 0) blocsParoles = [{ type: "Couplet", contenu: "" }];

    let indexBlocGlisse = null; // index du bloc en cours de glisser-déposer

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
        <label>Fichier audio ${chant && chant.audio ? "(laisser vide pour garder l'audio actuel)" : "(optionnel)"}
            <input type="file" name="audio" accept="audio/*">
        </label>
        ${chant && chant.audio ? `
            <div class="apercu-actuel apercu-audio">
                <audio controls preload="none" src="${echapperHTML(chant.audio)}"></audio>
                <label class="case-retirer-audio">
                    <input type="checkbox" name="supprimer_audio">
                    Retirer l'audio actuel
                </label>
            </div>
        ` : ""}
        <div class="champ-paroles">
            <span class="libelle-paroles">Paroles</span>
            <p class="aide-champ">Glisse-dépose les blocs pour réordonner les sections. Pour ajouter un accord, place le curseur dans le texte à l'endroit voulu, indique son nom, puis clique sur "Insérer".</p>
            <div id="blocs-paroles"></div>
            <div class="actions-blocs">
                <button type="button" class="btn-petit btn-ajouter-bloc" data-type="Couplet">+ Couplet</button>
                <button type="button" class="btn-petit btn-ajouter-bloc" data-type="Refrain">+ Refrain</button>
                <button type="button" class="btn-petit btn-ajouter-bloc" data-type="Bridge">+ Bridge</button>
            </div>
        </div>
        <p class="erreur-form" id="erreur-form-chant"></p>
        <button type="submit" class="btn-admin">${chant ? "Enregistrer" : "Ajouter"}</button>
        <button type="button" data-action="paroles">Annuler</button>
    </form>`;

    const conteneurBlocs = document.getElementById("blocs-paroles");

    function rendreBlocsParoles() {
        conteneurBlocs.innerHTML = blocsParoles.map((bloc, index) => `
            <div class="bloc-parole" data-index="${index}" draggable="true">
                <div class="bloc-parole-entete">
                    <span class="poignee-glisser" title="Glisser pour réordonner" aria-hidden="true">⠿</span>
                    <span class="bloc-parole-type bloc-type-${bloc.type.toLowerCase()}">${bloc.type}</span>
                    ${blocsParoles.length > 1 ? `
                        <button type="button" class="retirer-bloc" data-index="${index}" aria-label="Retirer ce bloc" title="Retirer ce bloc">×</button>
                    ` : ""}
                </div>
                <textarea class="bloc-parole-texte" data-index="${index}" rows="4" placeholder="Écris le texte du ${bloc.type.toLowerCase()} ici...">${echapperHTML(bloc.contenu)}</textarea>
                <div class="bloc-accords-outil">
                    <input type="text" class="champ-nom-accord" data-index="${index}" placeholder="Nom de l'accord (ex : C, G7, Am)">
                    <button type="button" class="btn-petit btn-inserer-accord" data-index="${index}">Insérer au curseur</button>
                </div>
            </div>
        `).join("");

        conteneurBlocs.querySelectorAll(".bloc-parole-texte").forEach(champ => {
            champ.addEventListener("input", (e) => {
                blocsParoles[Number(e.target.dataset.index)].contenu = e.target.value;
            });
        });

        conteneurBlocs.querySelectorAll(".retirer-bloc").forEach(bouton => {
            bouton.addEventListener("click", (e) => {
                blocsParoles.splice(Number(e.target.dataset.index), 1);
                rendreBlocsParoles();
            });
        });

        conteneurBlocs.querySelectorAll(".btn-inserer-accord").forEach(bouton => {
            bouton.addEventListener("click", (e) => {
                const index = Number(e.target.dataset.index);
                const zoneTexte = conteneurBlocs.querySelector(`.bloc-parole-texte[data-index="${index}"]`);
                const champNom = conteneurBlocs.querySelector(`.champ-nom-accord[data-index="${index}"]`);
                const nomAccord = champNom.value.trim();

                if (!nomAccord) { champNom.focus(); return; }

                const debut = zoneTexte.selectionStart ?? zoneTexte.value.length;
                const fin = zoneTexte.selectionEnd ?? zoneTexte.value.length;
                const balise = `[${nomAccord}]`;
                const nouvelleValeur = zoneTexte.value.slice(0, debut) + balise + zoneTexte.value.slice(fin);

                zoneTexte.value = nouvelleValeur;
                blocsParoles[index].contenu = nouvelleValeur;
                champNom.value = "";
                zoneTexte.focus();
                const nouvellePosition = debut + balise.length;
                zoneTexte.selectionStart = zoneTexte.selectionEnd = nouvellePosition;
            });
        });

        // ---- Glisser-déposer pour réordonner les blocs ----
        conteneurBlocs.querySelectorAll(".bloc-parole").forEach(el => {
            el.addEventListener("dragstart", () => {
                indexBlocGlisse = Number(el.dataset.index);
                el.classList.add("en-glissement");
            });
            el.addEventListener("dragend", () => {
                el.classList.remove("en-glissement");
            });
            el.addEventListener("dragover", (e) => {
                e.preventDefault();
                el.classList.add("survol-glissement");
            });
            el.addEventListener("dragleave", () => {
                el.classList.remove("survol-glissement");
            });
            el.addEventListener("drop", (e) => {
                e.preventDefault();
                el.classList.remove("survol-glissement");
                const indexCible = Number(el.dataset.index);
                if (indexBlocGlisse === null || indexBlocGlisse === indexCible) return;
                const [blocDeplace] = blocsParoles.splice(indexBlocGlisse, 1);
                blocsParoles.splice(indexCible, 0, blocDeplace);
                indexBlocGlisse = null;
                rendreBlocsParoles();
            });
        });
    }

    rendreBlocsParoles();

    document.querySelectorAll(".btn-ajouter-bloc").forEach(bouton => {
        bouton.addEventListener("click", () => {
            blocsParoles.push({ type: bouton.dataset.type, contenu: "" });
            rendreBlocsParoles();
            // on amène l'utilisateur directement au dernier bloc ajouté
            const derniereTextarea = conteneurBlocs.querySelector(".bloc-parole:last-child .bloc-parole-texte");
            if (derniereTextarea) derniereTextarea.focus();
        });
    });

    document.getElementById("form-chant").addEventListener("submit", async (e) => {
        e.preventDefault();
        const zoneErreur = document.getElementById("erreur-form-chant");
        zoneErreur.textContent = "";
        const boutonSubmit = e.target.querySelector("button[type=submit]");
        const fd = new FormData(e.target);
        const paroles = serialiserBlocsParoles(blocsParoles);

        const valeurs = {
            titre: fd.get("titre").trim(),
            auteur: fd.get("auteur").trim(),
            compositeur: fd.get("compositeur").trim(),
            tonalite: fd.get("tonalite").trim(),
            paroles
        };

        if (!valeurs.titre) {
            zoneErreur.textContent = "Le titre ne peut pas être vide.";
            return;
        }
        if (!paroles) {
            zoneErreur.textContent = "Les paroles ne peuvent pas être vides : remplis au moins un bloc.";
            return;
        }

        const fichierAudio = fd.get("audio");
        if (fichierAudio && fichierAudio.size > 0) {
            if (!fichierAudio.type.startsWith("audio/")) {
                zoneErreur.textContent = "Le fichier audio doit être un fichier son (mp3, wav, m4a...).";
                return;
            }
            if (fichierAudio.size > 20 * 1024 * 1024) {
                zoneErreur.textContent = "Le fichier audio dépasse 20 Mo, choisis un fichier plus léger.";
                return;
            }
        }

        boutonSubmit.disabled = true;
        boutonSubmit.textContent = "Envoi en cours...";
        try {
            if (fichierAudio && fichierAudio.size > 0) {
                valeurs.audio = await uploaderFichier(fichierAudio, "audio");
            } else if (fd.get("supprimer_audio")) {
                valeurs.audio = null;
            }

            if (chant) {
                await modifierChant(chant.id, valeurs);
            } else {
                await ajouterChant(valeurs);
            }
            await actualiserDonnees();
            afficherParoles();
            afficherToast(chant ? "Chant mis à jour." : "Chant ajouté.");
        } catch (err) {
            document.getElementById("erreur-form-chant").textContent = "Erreur : " + err.message;
            boutonSubmit.disabled = false;
            boutonSubmit.textContent = chant ? "Enregistrer" : "Ajouter";
        }
    });

    if (push) history.pushState({ view: "form-chant", id }, "", "#form-chant");
}

async function gererSuppressionChant(id) {
    const confirme = await confirmerAction("Supprimer définitivement ce chant ?", "Supprimer");
    if (!confirme) return;
    await supprimerChant(id);
    await actualiserDonnees();
    afficherParoles();
    afficherToast("Chant supprimé.");
}

// ---------------------------------------------------------------------
// GALERIE (MEMBRES)
// ---------------------------------------------------------------------

function afficherGalerie(push = true) {
    definirTitre("Galerie");
    let contenu = `<h2>Galerie</h2><div class="mini-loader"><span></span><span></span><span></span></div>`;

    if (estConnecte()) {
        contenu += `<button class="btn-admin" data-action="form-membre">+ Ajouter un membre</button>`;
    }

    contenu += `<div class="galerie">`;

    membres.forEach((membre, index) => {
        contenu += `
        <div class="membre">
            <div class="photo-wrapper">
                <img class="photo-principale" src="${membre.photo || "images/default.png"}" alt="${echapperHTML(membre.nom)}" loading="lazy" onerror="this.onerror=null; this.src='images/default.png';">
                ${membre.photo2 ? `<img class="photo-secondaire" src="${membre.photo2}" alt="${echapperHTML(membre.nom)}" loading="lazy">` : ''}
            </div>
            <p>${echapperHTML(membre.nom)}</p>
            ${membre.voix && membre.voix.length > 0 ? `
                <div class="badges-voix">
                    ${membre.voix.map(v => `<span class="badge-voix">${v === "Tenor" ? "Ténor" : echapperHTML(v)}</span>`).join("")}
                </div>
            ` : ""}
            <button class="toggle-description" data-index="${index}" aria-label="Afficher la description de ${echapperHTML(membre.nom)}" aria-expanded="false">▾</button>
            <div class="description-membre" id="description-${index}">
                <div class="description-inner">
                    <p>${echapperHTML(membre.description || "").replace(/\n/g, "<br>")}</p>
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

async function afficherFormulaireMembre(id, push = true) {
    const membre = id ? membres.find(m => m.id === id) : null;
    definirTitre(membre ? "Modifier un membre" : "Ajouter un membre");

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
        <label>Rôle précis (ex : Trésorier, Chef de chœur, Ex-secrétaire...)
            <input type="text" name="role" value="${membre ? echapper(membre.role || "") : ""}">
        </label>
        <label>Hiérarchie
            <select name="niveau">
                <option value="1" ${membre && membre.niveau === 1 ? "selected" : ""}>Fondateur</option>
                <option value="2" ${membre && membre.niveau === 2 ? "selected" : ""}>Bureau</option>
                <option value="3" ${!membre || membre.niveau === 3 || !membre.niveau ? "selected" : ""}>Membre</option>
            </select>
        </label>
        <fieldset class="cases-voix">
            <legend>Voix / instrument (plusieurs choix possibles)</legend>
            ${["Soprano", "Alto", "Tenor", "Musicien"].map(v => `
                <label class="case-voix">
                    <input type="checkbox" name="voix" value="${v}" ${membre && membre.voix && membre.voix.includes(v) ? "checked" : ""}>
                    ${v === "Tenor" ? "Ténor" : v}
                </label>
            `).join("")}
        </fieldset>
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
                voix: fd.getAll("voix")
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
            afficherToast(membre ? "Membre mis à jour." : "Membre ajouté.");
        } catch (err) {
            document.getElementById("erreur-form-membre").textContent = "Erreur : " + err.message;
            boutonSubmit.disabled = false;
            boutonSubmit.textContent = membre ? "Enregistrer" : "Ajouter";
        }
    });

    if (push) history.pushState({ view: "form-membre", id }, "", "#form-membre");
}

async function gererSuppressionMembre(id) {
    const confirme = await confirmerAction("Supprimer définitivement ce membre ?", "Supprimer");
    if (!confirme) return;
    await supprimerMembre(id);
    await actualiserDonnees();
    afficherGalerie();
    afficherToast("Membre supprimé.");
}

// ---------------------------------------------------------------------
// EVENEMENTS
// ---------------------------------------------------------------------

function genererCarrouselPhotos(e) {
    const photos = e.photos && e.photos.length > 0 ? e.photos : [];
    if (photos.length === 0) return '';

    const imgTag = (src) =>
        `<img src="${src}" alt="${echapperHTML(e.titre)}" loading="lazy" onerror="this.onerror=null; this.src='images/default.png';">`;

    if (photos.length === 1) {
        return `<div class="scroll-photos scroll-photos-fixe">${imgTag(photos[0])}</div>`;
    }

    const suite = photos.map(imgTag).join('') + photos.map(imgTag).join('');
    return `<div class="scroll-photos"><div class="scroll-track">${suite}</div></div>`;
}

function afficherEvenements(push = true) {
    definirTitre("Événements");
    const passes = evenements.filter(e => e.statut === "passe");
    const futurs = evenements.filter(e => e.statut === "futur");

    let contenu = `<h2>Événements</h2><div class="mini-loader"><span></span><span></span><span></span></div>`;

    if (estConnecte()) {
        contenu += `<button class="btn-admin" data-action="form-evenement">+ Ajouter un événement</button>`;
    }

    const rendreBloc = (e, estProchain = false) => `
        <div class="evenement ${estProchain ? "evenement-prochain" : ""}">
            ${estProchain ? `<span class="badge-prochain">Prochain événement</span>` : ""}
            ${genererCarrouselPhotos(e)}
            <h4>${echapperHTML(e.titre)}</h4>
            <p class="date-evenement">${echapperHTML(e.date_evenement || "")}</p>
            <p>${echapperHTML(e.description || "").replace(/\n/g, "<br>")}</p>
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
    definirTitre(evenement ? "Modifier un événement" : "Ajouter un événement");
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
            afficherToast(evenement ? "Événement mis à jour." : "Événement ajouté.");
        } catch (err) {
            document.getElementById("erreur-form-evenement").textContent = "Erreur : " + err.message;
            boutonSubmit.disabled = false;
            boutonSubmit.textContent = evenement ? "Enregistrer" : "Ajouter";
        }
    });

    if (push) history.pushState({ view: "form-evenement", id }, "", "#form-evenement");
}

async function gererSuppressionEvenement(id) {
    const confirme = await confirmerAction("Supprimer définitivement cet événement ?", "Supprimer");
    if (!confirme) return;
    await supprimerEvenement(id);
    await actualiserDonnees();
    afficherEvenements();
    afficherToast("Événement supprimé.");
}

// ---------------------------------------------------------------------
// HIERARCHIE ET ROLES
// ---------------------------------------------------------------------

function carteMembre(membre) {
    return `
    <div class="carte-hierarchie">
        <img src="${membre.photo || "images/default.png"}" alt="${echapperHTML(membre.nom)}" loading="lazy" onerror="this.onerror=null; this.src='images/default.png';">
        <p class="nom-hierarchie">${echapperHTML(membre.nom)}</p>
        <p class="role-hierarchie">${echapperHTML(membre.role || "")}</p>
    </div>`;
}

function afficherHierarchie(push = true) {
    definirTitre("Hiérarchie et rôles");
    // ---- Section 1 : hiérarchie (une personne = un seul niveau) ----
    const fondateurs = membres.filter(m => m.niveau === 1);
    const bureau = membres.filter(m => m.niveau === 2);
    const membresSimples = membres.filter(m => m.niveau === 3 || !m.niveau);

    let contenu = `<h2>Hiérarchie et rôles</h2><div class="mini-loader"><span></span><span></span><span></span></div>`;

    if (membres.length === 0) {
        contenu += `<p class="aucun-resultat">Aucun membre enregistré pour le moment.</p>`;
        main.innerHTML = contenu;
        if (push) history.pushState({ view: "hierarchie" }, "", "#hierarchie");
        return;
    }

    contenu += `<h3 class="sous-titre-evenement">Hiérarchie</h3>`;

    if (fondateurs.length > 0) {
        contenu += `
        <p class="etiquette-niveau">Fondateurs</p>
        <div class="niveau-hierarchie niveau-direction">
            ${fondateurs.map(carteMembre).join("")}
        </div>`;
    }
    if (bureau.length > 0) {
        contenu += `
        <p class="etiquette-niveau">Bureau</p>
        <div class="niveau-hierarchie niveau-chef">
            ${bureau.map(carteMembre).join("")}
        </div>`;
    }
    if (membresSimples.length > 0) {
        contenu += `<p class="etiquette-niveau">Membres</p>`;

        const ordreVoix = ["Soprano", "Alto", "Tenor", "Musicien"];
        const voixPresentes = ordreVoix.filter(v => membresSimples.some(m => m.voix && m.voix.includes(v)));
        const sansVoix = membresSimples.filter(m => !m.voix || m.voix.length === 0);

        contenu += `<div class="pupitres-hierarchie">`;

        voixPresentes.forEach(voix => {
            const membresVoix = membresSimples.filter(m => m.voix && m.voix.includes(voix));
            contenu += `
            <div class="colonne-pupitre">
                <h3>${voix === "Tenor" ? "Ténor" : voix}</h3>
                <div class="niveau-hierarchie niveau-choristes">
                    ${membresVoix.map(carteMembre).join("")}
                </div>
            </div>`;
        });

        if (sansVoix.length > 0) {
            contenu += `
            <div class="colonne-pupitre">
                <h3>Non classé</h3>
                <div class="niveau-hierarchie niveau-choristes">
                    ${sansVoix.map(carteMembre).join("")}
                </div>
            </div>`;
        }

        contenu += `</div>`;
    }

    if (estConnecte()) {
        contenu += `<p class="astuce-admin">Pour modifier les rôles, niveaux et voix/instruments, va dans Galerie → Modifier un membre.</p>`;
    }

    contenu += `<button data-action="accueil">Retour à l'accueil</button>`;
    main.innerHTML = contenu;
    if (push) history.pushState({ view: "hierarchie" }, "", "#hierarchie");
}

// ---------------------------------------------------------------------
// CONNEXION ADMIN
// ---------------------------------------------------------------------

function afficherConnexion(push = true) {
    definirTitre("Connexion");
    main.innerHTML = `
    <h2>Connexion</h2>
    <form id="form-connexion" class="form-admin">
        <label>Email
            <input type="email" name="email" required>
        </label>
        <label>Mot de passe
            <span class="champ-mdp">
                <input type="password" name="motdepasse" id="champ-motdepasse" required>
                <button type="button" id="toggle-mdp" class="btn-toggle-mdp" aria-label="Afficher le mot de passe">Afficher</button>
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
        bouton.textContent = visible ? "Afficher" : "Masquer";
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

// Alias conservé pour compatibilité : utilisé dans les attributs value="...".
// L'échappement complet (voir echapperHTML plus haut) couvre aussi bien les
// attributs que le contenu texte, donc plus besoin de deux logiques distinctes.
function echapper(texte) {
    return echapperHTML(texte);
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
    } else if (hash === "mentions") {
        afficherMentionsLegales(false);
        history.replaceState({ view: "mentions" }, "", "#mentions");
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
    } else if (state.view === "mentions") {
        afficherMentionsLegales(false);
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

    if (btn && btn.classList.contains("toggle-description")) {
        const index = btn.dataset.index;
        const descDiv = document.getElementById(`description-${index}`);
        const estOuvert = descDiv.classList.toggle("ouvert");
        btn.textContent = estOuvert ? "▴" : "▾";
        btn.setAttribute("aria-expanded", String(estOuvert));
        if (estOuvert) {
            // hauteur calculée dynamiquement pour s'adapter à n'importe
            // quelle longueur de description (plus de limite fixe)
            descDiv.style.maxHeight = descDiv.scrollHeight + "px";
        } else {
            descDiv.style.maxHeight = "";
        }
        return;
    }

    const elementAction = e.target.closest("[data-action]");
    if (!elementAction) return;
    if (elementAction.tagName === "A") e.preventDefault();

    const action = elementAction.dataset.action;
    const id = elementAction.dataset.id ? Number(elementAction.dataset.id) : null;

    if (action === "chant") afficherChant(id);
    else if (action === "paroles") afficherParoles();
    else if (action === "accueil") afficherAccueil();
    else if (action === "galerie") afficherGalerie();
    else if (action === "evenements") afficherEvenements();
    else if (action === "hierarchie") afficherHierarchie();
    else if (action === "mentions") afficherMentionsLegales();
    else if (action === "form-chant") afficherFormulaireChant(id);
    else if (action === "supprimer-chant") gererSuppressionChant(id);
    else if (action === "form-membre") afficherFormulaireMembre(id);
    else if (action === "supprimer-membre") gererSuppressionMembre(id);
    else if (action === "form-evenement") afficherFormulaireEvenement(id);
    else if (action === "supprimer-evenement") gererSuppressionEvenement(id);
});

// ---------------------------------------------------------------------
// HORS LIGNE
// ---------------------------------------------------------------------

const offlineOverlay = document.getElementById("offline-overlay");
const offlineRetryBtn = document.getElementById("offline-retry");
const offlineFermerBtn = document.getElementById("offline-fermer");

function afficherOverlayHorsLigne() {
    if (offlineOverlay) offlineOverlay.classList.add("visible");
}

function masquerOverlayHorsLigne() {
    if (offlineOverlay) offlineOverlay.classList.remove("visible");
}

async function tenterReconnexion() {
    if (offlineRetryBtn) {
        offlineRetryBtn.disabled = true;
        offlineRetryBtn.textContent = "Vérification...";
    }
    await actualiserDonnees(); // masque/affiche l'overlay selon le résultat
    if (!offlineOverlay.classList.contains("visible")) {
        // la reconnexion a réussi : on rafraîchit la vue actuelle avec les données à jour
        initDepuisHash();
    }
    if (offlineRetryBtn) {
        offlineRetryBtn.disabled = false;
        offlineRetryBtn.textContent = "Réessayer";
    }
}

window.addEventListener("offline", afficherOverlayHorsLigne);
// Le fait d'avoir un réseau ("online") ne garantit pas que Supabase répond ;
// on relance donc un vrai chargement plutôt que de juste cacher l'overlay.
window.addEventListener("online", tenterReconnexion);
if (offlineRetryBtn) offlineRetryBtn.addEventListener("click", tenterReconnexion);
// Le bandeau est informatif : on peut le fermer et continuer à utiliser le
// site normalement avec les données déjà en cache.
if (offlineFermerBtn) offlineFermerBtn.addEventListener("click", masquerOverlayHorsLigne);
if (!navigator.onLine) afficherOverlayHorsLigne();

// ---------------------------------------------------------------------
// MODE SOMBRE
// ---------------------------------------------------------------------
// Préférence mémorisée localement (par appareil, pas en base) : chaque
// visiteur garde son propre choix.
function initModeSombre() {
    const bouton = document.getElementById("toggle-mode-sombre");
    if (!bouton) return;

    const actif = localStorage.getItem("mode-sombre") === "1";
    appliquerModeSombre(actif, bouton);

    bouton.addEventListener("click", () => {
        const nouvelEtat = !document.documentElement.classList.contains("mode-sombre");
        appliquerModeSombre(nouvelEtat, bouton);
        localStorage.setItem("mode-sombre", nouvelEtat ? "1" : "0");
    });
}

function appliquerModeSombre(actif, bouton) {
    document.documentElement.classList.toggle("mode-sombre", actif);
    bouton.classList.toggle("actif", actif);
    bouton.setAttribute("aria-checked", String(actif));
}

// ---------------------------------------------------------------------
// DEMARRAGE
// ---------------------------------------------------------------------

async function demarrer() {
    initModeSombre();
    // Les boutons d'accueil sont déjà dans le HTML de départ et n'ont besoin
    // d'aucune donnée pour fonctionner : on ne les remplace par un spinner
    // que si on arrive directement sur une page qui, elle, a besoin des
    // données chargées (lien profond, rechargement sur #paroles, etc.).
    const hashInitial = location.hash.replace("#", "");
    const vuesSansDonnees = ["", "accueil", "mentions", "connexion"];
    if (!vuesSansDonnees.includes(hashInitial)) {
        main.innerHTML = `
            <div class="chargement">
                <div class="spinner"></div>
                <p>Chargement...</p>
            </div>`;
    }
    await initAuth();
    await actualiserDonnees();
    onChangementConnexion();
    initDepuisHash();
}

demarrer();
