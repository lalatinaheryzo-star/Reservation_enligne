// pages/IntegrerCooperative.jsx
// ============================================================
//  Point d'entrée PUBLIC pour une personne responsable d'une
//  coopérative de transport qui souhaite l'intégrer à Réservation en ligne.
//
//  Important (voir cahier des charges "rôle PRESIDENT") : ce n'est PAS
//  "je suis Voyageur et je deviens Président" — c'est une démarche
//  autonome, orientée coopérative, accessible directement depuis
//  l'accueil (section Président), pas depuis l'espace Voyageur connecté.
//
//  Si la personne n'a pas encore de compte, ce formulaire crée le
//  compte (registerUser) PUIS dépose la demande (createDemandeCooperative)
//  avec le token fraîchement obtenu. Si elle a déjà un compte, elle peut
//  basculer sur "J'ai déjà un compte" pour se connecter d'abord.
// ============================================================
import React, { useState } from "react";
import reservationLogo from "../assets/images/reservation-logo-madagascar.png";
import { Building2, Phone, Mail, MapPin, CreditCard, User, Lock, Send, ArrowLeft, Bus } from "lucide-react";
import toast from "react-hot-toast";
import { registerUser, loginUser, createDemandeCooperative } from "../api/services";

const EMPTY_ACCOUNT = { nom: "", prenom: "", email: "", telephone: "", password: "" };
const EMPTY_COOP    = { nom_president: "", telephone: "", email: "", cin: "", nom_cooperative: "", ville: "", adresse: "", message: "" };

