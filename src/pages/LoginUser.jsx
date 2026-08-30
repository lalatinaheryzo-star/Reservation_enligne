// pages/LoginUser.jsx — connecté au backend Express
import React, { useState } from "react";
import reservationLogo from "../assets/images/reservation-logo-madagascar.png";
import {
  User, Mail, Lock, Phone, ArrowLeft, ArrowRight,
  Eye, EyeOff, Home, CreditCard, Bus, LogIn, UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";
import { loginUser, registerUser, verifyEmail, resendVerification } from "../api/services";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

// ── CONNEXION ────────────────────────────────────────────────
function LoginForm({ onLogin, onBack, onSwitchToRegister, onNeedsVerification }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [showForgot, setShowForgot] = useState(false);

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
      if (err.status === 401 && /vérifier votre adresse/i.test(err.message || "")) {
        onNeedsVerification(email.trim());
        return;
      }
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
              <button type="button" onClick={() => setShowForgot(true)}
                style={{ background: "none", border: "none", padding: 0, marginTop: 6, color: "var(--accent)", fontSize: ".78rem", fontWeight: 600, cursor: "pointer" }}>
                Mot de passe oublié ?
              </button>
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
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
}

// ── EN ATTENTE DE VÉRIFICATION D'E-MAIL ───────────────────────
function PendingVerification({ email: initialEmail, onSwitchToLogin, onBack }) {
  const [email,   setEmail]   = useState(initialEmail || "");
  const [code,    setCode]    = useState("");
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) { toast.error("Collez le code reçu par e-mail."); return; }
    setChecking(true);
    try {
      await verifyEmail(code.trim());
      toast.success("E-mail vérifié ! Vous pouvez vous connecter.");
      onSwitchToLogin();
    } catch (err) {
      toast.error(err.message || "Code invalide ou expiré.");
    } finally { setChecking(false); }
  };

  const handleResend = async () => {
    if (!email.trim()) { toast.error("Entrez votre e-mail."); return; }
    setResending(true);
    try {
      await resendVerification(email.trim());
      toast.success("Un nouveau code de vérification a été envoyé.");
    } catch (err) {
      toast.error(err.message || "Impossible de renvoyer le code.");
    } finally { setResending(false); }
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
          <div className="auth-card-header-icon"><Mail size={26} /></div>
          <h2>Vérifiez votre e-mail</h2>
          <p>Un code de vérification a été envoyé à {initialEmail || "votre adresse"}</p>
        </div>
        <div className="auth-card-body">
          <button className="auth-back-btn" onClick={onBack}><ArrowLeft size={14} /> Retour à l'accueil</button>
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label>Code de vérification <span className="req">*</span></label>
              <div className="input-icon-wrap">
                <Lock size={14} className="icon" />
                <input type="text" placeholder="Collez le code reçu par e-mail"
                  value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary login-btn" disabled={checking}>
              {checking ? "Vérification…" : "Vérifier mon e-mail"} <ArrowRight size={15} />
            </button>
          </form>
          <div className="auth-switch-section">
            <p>Vous n'avez rien reçu ? Vérifiez vos spams, ou :</p>
            {!initialEmail && (
              <div className="form-group" style={{ marginBottom: 10 }}>
                <input type="email" placeholder="votre@email.mg" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            )}
            <button className="btn btn-secondary login-btn" onClick={handleResend} disabled={resending}>
              {resending ? "Envoi…" : "Renvoyer le code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── INSCRIPTION ──────────────────────────────────────────────
function RegisterForm({ onBack, onSwitchToLogin }) {
  const [nom,       setNom]       = useState("");
  const [prenom,    setPrenom]    = useState("");
  const [telephone, setTelephone] = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  // Une fois le compte créé, on affiche l'écran "vérifiez votre e-mail"
  // plutôt que de connecter automatiquement : le backend n'émet un token
  // qu'après confirmation de l'adresse (voir AuthService.register()).
  const [registeredEmail, setRegisteredEmail] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nom.trim())    { toast.error("Le nom est obligatoire."); return; }
    if (!prenom.trim()) { toast.error("Le prénom est obligatoire."); return; }
    if (!email.trim())  { toast.error("L'email est obligatoire."); return; }
    if (!password)      { toast.error("Créez un mot de passe."); return; }
    if (password.length < 6) { toast.error("Mot de passe : 6 caractères minimum."); return; }
    setLoading(true);
    try {
      await registerUser({ nom, prenom, email: email.trim(), password, telephone });
      setRegisteredEmail(email.trim());
      toast.success("Compte créé ! Vérifiez votre boîte mail.");
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'inscription.");
    } finally { setLoading(false); }
  };

  if (registeredEmail) {
    return <PendingVerification email={registeredEmail} onSwitchToLogin={onSwitchToLogin} onBack={onBack} />;
  }

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
  const [screen, setScreen] = useState("login"); // login | register | verify
  const [pendingEmail, setPendingEmail] = useState(null);

  if (screen === "register")
    return <RegisterForm onBack={onBack} onSwitchToLogin={() => setScreen("login")} />;
  if (screen === "verify")
    return <PendingVerification email={pendingEmail} onSwitchToLogin={() => setScreen("login")} onBack={onBack} />;
  return (
    <LoginForm
      onLogin={onLogin}
      onBack={onBack}
      onSwitchToRegister={() => setScreen("register")}
      onNeedsVerification={(email) => { setPendingEmail(email); setScreen("verify"); }}
    />
  );
}
