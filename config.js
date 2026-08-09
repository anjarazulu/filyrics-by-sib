// Configuration de la connexion à Supabase.
// L'URL et la clé "publishable" sont conçues pour être visibles publiquement
// dans le code d'un site (elles ne donnent aucun accès en écriture tant que
// personne n'est connecté, grâce aux règles de sécurité (RLS) configurées
// dans Supabase).

const SUPABASE_URL = "https://ivgelvrbrvetqjbpypwz.supabase.co";
const SUPABASE_KEY = "sb_publishable_0ym1XOZtDQVDKO7D2iKP5g_YOP0htX-";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