export default function IntegrerCooperative({ onBack, onSubmitted, onGoToLogin }) {
  const [hasAccount, setHasAccount] = useState(false);
  const [account, setAccount] = useState(EMPTY_ACCOUNT);
  const [coop,    setCoop]    = useState(EMPTY_COOP);
  const [submitting, setSubmitting] = useState(false);

  const set = (obj, setter) => (field) => (e) => setter({ ...obj, [field]: e.target.value });
  const setAcc  = set(account, setAccount);
  const setCoopF = set(coop, setCoop);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coop.nom_president.trim() || !coop.telephone.trim() || !coop.email.trim() || !coop.nom_cooperative.trim()) {
      toast.error("Veuillez remplir les champs obligatoires de la coopérative.");
      return;
    }
    if (!hasAccount && (!account.nom.trim() || !account.email.trim() || !account.password || account.password.length < 6)) {
      toast.error("Veuillez remplir vos informations de compte (mot de passe : 6 caractères minimum).");
      return;
    }

    setSubmitting(true);
    try {
      if (hasAccount) {
        await loginUser(account.email.trim(), account.password);
      } else {
        await registerUser({
          nom: account.nom.trim(),
          prenom: account.prenom.trim(),
          email: account.email.trim(),
          telephone: account.telephone.trim() || coop.telephone.trim(),
          password: account.password,
        });
      }
      await createDemandeCooperative(coop);
      toast.success("Demande envoyée ! Vous pourrez vous connecter à votre espace Président une fois la demande approuvée par l'administrateur.", { duration: 6000 });
      onSubmitted?.();
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'envoi de la demande.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-decor">
        <div className="auth-bg-blob b1" /><div className="auth-bg-blob b2" /><div className="auth-bg-blob b3" />
      </div>
      <div className="auth-card" style={{ maxWidth: 620 }}>
        <div className="auth-card-header" style={{ background: "linear-gradient(135deg,#059669,#10B981)" }}>
          <div className="auth-header-brand">
            <img src={reservationLogo} alt="Réservation en ligne" className="brand-logo-image brand-logo-image--auth" />
            <span>Réservation en ligne</span>
          </div>
          <div className="auth-card-header-icon"><Building2 size={26} /></div>
          <h2>Intégrer ma coopérative</h2>
          <p>Vous représentez une coopérative de transport ? Rejoignez Réservation en ligne.</p>
        </div>
        <div className="auth-card-body">
          <button className="auth-back-btn" onClick={onBack}>
            <ArrowLeft size={14} /> Retour à l'accueil
          </button>

          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <button type="button"
              className={`btn ${!hasAccount ? "btn-primary" : "btn-secondary"} btn-sm`}
              onClick={() => setHasAccount(false)}>
              Nouveau compte
            </button>
            <button type="button"
              className={`btn ${hasAccount ? "btn-primary" : "btn-secondary"} btn-sm`}
              onClick={() => setHasAccount(true)}>
              J'ai déjà un compte
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: ".8rem", color: "var(--navy)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".03em" }}>
                Votre compte
              </div>
              {hasAccount ? (
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
                    <label>Email <span className="req">*</span></label>
                    <div className="input-icon-wrap">
                      <Mail size={14} className="icon" />
                      <input type="email" value={account.email} onChange={setAcc("email")} autoComplete="username" />
                    </div>
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
                    <label>Mot de passe <span className="req">*</span></label>
                    <div className="input-icon-wrap">
                      <Lock size={14} className="icon" />
                      <input type="password" value={account.password} onChange={setAcc("password")} autoComplete="current-password" />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                    <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
                      <label>Nom <span className="req">*</span></label>
                      <div className="input-icon-wrap">
                        <User size={14} className="icon" />
                        <input value={account.nom} onChange={setAcc("nom")} />
                      </div>
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
                      <label>Prénom</label>
                      <div className="input-icon-wrap">
                        <User size={14} className="icon" />
                        <input value={account.prenom} onChange={setAcc("prenom")} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
                      <label>Email <span className="req">*</span></label>
                      <div className="input-icon-wrap">
                        <Mail size={14} className="icon" />
                        <input type="email" value={account.email} onChange={setAcc("email")} autoComplete="username" />
                      </div>
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
                      <label>Mot de passe <span className="req">*</span></label>
                      <div className="input-icon-wrap">
                        <Lock size={14} className="icon" />
                        <input type="password" value={account.password} onChange={setAcc("password")} autoComplete="new-password" placeholder="6 caractères minimum" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="divider" />

            <div>
              <div style={{ fontWeight: 700, fontSize: ".8rem", color: "var(--navy)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".03em" }}>
                Votre coopérative
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="form-group">
                  <label>Nom du responsable <span className="req">*</span></label>
                  <div className="input-icon-wrap">
                    <User size={14} className="icon" />
                    <input value={coop.nom_president} onChange={setCoopF("nom_president")} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
                    <label>Téléphone <span className="req">*</span></label>
                    <div className="input-icon-wrap">
                      <Phone size={14} className="icon" />
                      <input value={coop.telephone} onChange={setCoopF("telephone")} />
                    </div>
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
                    <label>Email de contact <span className="req">*</span></label>
                    <div className="input-icon-wrap">
                      <Mail size={14} className="icon" />
                      <input type="email" value={coop.email} onChange={setCoopF("email")} />
                    </div>
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                    <label>CIN</label>
                    <div className="input-icon-wrap">
                      <CreditCard size={14} className="icon" />
                      <input value={coop.cin} onChange={setCoopF("cin")} />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Nom de la coopérative <span className="req">*</span></label>
                  <div className="input-icon-wrap">
                    <Building2 size={14} className="icon" />
                    <input value={coop.nom_cooperative} onChange={setCoopF("nom_cooperative")} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
                    <label>Ville</label>
                    <div className="input-icon-wrap">
                      <MapPin size={14} className="icon" />
                      <input value={coop.ville} onChange={setCoopF("ville")} />
                    </div>
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
                    <label>Adresse</label>
                    <div className="input-icon-wrap">
                      <MapPin size={14} className="icon" />
                      <input value={coop.adresse} onChange={setCoopF("adresse")} />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Message (optionnel)</label>
                  <textarea rows={3} value={coop.message} onChange={setCoopF("message")}
                    placeholder="Véhicules, itinéraires envisagés, informations utiles pour l'administrateur…" />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ justifyContent: "center", marginTop: 6 }}>
              <Send size={14} /> {submitting ? "Envoi…" : "Envoyer ma demande d'intégration"}
            </button>
          </form>

          <p style={{ marginTop: 18, fontSize: ".74rem", color: "var(--muted)", textAlign: "center" }}>
            Déjà Président d'une coopérative approuvée ?{" "}
            <button type="button" onClick={onGoToLogin}
              style={{ background: "none", border: "none", padding: 0, color: "var(--accent)", fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>
              Connectez-vous ici
            </button>.
          </p>
        </div>
      </div>
    </div>
  );
}
