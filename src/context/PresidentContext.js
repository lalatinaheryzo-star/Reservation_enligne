// src/context/PresidentContext.js
// ============================================================
//  Contexte "Président / multi-coopératives" — FRONTEND UNIQUEMENT.
//
//  Gère l'état mutable du prototype : demandes de création de
//  coopérative (PENDING/APPROVED/REJECTED), liste des coopératives
//  et des présidents, voyages/réservations/paiements par coopérative.
//
//  Persisté dans localStorage (clé ci-dessous) uniquement pour que
//  la démo survive à un rafraîchissement de page — ce n'est PAS une
//  base de données, uniquement du confort de démonstration.
//
//  ⚠️ Frontend demo protection only.
//  Real authorization and access control (isolation des données
//  entre coopératives, création réelle de comptes Président, etc.)
//  must be implemented server-side. Rien ici ne doit être considéré
//  comme une sécurité réelle.
// ============================================================
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  MOCK_COOPERATIVES,
  MOCK_PRESIDENTS,
  MOCK_REQUESTS,
  MOCK_TRAVELS_BY_COOP,
  MOCK_RESERVATIONS_BY_COOP,
  MOCK_PAYMENTS_BY_COOP,
  MOCK_ACTIVITY_BY_COOP,
} from "../data/mockPresidentData";
import { getMyCooperative, getReservations, getPaiements, updateReservationStatut, updatePaiementStatut, updateCooperative as apiUpdateCooperative, createCooperative as apiCreateCooperative } from "../api/services";
import { getToken } from "../api/client";

const STORAGE_KEY = "reservation_en_ligne_demo_president_state_v1";

const DEFAULT_STATE = {
  cooperatives: MOCK_COOPERATIVES,
  presidents: MOCK_PRESIDENTS,
  requests: MOCK_REQUESTS,
  travelsByCoop: MOCK_TRAVELS_BY_COOP,
};

