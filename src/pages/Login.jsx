// pages/Login.jsx
import React, { useState } from "react";
import { Mail, Lock, Bus, Eye, EyeOff } from "lucide-react";
import { loginUser, registerUser, addUtilisateur } from "../firebase/services";
import toast from "react-hot-toast";

export default function Login() {
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({ email: "", password: "", nom: "", prenom: "", telephone: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await loginUser(form.email, form.password);
        toast.success("Connexion réussie !");
      } else {
        const cred = await registerUser(form.email, form.password);
        await addUtilisateur({
          uid: cred.user.uid,
          nom: form.nom, prenom: form.prenom,
          email: form.email, telephone: form.telephone,
        });
        toast.success("Compte créé !");
      }
    } catch (err) {
      const msg = {
        "auth/invalid-credential": "Email ou mot de passe incorrect",
        "auth/email-already-in-use": "Email déjà utilisé",
        "auth/weak-password": "Mot de passe trop faible (min 6 caractères)",
      }[err.code] || "Erreur d'authentification";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div style={{ marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, background: "rgba(16,185,129,.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
            <Bus size={28} color="#10B981" />
          </div>
          <h1>Réservez vos <span>voyages</span> facilement</h1>
          <p>Plateforme de réservation en ligne pour les coopératives de transport malgaches.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { t: "Paiement sécurisé", d: "Mvola, Orange Money, Airtel" },
            { t: "Notification instantanée", d: "SMS et WhatsApp" },
            { t: "Suivi en temps réel", d: "Statut de votre réservation" },
          ].map(({ t, d }) => (
            <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", marginTop: 7, flexShrink: 0 }} />
              <div>
                <div style={{ color: "white", fontSize: ".84rem", fontWeight: 600 }}>{t}</div>
                <div style={{ color: "rgba(255,255,255,.4)", fontSize: ".75rem" }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2>{mode === "login" ? "Connexion" : "Créer un compte"}</h2>
          <p>{mode === "login" ? "Accédez à votre espace" : "Rejoignez la plateforme"}</p>

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                {[{ f: "nom", p: "Nom" }, { f: "prenom", p: "Prénom" }].map(({ f, p }) => (
                  <div className="form-group" key={f}>
                    <label style={{ fontSize: ".74rem" }}>{p} *</label>
                    <input required value={form[f]} onChange={handle(f)} placeholder={p} />
                  </div>
                ))}
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontSize: ".74rem" }}>Téléphone</label>
                  <input value={form.telephone} onChange={handle("telephone")} placeholder="+261 34 00 000 00" />
                </div>
              </div>
            )}

            <div className="login-form-group">
              <label style={{ fontSize: ".74rem" }}>Adresse email *</label>
              <div className="input-icon-wrap">
                <Mail size={15} className="icon" />
                <input required type="email" value={form.email} onChange={handle("email")} placeholder="admin@voyage.mg" />
              </div>
            </div>

            <div className="login-form-group">
              <label style={{ fontSize: ".74rem" }}>Mot de passe *</label>
              <div className="input-icon-wrap" style={{ position: "relative" }}>
                <Lock size={15} className="icon" />
                <input required type={showPw ? "text" : "password"} value={form.password} onChange={handle("password")} placeholder="••••••••" style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? "…" : mode === "login" ? "Se connecter" : "Créer le compte"}
            </button>
          </form>

          <div className="login-switch">
            {mode === "login" ? (
              <>Pas encore de compte ? <a onClick={() => setMode("register")}>S'inscrire</a></>
            ) : (
              <>Déjà un compte ? <a onClick={() => setMode("login")}>Se connecter</a></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
