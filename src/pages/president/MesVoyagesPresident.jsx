// pages/president/MesVoyagesPresident.jsx
import React, { useState } from "react";
import { Plus, Search, Pencil, Trash2, Calendar, Clock, X, Printer } from "lucide-react";
import toast from "react-hot-toast";
import { usePresidentContext } from "../../context/PresidentContext";
import { useAppContext } from "../../context/AppContext";

const EMPTY = { depart: "", arrivee: "", date: "", heure: "", vehicule: "Sprinter 18", places: 18, prix: "", statut: "actif", description: "" };

// Ramène un voyage (mock OU réel) vers la même forme locale, pour que le
// reste du composant n'ait pas à connaître la différence de nommage entre
// les deux sources (mock: depart/arrivee/date/heure ; backend: ville_depart/
// ville_arrivee/date_depart/heure_depart/vehicule_nom/capacite).
function normalize(t) {
  return {
    id: t.id_voyage || t.id,
    depart: t.depart ?? t.ville_depart ?? "",
    arrivee: t.arrivee ?? t.ville_arrivee ?? "",
    date: t.date ?? t.date_depart ?? "",
    heure: (t.heure ?? t.heure_depart ?? "").slice(0, 5),
    vehicule: t.vehicule ?? t.vehicule_nom ?? "",
    places: t.places ?? t.capacite ?? 0,
    // Places encore libres (calculées côté backend à partir des places
    // réellement réservées/validées, voir VoyageService.toDto) — absent en
    // mode démo (mock), d'où le fallback null géré plus bas.
    placesDisponibles: t.places_disponibles ?? null,
    prix: t.prix ?? 0,
    statut: t.statut ?? "actif",
    description: t.description ?? "",
  };
}

