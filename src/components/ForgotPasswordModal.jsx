// components/ForgotPasswordModal.jsx
// ============================================================
//  Modale "Mot de passe oublié" — nouveau fonctionnement :
//    1. e-mail du compte
//    2. bouton "Nouveau code" -> le système génère un code à 6 chiffres
//       (l'éventuel code précédent devient invalide)
//    3. saisie du code + nouveau mot de passe + confirmation
//
//  Réutilisée par LoginUser.jsx (Voyageur) et LoginPresident.jsx
//  (Président). Volontairement absente de LoginAdmin.jsx : le compte
//  Admin n'a pas cette fonctionnalité (voir backend AuthService).
// ============================================================
import React, { useState } from "react";
import { Mail, X, KeyRound, Lock, RefreshCw, Check, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { genererNouveauCode, reinitialiserMotDePasse } from "../api/services";

export default function ForgotPasswordModal({ onClose }) {
  // etape : "email" (aucun code demandé) | "code" (code généré) | "done"
  const [etape, setEtape] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeGenere, setCodeGenere] = useState(null);   // dernier code généré
  const [expiration, setExpiration] = useState(null);
  const [regenere, setRegenere] = useState(false);      // un ancien code a été invalidé
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [validation, setValidation] = useState(false);

  // ── Bouton "Nouveau code" ────────────────────────────────
  // Chaque clic génère un code qui remplace le précédent : seul le
  // dernier code affiché est accepté par le backend.
  const handleNouveauCode = async () => {
    if (!email.trim()) { toast.error("Entrez votre adresse e-mail."); return; }
    setEnvoi(true);
    try {
      const data = await genererNouveauCode(email.trim());
      setRegenere(Boolean(codeGenere));
      setCodeGenere(data.code);
      setExpiration(data.expiration ? new Date(data.expiration) : null);
      setCode("");
      setEtape("code");
      toast.success(codeGenere ? "Nouveau code généré. L'ancien n'est plus valide." : "Code généré.");
    } catch (err) {
      toast.error(err.message || "Impossible de générer un code.");
    } finally {
      setEnvoi(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!code.trim()) { toast.error("Entrez le code affiché ci-dessus."); return; }
    if (password.length < 6) { toast.error("Mot de passe : 6 caractères minimum."); return; }
    if (password !== confirm) { toast.error("Les deux mots de passe ne correspondent pas."); return; }
    setValidation(true);
    try {
      await reinitialiserMotDePasse({ email: email.trim(), code: code.trim(), password });
      setEtape("done");
      toast.success("Mot de passe modifié.");
    } catch (err) {
      // Couvre : code incorrect, code expiré, code déjà utilisé, ancien code.
      toast.error(err.message || "Code invalide.");
    } finally {
      setValidation(false);
    }
  };

  const heureExpiration = expiration
    ? expiration.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : null;

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
                    onChange={(e) => setEmail(e.target.value)} autoFocus
                    disabled={etape === "code"} />
                </div>
              </div>

              <button type="button" className="btn btn-secondary login-btn"
                onClick={handleNouveauCode} disabled={envoi} style={{ marginBottom: 14 }}>
                <RefreshCw size={15} /> {envoi ? "Génération…" : "Nouveau code"}
              </button>

              {etape === "email" && (
                <p style={{ fontSize: ".78rem", color: "var(--muted)" }}>
                  Cliquez sur <strong>Nouveau code</strong> : un code de récupération sera généré
                  pour ce compte.
                </p>
              )}

              {etape === "code" && (
                <>
                  <div style={{
                    background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.3)",
                    borderRadius: 10, padding: "12px 14px", marginBottom: 14, textAlign: "center",
                  }}>
                    <div style={{ fontSize: ".72rem", color: "var(--muted)", marginBottom: 4 }}>
                      Votre code de récupération
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "6px", color: "var(--navy)" }}>
                      {codeGenere}
                    </div>
                    {heureExpiration && (
                      <div style={{ fontSize: ".7rem", color: "var(--muted)", marginTop: 4 }}>
                        Valable jusqu'à {heureExpiration}
                      </div>
                    )}
                    {regenere && (
                      <div style={{ fontSize: ".7rem", color: "#B45309", marginTop: 6 }}>
                        L'ancien code n'est plus valide : seul ce code est accepté.
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleReset}>
                    <div className="form-group">
                      <label>Code de récupération <span className="req">*</span></label>
                      <div className="input-icon-wrap">
                        <KeyRound size={14} className="icon" />
                        <input type="text" inputMode="numeric" maxLength={6} placeholder="123456"
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
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
                          value={confirm} onChange={(e) => setConfirm(e.target.value)}
                          autoComplete="new-password" />
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