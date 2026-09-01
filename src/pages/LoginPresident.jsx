// pages/LoginPresident.jsx
// ============================================================
//  Connexion Président — branchée sur le vrai backend (JWT), sur
//  le même modèle que LoginAdmin.jsx. Le compte doit avoir été
//  approuvé au préalable via le workflow "Devenir Président"
//  (POST /demandes-cooperatives -> approbation admin), qui fait
//  passer utilisateurs.role à PRESIDENT côté serveur.
// ============================================================
import React, { useState } from "react";
import reservationLogo from "../assets/images/reservation-logo-madagascar.png";
import { Building2, Mail, Lock, ArrowLeft, Eye, EyeOff, Bus } from "lucide-react";
import toast from "react-hot-toast";
import { loginUser } from "../api/services";
import { setToken } from "../api/client";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

export default function LoginPresident({ onLogin, onBack, onIntegrateCooperative }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Veuillez remplir tous les champs."); return; }
    setLoading(true);
    try {
      const user = await loginUser(email.trim(), password);
      if (user.role !== "president") {
        toast.error("Ce compte n'est pas un compte Président. Si votre demande vient d'être approuvée, vérifiez avec l'administrateur.");
        setToken(null);
        setLoading(false);
        return;
      }
      onLogin(user); // Token déjà stocké par loginUser via setToken()
      toast.success(`Bienvenue, ${user.prenom} !`);
    } catch (err) {
      toast.error(err.message || "Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-decor">
        <div className="auth-bg-blob b1" /><div className="auth-bg-blob b2" /><div className="auth-bg-blob b3" />
      </div>
      <div className="auth-card">
        <div className="auth-card-header" style={{ background: "linear-gradient(135deg,#059669,#10B981)" }}>
          <div className="auth-header-brand">
            <img src={reservationLogo} alt="Réservation en ligne" className="brand-logo-image brand-logo-image--auth" />
            <span>Réservation en ligne</span>
          </div>
          <div className="auth-card-header-icon"><Building2 size={26} /></div>
          <h2>Espace Président</h2>
          <p>Gérez votre coopérative de transport</p>
        </div>
        <div className="auth-card-body">
          <button className="auth-back-btn" onClick={onBack}>
            <ArrowLeft size={14} /> Retour à l'accueil
          </button>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Adresse e-mail <span className="req">*</span></label>
              <div className="input-icon-wrap">
                <Mail size={14} className="icon" />
                <input type="email" placeholder="president@voyagemada.mg"
                  value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 28 }}>
              <label>Mot de passe <span className="req">*</span></label>
              <div className="input-icon-wrap" style={{ position: "relative" }}>
                <Lock size={14} className="icon" />
                <input type={showPwd ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password" style={{ paddingRight: 40 }} />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd((p) => !p)}>
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button type="button" onClick={() => setShowForgot(true)}
                style={{ background: "none", border: "none", padding: 0, marginTop: 6, color: "var(--accent)", fontSize: ".78rem", fontWeight: 600, cursor: "pointer" }}>
                Mot de passe oublié ?
              </button>
            </div>
            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <p style={{ marginTop: 18, fontSize: ".74rem", color: "var(--muted)", textAlign: "center" }}>
            Vous représentez une coopérative de transport et souhaitez l'intégrer à Réservation en ligne ?{" "}
            <button type="button" onClick={onIntegrateCooperative}
              style={{ background: "none", border: "none", padding: 0, color: "var(--accent)", fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>
              Déposer une demande d'intégration
            </button>.
          </p>
        </div>
      </div>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
}
