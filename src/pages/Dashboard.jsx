// pages/Dashboard.jsx — connecté à l'API Supabase via AppContext
import React from "react";
import {
  Bus, Users, ClipboardList, TrendingUp, Clock, CheckCircle,
  XCircle, Ban, AlertCircle
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function formatDate(val) {
  if (!val) return "–";
  if (typeof val === "string") return new Date(val).toLocaleDateString("fr-FR");
  if (val?.toDate) return val.toDate().toLocaleDateString("fr-FR");
  return "–";
}

export default function Dashboard() {
  const { dashboardStats: stats, reservations, voyages } = useAppContext();

  // Graphique : on calcule les réservations des 6 derniers mois depuis les données réelles
  const monthLabels = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
  const now = new Date();
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const label = monthLabels[d.getMonth()];
    const count = reservations.filter((r) => {
      const rd = r.date_reservation ? new Date(r.date_reservation) : null;
      return rd && rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
    }).length;
    return { mois: label, réservations: count };
  });

  const recentResas = [...reservations]
    .sort((a, b) => new Date(b.date_reservation) - new Date(a.date_reservation))
    .slice(0, 5);

  const statusBadge = (s) => {
    const map = { "En attente": "amber", "Validée": "green", "Refusée": "rose", "Annulée": "gray" };
    return <span className={`badge ${map[s] || "gray"}`}>{s}</span>;
  };

  const statusBreakdown = [
    { label: "Validées",    value: stats?.reservations_validees  || 0, color: "#10B981", Icon: CheckCircle },
    { label: "En attente",  value: stats?.reservations_en_attente || 0, color: "#F59E0B", Icon: Clock },
    { label: "Refusées",    value: stats?.reservations_refusees  || 0, color: "#F43F5E", Icon: XCircle },
    { label: "Annulées",    value: stats?.reservations_annulees  || 0, color: "#94A3B8", Icon: Ban },
  ];

  const total = stats?.total_reservations || reservations.length || 1;

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-icon-wrap"><Bus size={20} /></div>
          <div className="stat-label">Voyages actifs</div>
          <div className="stat-value">{stats?.total_voyages ?? voyages.length ?? "–"}</div>
          <div className="stat-sub">trajets disponibles</div>
        </div>
        <div className="stat-card navy">
          <div className="stat-icon-wrap"><ClipboardList size={20} /></div>
          <div className="stat-label">Réservations</div>
          <div className="stat-value">{stats?.total_reservations ?? reservations.length ?? "–"}</div>
          <div className="stat-sub">total cumulé</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon-wrap"><Clock size={20} /></div>
          <div className="stat-label">En attente</div>
          <div className="stat-value">{stats?.reservations_en_attente ?? "–"}</div>
          <div className="stat-sub">à traiter</div>
        </div>
        <div className="stat-card sky">
          <div className="stat-icon-wrap"><Users size={20} /></div>
          <div className="stat-label">Utilisateurs</div>
          <div className="stat-value">{stats?.total_utilisateurs ?? "–"}</div>
          <div className="stat-sub">comptes enregistrés</div>
        </div>
        <div className="stat-card rose">
          <div className="stat-icon-wrap"><TrendingUp size={20} /></div>
          <div className="stat-label">Revenu total</div>
          <div className="stat-value">
            {stats?.revenu_total != null ? `${Number(stats.revenu_total).toLocaleString()} Ar` : "–"}
          </div>
          <div className="stat-sub">paiements réussis</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }} className="dashboard-charts-row">
        <div className="card">
          <div className="card-header"><h3>Réservations par mois</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 8px 28px rgba(15,31,61,.18)" }} />
                <defs>
                  <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <Bar dataKey="réservations" fill="url(#barFill)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Statut des réservations</h3></div>
          <div className="card-body">
            {statusBreakdown.map(({ label, value, color, Icon }) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: ".82rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569" }}>
                    <Icon size={14} color={color} /> {label}
                  </span>
                  <strong style={{ color: "#1e293b" }}>{value}</strong>
                </div>
                <div style={{ background: "#f1f5f9", borderRadius: 6, height: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (value / total) * 100)}%`, background: color, borderRadius: 6, transition: "width .6s ease" }} />
                </div>
              </div>
            ))}
            <div className="divider" />
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".82rem", color: "#64748b" }}>
              <AlertCircle size={14} color="#F59E0B" />
              {stats?.reservations_en_attente || 0} réservation(s) en attente de validation
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h3>Dernières réservations</h3></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Référence</th><th>Client</th><th>Date</th><th>Voyage</th><th>Statut</th></tr>
            </thead>
            <tbody>
              {recentResas.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "#94a3b8", padding: 24 }}>Aucune réservation</td></tr>
              ) : (
                recentResas.map((r) => (
                  <tr key={r.id}>
                    <td><code style={{ fontSize: ".75rem", color: "#64748b" }}>{(r.id || "").slice(0, 8)}…</code></td>
                    <td style={{ fontWeight: 500 }}>{r.client || "–"}</td>
                    <td>{formatDate(r.date_reservation)}</td>
                    <td style={{ color: "#64748b", fontSize: ".82rem" }}>
                      {r.ville_depart && r.ville_arrivee ? `${r.ville_depart} → ${r.ville_arrivee}` : "–"}
                    </td>
                    <td>{statusBadge(r.statut)}</td>
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
