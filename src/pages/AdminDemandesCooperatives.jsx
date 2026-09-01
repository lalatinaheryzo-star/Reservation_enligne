// pages/AdminDemandesCooperatives.jsx
// ============================================================
//  Admin — Demandes de création de coopératives.
//  Branché sur le vrai backend : GET /demandes-cooperatives,
//  PATCH /demandes-cooperatives/{id}/approve|reject.
//  L'approbation crée réellement la coopérative en base et fait
//  passer le compte candidat en rôle PRESIDENT (voir
//  DemandeCooperativeService côté backend).
// ============================================================
import React, { useState, useEffect, useCallback } from "react";
import { Eye, Check, X as XIcon, Building2, Phone, Mail, MapPin, RefreshCw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  getDemandesCooperatives,
  approveDemandeCooperative,
  rejectDemandeCooperative,
  deleteDemandeCooperative,
} from "../api/services";

const STATUT_LABEL = { PENDING: "En attente", APPROUVEE: "Approuvée", REJETEE: "Refusée" };
const STATUT_BADGE  = { PENDING: "amber", APPROUVEE: "green", REJETEE: "rose" };

export default function AdminDemandesCooperatives() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [viewing, setViewing] = useState(null);
const [confirming, setConfirming] = useState(null); // { id, action: "approve" | "reject" }
  const [deleting, setDeleting] = useState(null); // demande à supprimer (objet complet, pour afficher son nom)
  const [motif, setMotif] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDemandesCooperatives();
      setRequests(data || []);
    } catch (err) {
      toast.error(err.message || "Impossible de charger les demandes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const pendingCount = requests.filter((r) => r.statut === "PENDING").length;

  const handleConfirm = async () => {
    if (!confirming) return;
    setSaving(true);
    try {
      if (confirming.action === "approve") {
        await approveDemandeCooperative(confirming.id);
        toast.success("Coopérative créée et compte Président activé !");
      } else {
        await rejectDemandeCooperative(confirming.id, motif);
        toast.success("Demande refusée.");
      }
      setConfirming(null);
      setMotif("");
      refresh();
    } catch (err) {
      toast.error(err.message || "Erreur lors du traitement de la demande.");
    } finally {
      setSaving(false);
    }
  };

const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await deleteDemandeCooperative(deleting.id);
      toast.success("Demande supprimée.");
      setDeleting(null);
      refresh();
    } catch (err) {
      toast.error(err.message || "Erreur lors de la suppression.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <span className="section-title">Demandes de création de coopératives ({pendingCount} en attente)</span>
        <button className="btn btn-secondary btn-sm" onClick={refresh} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <RefreshCw size={13} /> Actualiser
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Candidat</th><th>Coopérative</th><th>Ville</th><th>Date</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: 24 }}>Chargement…</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: 24 }}>Aucune demande</td></tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.nom_president}</td>
                    <td>{r.nom_cooperative}</td>
                    <td style={{ fontSize: ".82rem", color: "#64748b" }}>{r.ville || "–"}</td>
                    <td style={{ fontSize: ".82rem", color: "#64748b" }}>
                      {r.date_creation ? new Date(r.date_creation).toLocaleDateString() : "–"}
                    </td>
                    <td><span className={`badge ${STATUT_BADGE[r.statut]}`}>{STATUT_LABEL[r.statut]}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-secondary btn-sm btn-icon" title="Voir" onClick={() => setViewing(r)}>
                          <Eye size={14} />
                        </button>
                  {r.statut === "PENDING" && (
                          <>
                            <button className="btn btn-primary btn-sm btn-icon" title="Valider" onClick={() => setConfirming({ id: r.id, action: "approve" })}>
                              <Check size={14} />
                            </button>
                            <button className="btn btn-danger btn-sm btn-icon" title="Refuser" onClick={() => setConfirming({ id: r.id, action: "reject" })}>
                              <XIcon size={14} />
                            </button>
                          </>
                        )}
                        <button className="btn btn-danger btn-sm btn-icon" title="Supprimer" onClick={() => setDeleting(r)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal "Voir la demande" */}
      {viewing && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setViewing(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Détail de la demande</h3>
              <button className="icon-btn" onClick={() => setViewing(null)}><XIcon size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div><strong>Candidat :</strong> {viewing.nom_president}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Building2 size={14} color="var(--muted)" /> {viewing.nom_cooperative}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone size={14} color="var(--muted)" /> {viewing.telephone}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Mail size={14} color="var(--muted)" /> {viewing.email}</div>
                {viewing.adresse && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><MapPin size={14} color="var(--muted)" /> {viewing.adresse}{viewing.ville ? `, ${viewing.ville}` : ""}</div>
                )}
                {viewing.cin && <div><strong>CIN :</strong> {viewing.cin}</div>}
                {viewing.message && (
                  <>
                    <div className="divider" />
                    <p className="text-muted">{viewing.message}</p>
                  </>
                )}
                {viewing.statut === "REJETEE" && viewing.motif_rejet && (
                  <div style={{ background: "#fff1f2", border: "1px solid #fda4af", borderRadius: 8, padding: "8px 12px", fontSize: ".82rem", color: "#9f1239" }}>
                    Motif du refus : {viewing.motif_rejet}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewing(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation validation/refus */}
      {confirming && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setConfirming(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3>{confirming.action === "approve" ? "Valider cette demande ?" : "Refuser cette demande ?"}</h3>
              <button className="icon-btn" onClick={() => setConfirming(null)}><XIcon size={18} /></button>
            </div>
            <div className="modal-body">
              <p className="text-muted">
                {confirming.action === "approve"
                  ? "La coopérative sera créée immédiatement et le candidat pourra se connecter à son espace Président."
                  : "Le candidat pourra déposer une nouvelle demande après ce refus."}
              </p>
              {confirming.action === "reject" && (
                <div className="form-group" style={{ marginTop: 12 }}>
                  <label>Motif du refus (optionnel)</label>
                  <textarea rows={3} value={motif} onChange={(e) => setMotif(e.target.value)} />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirming(null)}>Annuler</button>
              <button className={`btn ${confirming.action === "approve" ? "btn-primary" : "btn-danger"}`} onClick={handleConfirm} disabled={saving}>
                {saving ? "Traitement…" : confirming.action === "approve" ? "Valider" : "Refuser"}
              </button>
            </div>
          </div>
        </div>
      )}
{/* Modal de confirmation de suppression */}
      {deleting && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleting(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3>Supprimer cette demande ?</h3>
              <button className="icon-btn" onClick={() => setDeleting(null)}><XIcon size={18} /></button>
            </div>
            <div className="modal-body">
              <p className="text-muted">
                La demande de <strong>{deleting.nom_president}</strong> ({deleting.nom_cooperative}) sera supprimée
                définitivement. Cette action ne peut pas être annulée.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleting(null)}>Annuler</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
