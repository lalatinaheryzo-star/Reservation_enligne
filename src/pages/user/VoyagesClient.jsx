// pages/user/VoyagesClient.jsx — lit depuis AppContext (backend)
import React, { useState } from "react";
import { Bus, Clock, MapPin, ArrowRight, Search, Phone, Mail, X, Building2 } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

export default function VoyagesClient({ onSelectVoyage }) {
  const { voyages, cooperatives, loading } = useAppContext();
  const [search, setSearch] = useState("");
  const [contactCoop, setContactCoop] = useState(null);

  const filtered = voyages.filter((v) => {
    const q = search.toLowerCase();
    const statut = (v.statut || "").toLowerCase();
    return (
      statut === "actif" &&
      (
        (v.ville_depart  || "").toLowerCase().includes(q) ||
        (v.ville_arrivee || "").toLowerCase().includes(q)
      )
    );
  });
const openContact = (e, v) => {
    e.stopPropagation();
    const coopId  = v.cooperative_id;
    const coopNom = v.cooperative_nom || v.cooperative?.nom || "Coopérative";
    // Coordonnées réelles : recherchées dans la liste des coopératives
    // chargée depuis le backend (GET /cooperatives, déjà en contexte),
    // par id (fiable) puis par nom (repli).
    const found = (cooperatives || []).find(
      (c) => (c.id_cooperative || c.id) === coopId
          || (c.nom || "").toLowerCase() === coopNom.toLowerCase()
    );
    setContactCoop(
      found
        ? { nom: found.nom, telephone: found.telephone, adresse: found.adresse }
        : { nom: coopNom, telephone: null, adresse: null }
    );
  };

  if (loading) return (
    <div style={{ padding:40, textAlign:"center", color:"#64748b" }}>
      <Bus size={32} style={{ opacity:.2, display:"block", margin:"0 auto 12px" }} />
      Chargement des voyages…
    </div>
  );
  return (
    <div>
      <div className="toolbar">
        <div>
          <h2 className="section-title">Voyages disponibles</h2>
          <p className="text-muted" style={{ marginTop:4 }}>Choisissez votre trajet et réservez votre siège</p>
        </div>
        <div className="search-bar">
          <Search size={15} style={{ color:"var(--muted)" }} />
          <input placeholder="Rechercher une destination…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state card card-body" style={{ textAlign:"center", padding:56 }}>
          <Bus size={48} style={{ opacity:.2, display:"block", margin:"0 auto 12px" }} />
          <p>Aucun voyage disponible{search ? " pour cette recherche" : ""}.</p>
        </div>
      ) : (
        <div className="voyages-grid">
          {filtered.map((v) => {
            const id = v.id_voyage || v.id;
            const heureAff = (v.heure_depart || "").slice(0, 5);
            const coopNom  = v.cooperative_nom || v.cooperative?.nom || "Coopérative";
            return (
              <div key={id} className="voyage-card" onClick={() => onSelectVoyage(v)} style={{ cursor:"pointer" }}>
                <div className="voyage-card-header">
                  <h4>{v.ville_depart} → {v.ville_arrivee}</h4>
                  <div className="route">{coopNom}</div>
                  <div className="voyage-price">{Number(v.prix).toLocaleString()} Ar</div>
                </div>
                <div className="voyage-card-body">
                  <div className="voyage-meta">
                    <span className="voyage-meta-item"><MapPin size={13} />{v.ville_depart}</span>
                    <span className="voyage-meta-item"><Clock size={13} />{heureAff}</span>
                    <span className="voyage-meta-item"><Bus size={13} />{v.date_depart}</span>
                  </div>
                  <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center", marginTop:12 }}>
                    Réserver <ArrowRight size={14} />
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ width:"100%", justifyContent:"center", marginTop:8 }}
                    onClick={(e) => openContact(e, v)}
                  >
                    <Building2 size={14} /> Contacter la coopérative
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {contactCoop && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setContactCoop(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>Contacter la coopérative</h3>
              <button className="icon-btn" onClick={() => setContactCoop(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Building2 size={15} color="var(--muted)" />
                  <strong>{contactCoop.nom}</strong>
                </div>
               {contactCoop.president && (
                  <div style={{ fontSize:".86rem", color:"var(--navy)" }}>Président : {contactCoop.president}</div>
                )}
                {contactCoop.adresse && (
                  <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:".86rem" }}>
                    <MapPin size={14} color="var(--muted)" /> {contactCoop.adresse}
                  </div>
                )}
                {contactCoop.telephone ? (
                  <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:".86rem" }}>
                    <Phone size={14} color="var(--muted)" /> {contactCoop.telephone}
                  </div>
                ) : (
                  <p className="text-muted" style={{ fontSize:".82rem" }}>
                    Coordonnées non renseignées pour cette coopérative.
                  </p>
                )}
                {contactCoop.email && (
                  <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:".86rem" }}>
                    <Mail size={14} color="var(--muted)" /> {contactCoop.email}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setContactCoop(null)}>Fermer</button>
              {contactCoop.telephone && (
                <a className="btn btn-primary" href={`tel:${contactCoop.telephone.replace(/[^\d+]/g, "")}`}>
                  <Phone size={14} /> Appeler
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

