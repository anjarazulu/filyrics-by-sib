// Gestion de l'authentification (connexion réservée à l'administrateur du site).

let utilisateurConnecte = null;

async function initAuth() {
    const { data } = await sb.auth.getSession();
    utilisateurConnecte = data.session ? data.session.user : null;

    sb.auth.onAuthStateChange((event, session) => {
        utilisateurConnecte = session ? session.user : null;
        if (typeof onChangementConnexion === "function") {
            onChangementConnexion();
        }
    });
}

function estConnecte() {
    return utilisateurConnecte !== null;
}

async function seConnecter(email, motDePasse) {
    const { data, error } = await sb.auth.signInWithPassword({
        email: email,
        password: motDePasse
    });
    if (error) {
        return { succes: false, message: "Email ou mot de passe incorrect." };
    }
    utilisateurConnecte = data.user;
    return { succes: true };
}

async function seDeconnecter() {
    await sb.auth.signOut();
    utilisateurConnecte = null;
}
