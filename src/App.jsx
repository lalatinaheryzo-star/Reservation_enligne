// App.jsx — routage principal entre Landing, Admin, Président et Utilisateur
import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { AppProvider, useAppContext } from "./context/AppContext";
import { PresidentProvider } from "./context/PresidentContext";
import { getDemandesCooperatives } from "./api/services";

import SiteVitrine from "./pages/SiteVitrine";
import Landing     from "./pages/Landing";
import LoginAdmin  from "./pages/LoginAdmin";
import LoginUser   from "./pages/LoginUser";
import LoginPresident from "./pages/LoginPresident";
import IntegrerCooperative from "./pages/IntegrerCooperative";
import UserApp     from "./pages/user/UserApp";
import PresidentApp from "./pages/president/PresidentApp";

import Sidebar       from "./components/Sidebar";
import Dashboard     from "./pages/Dashboard";
import Voyages       from "./pages/Voyages";
import Cooperatives  from "./pages/Cooperatives";
import Reservations  from "./pages/Reservations";
import Utilisateurs  from "./pages/Utilisateurs";
import Paiements     from "./pages/Paiements";
import Recus         from "./pages/Recus";
import Notifications from "./pages/Notifications";
import Places        from "./pages/Places";
import VerificationQR from "./pages/VerificationQR";
import AdminPresidents from "./pages/AdminPresidents";
import AdminDemandesCooperatives from "./pages/AdminDemandesCooperatives";

import { Bell, RefreshCw, Menu } from "lucide-react";

const PAGE_TITLES = {
  dashboard:     ["Tableau de bord",  "Vue d'ensemble du système"],
  voyages:       ["Voyages",          "Gérer les trajets disponibles"],
  cooperatives:  ["Coopératives",     "Partenaires de transport"],
  presidents:    ["Présidents",       "Comptes présidents de coopérative"],
  demandes:      ["Demandes",         "Demandes de création de coopératives"],
  reservations:  ["Réservations",     "Suivi et validation des demandes"],
  utilisateurs:  ["Utilisateurs",     "Gestion des clients"],
  paiements:     ["Paiements",        "Transactions financières"],
  recus:         ["Reçus",            "Documents générés"],
  notifications: ["Notifications",    "Communications envoyées"],
  places:        ["Places",           "Disponibilité par voyage"],
};

