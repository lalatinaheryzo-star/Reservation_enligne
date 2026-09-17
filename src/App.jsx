

App · JSX
// App.jsx — routage principal entre Landing, Admin, Président et Utilisateur
import React, { useState, useEffect, Suspense, lazy } from "react";
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
 
// Chargées à la demande : chaque espace (Admin/Président/Voyageur) ne
// télécharge son code (et ses dépendances comme recharts, qrcode,
// react-to-print) qu'une fois réellement ouvert, au lieu d'alourdir le
// chargement initial commun (site vitrine + écrans de connexion) pour
// tout le monde, y compris un simple voyageur.
const UserApp      = lazy(() => import("./pages/user/UserApp"));
const PresidentApp = lazy(() => import("./pages/president/PresidentApp"));
const VerificationQR = lazy(() => import("./pages/VerificationQR"));
 
import Sidebar       from "./components/Sidebar";
const Dashboard     = lazy(() => import("./pages/Dashboard"));
const Voyages       = lazy(() => import("./pages/Voyages"));
const Cooperatives  = lazy(() => import("./pages/Cooperatives"));
const Reservations  = lazy(() => import("./pages/Reservations"));
const Utilisateurs  = lazy(() => import("./pages/Utilisateurs"));
const Paiements     = lazy(() => import("./pages/Paiements"));
const Recus         = lazy(() => import("./pages/Recus"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Places        = lazy(() => import("./pages/Places"));
const AdminPresidents = lazy(() => import("./pages/AdminPresidents"));
const AdminDemandesCooperatives = lazy(() => import("./pages/AdminDemandesCooperatives"));
 
// Fallback minimal, sans impact visuel notable, pendant le chargement
// à la demande du code d'une page (quelques centaines de ms max).
function PageLoading() {
  return <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Chargement…</div>;
}
 
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
 
// Intervalle de rafraîchissement automatique le plus court possible sans
// saturer le pool de connexions DB (Hikari : 5 connexions max côté Supabase,
// voir application.properties). En-dessous de ~2s, des utilisateurs
// simultanés en polling peuvent épuiser le pool et ralentir tout le monde —
// 2000 ms est le plancher raisonnable pour rester quasi instantané sans
// dégrader les temps de réponse.
const POLL_INTERVAL_MS = 2000;
 
function AdminApp({ user, onLogout }) {
  const [page, setPage]               = useState("dashboard");
  const [mobileNavOpen, setMobileNav] = useState(false);
  const { reservations, loadAll, loadAdmin } = useAppContext();
  const [pendingRequests, setPendingRequests] = useState(0);
  const pending = reservations.filter((r) => r.statut === "En attente").length;
 
  // Le badge des demandes se met à jour automatiquement, au rythme le plus
  // court possible (POLL_INTERVAL_MS), y compris en tâche de fond.
  useEffect(() => {
    let cancelled = false;
 
    const refreshPending = async () => {
      try {
        const list = await getDemandesCooperatives();
        if (!cancelled) {
          setPendingRequests((list || []).filter((r) => r.statut === "PENDING").length);
        }
      } catch {
        // Badge non critique : aucune erreur ne doit ralentir l'affichage.
      }
    };
 
    refreshPending();
    const timer = window.setInterval(refreshPending, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);
 
  // Actualisation automatique des données ADMIN au rythme le plus court
  // possible, pour que les mises à jour soient visibles quasi immédiatement.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") loadAdmin();
    };
 
    const timer = window.setInterval(refresh, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadAdmin]);
 
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
        user={user}
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
          <Suspense fallback={<PageLoading />}>
            {PAGES[page] || <Dashboard />}
          </Suspense>
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
 
  const handleAdminLogin = (user) => {
    setAdminUser(user);
    // Le chargement complet ne bloque plus l'entrée dans l'espace ADMIN.
    // Les données arrivent en arrière-plan et le polling les maintient à jour.
    loadAdmin();
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
        <Suspense fallback={<PageLoading />}>
          <PresidentApp user={presidentUser} onLogout={handleLogoutPresident} />
        </Suspense>
      )}
 
      {space === "user" && !clientUser && (
        <LoginUser onLogin={setClientUser} onBack={() => setSpace(null)} />
      )}
      {space === "user" && clientUser && (
        <Suspense fallback={<PageLoading />}>
          <UserApp user={clientUser} onLogout={handleLogoutUser} />
        </Suspense>
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
        <Suspense fallback={<PageLoading />}>
          <VerificationQR token={verifyMatch[1]} />
        </Suspense>
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
 
