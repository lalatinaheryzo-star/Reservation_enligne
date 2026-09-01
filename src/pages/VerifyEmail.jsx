// pages/VerifyEmail.jsx
// ============================================================
//  Page PUBLIQUE (pas de connexion requise) — confirme l'adresse
//  e-mail d'un compte VOYAGEUR/PRESIDENT fraîchement inscrit.
//  URL : /verifier-email?token=...  (lien envoyé par e-mail,
//  voir backend EmailVerificationService).
//  Le token peut aussi être collé manuellement si le lien n'a pas
//  été cliqué (ex. copié depuis un client mail qui casse les liens).
// ============================================================
import React, { useEffect, useState } from "react";
import reservationLogo from "../assets/images/reservation-logo-madagascar.png";
import { CheckCircle2, XCircle, Loader2, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { verifyEmail, resendVerification } from "../api/services";

export default function VerifyEmail({ token: initialToken, onGoToLogin }) {
  const [state, setState] = useState(initialToken ? "loading" : "manual"); // loading | success | invalid | manual
  const [manualToken, setManualToken] = useState("");
  const [checking, setChecking] = useState(false);
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);

  const attemptVerify = (tok) => {
    setState("loading");
    verifyEmail(tok)
      .then(() => setState("success"))
      .catch(() => setState("invalid"));
  };

  useEffect(() => {
    if (initialToken) attemptVerify(initialToken);
  }, [initialToken]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    setChecking(true);
    verifyEmail(manualToken.trim())
      .then(() => setState("success"))
      .catch((err) => {
        toast.error(err.message || "Code invalide ou expiré.");
        setState("invalid");
      })
      .finally(() => setChecking(false));
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Entrez votre e-mail."); return; }
    setResending(true);
    try {
      await resendVerification(email.trim());
      toast.success("Un nouveau code de vérification a été envoyé.");
    } catch (err) {
      toast.error(err.message || "Impossible de renvoyer le code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verif-page">
      <div className="verif-topbar">
        <img src={reservationLogo} alt="Réservation en ligne" className="brand-logo-image brand-logo-image--verify" />
        <span>Réservation en ligne · Vérification d'e-mail</span>
      </div>

      <div className="verif-content">
        {state === "loading" && (
          <div className="verif-card verif-card-center">
            <Loader2 className="spin" size={40} />
            <p>Vérification en cours…</p>
          </div>
        )}

        {state === "success" && (
          <div className="verif-card verif-card-center">
            <div className="verif-status-icon ok"><CheckCircle2 size={40} /></div>
            <h2>Adresse e-mail vérifiée !</h2>
            <p className="verif-muted">Vous pouvez maintenant vous connecter.</p>
            {onGoToLogin && (
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onGoToLogin}>
                Se connecter
              </button>
            )}
          </div>
        )}

        {state === "invalid" && (
          <div className="verif-card verif-card-center">
            <div className="verif-status-icon invalid"><XCircle size={40} /></div>
            <h2>Lien invalide ou expiré</h2>
            <p className="verif-muted">Demandez un nouveau code de vérification ci-dessous.</p>
            <form onSubmit={handleResend} style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <input
                type="email" placeholder="votre@email.mg" value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", minWidth: 220 }}
              />
              <button type="submit" className="btn btn-primary" disabled={resending}>
                {resending ? "Envoi…" : "Renvoyer le code"}
              </button>
            </form>
          </div>
        )}

        {state === "manual" && (
          <div className="verif-card verif-card-center">
            <div className="verif-status-icon"><KeyRound size={36} /></div>
            <h2>Entrez votre code de vérification</h2>
            <p className="verif-muted">Collez le code reçu par e-mail (ou cliquez directement sur le lien qu'il contient).</p>
            <form onSubmit={handleManualSubmit} style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <input
                type="text" inputMode="numeric" maxLength={6} placeholder="123456" value={manualToken}
                onChange={(e) => setManualToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", minWidth: 140,
                  letterSpacing: "4px", fontSize: "1.1rem", textAlign: "center" }}
              />
              <button type="submit" className="btn btn-primary" disabled={checking}>
                {checking ? "Vérification…" : "Vérifier"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
