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
        
