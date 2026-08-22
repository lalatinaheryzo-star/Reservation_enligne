// components/Sidebar.jsx
import React from "react";
import {
  LayoutDashboard, Bus, Users, ClipboardList,
  CreditCard, Receipt, Bell, Building2, LogOut, MapPin, X, UserCog, FileClock
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import reservationLogo from "../assets/images/reservation-logo-madagascar.png";

const NAV = [
  {
    section: "Général",
    items: [
      { key: "dashboard",    label: "Tableau de bord", Icon: LayoutDashboard },
      { key: "voyages",      label: "Voyages",          Icon: Bus },
      { key: "cooperatives", label: "Coopératives",     Icon: Building2 },
    ],
  },
  {
    section: "Multi-coopératives",
    items: [
      { key: "presidents",   label: "Présidents",       Icon: UserCog },
      { key: "demandes",     label: "Demandes",         Icon: FileClock, requestBadge: true },
    ],
  },
  {
    section: "Gestion",
    items: [
      { key: "reservations", label: "Réservations",     Icon: ClipboardList, badge: true },
      { key: "utilisateurs", label: "Utilisateurs",     Icon: Users },
      { key: "paiements",    label: "Paiements",        Icon: CreditCard },
      { key: "recus",        label: "Reçus",            Icon: Receipt },
    ],
  },
  {
    section: "Système",
    items: [
      { key: "notifications", label: "Notifications",   Icon: Bell },
      { key: "places",        label: "Places",          Icon: MapPin },
    ],
  },
];

export default function Sidebar({ active, onChange, pendingCount = 0, pendingRequestsCount = 0, mobileOpen = false, onClose = () => {}, onLogout }) {
  const { user } = useAuth();

  const handleNavClick = (key) => { onChange(key); onClose(); };

  return (
    <>
      <div className={`sidebar-overlay ${mobileOpen ? "open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <img src={reservationLogo} alt="Réservation en ligne" className="brand-logo-image brand-logo-image--sidebar" />
            <div>
              <h2>Réservation en ligne</h2>
              <p>Administration</p>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Fermer le menu">
            <X size={16} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ section, items }) => (
            <div key={section}>
              <div className="nav-section-label">{section}</div>
              {items.map(({ key, label, Icon, badge, requestBadge }) => (
                <div
                  key={key}
                  className={`nav-item ${active === key ? "active" : ""}`}
                  onClick={() => handleNavClick(key)}
                >
                  <Icon className="nav-icon" size={18} />
                  {label}
                  {badge && pendingCount > 0 && (
                    <span className="nav-badge">{pendingCount}</span>
                  )}
                  {requestBadge && pendingRequestsCount > 0 && (
                    <span className="nav-badge">{pendingRequestsCount}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={onLogout} title="Se déconnecter">
            <div className="avatar">
              {user?.email?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="sidebar-user-info">
              <p>{user?.displayName || "Administrateur"}</p>
              <span>{user?.email || "admin@voyage.mg"}</span>
            </div>
            <LogOut size={15} style={{ color: "rgba(255,255,255,.4)", marginLeft: "auto" }} />
          </div>
        </div>
      </aside>
    </>
  );
}
