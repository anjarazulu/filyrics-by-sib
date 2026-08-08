const main = document.querySelector("main");
const accueilHTML = main.innerHTML;

const membres = [
    { nom: "Manantenasoa Anjaraniaina", photo: "images/anjara.jpeg", photo2: "images/nosy.jpg", description: "Anjara no anarako. Zava-kanto nitaiza ahy sy nihazona ahy tamin'ny fotoana sarotra ny mozika, tena ankafiziko izany. Tiako ihany koa ny mizara tsikitsiky amin'ny manodidina ahy, tsy dia be resaka aho kanefa be hadalana toy ny zazakely." },
    { nom: "Arson Nicolas", photo: "images/nicolas.jpg", description: "" },
    { nom: "Daniel Ryan", photo: "images/ryan.jpg", description: "" },
    { nom: "Fifaliana Antsa", photo: "images/antsa.jpg", description: "" },
    { nom: "Fy Mickaëlah", photo: "images/fy.jpg", description: "" },
    { nom: "Nomenasoa Sariakaniaina", photo: "images/sariaka.jpg", description: "" },
    { nom: "Notahiantsoa Miaro", photo: "images/miaro.jpg", description: "" },
    { nom: "Faly Haingotiana", photo: "images/haingo.jpg", description: "" },
    { nom: "Soafaniry Lyanah", photo: "images/lyanah.jpg", description: "" },
    { nom: "Liantsoa Rufin", photo: "images/rufin.jpg", description: "" },
    { nom: "Miora Francia", photo: "images/francia.jpg", description: "" },
    { nom: "Miora Patricia", photo: "images/patricia.jpg", description: "" },
    { nom: "Anaura Kassimo", photo: "images/kassimo.jpg", description: "" },
    { nom: "Ornella Mitantsoa", photo: "images/mitantsoa.jpeg", description: "" },
    { nom: "Joeson Rodiah", photo: "images/rodiah.jpg", description: "" },
    { nom: "Vanintsoa Niaro", photo: "images/niaro.jpg", description: "" },
    { nom: "Feno Fitahiana", photo: "images/fitahiana.jpg", description: "" },
    { nom: "Mbolatiana Kantosoa", photo: "images/kanto.jpg", description: "" },
    { nom: "Tsarovaniaina Sariaka", photo: "images/psariaka.jpg", description: "" },
    { nom: "Tsarovaniaina Sarindra", photo: "images/sarindra.jpg", description: "" },
    { nom: "Lovasoa Annah", photo: "images/annah.jpg", description: "" },
    { nom: "Danielle Shania", photo: "images/shania.jpg", description: "" },
];

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

history.replaceState({ view: "accueil" }, "", "#accueil");

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
    }
});
        
