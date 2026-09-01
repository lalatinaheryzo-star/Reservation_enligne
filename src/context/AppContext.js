// context/AppContext.js
// Chargement en deux phases :
//   Phase 1 (public, sans token) : voyages + coopératives
//   Phase 2 (après login)        : tout le reste (admin uniquement)
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as svc from "../api/services";

const AppContext = createContext(null);

export function AppProvider({ children }) {

  const [cooperatives,   setCooperatives]   = useState([]);
  const [voyages,        setVoyages]        = useState([]);
  const [utilisateurs,   setUtilisateurs]   = useState([]);
  const [reservations,   setReservations]   = useState([]);
  const [paiements,      setPaiements]      = useState([]);
  const [recus,          setRecus]          = useState([]);
  const [notifications,  setNotifications]  = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading,        setLoading]        = useState(true);

  // ── Phase 1 : données publiques (sans token) ─────────────
  // hasLoadedOnceRef évite que le rafraîchissement automatique (toutes les
  // 2s, voir plus bas) ne repasse "loading" à true à chaque fois : c'est ce
  // qui faisait clignoter la liste des voyages (elle disparaissait puis
  // réapparaissait en boucle). Le spinner ne doit s'afficher qu'au tout
  // premier chargement, jamais lors des rafraîchissements en arrière-plan.
  const hasLoadedOnceRef = React.useRef(false);

  const loadPublic = useCallback(async () => {
    if (!hasLoadedOnceRef.current) setLoading(true);
    try {
      const [v, c] = await Promise.allSettled([
        svc.getVoyages(),
        svc.getCooperatives(),
      ]);
      if (v.status === "fulfilled") setVoyages(v.value      || []);
      if (c.status === "fulfilled") setCooperatives(c.value || []);
    } catch (err) {
      console.error("[AppContext] loadPublic:", err);
    } finally {
      hasLoadedOnceRef.current = true;
      setLoading(false);
    }
  }, []);

  // ── Phase 2 : données protégées (après login admin) ──────
  const loadAdmin = useCallback(async () => {
    try {
      const [u, r, p, rc, n, ds] = await Promise.allSettled([
        svc.getUtilisateurs(),
        svc.getReservations(),
        svc.getPaiements(),
        svc.getRecus(),
        svc.getNotifications(),
        svc.getDashboardStats(),
      ]);
      if (u.status  === "fulfilled") setUtilisateurs(u.value   || []);
      if (r.status  === "fulfilled") setReservations(r.value   || []);
      if (p.status  === "fulfilled") setPaiements(p.value      || []);
      if (rc.status === "fulfilled") setRecus(rc.value         || []);
      if (n.status  === "fulfilled") setNotifications(n.value  || []);
      if (ds.status === "fulfilled") setDashboardStats(ds.value);
    } catch (err) {
      console.error("[AppContext] loadAdmin:", err);
    }
  }, []);

  // Tout recharger (bouton actualiser, espace ADMIN uniquement)
  const loadAll = useCallback(async () => {
    await loadPublic();
    await loadAdmin();
  }, [loadPublic, loadAdmin]);

  // ── Réservations du voyageur connecté (espace utilisateur) ──
  // À la différence de loadAdmin(), n'appelle QUE /reservations (filtré côté
  // serveur : VOYAGEUR -> les siennes). N'appelle jamais /utilisateurs, /recus,
  // /notifications ni /dashboard/stats, qui sont réservés à l'ADMIN et
  // renvoient 403 pour un voyageur (c'était la cause du bruit console observé
  // sur la page "Mes réservations").
  const loadMyReservations = useCallback(async () => {
    try {
      const list = await svc.getReservations();
      const normalized = list || [];
      setReservations(normalized);
      return normalized;
    } catch (err) {
      console.error("[AppContext] loadMyReservations:", err);
      return null;
    }
  }, []);

  // Au démarrage : seulement les données publiques.
  useEffect(() => { loadPublic(); }, [loadPublic]);

  // Actualisation automatique des voyages/coops (données publiques, partagées
  // par les 3 espaces) au rythme le plus court possible.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") loadPublic();
    };

    const timer = window.setInterval(refresh, 2000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadPublic]);

  // ── COOPÉRATIVES ─────────────────────────────────────────
  const addCooperative = async (data) => {
    const item = await svc.createCooperative(data);
    setCooperatives((prev) => [item, ...prev]);
    return item;
  };
  const editCooperative = async (id, data) => {
    const item = await svc.updateCooperative(id, data);
    setCooperatives((prev) => prev.map((c) => ((c.id_cooperative || c.id) === id ? item : c)));
    return item;
  };
  const removeCooperative = async (id) => {
    await svc.deleteCooperative(id);
    setCooperatives((prev) => prev.filter((c) => (c.id_cooperative || c.id) !== id));
  };

  // ── VOYAGES ───────────────────────────────────────────────
  const addVoyage = async (data) => {
    const item = await svc.createVoyage(data);
    setVoyages((prev) => [item, ...prev]);
    return item;
  };
  const editVoyage = async (id, data) => {
    const item = await svc.updateVoyage(id, data);
    setVoyages((prev) => prev.map((v) => ((v.id_voyage || v.id) === id ? item : v)));
    return item;
  };
  const removeVoyage = async (id) => {
    await svc.deleteVoyage(id);
    setVoyages((prev) => prev.filter((v) => (v.id_voyage || v.id) !== id));
  };

  // ── UTILISATEURS ─────────────────────────────────────────
  const addUtilisateur = async (data) => {
    const item = await svc.createUtilisateur(data);
    setUtilisateurs((prev) => [item, ...prev]);
    return item;
  };
  const editUtilisateur = async (id, data) => {
    const item = await svc.updateUtilisateur(id, data);
    setUtilisateurs((prev) => prev.map((u) => ((u.id_utilisateur || u.id) === id ? item : u)));
    return item;
  };
  const removeUtilisateur = async (id) => {
    await svc.deleteUtilisateur(id);
    setUtilisateurs((prev) => prev.filter((u) => (u.id_utilisateur || u.id) !== id));
  };

  // ── PLACES ───────────────────────────────────────────────
  const getPlacesForVoyage = async (voyageId) => svc.getPlacesForVoyage(voyageId);

  const getPlacesForVoyageSync = (voyageId, capacity = 18) => {
    const reservedNums = new Set(
      reservations
        .filter((r) => (r.voyage_id || r.voyageId) === voyageId
          && r.statut !== "Refusée" && r.statut !== "Annulée" && r.numero_place)
        .map((r) => Number(r.numero_place))
    );
    return Array.from({ length: capacity }, (_, i) => ({
      id:           `seat-${voyageId}-${i + 1}`,
      voyageId,
      numero_place:  i + 1,
      statut:        reservedNums.has(i + 1) ? "reservee" : "disponible",
    }));
  };

  const reservePlace = async (placeId, utilisateurId) => svc.reservePlace(placeId, utilisateurId);
  const freePlace    = async (placeId)                 => svc.releasePlace(placeId);

  // ── RÉSERVATIONS ─────────────────────────────────────────
  // addReservation reçoit un objet DÉJÀ créé par PaiementClient (via /api/places/:id/reserver).
  // On l'ajoute simplement au state local — AUCUN appel API supplémentaire.
  const addReservation = (data) => {
    setReservations((prev) => [data, ...prev]);
  };

  const updateReservationStatus = async (id, statut, adminId) => {
    await svc.updateReservationStatut(id, statut, adminId);
    setReservations((prev) =>
      prev.map((r) => ((r.id_reservation || r.id) === id ? { ...r, statut } : r))
    );
    // Notification automatique
    try {
      const resa = reservations.find((r) => (r.id_reservation || r.id) === id);
      const msg  = statut === "Validée"
        ? `Votre réservation vers ${resa?.ville_arrivee || ""} a été validée.`
        : `Votre réservation vers ${resa?.ville_arrivee || ""} a été ${statut.toLowerCase()}.`;
      const notif = await svc.createNotification({
        utilisateur_id: resa?.utilisateur_id || null,
        reservation_id: id,
        type:    "SMS / WhatsApp",
        message: msg,
        statut:  "Envoyé",
      });
      setNotifications((prev) => [notif, ...prev]);
    } catch {}
    try { const ds = await svc.getDashboardStats(); setDashboardStats(ds); } catch {}
  };

  const removeReservation = async (id) => {
    await svc.deleteReservation(id);
    setReservations((prev) => prev.filter((r) => (r.id_reservation || r.id) !== id));
  };

  // ── PAIEMENTS ────────────────────────────────────────────
  const addPaiement = async (data) => {
    const item = await svc.createPaiement(data);
    setPaiements((prev) => [item, ...prev]);
    if (data.statut === "Réussi") {
      try {
        const recu = await svc.createRecu(item.id_paiement || item.id);
        setRecus((prev) => [recu, ...prev]);
      } catch {}
    }
    return item;
  };
  const removePaiement = async (id) => {
    await svc.deletePaiement(id);
    setPaiements((prev) => prev.filter((p) => (p.id_paiement || p.id) !== id));
    // Le reçu associé est supprimé en cascade côté backend -> on le retire aussi localement
    setRecus((prev) => prev.filter((r) => (r.paiement_id || r.paiementId) !== id));
  };

  // ── REÇUS ────────────────────────────────────────────────
  const removeRecu = async (id) => {
    await svc.deleteRecu(id);
    setRecus((prev) => prev.filter((r) => (r.id_recu || r.id) !== id));
  };

  // ── NOTIFICATIONS ────────────────────────────────────────
  const removeNotification = async (id) => {
    await svc.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => (n.id_notification || n.id) !== id));
  };

  return (
    <AppContext.Provider value={{
      loading, loadAll, loadAdmin, loadPublic, loadMyReservations,
      cooperatives, addCooperative, editCooperative, removeCooperative,
      voyages, addVoyage, editVoyage, removeVoyage,
      utilisateurs, addUtilisateur, editUtilisateur, removeUtilisateur,
      getPlacesForVoyage, getPlacesForVoyageSync, reservePlace, freePlace,
      reservations, addReservation, updateReservationStatus, removeReservation,
      paiements, addPaiement, removePaiement,
      recus, removeRecu,
      notifications, removeNotification,
      dashboardStats,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext doit être utilisé dans <AppProvider>");
  return ctx;
}