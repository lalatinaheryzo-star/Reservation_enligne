// pages/LoginUser.jsx — connecté au backend Express
import React, { useState } from "react";
import reservationLogo from "../assets/images/reservation-logo-madagascar.png";
import {
  User, Mail, Lock, Phone, ArrowLeft, ArrowRight,
  Eye, EyeOff, Home, CreditCard, Bus, LogIn, UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";
import { loginUser, registerUser } from "../api/services";

// ── CONNEXION ────────────────────────────────────────────────
function LoginForm({ onLogin, onBack, onSwitchToRegister }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Entrez votre e-mail."); return; }
    if (!password)     { toast.error("Entrez votre mot de passe."); return; }
    setLoading(true);
    try {
      const user = await loginUser(email.trim(), password);
      onLogin(user);
      toast.success(`Bienvenue, ${user.prenom} !`);
    } catch (err) {
      toast.error(err.message || "Identifiants incorrects.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-decor">
        <div className="auth-bg-blob b1" /><div className="auth-bg-blob b2" /><div className="auth-bg-blob b3" />
      </div>
      <div className="auth-card">
        <div className="auth-card-header user">
          <div className="auth-header-brand">
            <img src={reservationLogo} alt="Réservation en ligne" className="brand-logo-image brand-logo-image--auth" /><span>Réservation en ligne</span>
          </div>
          <div className="auth-card-header-icon"><LogIn size={26} /></div>
          <h2>Connexion</h2>
          <p>Accédez à votre espace voyageur</p>
        </div>
        <div className="auth-card-body">
          <button className="auth-back-btn" onClick={onBack}><ArrowLeft size={14} /> Retour à l'accueil</button>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Adresse e-mail <span className="req">*</span></label>
              <div className="input-icon-wrap">
                <Mail size={14} className="icon" />
                <input type="email" placeholder="jean@exemple.mg" value={email}
                  onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
              </div>
            </div>
            <div className="form-group">
              <label>Mot de passe <span className="req">*</span></label>
              <div className="input-icon-wrap" style={{ position:"relative" }}>
                <Lock size={14} className="icon" />
                <input type={showPwd ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password" style={{ paddingRight:40 }} />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(p => !p)}>
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"} <LogIn size={15} />
            </button>
          </form>
          <div className="auth-switch-section">
            <p>Pas encore de compte ?</p>
            <button className="btn btn-secondary login-btn" onClick={onSwitchToRegister}>
              <UserPlus size={15} /> Créer un compte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── INSCRIPTION ──────────────────────────────────────────────
function RegisterForm({ onLogin, onBack, onSwitchToLogin }) {
  const [nom,       setNom]       = useState("");
  const [prenom,    setPrenom]    = useState("");
  const [telephone, setTelephone] = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nom.trim())    { toast.error("Le nom est obligatoire."); return; }
    if (!prenom.trim()) { toast.error("Le prénom est obligatoire."); return; }
    if (!email.trim())  { toast.error("L'email est obligatoire."); return; }
    if (!password)      { toast.error("Créez un mot de passe."); return; }
    if (password.length < 6) { toast.error("Mot de passe : 6 caractères minimum."); return; }
    setLoading(true);
    try {
      const user = await registerUser({ nom, prenom, email: email.trim(), password, telephone });
      onLogin(user);
      toast.success(`Compte créé ! Bienvenue, ${prenom} !`);
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'inscription.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-decor">
        <div className="auth-bg-blob b1" /><div className="auth-bg-blob b2" /><div className="auth-bg-blob b3" />
      </div>
      <div className="auth-card" style={{ maxWidth:480 }}>
        <div className="auth-card-header user">
          <div className="auth-header-brand">
            <img src={reservationLogo} alt="Réservation en ligne" className="brand-logo-image brand-logo-image--auth" /><span>Réservation en ligne</span>
          </div>
          <div className="auth-card-header-icon"><UserPlus size={26} /></div>
          <h2>Créer un compte</h2>
          <p>Inscrivez-vous pour réserver vos places</p>
        </div>
        <div className="auth-card-body">
          <button className="auth-back-btn" onClick={onBack}><ArrowLeft size={14} /> Retour à l'accueil</button>
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Nom <span className="req">*</span></label>
                <div className="input-icon-wrap">
                  <User size={14} className="icon" />
                  <input type="text" placeholder="Rakoto" value={nom} onChange={(e) => setNom(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Prénom <span className="req">*</span></label>
                <div className="input-icon-wrap">
                  <User size={14} className="icon" />
                  <input type="text" placeholder="Jean" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>E-mail <span className="req">*</span></label>
              <div className="input-icon-wrap">
                <Mail size={14} className="icon" />
                <input type="email" placeholder="jean@exemple.mg" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Téléphone <span className="optional-tag">facultatif</span></label>
              <div className="input-icon-wrap">
                <Phone size={14} className="icon" />
                <input type="tel" placeholder="+261 34 00 000 00" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
              </div>
            </div>
            <div className="form-optional-divider"><span>Sécurité</span></div>
            <div className="form-group">
              <label>Mot de passe <span className="req">*</span></label>
              <div className="input-icon-wrap" style={{ position:"relative" }}>
                <Lock size={14} className="icon" />
                <input type={showPwd ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password" style={{ paddingRight:40 }} />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(p => !p)}>
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <span className="field-hint">Minimum 6 caractères</span>
            </div>
            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? "Création…" : "Créer mon compte"} <ArrowRight size={15} />
            </button>
          </form>
          <div className="auth-switch-section">
            <p>Déjà inscrit ?</p>
            <button className="btn btn-secondary login-btn" onClick={onSwitchToLogin}>
              <LogIn size={15} /> Me connecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginUser({ onLogin, onBack }) {
  const [screen, setScreen] = useState("login");
  if (screen === "register")
    return <RegisterForm onLogin={onLogin} onBack={onBack} onSwitchToLogin={() => setScreen("login")} />;
  return <LoginForm onLogin={onLogin} onBack={onBack} onSwitchToRegister={() => setScreen("register")} />;
}
