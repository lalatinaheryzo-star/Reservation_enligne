// pages/user/UserApp.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Bus, Ticket, LogOut, ArrowLeft } from "lucide-react";
import reservationLogo from "../../assets/images/reservation-logo-madagascar.png";
import VoyagesClient   from "./VoyagesClient";
import PlaceClient     from "./PlaceClient";
import PaiementClient  from "./PaiementClient";
import MesReservations from "./MesReservations";
import { useAppContext } from "../../context/AppContext";
import { getMesReservations } from "../../api/services";
import toast from "react-hot-toast";

const TABS = [
  { key:"voyages",      label:"Voyages",          Icon:Bus    },
  { key:"reservations", label:"Mes réservations",  Icon:Ticket },
];
const FLOW = { VOYAGES:"voyages", PLACE:"place", PAYMENT:"payment", CONFIRM:"confirm" };

export default function UserApp({ user, onLogout }) {
  const { addReservation } = useAppContext();
  const [tab,  setTab]  = useState("voyages");
  const [flow, setFlow] = useState(FLOW.VOYAGES);
  const [selectedVoyage, setSelectedVoyage] = useState(null);
  const [selectedPlace,  setSelectedPlace]  = useState(null);
  const [myResaIds,      setMyResaIds]      = useState([]);
  const [lastPaiement,   setLastPaiement]   = useState(null); // { statut } du dernier paiement effectué

  // Récupère les réservations du voyageur DEPUIS LE SERVEUR (au lieu de se
  // fier uniquement à la mémoire de session) -> survit aux rafraîchissements
  // de page et reflète les validations faites par l'admin entre-temps.
  const refreshMyReservations = useCallback(async () => {
    try {
      const mine = await getMesReservations(user.id);
      setMyResaIds((mine || []).map((r) => r.id_reservation || r.id));
    } catch {
      // Si l'appel échoue (ex: hors-ligne), on garde la liste locale existante
      // plutôt que de vider l'écran.
    }
  }, [user.id]);

  useEffect(() => {
    refreshMyReservations();
  }, [refreshMyReservations]);

  const goTab = (key) => {
    setTab(key); setFlow(FLOW.VOYAGES);
    setSelectedVoyage(null); setSelectedPlace(null);
    if (key === "reservations") refreshMyReservations();
  };

  const handleVoyageSelect = (v) => { setSelectedVoyage(v); setFlow(FLOW.PLACE); };
  const handlePlaceConfirm = (p) => { setSelectedPlace(p);  setFlow(FLOW.PAYMENT); };

  const handlePaymentSuccess = (reservation) => {
    const resaId = reservation.id_reservation || reservation.id;
    // addReservation ajoute au state local — pas d'appel API (déjà créé par PaiementClient)
    addReservation(reservation);
    setMyResaIds((prev) => [...prev, resaId]);
    setLastPaiement({ statut: reservation.paiement_statut || "Réussi" });
    setFlow(FLOW.CONFIRM);
    toast.success("Paiement enregistré ! Réservation en attente de validation par le Président.");
  };

  const handleBackToVoyages = () => {
    setFlow(FLOW.VOYAGES); setSelectedVoyage(null); setSelectedPlace(null);
  };

  const renderContent = () => {
    if (tab === "reservations") return <MesReservations myReservationIds={myResaIds} />;

    if (flow === FLOW.VOYAGES)  return <VoyagesClient onSelectVoyage={handleVoyageSelect} />;

    if (flow === FLOW.PLACE)    return (
      <PlaceClient voyage={selectedVoyage} user={user}
        onConfirm={handlePlaceConfirm} onBack={handleBackToVoyages} />
    );

    if (flow === FLOW.PAYMENT)  return (
      <PaiementClient voyage={selectedVoyage} place={selectedPlace} user={user}
        onSuccess={handlePaymentSuccess} onBack={() => setFlow(FLOW.PLACE)} />
    );

    if (flow === FLOW.CONFIRM)  return (
      <div style={{ maxWidth:520, margin:"0 auto" }}>
        <div className="card" style={{ overflow:"hidden" }}>
          <div style={{ background:"var(--grad-accent)", padding:"32px 28px", textAlign:"center", color:"white" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(255,255,255,.2)",
              display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
              <Ticket size={30} />
            </div>
            <h3 style={{ fontSize:"1.2rem", marginBottom:6 }}>Paiement enregistré !</h3>
            <p style={{ opacity:.8, fontSize:".85rem" }}>Le Président de la coopérative doit maintenant vérifier et valider votre réservation.</p>
          </div>
          <div style={{ padding:"24px 28px" }}>
            <div style={{ background:"#f8fafc", borderRadius:12, padding:"16px 18px", marginBottom:20 }}>
              <div style={{ fontWeight:700, color:"var(--navy)", marginBottom:10 }}>Récapitulatif</div>
              {[
                ["Voyage",   `${selectedVoyage?.ville_depart} → ${selectedVoyage?.ville_arrivee}`],
                ["Date",     selectedVoyage?.date_depart],
                ["Heure",    (selectedVoyage?.heure_depart||"").slice(0,5)],
                ["Siège",    `Place ${selectedPlace?.numero_place}`],
                ["Montant",  `${Number(selectedVoyage?.prix||0).toLocaleString()} Ar`],
                ["Passager", `${user.prenom} ${user.nom}`],
                ["Paiement", lastPaiement?.statut || "Réussi"],
                ["Réservation", "En attente de validation"],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:".83rem", marginBottom:6 }}>
                  <span style={{ color:"var(--muted)" }}>{k}</span>
                  <span style={{ color:"var(--navy)", fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }}
                onClick={() => goTab("reservations")}>Voir mes réservations</button>
              <button className="btn btn-secondary" style={{ flex:1, justifyContent:"center" }}
                onClick={handleBackToVoyages}><ArrowLeft size={14} /> Autre voyage</button>
            </div>
          </div>
        </div>
      </div>
    );
    return null;
  };

  return (
    <div className="user-app">
      <header className="user-topbar">
        <div className="user-topbar-logo">
          <img src={reservationLogo} alt="Réservation en ligne" className="brand-logo-image brand-logo-image--topbar" />
          <h2>Réservation en ligne</h2>
        </div>
        <nav className="user-nav">
          {TABS.map(({ key, label, Icon }) => (
            <button key={key} className={`user-nav-item ${tab===key?"active":""}`} onClick={() => goTab(key)}>
              <Icon size={16} /> <span>{label}</span>
              {key==="reservations" && myResaIds.length>0 && (
                <span style={{ background:"var(--rose)", color:"white", fontSize:".62rem",
                  fontWeight:800, padding:"2px 6px", borderRadius:20, marginLeft:2 }}>
                  {myResaIds.length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="user-topbar-right">
          <span className="user-greeting">Bonjour, <strong>{user.prenom}</strong></span>
          <button className="icon-btn" onClick={onLogout} title="Se déconnecter"
            style={{ background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.15)", color:"white" }}>
            <LogOut size={15} />
          </button>
        </div>
      </header>
      <main className="user-main">{renderContent()}</main>
    </div>
  );
}