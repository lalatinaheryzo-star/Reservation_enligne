// pages/user/PaiementClient.jsx
// CORRECTION 409 : un seul appel POST /api/places/:id/reserver
// qui réserve la place ET crée la réservation en une transaction atomique.
import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../../api/client";
import { createPaiement, createRecu } from "../../api/services";

const MODES = [
  { id: "Mvola",        label: "Mvola",        Icon: Smartphone },
  { id: "Orange Money", label: "Orange Money", Icon: Smartphone },
  { id: "Airtel Money", label: "Airtel Money", Icon: Smartphone },
  { id: "Espèces",      label: "Espèces",      Icon: CreditCard },
];

export default function PaiementClient({ voyage, place, user, onSuccess, onBack }) {
  const [mode,    setMode]    = useState(null);
  const [ref,     setRef]     = useState("");
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!mode) {
      toast.error("Choisissez un mode de paiement.");
      return;
    }
    if (mode !== "Espèces" && !ref.trim()) {
      toast.error("Entrez la référence de transaction.");
      return;
    }

    setLoading(true);
    try {
      // ── UN SEUL appel : réserve la place ET crée la réservation ──
      // placeController.reserve() fait tout en une transaction atomique.
      // NE PAS appeler createReservation() en plus — c'est lui qui causait le 409.
      const placeId = place.id || place.id_place;
      const resa = await apiClient.post(`/places/${placeId}/reserver`, {
        utilisateur_id: user.id,
      });

      // ── Créer le paiement ────────────────────────────────────
      const paiementStatut = mode === "Espèces" ? "En attente" : "Réussi";
      const paiement = await createPaiement({
        reservation_id: resa.id || resa.id_reservation,
        montant:        Number(voyage.prix),
        mode_paiement:  mode,
        statut:         paiementStatut,
      });

      // ── Générer un reçu si paiement réussi ──────────────────
// ── Générer un reçu si paiement réussi ──────────────────
      if (paiementStatut === "Réussi") {
        try {
          await createRecu(paiement.id_paiement || paiement.id);
        } catch (err) {
          console.error("[PaiementClient] Échec création du reçu :", err);
          toast.error("Paiement enregistré, mais la génération du reçu a échoué : " + (err.message || "erreur inconnue"));
        }
      }

      // ── Succès ───────────────────────────────────────────────
      onSuccess({
        ...resa,
        id:            resa.id || resa.id_reservation,
        mode,
        reference:     ref,
        voyage,
        place,
        numero_place:  place.numero_place,
        ville_depart:  voyage.ville_depart,
        ville_arrivee: voyage.ville_arrivee,
        date_depart:   voyage.date_depart,
        heure_depart:  voyage.heure_depart,
        prix:          voyage.prix,
        paiement_statut: paiementStatut,
      });

    } catch (err) {
      const msg = err.message || "";
      if (err.status === 409 || msg.toLowerCase().includes("occupée") || msg.toLowerCase().includes("occupee")) {
        toast.error("Cette place vient d'être prise. Veuillez en choisir une autre.");
      } else {
        toast.error(msg || "Erreur lors de la réservation.");
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
              >
                <Icon size={18} style={{ display: "block", margin: "0 auto 6px" }} />
                {label}
              </button>
            ))}
          </div>

          {mode && mode !== "Espèces" && (
            <div className="form-group" style={{ marginTop: 14 }}>
              <label>Référence de transaction *</label>
              <input
                type="text"
                placeholder={`Numéro reçu par SMS via ${mode}`}
                value={ref}
                onChange={(e) => setRef(e.target.value)}
              />
            </div>
          )}

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
              <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0 }} />
              <p>
                Paiement de {Number(voyage.prix).toLocaleString()} Ar via {mode} · Place {place.numero_place}
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