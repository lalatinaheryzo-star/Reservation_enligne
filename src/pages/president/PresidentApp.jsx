// pages/president/PresidentApp.jsx
// ============================================================
//  Espace Président — entièrement piloté par le backend : les données
//  viennent de GET /cooperatives/me, et l'isolation entre coopératives
//  est réellement appliquée côté serveur (voir SecurityConfig + scoping
//  dans les services Java), pas seulement ici.
// ============================================================
import React, { useState, useEffect } from "react";
import { Bell, Menu } from "lucide-react";
import PresidentSidebar from "./PresidentSidebar";
import DashboardPresident from "./DashboardPresident";
import MaCooperative from "./MaCooperative";
import MesVoyagesPresident from "./MesVoyagesPresident";
import MesReservationsPresident from "./MesReservationsPresident";
import MesPaiementsPresident from "./MesPaiementsPresident";
import MesVoyageursPresident from "./MesVoyageursPresident";
import CreateMyCooperative from "./CreateMyCooperative";
import { usePresidentContext } from "../../context/PresidentContext";

const PAGE_TITLES = {
  dashboard:    ["Tableau de bord",  "Vue d'ensemble de votre coopérative"],
  cooperative:  ["Ma coopérative",   "Informations générales"],
  voyages:      ["Mes voyages",      "Gérer les trajets de votre coopérative"],
  reservations: ["Mes réservations", "Réservations liées à vos voyages"],
  paiements:    ["Mes paiements",    "Suivi des paiements de votre coopérative"],
  voyageurs:    ["Mes voyageurs",    "Voyageurs ayant réservé vos voyages"],
};

export default function PresidentApp({ user, onLogout }) {
  const { realCooperative, realLoading, realError, needsCooperative, loadMyCooperativeSpace } = usePresidentContext();
  const [page, setPage] = useState("dashboard");
  const [mobileNavOpen, setMobileNav] = useState(false);

  useEffect(() => { loadMyCooperativeSpace(); }, [loadMyCooperativeSpace]);

  const cooperative = realCooperative;

  const PAGES = {
    dashboard:    <DashboardPresident cooperative={cooperative} />,
    cooperative:  <MaCooperative cooperative={cooperative} />,
    voyages:      <MesVoyagesPresident cooperative={cooperative} president={user} />,
    reservations: <MesReservationsPresident cooperative={cooperative} />,
    paiements:    <MesPaiementsPresident cooperative={cooperative} />,
    voyageurs:    <MesVoyageursPresident cooperative={cooperative} />,
  };

  const [title, subtitle] = PAGE_TITLES[page] || ["Page", ""];

  const renderMain = () => {
    if (realLoading && !cooperative) {
      return <div className="empty-state" style={{ padding: 60, textAlign: "center" }}><p>Chargement de votre coopérative…</p></div>;
    }
    if (needsCooperative) {
      return <CreateMyCooperative user={user} />;
    }
    if (realError && !cooperative) {
      return (
        <div className="empty-state" style={{ padding: 60, textAlign: "center" }}>
          <p style={{ color: "#e11d48", fontWeight: 600 }}>{realError}</p>
          <p className="text-muted" style={{ marginTop: 8, fontSize: ".85rem" }}>
            Si votre demande vient d'être approuvée, essayez de vous déconnecter puis reconnecter.
          </p>
        </div>
      );
    }
    if (!cooperative) {
      return (
        <div className="empty-state" style={{ padding: 60, textAlign: "center" }}>
          <p>Aucune coopérative n'est associée à ce compte Président.</p>
        </div>
      );
    }
    return PAGES[page] || <DashboardPresident cooperative={cooperative} />;
  };

  return (
    <div className="app-layout">
      <PresidentSidebar
        active={page}
        onChange={setPage}
        user={user}
        cooperativeNom={cooperative?.nom}
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNav(false)}
        onLogout={onLogout}
      />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-toggle-btn" onClick={() => setMobileNav(true)}>
              <Menu size={18} />
            </button>
            <div><h1>{title}</h1><p>{subtitle}</p></div>
          </div>
          <div className="topbar-right">
            <button className="icon-btn" title="Notifications">
              <Bell size={16} />
            </button>
          </div>
        </header>
        <main className="page-content">{renderMain()}</main>
      </div>
    </div>
  );
}
