// pages/user/RecuVoyageur.jsx
// ============================================================
//  Affiche le reçu d'une réservation (voyageur) : consultation,
//  téléchargement PDF et impression directe depuis le navigateur.
// ============================================================
import React, { useEffect, useRef, useState } from "react";
import reservationLogo from "../../assets/images/reservation-logo-madagascar.png";
import { X, Download, Printer, QrCode, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import QRCode from "qrcode";
import { useReactToPrint } from "react-to-print";
import { getRecuByReservation, downloadRecuPdf } from "../../api/services";

function formatDate(val) {
  if (!val) return "–";
  try {
    return new Date(val).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return String(val);
  }
}

function formatDateTime(val) {
  if (!val) return "–";
  try {
    return new Date(val).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return String(val);
  }
}

/**
 * Overlay plein écran affichant le reçu. À utiliser depuis
 * "Mes réservations" avec la réservation sélectionnée.
 */
export default function RecuVoyageur({ reservationId, onClose, onDownloaded }) {
  const [recu, setRecu]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [qrDataUrl, setQrDataUrl]     = useState(null);
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: recu?.numero_recu || "recu",
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getRecuByReservation(reservationId)
      .then((data) => { if (!cancelled) setRecu(data); })
      .catch((err) => { if (!cancelled) setError(err.message || "Reçu introuvable."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [reservationId]);

  useEffect(() => {
    if (!recu?.verify_url) return;
    let cancelled = false;
    QRCode.toDataURL(recu.verify_url, { margin: 1, width: 200, color: { dark: "#0B1530", light: "#FFFFFF" } })
      .then((url) => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [recu?.verify_url]);

  const handleDownload = async () => {
    if (!recu) return;
    setDownloading(true);
    try {
      await downloadRecuPdf(recu.id, `${recu.numero_recu}.pdf`);
      onDownloaded?.(reservationId);
    } catch (err) {
      toast.error(err.message || "Échec du téléchargement.");
    } finally {
      setDownloading(false);
    }
  };
  return (
    <div className="recu-overlay">
      <div className="recu-overlay-backdrop" onClick={onClose} />
      <div className="recu-modal">
        <div className="recu-modal-toolbar no-print">
          <span className="recu-modal-title">Reçu de réservation</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={handlePrint} disabled={!recu}>
              <Printer size={14} /> Imprimer
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleDownload} disabled={!recu || downloading}>
              <Download size={14} /> {downloading ? "Téléchargement…" : "Télécharger le PDF"}
            </button>
            <button className="icon-btn" onClick={onClose} title="Fermer">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="recu-modal-body">
          {loading && (
            <div className="recu-state">
              <Loader2 className="spin" size={28} />
              <p>Chargement du reçu…</p>
            </div>
          )}

          {!loading && error && (
            <div className="recu-state">
              <AlertCircle size={28} color="#e11d48" />
              <p>{error}</p>
            </div>
          )}

          {!loading && recu && (
            <div className="receipt-sheet" id="receipt-print-area" ref={printRef}>
              <div className="receipt-header">
                <div className="receipt-logo-badge">
                  <img src={reservationLogo} alt="Réservation en ligne à Madagascar" className="brand-logo-image brand-logo-image--receipt" />
                </div>
                <div className="receipt-header-info">
                  <h2>{recu.cooperative_nom || "Coopérative de transport"}</h2>
                  <p>Reçu de réservation officiel</p>
                  {recu.cooperative_telephone && <p>Tél : {recu.cooperative_telephone}</p>}
                </div>
                <div className="receipt-header-right">
                  <div className="receipt-number">{recu.numero_recu}</div>
                  <span className={`receipt-status-pill ${recu.statut === "Embarquée" ? "boarded" : "confirmed"}`}>
                    {recu.statut === "Embarquée" ? "Embarquée" : "Confirmée"}
                  </span>
                </div>
              </div>

              <div className="receipt-section">
                <h3>Informations du voyageur</h3>
                <div className="receipt-grid">
                  <div><span>Nom complet</span><strong>{recu.voyageur_nom}</strong></div>
                  <div><span>Téléphone</span><strong>{recu.voyageur_telephone || "–"}</strong></div>
                </div>
              </div>

              <div className="receipt-section">
                <h3>Détails du voyage</h3>
                <div className="receipt-grid">
                  <div><span>Trajet</span><strong>{recu.ville_depart} → {recu.ville_arrivee}</strong></div>
                  <div><span>Date du voyage</span><strong>{formatDate(recu.date_depart)}</strong></div>
                  <div><span>Heure de départ</span><strong>{(recu.heure_depart || "").slice(0, 5)}</strong></div>
                  <div><span>Numéro de place</span><strong>{recu.numero_place ? `Place ${recu.numero_place}` : "–"}</strong></div>
                </div>
              </div>

              <div className="receipt-section">
                <h3>Réservation &amp; paiement</h3>
                <div className="receipt-grid">
                  <div><span>Date de réservation</span><strong>{formatDateTime(recu.date_reservation)}</strong></div>
                  <div><span>Statut</span><strong>{recu.statut_reservation_label}</strong></div>
                  <div><span>Mode de paiement</span><strong>{recu.mode_paiement || "–"}</strong></div>
                  <div><span>Montant payé</span><strong>{Number(recu.montant || 0).toLocaleString("fr-FR")} Ar</strong></div>
                </div>
              </div>

              <div className="receipt-qr-box">
                {qrDataUrl ? (
                  <img className="receipt-qr-img" alt="QR Code de vérification" src={qrDataUrl} />
                ) : (
                  <div className="receipt-qr-img receipt-qr-placeholder"><Loader2 className="spin" size={22} /></div>
                )}
                <div className="receipt-qr-text">
                  <h4><QrCode size={15} style={{ verticalAlign: "middle", marginRight: 6 }} />Vérification à l'embarquement</h4>
                  <p>
                    Présentez ce QR Code à l'agent de la gare le jour du départ.
                    Il sera scanné pour confirmer votre réservation et valider l'embarquement.
                    Ce code ne peut être utilisé qu'une seule fois.
                  </p>
                </div>
              </div>

              <p className="receipt-footer-note">
                Reçu généré automatiquement le {formatDateTime(recu.date_generation)}. Présentez-le (imprimé ou sur
                téléphone) le jour du départ.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}