function AdminApp({ user, onLogout }) {
  const [page, setPage]               = useState("dashboard");
  const [mobileNavOpen, setMobileNav] = useState(false);
  const { reservations, loadAll, loadAdmin } = useAppContext();
  const [pendingRequests, setPendingRequests] = useState(0);
  const pending = reservations.filter((r) => r.statut === "En attente").length;

  useEffect(() => {
    getDemandesCooperatives()
      .then((list) => setPendingRequests((list || []).filter((r) => r.statut === "PENDING").length))
      .catch(() => {}); // badge non-critique : on ignore silencieusement une erreur réseau
  }, [page]); // se rafraîchit à chaque changement de page (ex: après un retour de "demandes")

  const PAGES = {
    dashboard:     <Dashboard />,
    voyages:       <Voyages />,
    cooperatives:  <Cooperatives />,
    presidents:    <AdminPresidents />,
    demandes:      <AdminDemandesCooperatives />,
    reservations:  <Reservations />,
    utilisateurs:  <Utilisateurs />,
    paiements:     <Paiements />,
    recus:         <Recus />,
    notifications: <Notifications />,
    places:        <Places />,
  };

  const [title, subtitle] = PAGE_TITLES[page] || ["Page", ""];

  return (
    <div className="app-layout">
      <Sidebar
        active={page}
        onChange={setPage}
        pendingCount={pending}
        pendingRequestsCount={pendingRequests}
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
            <button className="icon-btn" title="Actualiser" onClick={loadAdmin}>
              <RefreshCw size={16} />
            </button>
            <button className="icon-btn" style={{ position:"relative" }} onClick={() => setPage("notifications")}>
              <Bell size={16} />
              {pending > 0 && (
                <span style={{
                  position:"absolute", top:-4, right:-4,
                  width:16, height:16, borderRadius:"50%",
                  background:"#F43F5E", color:"white",
                  fontSize:".6rem", fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>{pending}</span>
              )}
            </button>
          </div>
        </header>
        <main className="page-content">
          {PAGES[page] || <Dashboard />}
        </main>
      </div>
    </div>
  );
}

// ── Composant racine avec accès au contexte ───────────────
function AppInner() {
  const { loadAdmin } = useAppContext();
  const [space,          setSpace]          = useState(null);
  const [adminUser,      setAdminUser]      = useState(null);
  const [clientUser,     setClientUser]     = useState(null);
  const [presidentUser,  setPresidentUser]  = useState(null);
  // "vitrine" = site de présentation Réservation en ligne (nouvel écran d'accueil) ;
  // "chooser" = ancien écran de sélection d'espace (Landing.jsx),
  // conservé tel quel et toujours utilisé pour la connexion Admin/Voyageur/Président.
  const [entry, setEntry] = useState("vitrine");

  const handleAdminLogin = async (user) => {
    setAdminUser(user);
    // Charger les données protégées maintenant qu'on a le token
    await loadAdmin();
  };

  const handleLogoutAdmin     = () => { setAdminUser(null); setSpace(null); setEntry("vitrine"); };
  const handleLogoutUser      = () => { setClientUser(null); setSpace(null); setEntry("vitrine"); };
  const handleLogoutPresident = () => { setPresidentUser(null); setSpace(null); setEntry("vitrine"); };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style:{ borderRadius:10, fontSize:".84rem" } }} />

      {/* Site vitrine Réservation en ligne : point d'entrée public, avant tout choix d'espace.
          "Réserver maintenant" mène directement à l'espace voyageur ;
          "Se connecter" ouvre l'écran de choix existant ;
          "Espace coopérative" mène directement à la connexion Président. */}
      {!space && entry === "vitrine" && (
        <SiteVitrine
          onReserve={() => { setSpace("user"); setEntry("chooser"); }}
          onLoginClick={() => setEntry("chooser")}
          onCooperativeClick={() => { setSpace("president"); setEntry("chooser"); }}
          onIntegrateCooperativeClick={() => setEntry("integrer-cooperative")}
        />
      )}

      {!space && entry === "integrer-cooperative" && (
        <IntegrerCooperative
          onBack={() => setEntry("vitrine")}
          onGoToLogin={() => { setSpace("president"); setEntry("chooser"); }}
          onSubmitted={() => { setEntry("vitrine"); }}
        />
      )}

      {!space && entry === "chooser" && (
        <Landing onChoose={setSpace} onBack={() => setEntry("vitrine")} />
      )}

      {space === "admin" && !adminUser && (
        <LoginAdmin onLogin={handleAdminLogin} onBack={() => setSpace(null)} />
      )}
      {space === "admin" && adminUser && (
        <AdminApp user={adminUser} onLogout={handleLogoutAdmin} />
      )}

      {space === "president" && !presidentUser && (
        <LoginPresident onLogin={setPresidentUser} onBack={() => setSpace(null)}
          onIntegrateCooperative={() => { setSpace(null); setEntry("integrer-cooperative"); }} />
      )}
      {space === "president" && presidentUser && (
        <PresidentApp user={presidentUser} onLogout={handleLogoutPresident} />
      )}

      {space === "user" && !clientUser && (
        <LoginUser onLogin={setClientUser} onBack={() => setSpace(null)} />
      )}
      {space === "user" && clientUser && (
        <UserApp user={clientUser} onLogout={handleLogoutUser} />
      )}
    </>
  );
}

export default function App() {
  // Route publique : /verify/<token> — page de contrôle scannée par
  // l'agent de la gare. Ne nécessite ni connexion ni AppContext.
  const verifyMatch = window.location.pathname.match(/^\/verify\/([^/]+)\/?$/);
  if (verifyMatch) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: 10, fontSize: ".84rem" } }} />
        <VerificationQR token={verifyMatch[1]} />
      </>
    );
  }

  return (
    <AppProvider>
      <PresidentProvider>
        <AppInner />
      </PresidentProvider>
    </AppProvider>
  );
}
