// pages/SiteVitrine.jsx
// ============================================================
//  Site vitrine Réservation en ligne — page de présentation professionnelle
//  affichée AVANT l'application de réservation existante.
//  Structure/UX inspirées de grands sites commerciaux (ex.
//  Namecheap) : navigation, hero, sections explicatives,
//  cartes de services, FAQ, footer riche.
//
//  ⚠️ Ce composant est purement additif : il ne modifie aucune
//  route, aucun appel API, aucune logique métier existante.
//  Les CTA appellent les callbacks fournies par App.jsx pour
//  rejoindre le parcours de connexion / réservation déjà en
//  place (LoginUser, LoginAdmin, UserApp…).
// ============================================================
import React, { useEffect, useRef, useState, useCallback } from "react";
import reservationLogo from "../assets/images/reservation-logo-madagascar.png";
import {
  Bus, Menu, X, ArrowRight, MapPin, Clock, CreditCard,
  ShieldCheck, Smartphone, QrCode, Search, CheckCircle2, XCircle,
  Users, Building2, Bell, History, Receipt, ChevronDown, Gauge,
  Lock, Sparkles, Layers, Wallet, Award, ClipboardCheck, UserCog,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import "../styles/vitrine.css";

const NAV_ITEMS = [
  { id: "top",            label: "Accueil" },
  { id: "services",       label: "Services" },
  { id: "destinations",   label: "Voyages" },
  { id: "comment",        label: "Comment ça marche" },
  { id: "cooperatives",   label: "Coopératives" },
  { id: "apropos",        label: "À propos" },
  { id: "faq",            label: "FAQ" },
];

const FALLBACK_DESTINATIONS = [
  { ville_depart: "Antananarivo", ville_arrivee: "Antsirabe",   duree: "≈ 3h" },
  { ville_depart: "Antananarivo", ville_arrivee: "Fianarantsoa",duree: "≈ 7h" },
  { ville_depart: "Antananarivo", ville_arrivee: "Toamasina",   duree: "≈ 6h" },
  { ville_depart: "Antananarivo", ville_arrivee: "Mahajanga",   duree: "≈ 9h" },
];

const FAQ_ITEMS = [
  {
    q: "Comment réserver un voyage sur Réservation en ligne ?",
    a: "Recherchez votre trajet, choisissez le voyage qui vous convient, sélectionnez un siège disponible puis confirmez votre réservation en quelques étapes simples.",
  },
  {
    q: "Puis-je choisir mon siège ?",
    a: "Oui. Lorsque cette fonctionnalité est disponible pour le voyage choisi, un plan des places vous permet de sélectionner directement votre siège.",
  },
  {
    q: "Comment recevoir mon reçu ?",
    a: "Un reçu numérique est généré automatiquement après validation de votre réservation. Vous pouvez le retrouver à tout moment dans votre espace voyageur.",
  },
  {
    q: "Comment fonctionne le QR Code ?",
    a: "Chaque réservation confirmée génère un QR Code unique qui sert de justificatif numérique et peut être présenté lors du contrôle.",
  },
  {
    q: "Comment vérifier ma réservation ?",
    a: "Votre réservation peut être vérifiée via son QR Code, qui renvoie vers une page de contrôle sécurisée dédiée à cet effet.",
  },
  {
    q: "Comment fonctionne le paiement ?",
    a: "Le paiement est géré directement depuis la plateforme au moment de la réservation, selon les moyens proposés par Réservation en ligne.",
  },
  {
    q: "Puis-je consulter mes anciennes réservations ?",
    a: "Oui, votre historique de réservations est disponible à tout moment depuis votre espace voyageur.",
  },
  {
    q: "Les coopératives peuvent-elles gérer leurs voyages ?",
    a: "Oui. Les coopératives disposent d'un espace dédié pour gérer leurs voyages, leurs places, leurs réservations et suivre leur activité.",
  },
  {
    q: "Qui gère les coopératives sur Réservation en ligne ?",
    a: "Chaque coopérative est gérée de façon indépendante par son propre Président, depuis son propre espace. L'administrateur supervise l'ensemble de la plateforme sans gérer les coopératives à leur place.",
  },
  {
    q: "Comment devenir Président d'une coopérative ?",
    a: "Une personne souhaitant créer sa coopérative peut en faire la demande auprès de l'administrateur. Une fois la demande validée, la coopérative est activée et le candidat devient Président avec son propre compte.",
  },
];

export default function SiteVitrine({ onReserve, onLoginClick, onCooperativeClick, onIntegrateCooperativeClick }) {
  const { voyages = [], cooperatives = [] } = useAppContext();
  const rootRef = useRef(null);
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq]     = useState(0);
  const [openStep, setOpenStep]   = useState(null);

  // ── navbar : ombre au scroll ──────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── apparition au scroll (IntersectionObserver, sans lib) ─
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll(".mv-reveal") || [];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("mv-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const scrollTo = useCallback((id) => {
    setMobileOpen(false);
    if (id === "top") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // ── destinations : données réelles si disponibles, sinon repli clairement indicatif ─
  const realDestinations = (voyages || [])
    .filter((v) => (v.statut || "").toLowerCase() === "actif")
    .reduce((acc, v) => {
      const key = `${v.ville_depart}→${v.ville_arrivee}`;
      if (!acc.some((x) => `${x.ville_depart}→${x.ville_arrivee}` === key)) acc.push(v);
      return acc;
    }, [])
    .slice(0, 4);
  const usingRealData = realDestinations.length > 0;
  const destinations = usingRealData ? realDestinations : FALLBACK_DESTINATIONS;

  const statVoyages = voyages.length;
  const statCoops    = cooperatives.length;
  const statDest     = new Set(voyages.map((v) => `${v.ville_depart}→${v.ville_arrivee}`)).size;

  return (
    <div className="mv-root" ref={rootRef} id="top">
      {/* ═══════════════════════ NAVBAR ═══════════════════════ */}
      <header className={`mv-navbar ${scrolled ? "mv-scrolled" : ""}`}>
        <div className="mv-navbar-inner">
          <button className="mv-logo" onClick={() => scrollTo("top")} style={{ background: "none", border: "none" }}>
            <img src={reservationLogo} alt="Réservation en ligne à Madagascar" className="brand-logo-image brand-logo-image--nav" />
            <span>Réservation en ligne</span>
          </button>

          <nav className="mv-nav-links">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => scrollTo(item.id)}>{item.label}</button>
            ))}
          </nav>

          <div className="mv-nav-actions">
            <button className="mv-nav-login" onClick={onLoginClick}>Se connecter</button>
            <button className="mv-btn mv-btn-primary mv-btn-sm" onClick={onReserve}>
              Réserver maintenant
            </button>
            <button className="mv-burger" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <div className={`mv-mobile-panel ${mobileOpen ? "mv-open" : ""}`}>
          {NAV_ITEMS.map((item) => (
            <button key={item.id} className="mv-mobile-link" onClick={() => scrollTo(item.id)}>
              {item.label}
            </button>
          ))}
          <div className="mv-mobile-actions">
            <button className="mv-btn mv-btn-outline mv-btn-block" onClick={() => { setMobileOpen(false); onLoginClick(); }}>
              Se connecter
            </button>
            <button className="mv-btn mv-btn-primary mv-btn-block" onClick={() => { setMobileOpen(false); onReserve(); }}>
              Réserver maintenant
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="mv-hero">
        <div className="mv-container mv-hero-grid">
          <div>
            <div className="mv-eyebrow"><span className="mv-eyebrow-dot" />Plateforme de réservation de voyages</div>
            <h1 className="mv-hero-title">
              Voyagez autrement<br />avec <span className="accent">Réservation en ligne</span>
            </h1>
            <p className="mv-hero-desc">
              Recherchez votre voyage, choisissez votre siège et réservez votre place
              en quelques clics. Réservation en ligne simplifie la réservation de voyages à Madagascar,
              pour les voyageurs comme pour les coopératives de transport.
            </p>
            <div className="mv-hero-ctas">
              <button className="mv-btn mv-btn-primary" onClick={onReserve}>
                Réserver maintenant <ArrowRight size={16} />
              </button>
              <button className="mv-btn mv-btn-outline" onClick={() => scrollTo("apropos")}>
                Découvrir Réservation en ligne
              </button>
            </div>
            <div className="mv-hero-trust">
              <div className="mv-hero-trust-item"><CheckCircle2 size={15} color="#10B981" /> Réservation en ligne</div>
              <div className="mv-hero-trust-item"><CheckCircle2 size={15} color="#10B981" /> Choix du siège</div>
              <div className="mv-hero-trust-item"><CheckCircle2 size={15} color="#10B981" /> Billet numérique</div>
            </div>
          </div>

          <div className="mv-hero-visual">
            <div className="mv-hero-blob" />
            <div className="mv-float-card mv-float-1">
              <span className="ic"><CheckCircle2 size={15} /></span> Place confirmée
            </div>
            <div className="mv-float-card mv-float-2">
              <span className="ic"><ShieldCheck size={15} /></span> Paiement sécurisé
            </div>
            <div className="mv-phone">
              <div className="mv-phone-screen">
                <div className="mv-phone-topbar"><span>MON BILLET</span><Bus size={15} color="#0B1530" /></div>
                <div className="mv-ticket">
                  <div className="mv-ticket-route"><span>ANT</span><ArrowRight size={15} /><span>TMV</span></div>
                  <div className="mv-ticket-sub">Antananarivo → Toamasina</div>
                  <div className="mv-ticket-divider" />
                  <div className="mv-ticket-meta">
                    <div>SIÈGE<strong>12</strong></div>
                    <div>DÉPART<strong>06:30</strong></div>
                    <div>DATE<strong>12/06</strong></div>
                  </div>
                  <div className="mv-qr-mini">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <span key={i} style={{ opacity: (i * 7) % 3 === 0 ? 1 : 0 }} />
                    ))}
                  </div>
                </div>
                <div className="mv-phone-below">
                  <div className="mv-phone-row"><span className="dot" /> Réservation confirmée</div>
                  <div className="mv-phone-row"><span className="dot" /> QR Code généré</div>
                  <div className="mv-phone-row"><span className="dot" /> Reçu disponible</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TRUST BAR ═══════════════════════ */}
      <section className="mv-trustbar">
        <div className="mv-container mv-trustbar-inner">
          <span className="mv-trustbar-label">Une nouvelle manière de préparer vos voyages</span>
          <div className="mv-trust-pill"><Smartphone size={15} />Réservation en ligne</div>
          <div className="mv-trust-pill"><MapPin size={15} />Choix du siège</div>
          <div className="mv-trust-pill"><Receipt size={15} />Billet numérique</div>
          <div className="mv-trust-pill"><QrCode size={15} />QR Code</div>
          <div className="mv-trust-pill"><Bell size={15} />Notifications</div>
        </div>
      </section>

      {/* ═══════════════════════ PROBLÈME ═══════════════════════ */}
      <section className="mv-problem">
        <div className="mv-container">
          <div className="mv-section-head mv-reveal">
            <div className="mv-eyebrow"><span className="mv-eyebrow-dot" />Le constat</div>
            <h2 className="mv-section-title">Réserver un voyage ne devrait pas être compliqué.</h2>
            <p className="mv-section-sub">
              Entre déplacements inutiles et informations difficiles à trouver, préparer
              un voyage prend souvent plus de temps qu'il ne le faudrait.
            </p>
          </div>

          <div className="mv-compare">
            <div className="mv-compare-col before mv-reveal">
              <div className="mv-compare-head before"><XCircle size={20} /> Avant Réservation en ligne</div>
              <div className="mv-compare-list">
                {[
                  "Déplacement jusqu'à la gare",
                  "Attente sur place",
                  "Informations limitées sur le voyage",
                  "Difficulté à trouver une place",
                  "Impossible de choisir son siège facilement",
                  "Temps perdu",
                ].map((t) => (
                  <div key={t} className="mv-compare-item before"><XCircle size={16} />{t}</div>
                ))}
              </div>
            </div>
            <div className="mv-compare-col after mv-reveal d1">
              <div className="mv-compare-head after"><CheckCircle2 size={20} /> Avec Réservation en ligne</div>
              <div className="mv-compare-list">
                {[
                  "Recherche en ligne, où que vous soyez",
                  "Informations centralisées",
                  "Disponibilité des places en direct",
                  "Choix du siège",
                  "Réservation en quelques clics",
                  "Reçu numérique immédiat",
                ].map((t) => (
                  <div key={t} className="mv-compare-item after"><CheckCircle2 size={16} />{t}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ QU'EST-CE QUE Réservation en ligne ═══════════════════════ */}
      <section className="mv-about" id="apropos">
        <div className="mv-container mv-about-grid">
          <div className="mv-reveal">
            <div className="mv-eyebrow"><span className="mv-eyebrow-dot" />À propos de Réservation en ligne</div>
            <h2 className="mv-section-title" style={{ textAlign: "left" }}>Réservation en ligne simplifie votre façon de voyager.</h2>
            <p className="mv-section-sub" style={{ margin: "18px 0 0", textAlign: "left" }}>
              Réservation en ligne est une plateforme numérique qui connecte voyageurs et coopératives de
              transport. Les voyageurs recherchent, comparent et réservent leur voyage en
              ligne ; les coopératives gèrent leurs trajets, leurs places et leurs
              réservations depuis un espace dédié. Un seul système, une expérience fluide
              pour tout le monde.
            </p>
            <div className="mv-about-stats">
              <div className="mv-stat-mini"><strong>{statVoyages > 0 ? `${statVoyages}+` : "—"}</strong><span>Voyages référencés</span></div>
              <div className="mv-stat-mini"><strong>{statCoops > 0 ? `${statCoops}+` : "—"}</strong><span>Coopératives partenaires</span></div>
            </div>
            <div style={{ marginTop: 28 }}>
              <button className="mv-btn mv-btn-dark" onClick={onReserve}>Réserver maintenant <ArrowRight size={16} /></button>
            </div>
          </div>

          <div className="mv-about-visual mv-reveal d1">
            <div className="mv-flow-step"><span className="n">1</span>Réservation en ligne</div>
            <div className="mv-flow-arrow" />
            <div className="mv-flow-step"><span className="n">2</span>Choix du siège</div>
            <div className="mv-flow-arrow" />
            <div className="mv-flow-step"><span className="n">3</span>Confirmation instantanée</div>
            <div className="mv-flow-arrow" />
            <div className="mv-flow-step"><span className="n">4</span>Billet numérique + QR Code</div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ SERVICES ═══════════════════════ */}
      <section className="mv-services" id="services">
        <div className="mv-container">
          <div className="mv-section-head mv-reveal">
            <div className="mv-eyebrow"><span className="mv-eyebrow-dot" />Nos services</div>
            <h2 className="mv-section-title">Tout ce dont vous avez besoin pour préparer votre voyage</h2>
            <p className="mv-section-sub">Une plateforme complète, pensée du premier clic jusqu'à l'embarquement.</p>
          </div>

          <div className="mv-bento">
            <div className="mv-card span2-row mv-reveal">
              <div>
                <div className="mv-card-icon" style={{ background: "#EEF2FF", color: "#4F46E5" }}><Smartphone size={20} /></div>
                <h4>Réservation en ligne</h4>
                <p>Réservez votre voyage depuis votre téléphone ou votre ordinateur, à tout moment, sans avoir à vous déplacer.</p>
              </div>
              <div className="mv-card-stat">24/7<span>Accessible en permanence</span></div>
            </div>

            <div className="mv-card mv-reveal d1">
              <div className="mv-card-icon" style={{ background: "#ECFDF5", color: "#059669" }}><MapPin size={20} /></div>
              <h4>Choix du siège</h4>
              <p>Visualisez les places disponibles et sélectionnez celle qui vous convient.</p>
            </div>

            <div className="mv-card mv-reveal d2">
              <div className="mv-card-icon" style={{ background: "#FEF3C7", color: "#B45309" }}><ClipboardCheck size={20} /></div>
              <h4>Informations de voyage</h4>
              <p>Consultez les informations essentielles avant votre départ.</p>
            </div>

            <div className="mv-card horizontal mv-reveal">
              <div className="mv-card-icon" style={{ background: "#EFF6FF", color: "#0EA5E9" }}><Wallet size={20} /></div>
              <div>
                <h4>Paiement</h4>
                <p>Gérez le paiement de votre réservation directement depuis la plateforme.</p>
              </div>
            </div>

            <div className="mv-card horizontal mv-reveal d1">
              <div className="mv-card-icon" style={{ background: "#FEF2F2", color: "#DC2626" }}><Receipt size={20} /></div>
              <div>
                <h4>Reçu numérique</h4>
                <p>Recevez votre justificatif de réservation immédiatement.</p>
              </div>
            </div>

            <div className="mv-card mv-reveal d3">
              <div className="mv-card-icon" style={{ background: "#F0FDFA", color: "#0D9488" }}><QrCode size={20} /></div>
              <h4>QR Code</h4>
              <p>Chaque réservation possède un QR Code permettant sa vérification.</p>
            </div>

            <div className="mv-card mv-reveal d4">
              <div className="mv-card-icon" style={{ background: "#F5F3FF", color: "#7C3AED" }}><Bell size={20} /></div>
              <h4>Notifications</h4>
              <p>Recevez les informations importantes concernant votre réservation.</p>
            </div>

            <div className="mv-card span2 mv-reveal d2">
              <div className="mv-card-icon" style={{ background: "#FDF2F8", color: "#DB2777" }}><History size={20} /></div>
              <h4>Historique</h4>
              <p>Retrouvez facilement toutes vos réservations précédentes depuis votre espace voyageur.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ COMMENT ÇA MARCHE ═══════════════════════ */}
      <section className="mv-how" id="comment">
        <div className="mv-container">
          <div className="mv-section-head mv-reveal">
            <div className="mv-eyebrow"><span className="mv-eyebrow-dot" />Fonctionnement</div>
            <h2 className="mv-section-title">Votre voyage en quelques étapes</h2>
            <p className="mv-section-sub">De la recherche à l'embarquement, un parcours pensé pour être simple.</p>
          </div>

          <div className="mv-steps">
            {[
              { n: "01", t: "Recherchez", d: "Trouvez votre destination et votre date de départ.", Icon: Search },
              { n: "02", t: "Choisissez", d: "Sélectionnez le voyage et votre siège préféré.", Icon: MapPin },
              { n: "03", t: "Réservez", d: "Confirmez vos informations et votre paiement.", Icon: CreditCard },
              { n: "04", t: "Voyagez", d: "Recevez votre reçu et votre QR Code, et embarquez.", Icon: Bus },
            ].map((s, i) => (
              <div key={s.n} className={`mv-step mv-reveal d${i}`}>
                <div className="mv-step-num">{s.n}</div>
                {i < 3 && <div className="mv-step-line" />}
                <h4>{s.t}</h4>
                <button
                  type="button"
                  className="mv-step-detail-toggle"
                  onClick={() => setOpenStep(openStep === i ? null : i)}
                  aria-expanded={openStep === i}
                >
                  {openStep === i ? "Masquer l'explication" : "Voir l'explication"}
                  <ChevronDown
                    size={13}
                    style={{ marginLeft: 5, verticalAlign: "middle", transform: openStep === i ? "rotate(180deg)" : "none", transition: "transform .2s" }}
                  />
                </button>
                {openStep === i && <div className="mv-step-detail">{s.d}</div>}
              </div>
            ))}
          </div>

          <div className="mv-how-cta">
            <button className="mv-btn mv-btn-primary" onClick={onReserve}>
              Commencer une réservation <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ DESTINATIONS ═══════════════════════ */}
      <section className="mv-destinations" id="destinations">
        <div className="mv-container">
          <div className="mv-section-head mv-reveal">
            <div className="mv-eyebrow"><span className="mv-eyebrow-dot" />Voyages</div>
            <h2 className="mv-section-title">Explorez les destinations disponibles</h2>
            <p className="mv-section-sub">Un aperçu des trajets proposés sur la plateforme.</p>
          </div>

          <div className="mv-dest-grid">
            {destinations.map((d, i) => {
              const key = `${d.ville_depart}-${d.ville_arrivee}-${i}`;
              const prix = d.prix ? `${Number(d.prix).toLocaleString()} Ar` : null;
              return (
                <div key={key} className={`mv-dest-card mv-reveal d${i % 4}`} onClick={onReserve}>
                  <div className="mv-dest-card-top">
                    <span className="badge">{usingRealData ? "Disponible" : "Exemple"}</span>
                    <Bus size={22} />
                  </div>
                  <div className="mv-dest-card-body">
                    <div className="mv-dest-route">{d.ville_depart} <ArrowRight size={13} /> {d.ville_arrivee}</div>
                    <div className="mv-dest-meta"><Clock size={13} />{d.duree || (d.heure_depart ? `Départ ${d.heure_depart.slice(0,5)}` : "Durée variable")}</div>
                    {prix && <div className="mv-dest-price">{prix}</div>}
                    <button onClick={(e) => { e.stopPropagation(); onReserve(); }}>
                      Voir le voyage <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mv-dest-note">
            {usingRealData
              ? "Destinations actuellement disponibles sur la plateforme."
              : "Exemples de trajets courants — les voyages réellement disponibles s'affichent une fois connecté à la plateforme."}
          </p>
        </div>
      </section>

      {/* ═══════════════════════ POUR LES VOYAGEURS ═══════════════════════ */}
      <section className="mv-split">
        <div className="mv-container mv-split-grid">
          <div className="mv-split-visual travelers mv-reveal">
            <div className="mv-mini-card">
              <span className="ic" style={{ background: "#DBEAFE", color: "#2563EB" }}><Search size={16} /></span>
              Recherche de voyage en cours…
            </div>
            <div className="mv-mini-card">
              <span className="ic" style={{ background: "#DCFCE7", color: "#16A34A" }}><MapPin size={16} /></span>
              Siège 12 sélectionné
            </div>
            <div className="mv-mini-card">
              <span className="ic" style={{ background: "#FEF9C3", color: "#CA8A04" }}><Bell size={16} /></span>
              Notification : voyage confirmé
            </div>
          </div>
          <div className="mv-reveal d1">
            <div className="mv-eyebrow"><span className="mv-eyebrow-dot" />Pour les voyageurs</div>
            <h2 className="mv-section-title" style={{ textAlign: "left" }}>Tout votre voyage, au même endroit.</h2>
            <div className="mv-split-list">
              {[
                ["Recherchez", "Trouvez rapidement votre trajet et votre date."],
                ["Réservez", "Confirmez votre voyage en quelques clics."],
                ["Choisissez votre siège", "Sélectionnez la place qui vous convient."],
                ["Suivez vos réservations", "Consultez l'historique et le statut de vos voyages."],
                ["Recevez vos notifications", "Restez informé à chaque étape."],
              ].map(([t, d]) => (
                <div key={t} className="mv-split-item">
                  <span className="ic"><CheckCircle2 size={16} /></span>
                  <div><strong>{t}</strong> — <span style={{ color: "var(--mv-muted)" }}>{d}</span></div>
                </div>
              ))}
            </div>
            <button className="mv-btn mv-btn-primary" onClick={onReserve}>Réserver maintenant <ArrowRight size={16} /></button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ POUR LES COOPÉRATIVES ═══════════════════════ */}
      <section className="mv-split reverse" id="cooperatives">
        <div className="mv-container mv-split-grid">
          <div className="mv-reveal">
            <div className="mv-eyebrow"><span className="mv-eyebrow-dot" />Pour les coopératives</div>
            <h2 className="mv-section-title" style={{ textAlign: "left" }}>Une solution aussi pensée pour les coopératives</h2>
            <p className="mv-section-sub" style={{ textAlign: "left", margin: "16px 0 24px" }}>
              Réservation en ligne permet aux coopératives de transport de gérer plus facilement leurs
              opérations depuis un espace centralisé.
            </p>
            <div className="mv-split-list">
              {[
                ["Gérer les voyages", "Créez et mettez à jour vos trajets."],
                ["Gérer les places", "Suivez la disponibilité en temps réel."],
                ["Suivre les réservations", "Validez ou refusez les demandes."],
                ["Vérifier les billets", "Contrôlez les QR Codes des voyageurs."],
                ["Suivre leur activité", "Consultez les statistiques de la coopérative."],
              ].map(([t, d]) => (
                <div key={t} className="mv-split-item">
                  <span className="ic"><Building2 size={16} /></span>
                  <div><strong>{t}</strong> — <span style={{ color: "var(--mv-muted)" }}>{d}</span></div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: ".82rem", color: "var(--mv-muted)", margin: "-8px 0 20px" }}>
              Chaque coopérative est représentée par un seul Président. Vous représentez une
              coopérative existante ? Déposez une demande d'intégration : après validation par
              l'administrateur, vous obtenez votre propre compte Président.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="mv-btn mv-btn-dark" onClick={onIntegrateCooperativeClick}>
                Intégrer ma coopérative <ArrowRight size={16} />
              </button>
              <button className="mv-btn mv-btn-outline" onClick={onCooperativeClick}>
                J'ai déjà un compte Président
              </button>
            </div>
          </div>
          <div className="mv-split-visual coops mv-reveal d1">
            <div className="mv-mini-card">
              <span className="ic" style={{ background: "#D1FAE5", color: "#059669" }}><Bus size={16} /></span>
              12 voyages actifs
            </div>
            <div className="mv-mini-card">
              <span className="ic" style={{ background: "#E0E7FF", color: "#4F46E5" }}><Users size={16} /></span>
              Réservations en attente : 3
            </div>
            <div className="mv-mini-card">
              <span className="ic" style={{ background: "#FEE2E2", color: "#DC2626" }}><ShieldCheck size={16} /></span>
              Billets vérifiés en gare
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ 3 ESPACES ═══════════════════════ */}
      <section className="mv-advantages" style={{ paddingBottom: 60 }}>
        <div className="mv-container">
          <div className="mv-section-head mv-reveal">
            <div className="mv-eyebrow"><span className="mv-eyebrow-dot" />Une plateforme, trois espaces</div>
            <h2 className="mv-section-title">Un espace dédié pour chaque rôle</h2>
            <p className="mv-section-sub">Chaque coopérative garde sa propre gestion, sous la supervision globale de Réservation en ligne.</p>
          </div>
          <div className="mv-bento mv-bento-3col">
            <div className="mv-card mv-reveal">
              <div className="mv-card-icon" style={{ background: "#EEF2FF", color: "#4F46E5" }}><ShieldCheck size={20} /></div>
              <h4>Espace Admin</h4>
              <p>Supervision globale de la plateforme : coopératives, présidents, voyages, réservations et paiements.</p>
            </div>
            <div className="mv-card mv-reveal d1">
              <div className="mv-card-icon" style={{ background: "#ECFDF5", color: "#059669" }}><UserCog size={20} /></div>
              <h4>Espace Président</h4>
              <p>Gestion complète de sa propre coopérative : voyages, réservations, paiements et voyageurs.</p>
            </div>
            <div className="mv-card mv-reveal d2">
              <div className="mv-card-icon" style={{ background: "#EFF6FF", color: "#0EA5E9" }}><Users size={20} /></div>
              <h4>Espace Voyageur</h4>
              <p>Réservation en ligne : recherche, choix du siège, paiement, reçu numérique et QR Code.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ QR CODE ═══════════════════════ */}
      <section className="mv-qrsection">
        <div className="mv-container mv-qr-grid">
          <div className="mv-reveal">
            <div className="mv-eyebrow" style={{ background: "rgba(255,255,255,.08)", borderColor: "rgba(255,255,255,.16)", color: "#fff" }}>
              <span className="mv-eyebrow-dot" />Billet numérique
            </div>
            <h2 className="mv-section-title" style={{ textAlign: "left", color: "#fff" }}>
              Votre billet numérique toujours avec vous
            </h2>
            <p style={{ color: "rgba(255,255,255,.7)", marginTop: 14, lineHeight: 1.7 }}>
              Une fois votre réservation confirmée, Réservation en ligne génère automatiquement un reçu
              numérique associé à un QR Code, qui sert de justificatif lors de votre voyage.
            </p>
            <div className="mv-qr-flow">
              {["Réservation", "Confirmation", "Reçu numérique", "QR Code", "Vérification"].map((s, i) => (
                <React.Fragment key={s}>
                  <div className="mv-qr-flow-item"><span className="n">{i + 1}</span>{s}</div>
                  {i < 4 && <div className="mv-qr-flow-line" />}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="mv-qr-ticket-visual mv-reveal d1">
            <div className="mv-real-ticket">
              <div className="rt-top"><strong>Réservation en ligne</strong><span className="rt-badge">Confirmé</span></div>
              <div className="rt-route">Antananarivo <ArrowRight size={16} /> Antsirabe</div>
              <div className="rt-qr">
                {Array.from({ length: 64 }).map((_, i) => (
                  <span key={i} style={{ opacity: (i * 13) % 5 === 0 ? 1 : 0 }} />
                ))}
              </div>
              <div className="rt-foot">Présentez ce QR Code à l'embarquement</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ AVANTAGES ═══════════════════════ */}
      <section className="mv-advantages">
        <div className="mv-container">
          <div className="mv-section-head mv-reveal">
            <div className="mv-eyebrow"><span className="mv-eyebrow-dot" />Avantages</div>
            <h2 className="mv-section-title">Pourquoi choisir Réservation en ligne ?</h2>
          </div>
          <div className="mv-adv-grid">
            {[
              { Icon: Gauge,     t: "Gain de temps",  d: "Plus besoin de se déplacer uniquement pour réserver votre voyage." },
              { Icon: Sparkles,  t: "Simplicité",     d: "Une expérience pensée pour être facile à utiliser, du premier clic à la réservation." },
              { Icon: Layers,    t: "Transparence",   d: "Les informations du voyage sont accessibles avant même la réservation." },
              { Icon: MapPin,    t: "Choix",          d: "Le voyageur peut choisir son siège lorsque cette fonctionnalité est disponible." },
              { Icon: Lock,      t: "Sécurité",       d: "Les informations et les réservations sont gérées par le système de bout en bout." },
              { Icon: Award,     t: "Digital",        d: "Billet numérique, QR Code et notifications, sans papier." },
            ].map((a, i) => (
              <div key={a.t} className={`mv-adv-item mv-reveal d${i % 4}`}>
                <div className="mv-adv-icon"><a.Icon size={22} /></div>
                <h4>{a.t}</h4>
                <p>{a.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ STATISTIQUES ═══════════════════════ */}
      <section className="mv-stats">
        <div className="mv-container mv-stats-grid">
          <div className="mv-reveal"><strong>{statVoyages > 0 ? `${statVoyages}+` : "—"}</strong><span>Voyages référencés</span></div>
          <div className="mv-reveal d1"><strong>{statDest > 0 ? `${statDest}+` : "—"}</strong><span>Destinations</span></div>
          <div className="mv-reveal d2"><strong>{statCoops > 0 ? `${statCoops}+` : "—"}</strong><span>Coopératives partenaires</span></div>
          <div className="mv-reveal d3"><strong>100%</strong><span>Réservation en ligne</span></div>
        </div>
      </section>

      {/* ═══════════════════════ Réservation en ligne EN QUELQUES MOTS ═══════════════════════ */}
      <section className="mv-story">
        <div className="mv-container mv-story-grid">
          <div className="mv-reveal">
            <div className="mv-eyebrow"><span className="mv-eyebrow-dot" />Notre histoire</div>
            <h2 className="mv-section-title" style={{ textAlign: "left" }}>Une plateforme pensée pour simplifier le voyage</h2>
            <div className="mv-story-chain" style={{ marginTop: 22 }}>
              {["Problème", "Besoin", "Réservation en ligne", "Solution numérique", "Réservation", "Voyage"].map((s, i, arr) => (
                <React.Fragment key={s}>
                  <div className="mv-story-node"><span className="dot" /><span>{s}</span></div>
                  {i < arr.length - 1 && <div className="mv-story-line" />}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="mv-reveal d1">
            <p>
              À Madagascar, préparer un voyage en taxi-brousse ou en bus signifie souvent
              se déplacer physiquement, attendre, et espérer trouver une place disponible.
            </p>
            <p>
              Réservation en ligne est né de ce constat simple : la réservation d'un voyage peut être
              centralisée, transparente et accessible depuis un téléphone, sans perdre le
              lien avec les coopératives qui font vivre le transport local.
            </p>
            <p>
              Aujourd'hui, Réservation en ligne connecte voyageurs et coopératives autour d'un même
              système : recherche, réservation, paiement, reçu numérique et QR Code — un
              parcours complet, pensé pour être clair à chaque étape.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FAQ ═══════════════════════ */}
      <section className="mv-faq" id="faq">
        <div className="mv-container">
          <div className="mv-section-head mv-reveal">
            <div className="mv-eyebrow"><span className="mv-eyebrow-dot" />Questions fréquentes</div>
            <h2 className="mv-section-title">Vous avez des questions ?</h2>
            <p className="mv-section-sub">Voici les réponses aux questions les plus courantes sur Réservation en ligne.</p>
          </div>
          <div className="mv-faq-list">
            {FAQ_ITEMS.map((item, i) => (
              <div key={item.q} className="mv-faq-item mv-reveal" data-open={openFaq === i}>
                <button className="mv-faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  {item.q}
                  <ChevronDown size={18} />
                </button>
                <div className="mv-faq-a"><div className="mv-faq-a-inner">{item.a}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CTA FINAL ═══════════════════════ */}
      <section className="mv-final-cta">
        <div className="mv-container">
          <h2>Prêt pour votre prochain voyage ?</h2>
          <p>Trouvez votre trajet, choisissez votre siège et réservez votre place simplement avec Réservation en ligne.</p>
          <button className="mv-btn mv-btn-primary" onClick={onReserve}>
            Réserver maintenant <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="mv-footer">
        <div className="mv-container mv-footer-grid">
          <div className="mv-footer-brand">
            <div className="mv-logo"><img src={reservationLogo} alt="Réservation en ligne à Madagascar" className="brand-logo-image brand-logo-image--nav" /><span>Réservation en ligne</span></div>
            <p>
              Réservation en ligne est une plateforme de réservation de voyages qui connecte voyageurs
              et coopératives de transport à Madagascar.
            </p>
          </div>
          <div className="mv-footer-col">
            <h5>Navigation</h5>
            <ul>
              <li><button onClick={() => scrollTo("top")}>Accueil</button></li>
              <li><button onClick={() => scrollTo("services")}>Services</button></li>
              <li><button onClick={() => scrollTo("destinations")}>Voyages</button></li>
              <li><button onClick={() => scrollTo("comment")}>Comment ça marche</button></li>
              <li><button onClick={() => scrollTo("apropos")}>À propos</button></li>
              <li><button onClick={() => scrollTo("faq")}>FAQ</button></li>
            </ul>
          </div>
          <div className="mv-footer-col">
            <h5>Voyageurs</h5>
            <ul>
              <li><button onClick={onReserve}>Réserver</button></li>
              <li><button onClick={onReserve}>Mes réservations</button></li>
              <li><button onClick={onReserve}>Mes reçus</button></li>
              <li><button onClick={onLoginClick}>Connexion</button></li>
            </ul>
          </div>
          <div className="mv-footer-col">
            <h5>Coopératives</h5>
            <ul>
              <li><button onClick={onCooperativeClick}>Espace coopérative</button></li>
              <li><button onClick={onCooperativeClick}>Connexion</button></li>
            </ul>
          </div>
        </div>
        <div className="mv-container mv-footer-bottom">
          <span>© {new Date().getFullYear()} Réservation en ligne — Réservation de voyages à Madagascar.</span>
          <div className="mv-footer-legal">
            <span>Conçu pour Madagascar 🇲🇬</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
