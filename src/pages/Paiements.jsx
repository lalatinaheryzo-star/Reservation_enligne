// pages/Paiements.jsx — connecté à l'API Supabase via AppContext
import React, { useState } from "react";
import { Plus, Search, X, CreditCard, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const STATUS_COLORS = { "Réussi": "green", "Échoué": "rose", "En attente": "amber" };

function formatDate(val) {
  if (!val) return "–";
  if (typeof val === "string") return new Date(val).toLocaleDateString("fr-FR");
  if (val?.toDate) return val.toDate().toLocaleDateString("fr-FR");
  return "–";
}

export default function Paiements() {
  const { paiements, reservations, addPaiement, removePaiement } = useAppContext();

  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm]     = useState({ reservation_id: "", montant: "", mode_paiement: "Mvola", statut: "Réussi" });

  const resas = reservations.filter((r) => r.statut === "En attente" || r.statut === "Validée");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addPaiement({
        reservation_id: form.reservation_id,
        montant: Number(form.montant),
        mode_paiement: form.mode_paiement,
        statut: form.statut,
      });
      toast.success(form.statut === "Réussi" ? "Paiement enregistré — reçu généré !" : "Paiement enregistré.");
      setModal(false);
      setForm({ reservation_id: "", montant: "", mode_paiement: "Mvola", statut: "Réussi" });
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm("Supprimer définitivement ce paiement ? Le reçu associé sera aussi supprimé.")) return;
    try {
      await removePaiement(p.id);
      toast.success("Paiement supprimé.");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la suppression.");
    }
  };

  const filtered = paiements.filter((p) =>
    (p.id || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.mode_paiement || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="toolbar">
        <span className="section-title">Paiements ({filtered.length})</span>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="search-bar">
            <Search size={15} style={{ color: "#94a3b8" }} />
            <input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> Nouveau paiement</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Référence</th><th>Réservation</th><th>Montant</th><th>Mode</th><th>Date</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>Aucun paiement</td></tr>}
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td><code style={{ fontSize: ".75rem", color: "#64748b" }}>{(p.id || "").slice(0, 10)}…</code></td>
                  <td style={{ color: "#64748b", fontSize: ".82rem" }}>{(p.reservation_id || "–").slice(0, 8)}</td>
                  <td><strong style={{ color: "#10B981" }}>{Number(p.montant || 0).toLocaleString()} Ar</strong></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <CreditCard size={13} style={{ color: "#64748b" }} />
                      <span style={{ fontSize: ".82rem" }}>{p.mode_paiement}</span>
                    </div>
                  </td>
                  <td style={{ color: "#64748b", fontSize: ".82rem" }}>{formatDate(p.date_paiement)}</td>
                  <td><span className={`badge ${STATUS_COLORS[p.statut] || "gray"}`}>{p.statut}</span></td>
                  <td>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(p)} title="Supprimer">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Nouveau paiement</h3>
              <button className="icon-btn" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="form-group">
                    <label>Réservation *</label>
                    <select required value={form.reservation_id} onChange={(e) => setForm({ ...form, reservation_id: e.target.value })}>
                      <option value="">-- Choisir une réservation --</option>
                      {resas.map((r) => (
                        <option key={r.id} value={r.id}>#{(r.id || "").slice(0, 12)} — {r.client || r.utilisateur_id?.slice(0, 8)} — {r.statut}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Montant (Ar) *</label>
                      <input required type="number" min="0" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} placeholder="15000" />
                    </div>
                    <div className="form-group">
                      <label>Mode de paiement</label>
                      <select value={form.mode_paiement} onChange={(e) => setForm({ ...form, mode_paiement: e.target.value })}>
                        <option>Mvola</option>
                        <option>Orange Money</option>
                        <option>Airtel Money</option>
                        <option>Espèces</option>
                        <option>Virement</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Statut</label>
                      <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>
                        <option>Réussi</option>
                        <option>Échoué</option>
                        <option>En attente</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}