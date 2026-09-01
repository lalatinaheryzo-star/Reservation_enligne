// pages/Landing.jsx — Version modernisée avec image taxi-brousse
import React, { useEffect, useState } from "react";
import reservationLogo from "../assets/images/reservation-logo-madagascar.png";
import { Bus, ShieldCheck, User, Building2, ArrowRight, MapPin, Clock, CreditCard, Star } from "lucide-react";

export default function Landing({ onChoose, onBack }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  return (
    <div className="landing">
      {/* ── GAUCHE : hero image taxi-brousse ── */}
      <div className={`landing-left ${mounted ? "mounted" : ""}`}>
        {/* Overlay gradient */}
        <div className="landing-left-overlay" />

        {/* Particules décoratives */}
        <div className="landing-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`particle particle-${i+1}`} />
          ))}
        </div>

        <div className="landing-left-content">
          {/* Badge */}
          <div className="landing-badge">
            <span className="landing-badge-dot" />
            Plateforme officielle de réservation · Madagascar
          </div>

          {/* Logo */}
          <div className="landing-logo">
            <img src={reservationLogo} alt="Réservation en ligne à Madagascar" className="brand-logo-image brand-logo-image--landing" />
            <div className="landing-logo-text">
              <h1>Réservation en ligne</h1>
              <p>À Madagascar</p>
            </div>
          </div>

          {/* Titre principal */}
          <h2 className="landing-headline">
            Voyagez à travers<br />
            <span>Madagascar</span><br />
            en toute sérénité
          </h2>
          <p className="landing-tagline">
            Réservez votre place en taxi-brousse depuis n'importe où.
            Choisissez votre siège, payez en ligne et voyagez l'esprit tranquille.
          </p>

          {/* Stats */}
          <div className="landing-stats">
            {[
              { val: "50+", label: "Destinations" },
              { val: "200+", label: "Voyages / semaine" },
              { val: "15k+", label: "Passagers satisfaits" },
            ].map(({ val, label }) => (
              <div key={label} className="landing-stat">
                <strong>{val}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Animation taxi-brousse (CSS) */}
          <div className="road-scene">
            <div className="smoke">
              <div className="smoke-puff" />
              <div className="smoke-puff" />
              <div className="smoke-puff" />
            </div>
            {/* Taxi-brousse stylisé */}
            <div className="taxibrousse">
              <div className="tb-body" />
              <div className="tb-cabin" />
              <div className="tb-windshield" />
              <div className="tb-window w1" />
              <div className="tb-window w2" />
              <div className="tb-rack" />
              <div className="tb-luggage l1" />
              <div className="tb-luggage l2" />
              <div className="tb-wheel front" />
              <div className="tb-wheel back" />
              <div className="tb-headlight" />
              <div className="tb-door" />
            </div>
            <div className="road">
              <div className="road-line" />
            </div>
            <div className="road-dust" />
          </div>

          {/* Features */}
          <div className="landing-features">
            {[
              { icon: <MapPin size={14} />, text: "Plan du véhicule avec sièges disponibles" },
              { icon: <CreditCard size={14} />, text: "Paiement Mvola, Orange Money, Airtel" },
              { icon: <Clock size={14} />, text: "Suivi en temps réel de votre réservation" },
              { icon: <Star size={14} />, text: "Service 24h/24, 7j/7" },
            ].map(({ icon, text }) => (
              <div key={text} className="landing-feature">
                <span className="landing-feature-icon">{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DROITE : choix d'espace ── */}
      <div className={`landing-right ${mounted ? "mounted" : ""}`}>
        <div className="landing-right-inner">

          {/* Header */}
          <div className="landing-right-header" style={{ justifyContent: onBack ? "space-between" : "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img src={reservationLogo} alt="Réservation en ligne" className="brand-logo-image brand-logo-image--small" />
              <span>Réservation en ligne</span>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: ".78rem", fontWeight: 700, color: "var(--muted, #64748B)",
                }}
              >
                ← Retour
              </button>
            )}
          </div>

          <h2 className="landing-choice-title">Bienvenue 👋</h2>
          <p className="landing-choice-sub">
            Sélectionnez votre espace pour accéder à la plateforme.
          </p>

          <div className="choice-cards">
            {/* UTILISATEUR — en premier (public) */}
            <button className="choice-card user" onClick={() => onChoose("user")}>
              <div className="choice-card-icon-wrap">
                <div className="choice-card-icon">
                  <User size={22} />
                </div>
                <div className="choice-card-glow user-glow" />
              </div>
              <div className="choice-card-text">
                <h3>Espace Voyageur</h3>
                <p>
                  Consultez les voyages, réservez votre place et payez en ligne.
                </p>
                <div className="choice-card-tags">
                  <span>Réservation</span>
                  <span>Paiement mobile</span>
                  <span>Suivi</span>
                </div>
              </div>
              <div className="choice-card-arrow">
                <ArrowRight size={16} />
              </div>
            </button>

            {/* PRÉSIDENT DE COOPÉRATIVE */}
            <button className="choice-card admin" style={{ borderColor: "rgba(16,185,129,.35)" }} onClick={() => onChoose("president")}>
              <div className="choice-card-icon-wrap">
                <div className="choice-card-icon" style={{ background: "linear-gradient(135deg,#059669,#10B981)" }}>
                  <Building2 size={22} />
                </div>
                <div className="choice-card-glow user-glow" />
              </div>
              <div className="choice-card-text">
                <h3>Espace Président</h3>
                <p>
                  Gérez votre coopérative : voyages, réservations et paiements.
                </p>
                <div className="choice-card-tags">
                  <span>Ma coopérative</span>
                  <span>Mes voyages</span>
                  <span>Mes paiements</span>
                </div>
              </div>
              <div className="choice-card-arrow">
                <ArrowRight size={16} />
              </div>
            </button>

            {/* ADMIN */}
            <button className="choice-card admin" onClick={() => onChoose("admin")}>
              <div className="choice-card-icon-wrap">
                <div className="choice-card-icon">
                  <ShieldCheck size={22} />
                </div>
                <div className="choice-card-glow admin-glow" />
              </div>
              <div className="choice-card-text">
                <h3>Espace Administrateur</h3>
                <p>
                  Gérez les voyages, coopératives, réservations et paiements.
                </p>
                <div className="choice-card-tags">
                  <span>Tableau de bord</span>
                  <span>Gestion</span>
                  <span>Rapports</span>
                </div>
              </div>
              <div className="choice-card-arrow">
                <ArrowRight size={16} />
              </div>
            </button>
          </div>

          {/* Séparateur */}
          <div className="landing-divider">
            <span>Plateforme sécurisée</span>
          </div>

          {/* Trust badges */}
          <div className="landing-trust">
            {["Paiement sécurisé", "Données protégées", "Support 24/7"].map((t) => (
              <div key={t} className="trust-badge">
                <span className="trust-dot" />
                {t}
              </div>
            ))}
          </div>

          <p className="landing-footer">
            © {new Date().getFullYear()} Réservation en ligne — Réservation en ligne
            <br />
            <span>Conçu pour Madagascar 🇲🇬</span>
          </p>
        </div>
      </div>
    </div>
  );
}
