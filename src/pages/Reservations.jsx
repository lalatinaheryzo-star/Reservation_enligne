// pages/Reservations.jsx — connecté à l'API Supabase via AppContext
// Valider/Refuser une réservation est désormais réservé au Président de la
// coopérative concernée (voir SecurityConfig côté backend, §5/§7 de la
// spec "Évolution du projet"). L'admin garde ici la consultation et la
// suppression (toujours autorisée pour un ADMIN).
import React, { useState } from "react";
import { Search, Eye, X, Trash2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  "En attente": "amber",
  "Validée":    "green",
  "Refusée":    "rose",
  "Annulée":    "gray",
};

function formatDate(val) {
  if (!val) return "–";
  if (typeof val === "string") return new Date(val).toLocaleDateString("fr-FR");
  if (val?.toDate) return val.toDate().toLocaleDateString("fr-FR");
  return "–";
}

export default function Reservations() {
  const { reservations, voyages, utilisateurs, removeReservation } = useAppContext();

  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [detail, setDetail]             = useState(null);

  const getUserName = (uid) => {
    // Les données API peuvent inclure directement le nom client
    const u = utilisateurs.find((x) => x.id === uid);
    return u ? `${u.nom} ${u.prenom}` : uid?.slice(0, 8) || "Inconnu";
  };

  const getVoyage = (vid) => voyages.find((v) => v.id === vid) || null;

  const handleDelete = async (r) => {
    if (!window.confirm("Supprimer définitivement cette réservation ?")) return;
    try {
      await removeReservation(r.id);
      toast.success("Réservation supprimée.");
      setDetail(null);
    } catch (err) {
      toast.error(err.message || "Erreur lors de la suppression.");
    }
  };

  const filtered = reservations.filter((r) => {
    const clientName = r.client || getUserName(r.utilisateur_id);
    const matchSearch =
      (r.id || "").toLowerCase().includes(search.toLowerCase()) ||
      clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.statut === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="toolbar">
        <span className="section-title">Réservations ({filtered.length}) — supervision</span>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div className="search-bar">
            <Search size={15} style={{ color: "#94a3b8" }} />
            <input
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: ".84rem", outline: "none" }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="En attente">En attente</option>
            <option value="Validée">Validée</option>
            <option value="Refusée">Refusée</option>
            <option value="Annulée">Annulée</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Client</th>
                <th>Voyage</th>
                <th>Place</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>Aucune réservation</td></tr>
              )}
              {filtered.map((r) => {
                const voyage = getVoyage(r.voyage_id);
                const clientName = r.client || getUserName(r.utilisateur_id);
                const trajet = r.ville_depart && r.ville_arrivee
                  ? `${r.ville_depart} → ${r.ville_arrivee}`
                  : voyage ? `${voyage.ville_depart} → ${voyage.ville_arrivee}`
                  : (r.voyage_id || "–").slice(0, 8);
                return (
                  <tr key={r.id}>
                    <td><code style={{ fontSize: ".75rem", color: "#64748b" }}>{(r.id || "").slice(0, 10)}…</code></td>
                    <td style={{ fontWeight: 500 }}>{clientName}</td>
                    <td style={{ color: "#64748b", fontSize: ".82rem" }}>{trajet}</td>
                    <td style={{ color: "#64748b", fontSize: ".82rem", textAlign: "center" }}>
                      {r.numero_place ? (
                        <span style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>
                          #{r.numero_place}
                        </span>
                      ) : "–"}
                    </td>
                    <td style={{ color: "#64748b", fontSize: ".82rem" }}>{formatDate(r.date_reservation)}</td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[r.statut] || "gray"}`}>{r.statut}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setDetail(r)} title="Détails">
                          <Eye size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(r)} title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDetail(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Détail réservation</h3>
              <button className="icon-btn" onClick={() => setDetail(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  ["Référence", (detail.id || "").slice(0, 12) + "…"],
                  ["Client",    detail.client || getUserName(detail.utilisateur_id)],
                  ["Place",     detail.numero_place ? `Place ${detail.numero_place}` : "–"],
                  ["Date",      formatDate(detail.date_reservation)],
                  ["Statut",    detail.statut],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: ".72rem", color: "#94a3b8", marginBottom: 3, textTransform: "uppercase", fontWeight: 600 }}>{k}</div>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>{v}</div>
                  </div>
                ))}
              </div>
              {(detail.ville_depart || getVoyage(detail.voyage_id)) && (
                <>
                  <div className="divider" />
                  <div style={{ background: "#f8fafc", borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: ".75rem", color: "#94a3b8", marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>Voyage</div>
                    {(() => {
                      const v = getVoyage(detail.voyage_id);
                      const depart = detail.ville_depart || v?.ville_depart;
                      const arrivee = detail.ville_arrivee || v?.ville_arrivee;
                      const date = detail.date_depart || v?.date_depart;
                      const prix = detail.prix || v?.prix;
                      return (
                        <>
                          <div style={{ fontWeight: 700, color: "#0f1f3d" }}>{depart} → {arrivee}</div>
                          <div style={{ fontSize: ".82rem", color: "#64748b", marginTop: 4 }}>
                            {date} · {prix ? `${Number(prix).toLocaleString()} Ar` : ""}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </>
              )}
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-danger" style={{ width: "100%", justifyContent: "center" }} onClick={() => handleDelete(detail)}>
                  <Trash2 size={15} /> Supprimer la réservation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}