import React, { useState } from "react";
import { Building2, Phone, Mail, MapPin, Pencil, X, Bell } from "lucide-react";
import { usePresidentContext } from "../../context/PresidentContext";

export default function MaCooperative({ cooperative }) {
  const { updateMyCooperativeReal } = usePresidentContext();
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(cooperative || {});
  // ── Rappel de voyage (WhatsApp) — configuration ──
  const [rappelActif, setRappelActif] = useState(!!(cooperative?.rappelActif ?? cooperative?.rappel_actif));
  const [rappelDelai, setRappelDelai] = useState(cooperative?.rappelDelaiMinutes ?? cooperative?.rappel_delai_minutes ?? 30);
  const [savingRappel, setSavingRappel] = useState(false);

  if (!cooperative) return <p className="text-muted">Aucune coopérative associée à ce compte.</p>;

  const openEdit = () => { setForm(cooperative); setModal(true); };

  const handleSaveRappel = async (e) => {
    e.preventDefault();
    setSavingRappel(true);
    try {
      await updateMyCooperativeReal(cooperative.id, {
        nom: cooperative.nom, telephone: cooperative.telephone, adresse: cooperative.adresse,
        rappelActif, rappelDelaiMinutes: Number(rappelDelai),
      });
    } finally {
      setSavingRappel(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Le backend ne persiste que nom / telephone / adresse pour l'instant
    // (voir CooperativeRequest côté serveur) — email/description restent
    // des champs d'affichage locaux, [À CONFIRMER] si à ajouter au schéma.
    setSaving(true);
    try {
      await updateMyCooperativeReal(cooperative.id, {
        nom: form.nom, telephone: form.telephone, adresse: form.adresse,
      });
      setModal(false);
    } catch (err) {
      // le toast d'erreur est déjà géré au niveau de l'appel API (apiClient)
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-body" style={{ display: "flex", gap: 22, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{
            width: 68, height: 68, borderRadius: 16, background: "var(--grad-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: "1.3rem", flexShrink: 0,
          }}>
            {cooperative.initiales || cooperative.nom?.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "1.2rem", color: "var(--navy)" }}>{cooperative.nom}</h2>
              <span className="badge green">Active</span>
            </div>
            <p className="text-muted" style={{ marginBottom: 16, maxWidth: 560 }}>{cooperative.description}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cooperative.president && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".86rem", color: "var(--navy)" }}>
                  <Building2 size={14} color="var(--muted)" /> Président : <strong>{cooperative.president}</strong>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".86rem", color: "var(--navy)" }}>
                <Phone size={14} color="var(--muted)" /> {cooperative.telephone}
              </div>
              {cooperative.email && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".86rem", color: "var(--navy)" }}>
                  <Mail size={14} color="var(--muted)" /> {cooperative.email}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".86rem", color: "var(--navy)" }}>
                <MapPin size={14} color="var(--muted)" /> {cooperative.adresse}
              </div>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={openEdit}>
            <Pencil size={14} /> Modifier les informations
          </button>
        </div>
      </div>

      {/* ── Rappel de voyage par WhatsApp ── */}
      <div className="card" style={{ marginTop: 18, maxWidth: 460 }}>
        <div className="card-body">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Bell size={18} color="var(--muted)" />
            <h3 style={{ fontSize: "1rem", color: "var(--navy)" }}>Rappel avant départ</h3>
          </div>
          <p className="text-muted" style={{ fontSize: ".82rem", marginBottom: 16 }}>
            Envoie automatiquement un message WhatsApp au voyageur avant le départ de son voyage.
          </p>
          <form onSubmit={handleSaveRappel} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".88rem", color: "var(--navy)" }}>
              <input type="checkbox" checked={rappelActif} onChange={(e) => setRappelActif(e.target.checked)} />
              Envoyer un rappel au client
            </label>
            <div className="form-group" style={{ maxWidth: 220 }}>
              <label>Délai avant départ</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number" min={1} max={1440} step={1}
                  value={rappelDelai}
                  disabled={!rappelActif}
                  onChange={(e) => setRappelDelai(e.target.value)}
                  style={{ width: 90 }}
                />
                <span className="text-muted" style={{ fontSize: ".84rem" }}>minutes</span>
              </div>
            </div>
            <div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={savingRappel}>
                {savingRappel ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Modifier les informations</h3>
              <button className="icon-btn" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nom de la coopérative *</label>
                    <input required value={form.nom || ""} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input value={form.telephone || ""} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Adresse</label>
                    <input value={form.adresse || ""} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1/-1" }}>
                    <label>Description</label>
                    <textarea rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
