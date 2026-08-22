// pages/AdminPresidents.jsx
// ============================================================
//  Admin — Gestion des présidents. Branché sur le vrai backend :
//  GET /utilisateurs (liste tous les comptes, filtrée ici sur
//  role === "president") + GET /cooperatives (pour afficher le nom
//  de la coopérative de chacun, si déjà créée). Un compte devient
//  Président dès que l'Admin approuve sa demande de création de
//  coopérative (voir DemandeCooperativeService.approve() côté
//  backend) — il apparaît donc ici automatiquement, même s'il n'a
//  pas encore créé sa coopérative.
// ============================================================
import React, { useState, useEffect, useCallback } from "react";
import { Search, Building2, Phone, Mail, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { getUtilisateurs, getCooperatives } from "../api/services";

export default function AdminPresidents() {
  const [presidents, setPresidents] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [users, coops] = await Promise.all([getUtilisateurs(), getCooperatives()]);
      const coopByPresidentId = new Map(
        (coops || []).map((c) => [c.presidentId || c.president_id, c])
      );
      const list = (users || [])
        .filter((u) => u.role === "president")
        .map((u) => ({
          id: u.id,
          nom: u.nom,
          prenom: u.prenom,
          email: u.email,
          telephone: u.telephone,
          dateCreation: u.date_creation,
          cooperativeNom: coopByPresidentId.get(u.id)?.nom || null,
        }));
      setPresidents(list);
    } catch (err) {
      toast.error(err.message || "Impossible de charger les présidents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = presidents.filter(
    (p) => `${p.prenom} ${p.nom}`.toLowerCase().includes(search.toLowerCase())
        || (p.cooperativeNom || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="toolbar">
        <span className="section-title">Présidents ({filtered.length})</span>
        <div style={{ display: "flex", gap: 8 }}>
          <div className="search-bar">
            <Search size={15} style={{ color: "#94a3b8" }} />
            <input placeholder="Rechercher un président ou une coopérative…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={refresh} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={13} /> Actualiser
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nom</th><th>Email</th><th>Téléphone</th><th>Coopérative</th><th>Statut</th><th>Créé le</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: 24 }}>Chargement…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: 24 }}>Aucun président trouvé</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.prenom} {p.nom}</td>
                    <td><span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".82rem", color: "#64748b" }}><Mail size={13} />{p.email}</span></td>
                    <td><span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".82rem", color: "#64748b" }}><Phone size={13} />{p.telephone}</span></td>
                    <td>
                      {p.cooperativeNom ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Building2 size={13} />{p.cooperativeNom}</span>
                      ) : (
                        <span style={{ fontSize: ".78rem", color: "#94a3b8" }}>Pas encore créée</span>
                      )}
                    </td>
                    <td><span className="badge green">Compte actif</span></td>
                    <td style={{ fontSize: ".82rem", color: "#64748b" }}>
                      {p.dateCreation ? new Date(p.dateCreation).toLocaleDateString() : "–"}
                    </td>
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
