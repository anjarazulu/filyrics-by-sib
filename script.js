const main = document.querySelector("main");
const accueilHTML = main.innerHTML;

const chants = [
    {
        id: 1,
        titre: "Hazavan'ny aliko",
        auteur: "Arson Nicolas",
        compositeur: "Manoa",
        paroles: `Ianao ilay hazavan'ny aliko
Izay miposaka indray ho ahy
Ianao ilay manazava ny amiko rehetra
Ao am-poko Ianao no mitoetra

Na aiza na aiza na aiza misy ahy
Izaho tsy hanahy, fantatro fa
Ianao hanzava ahy
Na haizina mikitroka io
Na koa halaelo, fantatro fa
Izaho tsy handeha irery

F'Ianao ilay hazavana
Hazavana (x4)`
    },
    {
        id: 2,
        titre: "Kasiho",
        auteur: "Arson Nicolas",
        compositeur: "Arson Nicolas",
        paroles: `Ny sitrakao Tompo ô, no aoka hatao
Ny lalanao no hizorako
Ny herinao no mampahery ahy
Jesosy ô mila anao ny fiainako

Raiso indray aho Jesoa, fihino an-tratranao
Fa mahery sy osa, eny kanosa tsy mahafoy Anao
Ny anilanao irery ihany no hany hasambarako
Jesosy ô, Jesosy ô kasiho ny foko`
    },
    {
        id: 3,
        titre: "Ny Ray",
        auteur: "Arson Nicolas",
        compositeur: "Arson Nicolas",
        paroles: `Avelako any ireo sakana ho ahy
Ary tsy avelako hanakana ahy izao rehetra izao
Hadinoiko avokoa satria efa nofafany
Ireo ota vitako hatrizay
Ny eo anilany izao no hokasaiko

Ka na inona na inona hiseho efa fantatro fa
Manana Ray Mpiaro aho
Miahy sy mitahy, ka izaho tsy hanahy
Ny fitiavany no mampahery ahy

Izao rehetra izao zava-poana ho ahy
Mora foana, voafafan'ny fotoana
Tsy ohatra Anao, Ray
Izay momba Anao, toa lasa momba ahy
Tsy ilaiko porofo ny fisianao satria
Efa fantatro fa eo anilako eo...`
    },
    {
        id: 4,
        titre: "Magnana Azy",
        auteur: "Arson Nicolas",
        compositeur: "Arson Nicolas",
        paroles: `Tompo mahery ny Andriamanitro eh
'lay Nahary izao rehetra izao, mitahy ahy sy ianao
Ireo olako kely jamais jamais, tsy hampiondrika ahy
Magnana Azy toujours mande

Koa magnana Azy eh, toujours mande
Koa magnana Azy eh, tsy maintsy courage eh eh
Koa Magnana Azy eh, tsy misy mihemotra oh
Koa Magnana Azy eh, mijoro ake

Ny ety an-tany mihoatra Azy tsy misy raha pare
Magnana Azy eh, toujours mafy eh
Ireo fahavalo manenjika, tsy hampiontsona eh
Magnana Azy eh toujours mafy eh.

Koa magnana Azy eh, toujours mande
Koa magnana Azy eh, tsy maintsy courage eh eh
Koa Magnana Azy eh, tsy misy mihemotra oh
Koa Magnana Azy eh, mijoro ake

Izaho hoy aho (tsy ho kivy) x3
Magnana Anao miahy ahy isan'andro oh
Izaho hoy aho (tsy ho very) x3
Fa misy Anao tsy mamela ahy i

Koa magnana Azy eh, toujours mande
Koa magnana Azy eh, tsy maintsy courage eh eh
Koa Magnana Azy eh, tsy misy mihemotra oh
Koa Magnana Azy eh, mijoro ake fô ou oh
rery`
    },
    {
        id: 5,
        titre: "Avo Indrindra",
        auteur: "Arson Nicolas & Antsa Fifaliana",
        compositeur: "Antsa Fifaliana",
        paroles: `Hidera Anao amin'ny foko rehetra aho
Hanambara ireo zava-mahagaga nataonao
Ny foko ent-nin'kafaliana
No hanandratako hira fitoriana ny Anaranao Masina
Ry Avo Indrindra ô

Mendrika Anao avokoa (ny haja, voninahitra)
Ianao Ray Tsitoha (ry Mpanjakan'ny lanitra)
Ny fahasoavanao no nahatonga ahy ho olom-baovao
Ny fitiavanao tokoa (no nahatoy izao ahy)
Ray Mpamindra fo (Tompo miahy)
Masina Ianao, ry Avo indrindra ô

Androany aho hihira ho Anao
Noho ny soa rehetra izay efa vitanao
Atolotray ho Anao ry Ray ny antsa avy ao am-po
Ho Anao tokoa, ry Avo indrindra ô`
    },
    {
        id: 6,
        titre: "Mahery aho",
        auteur: "Arson Nicolas",
        compositeur: "Arson Nicolas",
        paroles: `Ekeko hoe mafy ny ady, fantatro hoe izaho mila mafy
Ilay haka aina anie satry fa io anie tsy hoe ny ahy irery
Ka tsy asiana tomany, ny aty anie efa ohatr'izany
Fahoriana, fijaliana, dia izay ihany no miverina eo
Ny ataoko am-po hoe « ny Raiko mafy »
Ny herim-panahy no ataoko ho fitafy

Ataoko an-tsaina hoe ady io
Mihatra aman'aina fa tsy asiana taraina satria
Izaho anie tsy hoe miady irery
Ka ataoko an-tsaina hoe mitsangana rehefa mianjera
Ataoko am-po foana hoe izaho tsy ho rery
Ny ao ambony ao mijery ka fantatro
Fa izaho tsy ho very
Fanilon'ny tongotro sy hazavan'ny lalako

Mahery aho manana Anao, mahery aho Tompo ô`
    },
    {
        id: 7,
        titre: "Fantatro",
        auteur: "Arson Nicolas",
        compositeur: "Arson Nicolas",
        paroles: `Asehoy ahy izay mbola tsy hitako
Hazavao ireo izay tsy takatro
Lazao ahy Izay mbola tsy fantatro
Ahafantarako Anao misimisy be be kokoa

Fa mangetaheta Anao izao tontolo izao
Asehoy azy fa eo miasa sy mijery Ianao
Fa mangetaheta Anao, ny fanahiko Tompo ô
Miasà, mitoera ato am-poko Ianao Jesoa

Fantatro izay inoako, dia matoky Azy aho
(Matoky An-dRay) x2 Matoky Azy aho
Fantatro izay lazaiko, fa avy amin'ny teninao
(Ny teninao) x2 Manazava ny lalako

Ny fitiavanao no aoko ho hery ho ahy
Ny teninao, no fiadian'ny fanahy
Izao rehetra izao aoka ahalala ny herinao
Ilay mbola mihazona ahy hatrizao

Oh ! oh ! Fantatro izay inoako
Oh ! oh ! Fantatro ilay Mpamonjy ahy`
    },
    {
        id: 8,
        titre: "Hidera Anao",
        auteur: "Arson Nicolas",
        compositeur: "Arson Nicolas",
        paroles: `Hidera Anao izaho Tompo Malalako ô
Hankalaza ny Anaranao Raiko tia zah (ah ! ah ! eh !)
Ny midera Anao Raiko roh hasambarako eh
Hankalaza ny Anaranao Andriamanitra

Fa ny midera Anao roh (Mahasambatsambatse)
Ny midera Anao oh (Magnome hafaliagna eh)
Ka na aiza na aiza (No mety hisy 'zao)
Dia hidera Anao oh (Tompo Ray Masina)

Hidera Anao 'zaho Tompo ô, isan'andro isan'andro
Na maraina na atoandro 'zaho hidera Anao
Hankalaza Anao 'zaho ô, isan'andro isan'andro
Na maraina na atoandro hankalaza Anao

'zaho, 'zaho, 'zaho, hankalaza Anao
'zaho, 'zaho, 'zaho, 'zaho hidera Anao

Ka hihira aho hanandratra feo mahery
Hiderako anao zegny x2
Ka hihira aho hanandratra Anao
Tompo andriamanitro eh x2`
    },
];

