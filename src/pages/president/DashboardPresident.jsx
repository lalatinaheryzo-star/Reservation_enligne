// pages/president/DashboardPresident.jsx
import React from "react";
import { Bus, ClipboardList, Wallet, Users, Activity } from "lucide-react";
import { usePresidentContext } from "../../context/PresidentContext";
import { useAppContext } from "../../context/AppContext";

export default function DashboardPresident({ cooperative }) {
  const { realReservations, realPaiements } = usePresidentContext();
  const { voyages: allVoyages } = useAppContext();
  const coopId = cooperative?.id;

  const travels      = allVoyages.filter((v) => v.cooperative_id === coopId);
  const reservations = realReservations;
  const payments     = realPaiements;
  const travelers     = new Set(reservations.map((r) => r.utilisateur_id)).size;

  const totalPaiements = payments
    .filter((p) => p.statut === "Réussi")
    .reduce((sum, p) => sum + Number(p.montant || 0), 0);

  return (
    <div>
      <div className="card" style={{ padding: "22px 26px", marginBottom: 20, background: "var(--grad-brand)", color: "#fff", border: "none" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: 4 }}>Bonjour {cooperative ? "👋" : ""}</h2>
        <p style={{ opacity: .8, fontSize: ".9rem" }}>
          Bienvenue dans votre espace Président. Coopérative : <strong>{cooperative?.nom || "—"}</strong>
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-icon-wrap"><Bus size={20} /></div>
          <div className="stat-label">Mes voyages</div>
          <div className="stat-value">{travels.length}</div>
          <div className="stat-sub">trajets créés</div>
        </div>
        <div className="stat-card navy">
          <div className="stat-icon-wrap"><ClipboardList size={20} /></div>
          <div className="stat-label">Mes réservations</div>
          <div className="stat-value">{reservations.length}</div>
          <div className="stat-sub">au total</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon-wrap"><Wallet size={20} /></div>
          <div className="stat-label">Mes paiements</div>
          <div className="stat-value">{totalPaiements.toLocaleString()} Ar</div>
          <div className="stat-sub">paiements réussis</div>
        </div>
        <div className="stat-card sky">
          <div className="stat-icon-wrap"><Users size={20} /></div>
          <div className="stat-label">Mes voyageurs</div>
          <div className="stat-value">{travelers}</div>
          <div className="stat-sub">voyageurs distincts</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h3><Activity size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />Activité récente</h3></div>
        <div className="card-body">
          {reservations.length === 0 ? (
            <p className="text-muted">Aucune activité récente.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {reservations.slice(0, 8).map((r) => {
                const id = r.id_reservation || r.id;
                return (
                  <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: ".86rem", color: "var(--navy)", fontWeight: 600 }}>
                      {r.client || "Voyageur"} — {r.ville_depart} → {r.ville_arrivee} ({r.statut})
                    </span>
                    <span style={{ fontSize: ".76rem", color: "var(--muted)" }}>
                      {r.date_reservation ? new Date(r.date_reservation).toLocaleDateString() : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
