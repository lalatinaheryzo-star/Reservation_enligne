import React, { useState } from "react";
import { Mail, X, KeyRound, Lock, RefreshCw, Check, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { genererNouveauCode, reinitialiserMotDePasse } from "../api/services";

export default function ForgotPasswordModal({ onClose }) {
  const [etape, setEtape] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [validation, setValidation] = useState(false);

  const handleNouveauCode = async () => {
    const adresse = email.trim();
    if (!adresse) {
      toast.error("Entrez votre adresse e-mail.");
      return;
    }

    setEnvoi(true);
    try {
      await genererNouveauCode(adresse);
      setCode("");
      setEtape("code");
      toast.success("Si cette adresse correspond à un compte autorisé, vérifiez votre boîte de réception et vos courriers indésirables.");
    } catch (err) {
      toast.error(err.message || "La demande n'a pas pu être traitée.");
    } finally {
      setEnvoi(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      toast.error("Saisissez le code reçu par e-mail à 6 chiffres.");
      return;
    }
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      toast.error("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setValidation(true);
    try {
      await reinitialiserMotDePasse({ email: email.trim(), code: code.trim(), password });
      setEtape("done");
      toast.success("Mot de passe modifié.");
    } catch (err) {
      toast.error(err.message || "Le code est invalide ou expiré.");
    } finally {
      setValidation(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h3>Mot de passe oublié</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {etape === "done" ? (
            <>
              <p style={{ fontSize: ".88rem", color: "var(--navy)" }}>
                <Check size={15} style={{ verticalAlign: "-2px" }} /> Votre mot de passe a bien été modifié.
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <button className="btn btn-primary login-btn" onClick={onClose} style={{ marginTop: 14 }}>
                Retour à la connexion
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Adresse e-mail du compte <span className="req">*</span></label>
                <div className="input-icon-wrap">
                  <Mail size={14} className="icon" />
                  <input type="email" placeholder="jean@exemple.mg" value={email}
                    onChange={(e) => setEmail(e.target.value)} autoFocus disabled={etape === "code"} />
                </div>
              </div>
              <button type="button" className="btn btn-secondary login-btn"
                onClick={handleNouveauCode} disabled={envoi} style={{ marginBottom: 14 }}>
                <RefreshCw size={15} /> {envoi ? "Envoi…" : etape === "code" ? "Nouveau code" : "Nouveau code"}
              </button>
              {etape === "email" && (
                <p style={{ fontSize: ".78rem", color: "var(--muted)" }}>
                  Si l’adresse correspond à un compte autorisé, un code pourra être envoyé. Vérifiez votre boîte de réception et vos courriers indésirables après votre demande.
                </p>
              )}
              {etape === "code" && (
                <>
                  <p style={{ fontSize: ".78rem", color: "var(--muted)" }}>
                    Si l’adresse correspond à un compte autorisé, un code pourra être envoyé. Vérifiez votre boîte de réception et vos courriers indésirables.
                  </p>
                  <form onSubmit={handleReset}>
                    <div className="form-group">
                      <label>Code reçu par e-mail <span className="req">*</span></label>
                      <div className="input-icon-wrap">
                        <KeyRound size={14} className="icon" />
                        <input type="text" inputMode="numeric" maxLength={6} placeholder="123456"
                          value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          style={{ letterSpacing: "4px", fontSize: "1.05rem", textAlign: "center" }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Nouveau mot de passe <span className="req">*</span></label>
                      <div className="input-icon-wrap" style={{ position: "relative" }}>
                        <Lock size={14} className="icon" />
                        <input type={showPwd ? "text" : "password"} placeholder="••••••••"
                          value={password} onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password" style={{ paddingRight: 40 }} />
                        <button type="button" className="pwd-toggle" onClick={() => setShowPwd((p) => !p)}>
                          {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <span className="field-hint">Minimum 6 caractères</span>
                    </div>
                    <div className="form-group">
                      <label>Confirmer le mot de passe <span className="req">*</span></label>
                      <div className="input-icon-wrap">
                        <Lock size={14} className="icon" />
                        <input type={showPwd ? "text" : "password"} placeholder="••••••••"
                          value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary login-btn" disabled={validation}>
                      {validation ? "Validation…" : "Modifier mon mot de passe"} <Check size={15} />
                    </button>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
