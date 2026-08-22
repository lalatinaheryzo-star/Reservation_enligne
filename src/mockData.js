export const stamp = (value) => ({ toDate: () => new Date(value) });

export const mockUsers = [
  { id: "u1", nom: "Rakoto",    prenom: "Nirina", email: "nirina@voyage.mg", telephone: "+261 34 11 111 11", mot_de_passe: "demo123" },
  { id: "u2", nom: "Rasoa",     prenom: "Lala",   email: "lala@voyage.mg",   telephone: "+261 32 22 222 22", mot_de_passe: "demo123" },
  { id: "u3", nom: "Andriami",  prenom: "Tiana",  email: "tiana@voyage.mg",  telephone: "+261 33 33 333 33", mot_de_passe: "demo123" },
];

export const mockCooperatives = [
  { id: "c1", nom: "Coop Fivoy",    adresse: "Antananarivo", telephone: "+261 34 10 000 01" },
  { id: "c2", nom: "Voyages Sud",   adresse: "Fianarantsoa", telephone: "+261 34 20 000 02" },
  { id: "c3", nom: "Express Nord",  adresse: "Toamasina",    telephone: "+261 34 30 000 03" },
];

export const mockVoyages = [
  { id: "v1", ville_depart: "Antananarivo", ville_arrivee: "Toamasina",    date_depart: "2026-06-12", heure_depart: "06:30", prix: 25000, statut: "actif",   cooperative_id: "c1", vehicule_nom: "Sprinter", capacite: 18, places_disponibles: 15, places_total: 18 },
  { id: "v2", ville_depart: "Antananarivo", ville_arrivee: "Fianarantsoa", date_depart: "2026-06-14", heure_depart: "08:15", prix: 32000, statut: "actif",   cooperative_id: "c2", vehicule_nom: "Sprinter", capacite: 18, places_disponibles: 16, places_total: 18 },
  { id: "v3", ville_depart: "Toamasina",    ville_arrivee: "Antsiranana",  date_depart: "2026-06-18", heure_depart: "13:45", prix: 42000, statut: "complet", cooperative_id: "c3", vehicule_nom: "Minibus 26", capacite: 26, places_disponibles: 0,  places_total: 26 },
];

export const mockPlaces = [
  { id: "p1", voyageId: "v1", numero_place: 1, statut: "disponible" },
  { id: "p2", voyageId: "v1", numero_place: 2, statut: "disponible" },
  { id: "p3", voyageId: "v1", numero_place: 3, statut: "reservee" },
  { id: "p4", voyageId: "v2", numero_place: 1, statut: "disponible" },
  { id: "p5", voyageId: "v2", numero_place: 2, statut: "reservee" },
  { id: "p6", voyageId: "v3", numero_place: 1, statut: "reservee" },
];

export const mockReservations = [
  { id: "r1", utilisateur_id: "u1", voyage_id: "v1", numero_place: 1, statut: "En attente", date_reservation: stamp("2026-06-08T09:00:00"), client: "Nirina Rakoto",   ville_depart: "Antananarivo", ville_arrivee: "Toamasina",    prix: 25000 },
  { id: "r2", utilisateur_id: "u2", voyage_id: "v2", numero_place: 2, statut: "Validée",    date_reservation: stamp("2026-06-07T14:30:00"), client: "Lala Rasoa",     ville_depart: "Antananarivo", ville_arrivee: "Fianarantsoa", prix: 32000 },
  { id: "r3", utilisateur_id: "u3", voyage_id: "v3", numero_place: 1, statut: "En attente", date_reservation: stamp("2026-06-09T11:15:00"), client: "Tiana Andriami", ville_depart: "Toamasina",    ville_arrivee: "Antsiranana",  prix: 42000 },
  { id: "r4", utilisateur_id: "u2", voyage_id: "v1", numero_place: 3, statut: "Refusée",    date_reservation: stamp("2026-06-05T10:05:00"), client: "Lala Rasoa",     ville_depart: "Antananarivo", ville_arrivee: "Toamasina",    prix: 25000 },
  { id: "r5", utilisateur_id: "u1", voyage_id: "v2", numero_place: 1, statut: "Annulée",    date_reservation: stamp("2026-06-04T16:40:00"), client: "Nirina Rakoto",   ville_depart: "Antananarivo", ville_arrivee: "Fianarantsoa", prix: 32000 },
];

export const mockPaiements = [
  { id: "pay1", reservationId: "r1", montant: 25000, mode_paiement: "Mvola",        statut: "Réussi",     date_paiement: stamp("2026-06-08T10:10:00") },
  { id: "pay2", reservationId: "r2", montant: 32000, mode_paiement: "Orange Money", statut: "Réussi",     date_paiement: stamp("2026-06-07T15:10:00") },
  { id: "pay3", reservationId: "r3", montant: 42000, mode_paiement: "Airtel Money", statut: "En attente", date_paiement: stamp("2026-06-09T12:00:00") },
];

export const mockRecus = [
  { id: "rec1", paiementId: "pay1", numero_recu: "REC-1001", date_generation: stamp("2026-06-08T10:20:00") },
  { id: "rec2", paiementId: "pay2", numero_recu: "REC-1002", date_generation: stamp("2026-06-07T15:20:00") },
];

export const mockNotifications = [
  { id: "n1", type: "SMS",      message: "Votre réservation r1 est en attente de validation.", statut: "Envoyé", date_envoi: stamp("2026-06-09T08:00:00") },
  { id: "n2", type: "WhatsApp", message: "Votre trajet vers Fianarantsoa est confirmé.",        statut: "Envoyé", date_envoi: stamp("2026-06-08T18:30:00") },
];

export const mockDashboardStats = {
  totalVoyages: mockVoyages.length,
  totalReservations: mockReservations.length,
  totalUtilisateurs: mockUsers.length,
  revenuTotal: mockPaiements.filter((p) => p.statut === "Réussi").reduce((s, p) => s + p.montant, 0),
  reservationsEnAttente: mockReservations.filter((r) => r.statut === "En attente").length,
  reservationsValidees:  mockReservations.filter((r) => r.statut === "Validée").length,
  reservationsRefusees:  mockReservations.filter((r) => r.statut === "Refusée").length,
  reservationsAnnulees:  mockReservations.filter((r) => r.statut === "Annulée").length,
};
