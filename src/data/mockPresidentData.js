// src/data/mockPresidentData.js
// ============================================================
//  Données mockées — FRONTEND UNIQUEMENT (prototype).
//
//  Ce fichier alimente le nouvel espace Président ainsi que les
//  pages Admin "Présidents" et "Demandes de coopératives". Aucune
//  de ces données ne provient d'un backend : tout est simulé côté
//  React (voir PresidentContext.js pour la logique mutable).
//
//  ⚠️ Les numéros de téléphone / emails sont explicitement des
//  données de démonstration, jamais présentées comme réelles.
// ============================================================

export const MOCK_COOPERATIVES = [
  {
    id: "coop-1",
    nom: "Transport XYZ",
    initiales: "TX",
    president: "Jean Dupont",
    presidentId: "demo-president",
    telephone: "034 00 111 22 (démo)",
    email: "contact@transport-xyz.demo",
    adresse: "Gare routière Fasan'ny Karana, Antananarivo",
    description:
      "Coopérative historique reliant la capitale aux grandes villes du pays, connue pour la ponctualité de ses départs.",
    statut: "active",
    dateCreation: "2024-02-10",
  },
  {
    id: "coop-2",
    nom: "Transport ABC",
    initiales: "TA",
    president: "Paul Rakoto",
    presidentId: "pres-2",
    telephone: "032 00 222 33 (démo)",
    email: "contact@transport-abc.demo",
    adresse: "Gare routière Ampasapito, Antananarivo",
    description: "Spécialiste des liaisons vers le sud de Madagascar, flotte récente et climatisée.",
    statut: "active",
    dateCreation: "2024-06-22",
  },
  {
    id: "coop-3",
    nom: "Transport MADA",
    initiales: "TM",
    president: "Marie Randria",
    presidentId: "pres-3",
    telephone: "033 00 333 44 (démo)",
    email: "contact@transport-mada.demo",
    adresse: "Gare routière Anosibe, Antananarivo",
    description: "Coopérative en forte croissance, dessert principalement l'est et le nord du pays.",
    statut: "active",
    dateCreation: "2025-01-15",
  },
];

// ── Comptes Présidents (mock, un par coopérative) ───────────
export const MOCK_PRESIDENTS = [
  {
    id: "demo-president",
    nom: "Dupont",
    prenom: "Jean",
    email: "president@demo.com",
    telephone: "034 00 111 22 (démo)",
    cooperativeId: "coop-1",
    cooperativeNom: "Transport XYZ",
    statut: "actif",
    dateCreation: "2024-02-10",
  },
  {
    id: "pres-2",
    nom: "Rakoto",
    prenom: "Paul",
    email: "paul.rakoto@transport-abc.demo",
    telephone: "032 00 222 33 (démo)",
    cooperativeId: "coop-2",
    cooperativeNom: "Transport ABC",
    statut: "actif",
    dateCreation: "2024-06-22",
  },
  {
    id: "pres-3",
    nom: "Randria",
    prenom: "Marie",
    email: "marie.randria@transport-mada.demo",
    telephone: "033 00 333 44 (démo)",
    cooperativeId: "coop-3",
    cooperativeNom: "Transport MADA",
    statut: "actif",
    dateCreation: "2025-01-15",
  },
];

// ── Demandes de création de coopérative (Admin) ─────────────
export const MOCK_REQUESTS = [
  {
    id: "req-1",
    candidat: "Herimanana Solofo",
    telephone: "033 12 345 67 (démo)",
    email: "herimanana.solofo@example.demo",
    cooperative: "Transport Est",
    adresse: "Toamasina",
    message: "Souhaite créer une coopérative desservant la côte est, flotte de 4 véhicules disponible.",
    date: "2026-07-28",
    statut: "PENDING",
  },
  {
    id: "req-2",
    candidat: "Voahangy Rasoanaivo",
    telephone: "034 98 765 43 (démo)",
    email: "voahangy.r@example.demo",
    cooperative: "Transport Ouest Express",
    adresse: "Mahajanga",
    message: "Expérience de 8 ans dans le transport interurbain, dossier complet fourni.",
    date: "2026-07-22",
    statut: "PENDING",
  },
  {
    id: "req-3",
    candidat: "Fanomezantsoa Andria",
    telephone: "032 55 667 78 (démo)",
    email: "fano.andria@example.demo",
    cooperative: "Coopérative du Sud",
    adresse: "Fianarantsoa",
    message: "Demande soutenue par 3 chauffeurs déjà en activité.",
    date: "2026-07-10",
    statut: "APPROVED",
  },
  {
    id: "req-4",
    candidat: "Njato Rabemananjara",
    telephone: "033 44 556 60 (démo)",
    email: "njato.r@example.demo",
    cooperative: "Rapid Transport",
    adresse: "Antsirabe",
    message: "Dossier incomplet — informations sur les véhicules manquantes.",
    date: "2026-06-30",
    statut: "REJECTED",
  },
];

