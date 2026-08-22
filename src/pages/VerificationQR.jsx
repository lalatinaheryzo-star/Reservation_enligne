// pages/VerificationQR.jsx
// ============================================================
//  Page PUBLIQUE (pas de connexion requise) affichée lorsqu'un
//  agent de la gare scanne le QR Code d'un reçu.
//  URL : /verify/:token
// ============================================================
import React, { useEffect, useState } from "react";
import reservationLogo from "../assets/images/reservation-logo-madagascar.png";
import {
  Bus, CheckCircle2, XCircle, AlertTriangle, Loader2,
  User, Phone, MapPin, Calendar, Clock, Armchair, Building2, Receipt,
} from "lucide-react";
import toast from "react-hot-toast";
import { verifyRecuByToken, checkinRecuByToken } from "../api/services";

function formatDate(val) {
  if (!val) return "–";
  try {
    return new Date(val).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return String(val);
  }
}

function formatDateTime(val) {
  if (!val) return "–";
  try {
    return new Date(val).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return String(val);
  }
}

function InfoRow({ Icon, label, value }) {
  return (
    <div className="verif-info-row">
      <div className="verif-info-icon"><Icon size={15} /></div>
      <div>
        <div className="verif-info-label">{label}</div>
        <div className="verif-info-value">{value ?? "–"}</div>
      </div>
    </div>
  );
}

export default function VerificationQR({ token }) {
  const [state, setState]       = useState("loading"); // loading | valid | used | invalid
  const [recu, setRecu]         = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);

  const load = () => {
    setState("loading");
    verifyRecuByToken(token)
      .then((data) => {
        setRecu(data.recu);
        setState(data.already_used ? "used" : "valid");
      })
      .catch(() => {
        setState("invalid");
      });
  };

  useEffect(() => { load(); }, [token]);

  const handleCheckin = async () => {
    setCheckingIn(true);
    try {
      const data = await checkinRecuByToken(token, "Agent de gare");
      setRecu(data.recu);
      setState("used-now");
      toast.success("Embarquement validé !");
    } catch (err) {
      if (err.status === 409) {
        toast.error("Réservation déjà utilisée.");
        setState("used");
      } else {
        toast.error(err.message || "Erreur lors de la validation.");
      }
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="verif-page">
      <div className="verif-topbar">
        <img src={reservationLogo} alt="Réservation en ligne" className="brand-logo-image brand-logo-image--verify" />
        <span>Voyage<strong>Mada</strong> · Contrôle d'embarquement</span>
      </div>

      <div className="verif-content">
        {state === "loading" && (
          <div className="verif-card verif-card-center">
            <Loader2 className="spin" size={40} />
            <p>Vérification en cours…</p>
          </div>
        )}

        {state === "invalid" && (
          <div className="verif-card verif-card-center">
            <div className="verif-status-icon invalid"><XCircle size={40} /></div>
            <h2>Réservation invalide</h2>
            <p className="verif-muted">Ce QR Code ne correspond à aucune réservation connue.</p>
          </div>
        )}

        {(state === "valid" || state === "used" || state === "used-now") && recu && (
          <div className="verif-card">
            <div className={`verif-banner ${state === "valid" ? "ok" : "warn"}`}>
              {state === "valid" && (<><CheckCircle2 size={22} /><span>Réservation valide</span></>)}
              {state === "used"  && (<><AlertTriangle size={22} /><span>Réservation déjà utilisée</span></>)}
              {state === "used-now" && (<><CheckCircle2 size={22} /><span>Embarquement validé avec succès</span></>)}
            </div>

            <div className="verif-body">
              <div className="verif-receipt-number">
                <Receipt size={14} /> {recu.numero_recu}
              </div>

              <div className="verif-grid">
                <InfoRow Icon={User}     label="Voyageur"   value={recu.voyageur_nom} />
                <InfoRow Icon={Phone}    label="Téléphone"  value={recu.voyageur_telephone} />
                <InfoRow Icon={Building2} label="Coopérative" value={recu.cooperative_nom} />
                <InfoRow Icon={MapPin}   label="Trajet"     value={`${recu.ville_depart} → ${recu.ville_arrivee}`} />
                <InfoRow Icon={Calendar} label="Date du voyage" value={formatDate(recu.date_depart)} />
                <InfoRow Icon={Clock}    label="Heure de départ" value={(recu.heure_depart || "").slice(0, 5)} />
                <InfoRow Icon={Armchair} label="Numéro de place" value={recu.numero_place ? `Place ${recu.numero_place}` : "–"} />
                <InfoRow Icon={Calendar} label="Date de réservation" value={formatDateTime(recu.date_reservation)} />
              </div>

              <div className="verif-status-footer">
                <span>Statut actuel</span>
                <strong className={recu.statut === "Embarquée" ? "boarded" : "confirmed"}>
                  {recu.statut === "Embarquée" ? "Embarquée" : "Confirmée"}
                </strong>
                {recu.checked_at && (
                  <span className="verif-checked-at">Contrôlée le {formatDateTime(recu.checked_at)}</span>
                )}
              </div>

              {state === "valid" && (
                <button className="btn btn-primary verif-checkin-btn" onClick={handleCheckin} disabled={checkingIn}>
                  {checkingIn ? "Validation…" : "Valider l'embarquement"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
