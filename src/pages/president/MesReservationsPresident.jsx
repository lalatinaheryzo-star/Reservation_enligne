// pages/president/MesReservationsPresident.jsx
import React, { useState } from "react";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { usePresidentContext } from "../../context/PresidentContext";

export default function MesReservationsPresident({ cooperative, isRealSession }) {
  const { travelsByCoop, getReservationsForCoop, realReservations, realPaiements, updateReservationStatutReal, loadMyCooperativeSpace } = usePresidentContext();
  const [savingId, setSavingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const coopId = cooperative?.id;
  const travels = travelsByCoop[coopId] || [];
  const reservations = isRealSession ? realReservations : getReservationsForCoop(coopId);

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await loadMyCooperativeSpace(); }
    finally { setRefreshing(false); }
  };
  const paiementFor = (reservationId) =>
    realPaiements.find((p) => p.reservation_id === reservationId);

  const statusBadge = (s) => {
    const map = { "Validée": "green", "En attente": "amber", "Refusée": "rose", "Annulée": "gray", "Payé": "green", "Réussi": "green", "Échoué": "rose" };
    return <span className={`badge ${map[s] || "gray"}`}>{s || "—"}</span>;
  };

  const handleValidate = async (id) => {
    setSavingId(id);
    try { await updateReservationStatutReal(id, "Validée"); }
    catch (err) { /* toast déjà géré par apiClient */ }
    finally { setSavingId(null); }
  };
  const handleRefuse = async (id) => {
    setSavingId(id);
    try { await updateReservationStatutReal(id, "Refusée"); }
    catch (err) { /* toast déjà géré par apiClient */ }
    finally { setSavingId(null); }
  };

  return (
    <div>
      <div className="toolbar">
        <span className="section-title">Mes réservations ({reservations.length})</span>
        {isRealSession && (
          <button className="btn btn-secondary btn-sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={14} style={{ marginRight: 4, animation: refreshing ? "spin 1s linear infinite" : "none" }} />
            Actualiser
          </button>
        )}
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Voyageur</th><th>Voyage</th><th>Date</th><th>Siège</th><th>Montant</th><th>Paiement</th><th>Statut</th>
                {isRealSession && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr><td colSpan={isRealSession ? 8 : 6} style={{ textAlign: "center", color: "#94a3b8", padding: 24 }}>Aucune réservation</td></tr>
              ) : isRealSession ? (
                reservations.map((r) => {
                  const id = r.id_reservation || r.id;
                  const paiement = paiementFor(id);
                  return (
                    <tr key={id}>
                      <td style={{ fontWeight: 600 }}>{r.client || "—"}</td>
                      <td style={{ color: "#64748b", fontSize: ".85rem" }}>
                        {r.ville_depart} → {r.ville_arrivee}
                      </td>
                      <td style={{ fontSize: ".82rem" }}>{r.date_depart || "—"}{r.heure_depart ? ` · ${r.heure_depart}` : ""}</td>
                      <td>Place {r.numero_place}</td>
                      <td>{Number(r.prix || 0).toLocaleString()} Ar</td>
                      <td>{statusBadge(paiement?.statut)}</td>
                      <td>{statusBadge(r.statut)}</td>
                      <td>
                        {r.statut === "En attente" ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-primary btn-sm btn-icon" title="Valider" disabled={savingId === id} onClick={() => handleValidate(id)}>
                              <CheckCircle size={14} />
                            </button>
                            <button className="btn btn-danger btn-sm btn-icon" title="Refuser" disabled={savingId === id} onClick={() => handleRefuse(id)}>
                              <XCircle size={14} />
                            </button>
                          </div>
                        ) : <span style={{ color: "#94a3b8", fontSize: ".78rem" }}>—</span>}
                      </td>
                    </tr>
                  );
                })
              ) : (
                reservations.map((r) => {
                  const trip = travels.find((t) => t.id === r.voyageId);
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.voyageur}</td>
                      <td style={{ color: "#64748b", fontSize: ".85rem" }}>
                        {trip ? `${trip.depart} → ${trip.arrivee}` : "—"}
                      </td>
                      <td style={{ fontSize: ".82rem" }}>{trip?.date || "—"}</td>
                      <td>Place {r.siege}</td>
                      <td>{Number(r.montant).toLocaleString()} Ar</td>
                      <td>{statusBadge(r.statut === "Payé" ? "Réussi" : "En attente")}</td>
                      <td>{statusBadge(r.statut)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
