import React, { useState } from "react";
import reservationLogo from "../assets/images/reservation-logo-madagascar.png";
import { ShieldCheck, Mail, Lock, ArrowLeft, Eye, EyeOff, Bus } from "lucide-react";
import toast from "react-hot-toast";
import { loginUser } from "../api/services";
import { setToken } from "../api/client";

export default function LoginAdmin({ onLogin, onBack }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Veuillez remplir tous les champs."); return; }
    setLoading(true);
    try {
      const user = await loginUser(email.trim(), password);
      if (user.role !== "admin") {
        toast.error("Ce compte n'est pas un administrateur.");
        setToken(null);
        return;
      }
      // Token déjà stocké par loginUser via setToken()
      await onLogin(user);  // déclenche loadAdmin() dans App.jsx
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
        <div className="auth-bg-blob b1"/><div className="auth-bg-blob b2"/><div className="auth-bg-blob b3"/>
      </div>
      <div className="auth-card">
        <div className="auth-card-header admin">
          <div className="auth-header-brand">
            <img src={reservationLogo} alt="Réservation en ligne" className="brand-logo-image brand-logo-image--auth" />
            <span>Réservation en ligne</span>
          </div>
          <div className="auth-card-header-icon"><ShieldCheck size={26}/></div>
          <h2>Espace Administrateur</h2>
          <p>Connexion sécurisée au tableau de bord</p>
        </div>
        <div className="auth-card-body">
          <button className="auth-back-btn" onClick={onBack}>
            <ArrowLeft size={14}/> Retour à l'accueil
          </button>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom:14 }}>
              <label>Adresse e-mail <span className="req">*</span></label>
              <div className="input-icon-wrap">
                <Mail size={14} className="icon"/>
                <input type="email" placeholder="admin@voyagemada.mg"
                  value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username"/>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom:28 }}>
              <label>Mot de passe <span className="req">*</span></label>
              <div className="input-icon-wrap" style={{ position:"relative" }}>
                <Lock size={14} className="icon"/>
                <input type={showPwd?"text":"password"} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password" style={{ paddingRight:40 }}/>
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(p=>!p)}>
                  {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
