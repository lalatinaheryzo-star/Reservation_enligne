// pages/president/MesVoyageursPresident.jsx
import React, { useState } from "react";
import { Search } from "lucide-react";
import { usePresidentContext } from "../../context/PresidentContext";

export default function MesVoyageursPresident({ cooperative }) {
  const { realReservations } = usePresidentContext();
  const [search, setSearch] = useState("");

  // Dérivé des réservations de la coopérative (déjà scopées côté serveur).
  // Le téléphone du voyageur n'est pas encore exposé par /reservations —
  // [À CONFIRMER] si un endpoint dédié est souhaité.
  const travelers = realReservations.map((r) => ({
    id: r.id_reservation || r.id,
    nom: r.client || "—",
    telephone: null,
    voyage: `${r.ville_depart} → ${r.ville_arrivee}`,
    date: r.date_reservation ? new Date(r.date_reservation).toLocaleDateString() : "—",
    siege: r.numero_place,
    statut: r.statut,
  }));

  const filtered = travelers.filter((t) => (t.nom || "").toLowerCase().includes(search.toLowerCase()));

  const statusBadge = (s) => {
    const map = { "Payé": "green", "Validée": "green", "En attente": "amber", "Refusée": "rose", "Annulée": "gray" };
    return <span className={`badge ${map[s] || "gray"}`}>{s}</span>;
  };

  return (
    <div>
      <div className="toolbar">
        <span className="section-title">Mes voyageurs ({filtered.length})</span>
        <div className="search-bar">
          <Search size={15} style={{ color: "#94a3b8" }} />
          <input placeholder="Rechercher un voyageur…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nom</th><th>Téléphone</th><th>Voyage</th><th>Date</th><th>Siège</th><th>Statut</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: 24 }}>Aucun voyageur trouvé</td></tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.nom}</td>
                    <td>{t.telephone || "—"}</td>
                    <td style={{ color: "#64748b", fontSize: ".85rem" }}>{t.voyage}</td>
                    <td>{t.date}</td>
                    <td>Place {t.siege}</td>
                    <td>{statusBadge(t.statut)}</td>
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
