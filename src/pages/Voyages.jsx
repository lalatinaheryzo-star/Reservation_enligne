// pages/Voyages.jsx — connecté à l'API Supabase via AppContext
// LECTURE SEULE pour l'ADMIN : la création/modification/suppression de
// voyages est désormais réservée au Président de la coopérative
// concernée (voir SecurityConfig côté backend, §4/§7 de la spec
// "Évolution du projet"). L'admin garde ici une vue de supervision.
import React, { useState } from "react";
import { Search, Calendar, Clock, MapPin } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function Voyages() {
  const { voyages, voyagesLoading, cooperatives } = useAppContext();

  const [search, setSearch] = useState("");

  const filtered = voyages.filter(
    (v) =>
      v.ville_depart?.toLowerCase().includes(search.toLowerCase()) ||
      v.ville_arrivee?.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (s) => (
    <span className={`badge ${s === "actif" ? "green" : s === "complet" ? "amber" : "gray"}`}>
      {s}
    </span>
  );

  if (voyagesLoading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Chargement des voyages…</div>;
  }

  return (
    <div>
      <div className="toolbar">
        <span className="section-title">Voyages ({filtered.length}) — supervision (lecture seule)</span>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="search-bar">
            <Search size={15} style={{ color: "#94a3b8" }} />
            <input
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="voyages-grid">
        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: "1/-1" }}>
            <p>Aucun voyage trouvé</p>
          </div>
        )}
        {filtered.map((v) => {
          const placesDisponibles = Number(v.places_disponibles) || 0;
          const placesTotal = Number(v.places_total) || Number(v.capacite) || 0;
          const pct = placesTotal > 0 ? ((placesTotal - placesDisponibles) / placesTotal) * 100 : 0;
          const coop = cooperatives.find((c) => c.id === v.cooperative_id);
          return (
            <div className="voyage-card" key={v.id}>
              <div className="voyage-card-header">
                <h4>{v.ville_depart} → {v.ville_arrivee}</h4>
                <div className="route">{coop?.nom || v.cooperative_nom || "Coopérative inconnue"}</div>
                <div className="voyage-price">{Number(v.prix || 0).toLocaleString()} Ar</div>
              </div>
              <div className="voyage-card-body">
                <div className="voyage-meta">
                  <span className="voyage-meta-item"><Calendar size={13} />{v.date_depart || "–"}</span>
                  <span className="voyage-meta-item"><Clock size={13} />{v.heure_depart || "–"}</span>
                  <span className="voyage-meta-item"><MapPin size={13} />{v.ville_depart}</span>
                </div>
                <div className="places-bar">
                  <div className="places-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="places-info">
                  <span>{placesDisponibles} places disponibles</span>
                  <span>{placesTotal} total</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                  {statusBadge(v.statut)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
