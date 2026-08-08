const main = document.querySelector("main");
const accueilHTML = main.innerHTML;

function afficherAccueil(push = true) {
    main.innerHTML = accueilHTML;
    if (push) history.pushState({ view: "accueil" }, "", "#accueil");
}

function afficherParoles(push = true) {
    let contenu = "<h2>Liste des chants</h2>";

    chants.forEach(chant => {
        contenu += `
        <div class="chant">
            <h3>${chant.titre}</h3>
            <button data-action="chant" data-id="${chant.id}">Lire les paroles</button>
        </div>`;
    });

    contenu += `<button data-action="accueil">Retour à l'accueil</button>`;
    main.innerHTML = contenu;
    if (push) history.pushState({ view: "paroles" }, "", "#paroles");
}

function afficherChant(id, push = true) {
    const chant = chants.find(c => c.id === id);

    main.innerHTML = `
    <section class="page-chant">
        <h2>${chant.titre}</h2>
        <p><strong>Auteur :</strong> ${chant.auteur}</p>
        <p><strong>Compositeur :</strong> ${chant.compositeur}</p>
        <p><strong>Tonalité :</strong> ${chant.tonalite}</p>
        <p class="paroles">${chant.paroles}</p>
        <button data-action="paroles">Retour aux paroles</button>
    </section>`;
    if (push) history.pushState({ view: "chant", id }, "", "#chant-" + id);
}

function afficherGalerie(push = true) {
    let contenu = `<h2>Galerie</h2><div class="galerie">`;

    membres.forEach((membre, index) => {
        contenu += `
        <div class="membre">
            <div class="photo-wrapper">
                <img class="photo-principale" src="${membre.photo}" alt="${membre.nom}" onerror="this.onerror=null; this.src='images/default.png';">
                ${membre.photo2 ? `<img class="photo-secondaire" src="${membre.photo2}" alt="${membre.nom}">` : ''}
            </div>
            <p>${membre.nom}</p>
            <button class="toggle-description" data-index="${index}">▾</button>
            <div class="description-membre" id="description-${index}" hidden>
                <p>${membre.description}</p>
            </div>
        </div>`;
    });

    contenu += `</div><button data-action="accueil">Retour à l'accueil</button>`;
    main.innerHTML = contenu;
    if (push) history.pushState({ view: "galerie" }, "", "#galerie");
}

// Construit le HTML du carrousel de photos qui défile en boucle pour un événement.
// Accepte soit e.photos (tableau), soit l'ancien format e.photo (une seule image).
function genererCarrouselPhotos(e) {
    const photos = e.photos && e.photos.length > 0 ? e.photos : (e.photo ? [e.photo] : []);
    if (photos.length === 0) return '';

    const imgTag = (src) =>
        `<img src="${src}" alt="${e.titre}" onerror="this.onerror=null; this.src='images/default.png';">`;

    // Une seule photo : pas besoin de défilement, on l'affiche simplement
    if (photos.length === 1) {
        return `<div class="scroll-photos scroll-photos-fixe">${imgTag(photos[0])}</div>`;
    }

    // Plusieurs photos : la liste est dupliquée pour un défilement sans coupure
    const suite = photos.map(imgTag).join('') + photos.map(imgTag).join('');
    return `<div class="scroll-photos"><div class="scroll-track">${suite}</div></div>`;
}

function afficherEvenements(push = true) {
    const passes = evenements.filter(e => e.statut === "passe");
    const futurs = evenements.filter(e => e.statut === "futur");

    let contenu = `<h2>Événements</h2>`;

    if (futurs.length > 0) {
        contenu += `<h3 class="sous-titre-evenement">À venir</h3><div class="liste-evenements">`;
        futurs.forEach(e => {
            contenu += `
            <div class="evenement">
                ${genererCarrouselPhotos(e)}
                <h4>${e.titre}</h4>
                <p class="date-evenement">${e.date}</p>
                <p>${e.description}</p>
            </div>`;
        });
        contenu += `</div>`;
    }

    if (passes.length > 0) {
        contenu += `<h3 class="sous-titre-evenement">Passés</h3><div class="liste-evenements">`;
        passes.forEach(e => {
            contenu += `
            <div class="evenement">
                ${genererCarrouselPhotos(e)}
                <h4>${e.titre}</h4>
                <p class="date-evenement">${e.date}</p>
                <p>${e.description}</p>
            </div>`;
        });
        contenu += `</div>`;
    }

    contenu += `<button data-action="accueil">Retour à l'accueil</button>`;
    main.innerHTML = contenu;
    if (push) history.pushState({ view: "evenements" }, "", "#evenements");
}

// Affiche la bonne vue selon le hash présent dans l'URL au chargement
// (au lieu de toujours revenir à l'accueil quand on actualise la page)
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

    // Aucun hash reconnu (ou vide) : on reste sur l'accueil déjà affiché
    history.replaceState({ view: "accueil" }, "", "#accueil");
}

initDepuisHash();

// Gère le bouton retour physique / navigateur
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
    }
});

document.addEventListener("click", function (e) {
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

    if (btn.dataset.action === "chant") {
        afficherChant(Number(btn.dataset.id));
    } else if (btn.dataset.action === "paroles") {
        afficherParoles();
    } else if (btn.dataset.action === "accueil") {
        afficherAccueil();
    } else if (texte.includes("parole")) {
        afficherParoles();
    } else if (texte.includes("galerie")) {
        afficherGalerie();
    } else if (texte.includes("événement")) {
        afficherEvenements();
    }
});
