// components/ForgotPasswordModal.jsx
// ============================================================
//  Modale "Mot de passe oublié" — un seul champ (e-mail). Réutilisée
//  par LoginUser.jsx (Voyageur) et LoginPresident.jsx (Président).
//  Volontairement absente de LoginAdmin.jsx : le compte Admin n'a pas
//  cette fonctionnalité (voir backend AuthService.forgotPassword()).
// ============================================================
import React, { useState } from "react";
import { Mail, X, Send } from "lucide-react";
import toast from "react-hot-toast";
import { forgotPassword } from "../api/services";

export default function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Entrez votre adresse e-mail."); return; }
    setSending(true);
    try {
      await forgotPassword(email.trim());
      // Réponse volontairement neutre côté backend (204 dans tous les cas,
      // que l'adresse existe ou non) : on affiche donc toujours ce même
      // message de confirmation, jamais "cette adresse n'existe pas".
      setSent(true);
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'envoi. Réessayez.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h3>Mot de passe oublié</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {sent ? (
            <p style={{ fontSize: ".88rem", color: "var(--navy)" }}>
              Si un compte existe pour <strong>{email}</strong>, un nouveau mot de passe vient de lui être envoyé par e-mail.
              Vérifiez votre boîte de réception (et vos spams).
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ fontSize: ".84rem", color: "var(--muted)", marginBottom: 14 }}>
                Entrez votre adresse e-mail : nous vous enverrons un nouveau mot de passe.
              </p>
              <div className="form-group">
                <label>Adresse e-mail <span className="req">*</span></label>
                <div className="input-icon-wrap">
                  <Mail size={14} className="icon" />
                  <input type="email" placeholder="jean@exemple.mg" value={email}
                    onChange={(e) => setEmail(e.target.value)} autoFocus />
                </div>
              </div>
              <button type="submit" className="btn btn-primary login-btn" disabled={sending} style={{ marginTop: 6 }}>
                {sending ? "Envoi…" : "Envoyer"} <Send size={15} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