// ── Voyages par coopérative ──────────────────────────────────
export const MOCK_TRAVELS_BY_COOP = {
  "coop-1": [
    { id: "trv-1", depart: "Antananarivo", arrivee: "Antsirabe",   date: "2026-08-05", heure: "07:00", vehicule: "Sprinter 18",  places: 18, prix: 22000, statut: "actif" },
    { id: "trv-2", depart: "Antananarivo", arrivee: "Toamasina",   date: "2026-08-06", heure: "06:30", vehicule: "Sprinter 18",  places: 18, prix: 25000, statut: "actif" },
    { id: "trv-3", depart: "Toamasina",    arrivee: "Antananarivo",date: "2026-08-07", heure: "13:00", vehicule: "Minibus 26",   places: 26, prix: 25000, statut: "complet" },
  ],
  "coop-2": [
    { id: "trv-4", depart: "Antananarivo", arrivee: "Fianarantsoa",date: "2026-08-05", heure: "08:15", vehicule: "Sprinter 18",  places: 18, prix: 32000, statut: "actif" },
    { id: "trv-5", depart: "Antananarivo", arrivee: "Toliara",     date: "2026-08-09", heure: "05:00", vehicule: "Minibus 26",   places: 26, prix: 48000, statut: "actif" },
  ],
  "coop-3": [
    { id: "trv-6", depart: "Antananarivo", arrivee: "Antsiranana", date: "2026-08-10", heure: "14:00", vehicule: "Minibus 26",  places: 26, prix: 55000, statut: "actif" },
    { id: "trv-7", depart: "Antananarivo", arrivee: "Mahajanga",   date: "2026-08-11", heure: "09:00", vehicule: "Sprinter 18",  places: 18, prix: 38000, statut: "annulé" },
  ],
};

// ── Réservations par coopérative (liées aux voyages ci-dessus) ─
export const MOCK_RESERVATIONS_BY_COOP = {
  "coop-1": [
    { id: "res-1", voyageId: "trv-1", voyageur: "Rakoto Jean",     telephone: "034 11 111 11 (démo)", siege: 4,  montant: 22000, statut: "Payé" },
    { id: "res-2", voyageId: "trv-1", voyageur: "Rasoa Lala",      telephone: "032 22 222 22 (démo)", siege: 5,  montant: 22000, statut: "En attente" },
    { id: "res-3", voyageId: "trv-2", voyageur: "Andriamihaja Tiana", telephone: "033 33 333 33 (démo)", siege: 2, montant: 25000, statut: "Payé" },
    { id: "res-4", voyageId: "trv-3", voyageur: "Rabe Solo",       telephone: "034 44 444 44 (démo)", siege: 12, montant: 25000, statut: "Payé" },
  ],
  "coop-2": [
    { id: "res-5", voyageId: "trv-4", voyageur: "Ravao Nirina",    telephone: "032 55 555 55 (démo)", siege: 7,  montant: 32000, statut: "Payé" },
  ],
  "coop-3": [
    { id: "res-6", voyageId: "trv-6", voyageur: "Randria Faly",    telephone: "033 66 666 66 (démo)", siege: 9,  montant: 55000, statut: "En attente" },
  ],
};

// ── Paiements par coopérative (dérivés des réservations "Payé") ─
export const MOCK_PAYMENTS_BY_COOP = {
  "coop-1": [
    { id: "pay-1", reservationId: "res-1", voyageur: "Rakoto Jean",        montant: 22000, mode: "Mvola",        statut: "Réussi", date: "2026-07-30" },
    { id: "pay-2", reservationId: "res-3", voyageur: "Andriamihaja Tiana", montant: 25000, mode: "Orange Money", statut: "Réussi", date: "2026-07-29" },
    { id: "pay-3", reservationId: "res-4", voyageur: "Rabe Solo",          montant: 25000, mode: "Airtel Money", statut: "Réussi", date: "2026-07-27" },
    { id: "pay-4", reservationId: "res-2", voyageur: "Rasoa Lala",         montant: 22000, mode: "Mvola",        statut: "En attente", date: "2026-07-31" },
  ],
  "coop-2": [
    { id: "pay-5", reservationId: "res-5", voyageur: "Ravao Nirina", montant: 32000, mode: "Mvola", statut: "Réussi", date: "2026-07-28" },
  ],
  "coop-3": [
    { id: "pay-6", reservationId: "res-6", voyageur: "Randria Faly", montant: 55000, mode: "Orange Money", statut: "En attente", date: "2026-08-01" },
  ],
};

// ── Activité récente (dashboard Président) ───────────────────
export const MOCK_ACTIVITY_BY_COOP = {
  "coop-1": [
    { id: "act-1", texte: "Nouvelle réservation — Antananarivo → Antsirabe", date: "Il y a 2 h" },
    { id: "act-2", texte: "Paiement reçu — 25 000 Ar", date: "Il y a 5 h" },
    { id: "act-3", texte: "Voyage créé — Antananarivo → Toamasina", date: "Hier" },
    { id: "act-4", texte: "Réservation confirmée — Siège 12", date: "Hier" },
  ],
  "coop-2": [
    { id: "act-5", texte: "Nouvelle réservation — Antananarivo → Fianarantsoa", date: "Il y a 3 h" },
    { id: "act-6", texte: "Paiement reçu — 32 000 Ar", date: "Hier" },
  ],
  "coop-3": [
    { id: "act-7", texte: "Réservation en attente — Antananarivo → Antsiranana", date: "Il y a 1 h" },
  ],
};

/** Retourne les voyageurs uniques d'une coopérative à partir des réservations. */
export function getTravelersForCoop(coopId) {
  const reservations = MOCK_RESERVATIONS_BY_COOP[coopId] || [];
  const travels = MOCK_TRAVELS_BY_COOP[coopId] || [];
  return reservations.map((r) => {
    const trip = travels.find((t) => t.id === r.voyageId);
    return {
      id: r.id,
      nom: r.voyageur,
      telephone: r.telephone,
      voyage: trip ? `${trip.depart} → ${trip.arrivee}` : "—",
      date: trip?.date || "—",
      siege: r.siege,
      statut: r.statut,
    };
  });
}

/** Recherche les coordonnées d'une coopérative par nom (utilisé pour "Contacter la coopérative"). */
export function findCooperativeContact(nameOrId) {
  if (!nameOrId) return null;
  const needle = String(nameOrId).toLowerCase();
  return (
    MOCK_COOPERATIVES.find(
      (c) => c.id.toLowerCase() === needle || c.nom.toLowerCase() === needle
    ) || null
  );
}