const membres = [
    { nom: "Manantenasoa Anjaraniaina (Nosy)", photo: "images/anjara.jpeg" },
    { nom: "Arson Nicolas", photo: "images/nicolas.jpg" }
];

function afficherAccueil() {
    main.innerHTML = accueilHTML;
}

function afficherParoles() {
    let contenu = "<h2>📖 Liste des chants</h2>";

    chants.forEach(chant => {
        contenu += `
        <div class="chant">
            <h3>${chant.titre}</h3>
            <button data-action="chant" data-id="${chant.id}">Lire les paroles</button>
        </div>`;
    });

    contenu += `<button data-action="accueil">🏠 Retour à l'accueil</button>`;
    main.innerHTML = contenu;
}

function afficherChant(id) {
    const chant = chants.find(c => c.id === id);

    main.innerHTML = `
    <section class="page-chant">
        <h2>${chant.titre}</h2>
        <p><strong>Auteur :</strong> ${chant.auteur}</p>
        <p><strong>Compositeur :</strong> ${chant.compositeur}</p>
        <p class="paroles">${chant.paroles}</p>
        <button data-action="paroles">↩ Retour aux paroles</button>
    </section>`;
}

function afficherGalerie() {
    let contenu = `<h2>🖼 Galerie</h2><div class="galerie">`;

    membres.forEach(membre => {
        contenu += `
        <div class="membre">
            <img src="${membre.photo}" alt="${membre.nom}">
            <p>${membre.nom}</p>
        </div>`;
    });

    contenu += `</div><button data-action="accueil">🏠 Retour à l'accueil</button>`;
    main.innerHTML = contenu;
}

document.addEventListener("click", function(e) {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.dataset.action === "chant") {
        afficherChant(Number(btn.dataset.id));
    } else if (btn.dataset.action === "paroles") {
        afficherParoles();
    } else if (btn.dataset.action === "accueil") {
        afficherAccueil();
    } else if (btn.textContent.includes("📖")) {
        afficherParoles();
    } else if (btn.textContent.includes("🖼")) {
        afficherGalerie();
    }
});
