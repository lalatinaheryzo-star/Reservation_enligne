// src/api/services.js
// ============================================================
//  Couche de services qui appelle le serveur Express (../server)
//  au lieu de Firebase. Mêmes noms de fonctions que
//  src/firebase/services.js pour pouvoir basculer facilement.
// ============================================================
import { apiClient, setToken, getToken, downloadProtectedFile } from "./client";

// ── AUTH ──────────────────────────────────────────────────
export async function loginUser(email, password) {
  const data = await apiClient.post("/auth/login", { email, password });
  setToken(data.token);
  return data.user;
}

export async function registerUser({ nom, prenom, email, password, telephone }) {
  const data = await apiClient.post("/auth/register", { nom, prenom, email, password, telephone });
  setToken(data.token);
  return data.user;
}

export async function fetchCurrentUser() {
  if (!getToken()) return null;
  return apiClient.get("/auth/me");
}

export function logoutUser() {
  setToken(null);
  return Promise.resolve();
}

// ── DASHBOARD ─────────────────────────────────────────────
export const getDashboardStats = () => apiClient.get("/dashboard/stats");

// ── VOYAGES ───────────────────────────────────────────────
export const getVoyages = () => apiClient.get("/voyages");
export const getVoyage = (id) => apiClient.get(`/voyages/${id}`);
export const createVoyage = (payload) => apiClient.post("/voyages", payload);
export const updateVoyage = (id, payload) => apiClient.put(`/voyages/${id}`, payload);
export const deleteVoyage = (id) => apiClient.delete(`/voyages/${id}`);

// ── PLACES ────────────────────────────────────────────────
export const getPlacesForVoyage = (voyageId) => apiClient.get(`/voyages/${voyageId}/places`);
export const reservePlace = (placeId, utilisateurId) =>
  apiClient.post(`/places/${placeId}/reserver`, { utilisateur_id: utilisateurId });
export const releasePlace = (placeId) => apiClient.post(`/places/${placeId}/liberer`);

// ── COOPERATIVES ──────────────────────────────────────────
export const getCooperatives = () => apiClient.get("/cooperatives");
export const getMyCooperative = () => apiClient.get("/cooperatives/me");
export const createCooperative = (payload) => apiClient.post("/cooperatives", payload);
export const updateCooperative = (id, payload) => apiClient.put(`/cooperatives/${id}`, payload);
export const deleteCooperative = (id) => apiClient.delete(`/cooperatives/${id}`);

// ── DEMANDES DE CRÉATION DE COOPÉRATIVE ───────────────────
// Workflow : un voyageur dépose une demande -> l'admin approuve/rejette.
// Voir DemandeCooperativeController côté backend.
export const createDemandeCooperative = (payload) => apiClient.post("/demandes-cooperatives", payload);
export const getMesDemandesCooperatives = () => apiClient.get("/demandes-cooperatives/me");
export const getDemandesCooperatives = () => apiClient.get("/demandes-cooperatives");
export const approveDemandeCooperative = (id) => apiClient.patch(`/demandes-cooperatives/${id}/approve`);
export const rejectDemandeCooperative = (id, motif) =>
  apiClient.patch(`/demandes-cooperatives/${id}/reject`, motif ? { motif } : {});
export const deleteDemandeCooperative = (id) => apiClient.delete(`/demandes-cooperatives/${id}`);

// ── UTILISATEURS ──────────────────────────────────────────
export const getUtilisateurs = () => apiClient.get("/utilisateurs");
export const createUtilisateur = (payload) => apiClient.post("/utilisateurs", payload);
export const updateUtilisateur = (id, payload) => apiClient.put(`/utilisateurs/${id}`, payload);
export const deleteUtilisateur = (id) => apiClient.delete(`/utilisateurs/${id}`);

// ── RESERVATIONS ──────────────────────────────────────────// ── RESERVATIONS ──────────────────────────────────────────
export const getReservations = (statut) =>
  apiClient.get(statut ? `/reservations?statut=${encodeURIComponent(statut)}` : "/reservations");
export const getMesReservations = (utilisateurId) =>
  apiClient.get(`/reservations?utilisateur_id=${encodeURIComponent(utilisateurId)}`);
export const createReservation = (payload) => apiClient.post("/reservations", payload);
export const updateReservationStatut = (id, statut, adminId) =>
  apiClient.patch(`/reservations/${id}/statut`, { statut, admin_id: adminId });
export const deleteReservation = (id) => apiClient.delete(`/reservations/${id}`);

// ── PAIEMENTS ─────────────────────────────────────────────
export const getPaiements = () => apiClient.get("/paiements");
export const createPaiement = (payload) => apiClient.post("/paiements", payload);
export const updatePaiementStatut = (id, statut) => apiClient.patch(`/paiements/${id}/statut`, { statut });
export const deletePaiement = (id) => apiClient.delete(`/paiements/${id}`);

// ── RECUS ─────────────────────────────────────────────────
export const getRecus = () => apiClient.get("/recus");
export const createRecu = (paiementId) => apiClient.post("/recus", { paiement_id: paiementId });
export const getRecuById = (id) => apiClient.get(`/recus/${id}`);
export const getRecuByReservation = (reservationId) => apiClient.get(`/recus/reservation/${reservationId}`);
export const downloadRecuPdf = (id, filename) => downloadProtectedFile(`/recus/${id}/download`, filename);
export const deleteRecu = (id) => apiClient.delete(`/recus/${id}`);

// Vérification QR (page publique, agent de gare — pas de token requis)
export const verifyRecuByToken = (token) => apiClient.get(`/recus/verify/${token}`);
export const checkinRecuByToken = (token, checkedBy) =>
  apiClient.post(`/recus/verify/${token}/checkin`, { checked_by: checkedBy });

// ── NOTIFICATIONS ─────────────────────────────────────────
export const getNotifications = () => apiClient.get("/notifications");
export const createNotification = (payload) => apiClient.post("/notifications", payload);
export const deleteNotification = (id) => apiClient.delete(`/notifications/${id}`);