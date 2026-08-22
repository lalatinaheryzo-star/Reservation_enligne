// pages/president/MesPaiementsPresident.jsx
import React, { useState } from "react";
import { Wallet, CheckCircle, Clock } from "lucide-react";
import { usePresidentContext } from "../../context/PresidentContext";

export default function MesPaiementsPresident({ cooperative, isRealSession }) {
  const { getPaymentsForCoop, realPaiements, realReservations, updatePaiementStatutReal } = usePresidentContext();
  const [savingId, setSavingId] = useState(null);
  const payments = isRealSession ? realPaiements : getPaymentsForCoop(cooperative?.id);

  const clientFor = (reservationId) => {
    const r = realReservations.find((x) => (x.id_reservation || x.id) === reservationId);
    return r?.client || "—";
  };

  const total     = payments.reduce((s, p) => s + Number(p.montant || 0), 0);
  const confirmes = payments.filter((p) => p.statut === "Réussi");
  const enAttente = payments.filter((p) => p.statut === "En attente");

  const statusBadge = (s) => (
    <span className={`badge ${s === "Réussi" ? "green" : s === "Échoué" ? "rose" : "amber"}`}>{s}</span>
  );

  const handleValidate = async (id) => {
    setSavingId(id);
    try { await updatePaiementStatutReal(id, "Réussi"); }
    catch (err) { /* toast déjà géré par apiClient */ }
    finally { setSavingId(null); }
  };

  return (
    <div>
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="stat-card navy">
          <div className="stat-icon-wrap"><Wallet size={20} /></div>
          <div className="stat-label">Total</div>
          <div className="stat-value">{total.toLocaleString()} Ar</div>
          <div className="stat-sub">tous paiements confondus</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon-wrap"><CheckCircle size={20} /></div>
          <div className="stat-label">Confirmés</div>
          <div className="stat-value">{confirmes.length}</div>
          <div className="stat-sub">{confirmes.reduce((s, p) => s + Number(p.montant || 0), 0).toLocaleString()} Ar</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon-wrap"><Clock size={20} /></div>
          <div className="stat-label">En attente</div>
          <div className="stat-value">{enAttente.length}</div>
          <div className="stat-sub">à confirmer</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h3>Historique des paiements</h3></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Référence</th><th>Voyageur</th><th>Mode</th><th>Date</th><th>Montant</th><th>Statut</th>
                {isRealSession && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={isRealSession ? 7 : 6} style={{ textAlign: "center", color: "#94a3b8", padding: 24 }}>Aucun paiement</td></tr>
              ) : isRealSession ? (
                payments.map((p) => {
                  const id = p.id_paiement || p.id;
                  return (
                    <tr key={id}>
                      <td><code style={{ fontSize: ".75rem", color: "#64748b" }}>#{String(id).slice(0, 8)}</code></td>
                      <td style={{ fontWeight: 600 }}>{clientFor(p.reservation_id)}</td>
                      <td>{p.mode_paiement}</td>
                      <td>{p.date_paiement ? new Date(p.date_paiement).toLocaleDateString() : "—"}</td>
                      <td>{Number(p.montant || 0).toLocaleString()} Ar</td>
                      <td>{statusBadge(p.statut)}</td>
                      <td>
                        {p.statut === "En attente" ? (
                          <button className="btn btn-primary btn-sm btn-icon" title="Valider" disabled={savingId === id} onClick={() => handleValidate(id)}>
                            <CheckCircle size={14} />
                          </button>
                        ) : <span style={{ color: "#94a3b8", fontSize: ".78rem" }}>—</span>}
                      </td>
                    </tr>
                  );
                })
              ) : (
                payments.map((p) => (
                  <tr key={p.id}>
                    <td><code style={{ fontSize: ".75rem", color: "#64748b" }}>#{p.id.replace("pay-", "").padStart(3, "0")}</code></td>
                    <td style={{ fontWeight: 600 }}>{p.voyageur}</td>
                    <td>{p.mode}</td>
                    <td>{p.date}</td>
                    <td>{Number(p.montant).toLocaleString()} Ar</td>
                    <td>{statusBadge(p.statut)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
