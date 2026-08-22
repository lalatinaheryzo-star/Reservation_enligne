// src/data/demoAccounts.js
// ============================================================
//  Comptes de démonstration — FRONTEND UNIQUEMENT.
//
//  Ces identifiants permettent de visualiser le prototype sans
//  backend actif. Ils NE remplacent PAS l'authentification réelle
//  (src/api/services.js / JWT serveur) : lorsqu'un backend est
//  disponible, la connexion normale (email/mot de passe réel)
//  continue de fonctionner exactement comme avant.
//
//  ⚠️ Real authorization and access control must be implemented
//  server-side. This demo login is a frontend convenience only
//  and must never be treated as real security.
// ============================================================

export const DEMO_ACCOUNTS = [
  {
    role: "admin",
    email: "admin@demo.com",
    password: "admin123",
    nom: "Réservation en ligne",
    prenom: "Admin",
  },
  {
    role: "president",
    email: "president@demo.com",
    password: "president123",
    nom: "Dupont",
    prenom: "Jean",
    cooperative_id: "coop-1",
  },
  {
    role: "voyageur",
    email: "voyageur@demo.com",
    password: "voyageur123",
    nom: "Rakoto",
    prenom: "Nirina",
    telephone: "+261 34 11 111 11",
  },
];

/**
 * Tente une connexion de démonstration (100% locale, sans réseau).
 * Retourne un objet utilisateur si les identifiants correspondent
 * à un compte démo du rôle attendu, sinon `null`.
 */
export function tryDemoLogin(email, password, expectedRole) {
  const normalized = (email || "").trim().toLowerCase();
  const account = DEMO_ACCOUNTS.find(
    (a) => a.role === expectedRole && a.email === normalized && a.password === password
  );
  if (!account) return null;

  return {
    id: `demo-${account.role}`,
    id_utilisateur: `demo-${account.role}`,
    nom: account.nom,
    prenom: account.prenom,
    email: account.email,
    telephone: account.telephone || "",
    role: account.role,
    cooperative_id: account.cooperative_id || null,
    demo: true,
  };
}
