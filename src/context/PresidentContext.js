// src/context/PresidentContext.js
// ============================================================
//  Contexte "Président" — entièrement piloté par le backend.
//  Charge la coopérative du Président connecté (GET /cooperatives/me)
//  ainsi que ses réservations/paiements, et expose les actions qui les
//  modifient (validation de réservation/paiement, mise à jour de la
//  coopérative, création de la coopérative si pas encore faite).
// ============================================================
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getMyCooperative, getReservations, getPaiements, updateReservationStatut, updatePaiementStatut, updateCooperative as apiUpdateCooperative, createCooperative as apiCreateCooperative } from "../api/services";
import { getToken } from "../api/client";

const PresidentContext = createContext(null);

export function PresidentProvider({ children }) {
  const [realCooperative,  setRealCooperative]  = useState(null);
  const [realReservations, setRealReservations] = useState([]);
  const [realPaiements,    setRealPaiements]    = useState([]);
  const [realLoading,      setRealLoading]      = useState(false);
  const [realError,        setRealError]        = useState(null);
  const [needsCooperative, setNeedsCooperative]  = useState(false); // PRESIDENT approuvé, coopérative pas encore créée

  const refreshRealData = useCallback(async () => {
    if (!getToken()) return;

    const [reservationsResult, paiementsResult] = await Promise.allSettled([
      getReservations(),
      getPaiements(),
    ]);

    if (reservationsResult.status === "fulfilled") {
      setRealReservations(reservationsResult.value || []);
    } else {
      console.error("Échec du chargement des réservations :", reservationsResult.reason);
    }

    if (paiementsResult.status === "fulfilled") {
      setRealPaiements(paiementsResult.value || []);
    } else {
      console.error("Échec du chargement des paiements :", paiementsResult.reason);
    }
  }, []);

  const loadMyCooperativeSpace = useCallback(async () => {
    if (!getToken()) return;
    setRealLoading(true);
    setRealError(null);
    setNeedsCooperative(false);

    try {
      // Étape critique : récupérer uniquement la coopérative pour afficher
      // immédiatement l'espace Président. Les listes lourdes viennent ensuite.
      const coop = await getMyCooperative();
      setRealCooperative(coop);
      setRealLoading(false);

      // Chargement secondaire non bloquant.
      await refreshRealData();
    } catch (err) {
      if (err.status === 404) {
        setNeedsCooperative(true);
      } else {
        setRealError(err.message || "Impossible de charger votre coopérative.");
      }
      setRealLoading(false);
    }
  }, [refreshRealData]);

  // Actualisation automatique des réservations/paiements du Président au
  // rythme le plus court possible.
  useEffect(() => {
    if (!getToken()) return;

    const refresh = () => {
      if (document.visibilityState === "visible") refreshRealData();
    };

    const timer = window.setInterval(refresh, 2000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [refreshRealData]);

  const createMyCooperativeReal = useCallback(async (payload) => {
    const coop = await apiCreateCooperative(payload);
    setRealCooperative(coop);
    setNeedsCooperative(false);
    toast.success("Coopérative créée ! Vous pouvez maintenant la gérer.");
    return coop;
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

  const value = {
    realCooperative,
    needsCooperative,
    createMyCooperativeReal,
    realReservations,
    realPaiements,
    realLoading,
    realError,
    loadMyCooperativeSpace,
    refreshRealData,
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
