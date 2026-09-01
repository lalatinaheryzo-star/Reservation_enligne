// pages/Utilisateurs.jsx — connecté à l'API Supabase via AppContext
import React, { useState } from "react";
import { Plus, Search, Pencil, Trash2, X, UserCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const EMPTY = { nom: "", prenom: "", email: "", telephone: "", mot_de_passe: "" };

export default function Utilisateurs() {
  const { utilisateurs, addUtilisateur, editUtilisateur, removeUtilisateur } = useAppContext();

  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (u) => { setEditing(u.id); setForm({ nom: u.nom || "", prenom: u.prenom || "", email: u.email || "", telephone: u.telephone || "", mot_de_passe: "" }); setModal(true); };
  const closeModal = () => { setModal(false); setSaving(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const payload = { nom: form.nom, prenom: form.prenom, email: form.email, telephone: form.telephone || null };
        if (form.mot_de_passe) payload.password = form.mot_de_passe;
        await editUtilisateur(editing, payload);
        toast.success("Utilisateur modifié.");
      } else {
        await addUtilisateur({
          nom: form.nom, prenom: form.prenom, email: form.email,
          telephone: form.telephone || null, password: form.mot_de_passe,
        });
        toast.success("Utilisateur ajouté.");
      }
      closeModal();
    } catch (err) {
      toast.error(err.message || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await removeUtilisateur(id);
      toast.success("Supprimé.");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la suppression.");
    }
  };

  const filtered = utilisateurs.filter((u) =>
    `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="toolbar">
        <span className="section-title">Utilisateurs ({filtered.length})</span>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="search-bar">
            <Search size={15} style={{ color: "#94a3b8" }} />
            <input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Nouveau</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nom</th><th>Email</th><th>Téléphone</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>Aucun utilisateur</td></tr>}
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", fontWeight: 700, fontSize: ".8rem" }}>
                        {u.nom?.[0]?.toUpperCase() || "?"}
                      </div>
                      <span style={{ fontWeight: 500 }}>{u.nom} {u.prenom}</span>
                    </div>
                  </td>
                  <td style={{ color: "#64748b" }}>{u.email}</td>
                  <td style={{ color: "#64748b" }}>{u.telephone || "–"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(u)}><Pencil size={14} /></button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(u.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? "Modifier utilisateur" : "Nouvel utilisateur"}</h3>
              <button className="icon-btn" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  {[
                    { f: "nom",          l: "Nom *",         t: "text",     r: true },
                    { f: "prenom",       l: "Prénom *",      t: "text",     r: true },
                    { f: "email",        l: "Email *",       t: "email",    r: true },
                    { f: "telephone",    l: "Téléphone",     t: "text",     r: false },
                    { f: "mot_de_passe", l: editing ? "Mot de passe (laisser vide pour ne pas changer)" : "Mot de passe *", t: "password", r: !editing },
                  ].map(({ f, l, t, r }) => (
                    <div className="form-group" key={f}>
                      <label>{l}</label>
                      <input required={r} type={t} value={form[f] || ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Enregistrement…" : editing ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
