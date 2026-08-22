// pages/Recus.jsx — connecté à l'API Supabase via AppContext
import React, { useState } from "react";
import { Receipt, Search } from "lucide-react";
import { useAppContext } from "../context/AppContext";

function formatDate(val) {
  if (!val) return "–";
  if (typeof val === "string") return new Date(val).toLocaleString("fr-FR");
  if (val?.toDate) return val.toDate().toLocaleString("fr-FR");
  return "–";
}

export default function Recus() {
  const { recus } = useAppContext();
  const [search, setSearch] = useState("");

  const filtered = recus.filter((r) =>
    (r.numero_recu || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="toolbar">
        <span className="section-title">Reçus ({filtered.length})</span>
        <div className="search-bar">
          <Search size={15} style={{ color: "#94a3b8" }} />
          <input placeholder="N° reçu…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Numéro reçu</th><th>Paiement</th><th>Date de génération</th></tr></thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>Aucun reçu</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 7, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Receipt size={14} color="#16a34a" />
                      </div>
                      <code style={{ fontWeight: 600, color: "#0f1f3d" }}>{r.numero_recu}</code>
                    </div>
                  </td>
                  <td style={{ color: "#64748b", fontSize: ".82rem" }}>{(r.paiement_id || "–").slice(0, 12)}</td>
                  <td style={{ color: "#64748b", fontSize: ".82rem" }}>{formatDate(r.date_generation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
