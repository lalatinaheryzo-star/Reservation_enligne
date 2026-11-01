// pages/user/PaiementClient.jsx
// CORRECTION 409 : un seul appel POST /api/places/:id/reserver
// qui réserve la place ET crée la réservation en une transaction atomique.
import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../../api/client";
import { createPaiement } from "../../api/services";

const MODES = [
  { id: "Mvola",        label: "Mvola",        Icon: Smartphone },
  { id: "Orange Money", label: "Orange Money", Icon: Smartphone },
  { id: "Airtel Money", label: "Airtel Money", Icon: Smartphone },
  { id: "Espèces",      label: "Espèces",      Icon: CreditCard },
];

export default function PaiementClient({ voyage, place, user, onSuccess, onBack }) {
  const [mode,    setMode]    = useState(null);
  const [loading, setLoading] = useState(false);

  const paymentErrorMessage = (err) => {
    const detail = err.message || "Erreur inattendue.";
    if (err.status === 400) return `Paiement refusé : données invalides. ${detail}`;
    if (err.status === 403) return `Paiement refusé : accès non autorisé. ${detail}`;
    if (err.status === 409) return `Paiement en conflit ou indisponible. ${detail}`;
    if (err.status) return `Le paiement a échoué (HTTP ${err.status}). ${detail}`;
    return `Impossible de confirmer le résultat du paiement. ${detail}`;
  };

  const handlePay = async () => {
    if (!mode) {
      toast.error("Choisissez un mode de paiement.");
      return;
    }
    if (mode !== "Espèces") {
      toast.error("Seul le paiement en espèces est actuellement disponible.");
      return;
    }

    setLoading(true);
    const placeId = place.id || place.id_place;
    let resa;
    try {
      // ── UN SEUL appel : réserve la place ET crée la réservation ──
      // placeController.reserve() fait tout en une transaction atomique.
      // NE PAS appeler createReservation() en plus — c'est lui qui causait le 409.
      resa = await apiClient.post(`/places/${placeId}/reserver`, {
        utilisateur_id: user.id,
      });
    } catch (err) {
      const detail = err.message || "Erreur inattendue.";
      if (err.status === 409) {
        toast.error(`Réservation impossible (HTTP 409) : ${detail}`);
      } else if (err.status === 400) {
        toast.error(`Données de réservation invalides (HTTP 400) : ${detail}`);
      } else if (err.status === 403) {
        toast.error(`Réservation refusée (HTTP 403) : ${detail}`);
      } else {
        toast.error(err.status ? `Erreur de réservation (HTTP ${err.status}) : ${detail}` : detail);
      }
      setLoading(false);
      return;
    }

    const notifyReservationCreated = (paiementStatut) => onSuccess({
      ...resa,
      id: resa.id || resa.id_reservation,
      mode,
      voyage,
      place,
      numero_place: place.numero_place,
      ville_depart: voyage.ville_depart,
      ville_arrivee: voyage.ville_arrivee,
      date_depart: voyage.date_depart,
      heure_depart: voyage.heure_depart,
      prix: voyage.prix,
      paiement_statut: paiementStatut,
    });

    try {
      const paiement = await createPaiement({
        reservation_id: resa.id || resa.id_reservation,
        montant: Number(voyage.prix),
        mode_paiement: mode,
        statut: "En attente",
      });

      notifyReservationCreated(paiement.statut || "Statut indisponible");
    } catch (err) {
      if (err.status === 409) {
        toast.error(
          `La réservation a été créée, mais la demande de paiement est en conflit (HTTP 409). ` +
          `${paymentErrorMessage(err)} Vérifiez le statut du paiement avant de réessayer. ` +
          `La place n'a pas été libérée automatiquement.`
        );
        notifyReservationCreated("Paiement à vérifier");
      } else if (err.status === 400 || err.status === 403) {
        toast.error(
          `La réservation a été créée et reste en attente, mais le paiement a été refusé (HTTP ${err.status}). ` +
          `${paymentErrorMessage(err)} La place n'a pas été libérée automatiquement.`
        );
        notifyReservationCreated("Paiement non enregistré");
      } else if (err.status && err.status < 500) {
        toast.error(
          `La réservation a été créée, mais le paiement n'a pas été confirmé (HTTP ${err.status}). ` +
          `${paymentErrorMessage(err)} La place n'a pas été libérée automatiquement.`
        );
        notifyReservationCreated("Paiement non confirmé");
      } else {
        toast.error(
          `La réservation a été créée, mais le résultat du paiement est incertain${err.status ? ` (HTTP ${err.status})` : ""}. ` +
          `Vérifiez vos réservations avant de réessayer. La place n'a pas été libérée automatiquement.`
        );
        notifyReservationCreated("Résultat incertain");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div>
          <button className="auth-back-btn" onClick={onBack}>
            <ArrowLeft size={15} /> Changer de siège
          </button>
          <h2 className="section-title">Paiement</h2>
          <p className="text-muted" style={{ marginTop: 4 }}>Finalisez votre réservation</p>
        </div>
      </div>

      <div className="payment-card">
        <div className="payment-summary">
          <div className="payment-summary-route">
            <h3>{voyage.ville_depart} → {voyage.ville_arrivee}</h3>
            <p>
              {voyage.date_depart} · {(voyage.heure_depart || "").slice(0, 5)} · Place {place.numero_place}
            </p>
          </div>
          <div className="payment-summary-price">
            {Number(voyage.prix).toLocaleString()} Ar
            <span>Tarif par siège</span>
          </div>
        </div>

        <div style={{ padding: "24px 26px" }}>
          <p style={{ fontWeight: 700, color: "var(--navy)", marginBottom: 14, fontSize: ".88rem" }}>
            Mode de paiement
          </p>

          <div className="payment-method-list">
            {MODES.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`payment-method-btn ${mode === id ? "active" : ""}`}
                onClick={() => setMode(id)}
                disabled={id !== "Espèces"}
                aria-label={id === "Espèces" ? label : `${label}, indisponible`}
                title={id === "Espèces" ? undefined : "Moyen de paiement indisponible"}
                style={id === "Espèces" ? undefined : { opacity: 0.5, cursor: "not-allowed" }}
              >
                <Icon size={18} style={{ display: "block", margin: "0 auto 6px" }} />
                {label}
                {id !== "Espèces" && <span style={{ display: "block", fontSize: ".65rem" }}>Indisponible</span>}
              </button>
            ))}
          </div>

          {mode === "Espèces" && (
            <div style={{
              background: "#fef3c7", border: "1px solid #fde68a",
              borderRadius: 10, padding: "12px 16px", marginTop: 14,
              fontSize: ".8rem", color: "#92400e",
            }}>
              Le paiement en espèces sera effectué au guichet de la coopérative.
            </div>
          )}

          {mode && (
            <div className="payment-confirm-box">
              <CheckCircle2 size={20} color="#d97706" style={{ flexShrink: 0 }} />
              <p>
                Paiement en espèces de {Number(voyage.prix).toLocaleString()} Ar en attente de confirmation au guichet · Place {place.numero_place}
              </p>
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: 20, padding: "12px" }}
            onClick={handlePay}
            disabled={loading || !mode}
          >
            {loading ? "Traitement…" : "Confirmer la réservation"}
          </button>
        </div>
      </div>
    </div>
  );
}