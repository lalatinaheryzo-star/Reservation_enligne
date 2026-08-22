// pages/Cooperatives.jsx — connecté à l'API Supabase via AppContext
// Consultation + suppression uniquement pour l'ADMIN (supervision, §1/§8 de
// la spec) : la création se fait désormais exclusivement via l'approbation
// d'une DemandeCooperative, et la modification des informations est réservée
// au Président propriétaire (backend : PUT /cooperatives/{id} -> PRESIDENT).
import React, { useState } from "react";
import { Search, Trash2, Building2, Phone, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

export default function Cooperatives() {
  const { cooperatives, removeCooperative } = useAppContext();

  const [search, setSearch] = useState("");

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette coopérative ?")) return;
    try {
      await removeCooperative(id);
      toast.success("Coopérative supprimée.");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la suppression.");
    }
  };

  const filtered = cooperatives.filter((c) =>
    c.nom?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="toolbar">
        <span className="section-title">Coopératives ({filtered.length}) — supervision</span>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="search-bar">
            <Search size={15} style={{ color: "#94a3b8" }} />
            <input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 16 }}>
        {filtered.map((c) => (
          <div key={c.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg,#1A3260,#0F1F3D)", padding: "18px 18px 14px" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(16,185,129,.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <Building2 size={22} color="#10B981" />
              </div>
              <div style={{ color: "white", fontWeight: 700, fontSize: "1rem", fontFamily: "var(--font-display)" }}>{c.nom}</div>
            </div>
            <div style={{ padding: "14px 18px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                {c.adresse && (
                  <span style={{ fontSize: ".8rem", color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
                    <MapPin size={12} /> {c.adresse}
                  </span>
                )}
                {c.telephone && (
                  <span style={{ fontSize: ".8rem", color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
                    <Phone size={12} /> {c.telephone}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)} style={{ flex: 1, justifyContent: "center" }}>
                  <Trash2 size={13} /> Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: "1/-1" }}>
            <p>Aucune coopérative</p>
          </div>
        )}
      </div>

    </div>
  );
}
