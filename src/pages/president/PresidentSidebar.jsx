// pages/president/PresidentSidebar.jsx
// ============================================================
//  Sidebar de l'espace Président — réutilise le style existant
//  (.sidebar, .nav-item, etc.), alimentée par le vrai utilisateur
//  connecté (prop `user`, issu de la session JWT).
// ============================================================
import React from "react";
import reservationLogo from "../../assets/images/reservation-logo-madagascar.png";
import {
  LayoutDashboard, Building2, Bus, ClipboardList,
  CreditCard, Users, LogOut, X,
} from "lucide-react";

const NAV = [
  { key: "dashboard",     label: "Tableau de bord",  Icon: LayoutDashboard },
  { key: "cooperative",   label: "Ma coopérative",   Icon: Building2 },
  { key: "voyages",       label: "Mes voyages",      Icon: Bus },
  { key: "reservations",  label: "Mes réservations", Icon: ClipboardList },
  { key: "paiements",     label: "Mes paiements",    Icon: CreditCard },
  { key: "voyageurs",     label: "Mes voyageurs",    Icon: Users },
];

export default function PresidentSidebar({ active, onChange, user, cooperativeNom, mobileOpen = false, onClose = () => {}, onLogout }) {
  const handleNavClick = (key) => { onChange(key); onClose(); };

  return (
    <>
      <div className={`sidebar-overlay ${mobileOpen ? "open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`} style={{ background: "linear-gradient(180deg,#062A22 0%,#0B4A3A 60%,#0D5C46 130%)" }}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <img src={reservationLogo} alt="Réservation en ligne" className="brand-logo-image brand-logo-image--sidebar" />
            <div>
              <h2>Réservation en ligne</h2>
              <p>{cooperativeNom || "Espace Président"}</p>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Fermer le menu">
            <X size={16} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Espace Président</div>
          {NAV.map(({ key, label, Icon }) => (
            <div
              key={key}
              className={`nav-item ${active === key ? "active" : ""}`}
              onClick={() => handleNavClick(key)}
            >
              <Icon className="nav-icon" size={18} />
              {label}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={onLogout} title="Se déconnecter">
            <div className="avatar">{user?.prenom?.[0]?.toUpperCase() || "P"}</div>
            <div className="sidebar-user-info">
              <p>{user ? `${user.prenom} ${user.nom}` : "Président"}</p>
              <span>{user?.email || ""}</span>
            </div>
            <LogOut size={15} style={{ color: "rgba(255,255,255,.4)", marginLeft: "auto" }} />
          </div>
        </div>
      </aside>
    </>
  );
}