function loadInitialState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    // Fusion défensive : si la structure sauvegardée est incomplète
    // (ex. après une mise à jour du prototype), on retombe sur les valeurs par défaut.
    return {
      cooperatives:  parsed.cooperatives  || DEFAULT_STATE.cooperatives,
      presidents:    parsed.presidents    || DEFAULT_STATE.presidents,
      requests:      parsed.requests      || DEFAULT_STATE.requests,
      travelsByCoop: parsed.travelsByCoop || DEFAULT_STATE.travelsByCoop,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

const PresidentContext = createContext(null);

export function PresidentProvider({ children }) {
  const [state, setState] = useState(loadInitialState);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* stockage indisponible : on continue en mémoire */ }
  }, [state]);

  const { cooperatives, presidents, requests, travelsByCoop } = state;

  // ── Espace RÉEL (compte Président authentifié par JWT) ─────
  // Le compte de démonstration (LoginPresident -> tryDemoLogin) ne pose
  // jamais de token ; un vrai compte Président (issu de l'approbation
  // d'une DemandeCooperative) en pose toujours un via loginUser(). On
  // distingue donc les deux modes par la simple présence du token,
  // sans dupliquer la logique de connexion.
  const [realCooperative,  setRealCooperative]  = useState(null);
  const [realReservations, setRealReservations] = useState([]);
  const [realPaiements,    setRealPaiements]    = useState([]);
  const [realLoading,      setRealLoading]      = useState(false);
  const [realError,        setRealError]        = useState(null);
  const [needsCooperative, setNeedsCooperative]  = useState(false); // PRESIDENT approuvé, coopérative pas encore créée

  const isRealSession = Boolean(getToken());

  const loadMyCooperativeSpace = useCallback(async () => {
    if (!getToken()) return; // compte de démonstration : rien à charger côté serveur
    setRealLoading(true);
    setRealError(null);
    setNeedsCooperative(false);
    try {
      const coop = await getMyCooperative();
      setRealCooperative(coop);

      // Chargés indépendamment : un échec sur l'un (ex. backend pas encore
      // "chaud" juste après un démarrage) ne doit pas empêcher l'affichage
      // de l'autre, ni bloquer la coopérative déjà récupérée ci-dessus.
      const [reservationsResult, paiementsResult] = await Promise.allSettled([
        getReservations(),
        getPaiements(),
      ]);

      if (reservationsResult.status === "fulfilled") {
        setRealReservations(reservationsResult.value || []);
      } else {
        console.error("Échec du chargement des réservations :", reservationsResult.reason);
        toast.error("Impossible de charger les réservations. Réessayez.");
      }

      if (paiementsResult.status === "fulfilled") {
        setRealPaiements(paiementsResult.value || []);
      } else {
        console.error("Échec du chargement des paiements :", paiementsResult.reason);
        toast.error("Impossible de charger les paiements. Réessayez.");
      }
    } catch (err) {
      if (err.status === 404) {
        // Cas normal juste après l'approbation Admin : le compte est bien
        // PRESIDENT, mais n'a pas encore créé sa coopérative (§ workflow
        // "l'admin autorise, le Président crée sa coopérative lui-même").
        setNeedsCooperative(true);
      } else {
        setRealError(err.message || "Impossible de charger votre coopérative.");
      }
    } finally {
      setRealLoading(false);
    }
  }, []);

  const createMyCooperativeReal = useCallback(async (payload) => {
    const coop = await apiCreateCooperative(payload);
    setRealCooperative(coop);
    setNeedsCooperative(false);
    toast.success("Coopérative créée ! Vous pouvez maintenant la gérer.");
    return coop;
  }, []);

  // ── Demandes de création de coopérative ───────────────────
  const approveRequest = useCallback((requestId) => {
    setState((prev) => {
      const req = prev.requests.find((r) => r.id === requestId);
      if (!req || req.statut !== "PENDING") return prev;

      const newCoopId = `coop-demo-${Date.now()}`;
      const newPresidentId = `pres-demo-${Date.now()}`;

      const newCoop = {
        id: newCoopId,
        nom: req.cooperative,
        initiales: req.cooperative.slice(0, 2).toUpperCase(),
        president: req.candidat,
        presidentId: newPresidentId,
        telephone: req.telephone,
        email: req.email,
        adresse: req.adresse,
        description: `Coopérative créée suite à la validation de la demande de ${req.candidat}.`,
        statut: "active",
        dateCreation: new Date().toISOString().slice(0, 10),
      };
      const newPresident = {
        id: newPresidentId,
        nom: req.candidat.split(" ").slice(1).join(" ") || req.candidat,
        prenom: req.candidat.split(" ")[0],
        email: req.email,
        telephone: req.telephone,
        cooperativeId: newCoopId,
        cooperativeNom: req.cooperative,
        statut: "actif",
        dateCreation: newCoop.dateCreation,
      };

      return {
        ...prev,
        requests: prev.requests.map((r) => (r.id === requestId ? { ...r, statut: "APPROVED" } : r)),
        cooperatives: [newCoop, ...prev.cooperatives],
        presidents: [newPresident, ...prev.presidents],
        travelsByCoop: { ...prev.travelsByCoop, [newCoopId]: [] },
      };
    });
    toast.success("Coopérative créée avec succès. Le compte Président a été créé.");
  }, []);

  const rejectRequest = useCallback((requestId) => {
    setState((prev) => ({
      ...prev,
      requests: prev.requests.map((r) => (r.id === requestId ? { ...r, statut: "REJECTED" } : r)),
    }));
    toast("Demande refusée.", { icon: "✕" });
  }, []);

  // ── Voyages (espace Président) ────────────────────────────
  const addTravel = useCallback((cooperativeId, travel) => {
    setState((prev) => {
      const list = prev.travelsByCoop[cooperativeId] || [];
      const newTravel = { id: `trv-demo-${Date.now()}`, statut: "actif", ...travel };
      return { ...prev, travelsByCoop: { ...prev.travelsByCoop, [cooperativeId]: [newTravel, ...list] } };
    });
    toast.success("Voyage créé.");
  }, []);

  const updateTravel = useCallback((cooperativeId, travelId, updates) => {
    setState((prev) => {
      const list = prev.travelsByCoop[cooperativeId] || [];
      return {
        ...prev,
        travelsByCoop: {
          ...prev.travelsByCoop,
          [cooperativeId]: list.map((t) => (t.id === travelId ? { ...t, ...updates } : t)),
        },
      };
    });
    toast.success("Voyage modifié.");
  }, []);

  const removeTravel = useCallback((cooperativeId, travelId) => {
    setState((prev) => {
      const list = prev.travelsByCoop[cooperativeId] || [];
      return { ...prev, travelsByCoop: { ...prev.travelsByCoop, [cooperativeId]: list.filter((t) => t.id !== travelId) } };
    });
    toast.success("Voyage supprimé.");
  }, []);

  const updateCooperative = useCallback((cooperativeId, updates) => {
    setState((prev) => ({
      ...prev,
      cooperatives: prev.cooperatives.map((c) => (c.id === cooperativeId ? { ...c, ...updates } : c)),
    }));
    toast.success("Informations de la coopérative mises à jour.");
  }, []);

  const updateMyCooperativeReal = useCallback(async (cooperativeId, payload) => {
    const updated = await apiUpdateCooperative(cooperativeId, payload);
    setRealCooperative(updated);
    toast.success("Informations de la coopérative mises à jour.");
    return updated;
  }, []);

  const updateReservationStatutReal = useCallback(async (id, statut) => {
    const updated = await updateReservationStatut(id, statut);
    setRealReservations((prev) => prev.map((r) => ((r.id_reservation || r.id) === id ? updated : r)));
    toast.success(statut === "Validée" ? "Réservation confirmée." : "Réservation refusée.");
    return updated;
  }, []);

  const updatePaiementStatutReal = useCallback(async (id, statut) => {
    const updated = await updatePaiementStatut(id, statut);
    setRealPaiements((prev) => prev.map((p) => ((p.id_paiement || p.id) === id ? updated : p)));
    toast.success("Paiement validé.");
    return updated;
  }, []);

  const resetDemoData = useCallback(() => {
    setState(DEFAULT_STATE);
    toast("Données de démonstration réinitialisées.", { icon: "↺" });
  }, []);

  // Réservations/paiements/activité : lecture seule pour ce prototype
  // (les nouvelles coopératives créées via une demande démarrent à vide).
  const getReservationsForCoop = useCallback((coopId) => MOCK_RESERVATIONS_BY_COOP[coopId] || [], []);
  const getPaymentsForCoop     = useCallback((coopId) => MOCK_PAYMENTS_BY_COOP[coopId] || [], []);
  const getActivityForCoop     = useCallback((coopId) => MOCK_ACTIVITY_BY_COOP[coopId] || [], []);
  const getCooperativeById     = useCallback((coopId) => cooperatives.find((c) => c.id === coopId) || null, [cooperatives]);

  const value = {
    cooperatives,
    presidents,
    requests,
    travelsByCoop,
    approveRequest,
    rejectRequest,
    addTravel,
    updateTravel,
    removeTravel,
    updateCooperative,
    resetDemoData,
    getReservationsForCoop,
    getPaymentsForCoop,
    getActivityForCoop,
    getCooperativeById,
    // Espace réel (JWT) — voir loadMyCooperativeSpace ci-dessus
    isRealSession,
    realCooperative,
    needsCooperative,
    createMyCooperativeReal,
    realReservations,
    realPaiements,
    realLoading,
    realError,
    loadMyCooperativeSpace,
    updateMyCooperativeReal,
    updateReservationStatutReal,
    updatePaiementStatutReal,
  };

  return <PresidentContext.Provider value={value}>{children}</PresidentContext.Provider>;
}

export function usePresidentContext() {
  const ctx = useContext(PresidentContext);
  if (!ctx) throw new Error("usePresidentContext doit être utilisé à l'intérieur de <PresidentProvider>");
  return ctx;
}
