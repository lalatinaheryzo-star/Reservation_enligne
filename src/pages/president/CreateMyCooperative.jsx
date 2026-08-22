// pages/president/CreateMyCooperative.jsx
// ============================================================
//  Affiché uniquement quand un compte PRESIDENT vient d'être approuvé
//  par l'Admin mais n'a pas encore créé sa coopérative (§ workflow :
//  "l'admin autorise, le Président crée sa coopérative lui-même").
// ============================================================
import React, { useState } from "react";
import { Building2, Phone, MapPin, Send } from "lucide-react";
import toast from "react-hot-toast";
import { usePresidentContext } from "../../context/PresidentContext";

const EMPTY = { nom: "", telephone: "", adresse: "" };

export default function CreateMyCooperative({ user }) {
  const { createMyCooperativeReal } = usePresidentContext();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom.trim()) { toast.error("Le nom de la coopérative est obligatoire."); return; }
    setSaving(true);
    try {
      await createMyCooperativeReal({
        nom: form.nom.trim(),
        telephone: form.telephone.trim(),
        adresse: form.adresse.trim(),
      });
    } catch (err) {
      toast.error(err.message || "Erreur lors de la création de la coopérative.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto" }}>
      <div className="card card-body" style={{ textAlign: "center", marginBottom: 20 }}>
        <Building2 size={36} style={{ color: "var(--accent)", marginBottom: 10 }} />
        <h2 style={{ fontSize: "1.15rem", marginBottom: 6 }}>Bienvenue, {user?.prenom} !</h2>
        <p className="text-muted" style={{ fontSize: ".88rem" }}>
          Votre demande a été approuvée par l'administrateur. Il ne vous reste
          qu'une étape : créer votre coopérative pour accéder à votre espace de gestion.
        </p>
      </div>

      <form className="card card-body" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="form-group">
          <label>Nom de la coopérative <span className="req">*</span></label>
          <div className="input-icon-wrap">
            <Building2 size={14} className="icon" />
            <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label>Téléphone</label>
          <div className="input-icon-wrap">
            <Phone size={14} className="icon" />
            <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label>Adresse</label>
          <div className="input-icon-wrap">
            <MapPin size={14} className="icon" />
            <input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ justifyContent: "center", marginTop: 6 }}>
          <Send size={14} /> {saving ? "Création…" : "Créer ma coopérative"}
        </button>
      </form>
    </div>
  );
}