export default function MesVoyagesPresident({ cooperative, isRealSession, president }) {
  const { travelsByCoop, addTravel, updateTravel, removeTravel, realReservations } = usePresidentContext();
  const { voyages: allVoyages, addVoyage, editVoyage, removeVoyage } = useAppContext();
  const coopId = cooperative?.id;

  const rawTravels = isRealSession
    ? allVoyages.filter((v) => v.cooperative_id === coopId)
    : (travelsByCoop[coopId] || []);
  const travels = rawTravels.map(normalize);

  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (t) => { setEditing(t.id); setForm({ ...EMPTY, ...t }); setModal(true); };
  const closeModal = () => setModal(false);

  // Voyage complet = plus aucune place disponible parmi les places réellement
  // réservées/validées (§6 : on ne compte pas simplement le nombre de
  // réservations créées, on réutilise le calcul déjà fait côté backend).
  // En mode démo (pas de données de places réelles), on retombe sur le champ
  // statut existant pour ne rien casser du prototype.
  const isComplet = (t) => (t.placesDisponibles !== null ? t.placesDisponibles <= 0 : t.statut === "complet");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.depart.trim() || !form.arrivee.trim() || !form.date) return;

    if (isRealSession) {
      const payload = {
        ville_depart: form.depart.trim(),
        ville_arrivee: form.arrivee.trim(),
        date_depart: form.date,
        heure_depart: form.heure,
        vehicule_nom: form.vehicule,
        capacite: Number(form.places) || 18,
        prix: Number(form.prix) || 0,
        statut: form.statut,
      };
      setSaving(true);
      try {
        if (editing) await editVoyage(editing, payload);
        else await addVoyage(payload);
        toast.success(editing ? "Voyage modifié." : "Voyage créé.");
        closeModal();
      } catch (err) {
        toast.error(err.message || "Erreur lors de l'enregistrement du voyage.");
      } finally {
        setSaving(false);
      }
      return;
    }

    const payload = { ...form, places: Number(form.places) || 18, prix: Number(form.prix) || 0 };
    if (editing) updateTravel(coopId, editing, payload);
    else addTravel(coopId, payload);
    closeModal();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce voyage ? Cette action est irréversible.")) return;
    if (isRealSession) {
      try {
        await removeVoyage(id);
        toast.success("Voyage supprimé.");
      } catch (err) {
        toast.error(err.message || "Erreur lors de la suppression.");
      }
      return;
    }
    removeTravel(coopId, id);
  };

  // Liste imprimable des voyageurs d'un voyage complet — réutilise uniquement
  // des données déjà chargées (realReservations, déjà scopées par le backend
  // à la coopérative du Président connecté), aucun nouvel appel réseau.
  const handlePrint = (t) => {
    const passagers = (realReservations || [])
      .filter((r) => (r.voyage_id === t.id) && r.statut === "Validée")
      .sort((a, b) => (a.numero_place || 0) - (b.numero_place || 0));

    const rows = passagers.map((r) => `
      <tr>
        <td>${r.numero_place ?? "-"}</td>
        <td>${r.client || "-"}</td>
        <td>${r.telephone || "-"}</td>
        <td>${r.statut || "-"}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><title>Liste des voyageurs</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #1e293b; padding: 32px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .subtitle { color: #64748b; font-size: 13px; margin-bottom: 20px; }
  .infos { display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 20px; font-size: 13px; }
  .infos div span { display: block; color: #64748b; font-size: 11px; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; font-size: 13px; }
  th { background: #f1f5f9; }
  .footer { margin-top: 24px; font-size: 11px; color: #94a3b8; }
  @media print { body { padding: 0; } }
</style></head>
<body>
  <h1>Liste des voyageurs — ${t.depart} → ${t.arrivee}</h1>
  <div class="subtitle">Voyage complet — contrôle avant départ</div>
  <div class="infos">
    <div><span>Date</span>${t.date || "-"}</div>
    <div><span>Heure de départ</span>${t.heure || "-"}</div>
    <div><span>Coopérative</span>${cooperative?.nom || "-"}</div>
    <div><span>Président</span>${president ? `${president.prenom || ""} ${president.nom || ""}`.trim() : "-"}</div>
    <div><span>Véhicule</span>${t.vehicule || "-"}</div>
    <div><span>Places</span>${passagers.length}/${t.places}</div>
  </div>
  <table>
    <thead><tr><th>Siège</th><th>Voyageur</th><th>Téléphone</th><th>Statut</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="4" style="text-align:center;color:#94a3b8;">Aucun voyageur validé</td></tr>`}</tbody>
  </table>
  <div class="footer">Généré le ${new Date().toLocaleString()}</div>
</body></html>`;

    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) { toast.error("Veuillez autoriser les fenêtres popup pour imprimer."); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  const filtered = travels.filter(
    (t) => t.depart?.toLowerCase().includes(search.toLowerCase()) || t.arrivee?.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (s) => (
    <span className={`badge ${s === "actif" ? "green" : s === "complet" ? "amber" : "gray"}`}>{s}</span>
  );

  return (
    <div>
      <div className="toolbar">
        <span className="section-title">Mes voyages ({filtered.length})</span>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="search-bar">
            <Search size={15} style={{ color: "#94a3b8" }} />
            <input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Nouveau voyage
          </button>
        </div>
      </div>

      <div className="voyages-grid">
        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: "1/-1" }}><p>Aucun voyage pour le moment.</p></div>
        )}
        {filtered.map((t) => (
          <div className="voyage-card" key={t.id}>
            <div className="voyage-card-header">
              <h4>{t.depart} → {t.arrivee}</h4>
              <div className="route">{cooperative?.nom}</div>
              <div className="voyage-price">{Number(t.prix || 0).toLocaleString()} Ar</div>
            </div>
            <div className="voyage-card-body">
              <div className="voyage-meta">
                <span className="voyage-meta-item"><Calendar size={13} />{t.date || "–"}</span>
                <span className="voyage-meta-item"><Clock size={13} />{t.heure || "–"}</span>
              </div>
              <div className="places-info" style={{ marginTop: 8 }}>
                <span>{t.vehicule}</span>
                <span>{t.placesDisponibles !== null ? `${t.places - t.placesDisponibles}/${t.places} places` : `${t.places} places`}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                {statusBadge(t.statut)}
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(t)} title="Modifier">
                    <Pencil size={14} />
                  </button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(t.id)} title="Supprimer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {isRealSession && isComplet(t) && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 700, fontSize: ".78rem", letterSpacing: ".03em", color: "#b45309", marginBottom: 8 }}>
                    VOYAGE COMPLET
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-secondary btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={() => handlePrint(t)}>
                      <Printer size={13} /> Imprimer la liste
                    </button>
                    <button className="btn btn-danger btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={() => handleDelete(t.id)}>
                      <Trash2 size={13} /> Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? "Modifier le voyage" : "Nouveau voyage"}</h3>
              <button className="icon-btn" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Ville de départ *</label>
                    <input required value={form.depart} onChange={(e) => setForm({ ...form, depart: e.target.value })} placeholder="Antananarivo" />
                  </div>
                  <div className="form-group">
                    <label>Destination *</label>
                    <input required value={form.arrivee} onChange={(e) => setForm({ ...form, arrivee: e.target.value })} placeholder="Toamasina" />
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Heure *</label>
                    <input required type="time" value={form.heure} onChange={(e) => setForm({ ...form, heure: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Véhicule</label>
                    <select value={form.vehicule} onChange={(e) => {
                      const cap = e.target.value.includes("26") ? 26 : 18;
                      setForm({ ...form, vehicule: e.target.value, places: cap });
                    }}>
                      <option value="Sprinter 18">Sprinter 18 places</option>
                      <option value="Minibus 26">Minibus 26 places</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nombre de places</label>
                    <input type="number" min="1" value={form.places} onChange={(e) => setForm({ ...form, places: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Prix (Ar) *</label>
                    <input required type="number" min="0" value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} placeholder="25000" />
                  </div>
                  <div className="form-group">
                    <label>Statut</label>
                    <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>
                      <option value="actif">Actif</option>
                      <option value="complet">Complet</option>
                      <option value="annulé">Annulé</option>
                    </select>
                  </div>
                  {!isRealSession && (
                    <div className="form-group" style={{ gridColumn: "1/-1" }}>
                      <label>Description</label>
                      <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Informations complémentaires sur ce voyage…" />
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Enregistrement…" : editing ? "Enregistrer" : "Créer le voyage"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

