// pages/user/MesReservations.jsx — statuts en temps réel depuis le contexte
import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, MapPin, ArrowRight, Ticket, RefreshCw, FileText, Download, Printer } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { downloadRecuPdf, getRecuByReservation } from "../../api/services";
import RecuVoyageur from "./RecuVoyageur";
import toast from "react-hot-toast";

// Réservations dont le reçu a déjà été téléchargé : masquées de la liste pour
// éviter l'accumulation, sans jamais toucher aux données côté serveur. Stocké
// en local (par navigateur) pour rester masqué même après avoir quitté l'app.
const HIDDEN_KEY = "reservation_en_ligne_recus_masques_v1";
function loadHiddenIds() {
  try { return new Set(JSON.parse(localStorage.getItem(HIDDEN_KEY)) || []); }
  catch { return new Set(); }
}
function saveHiddenIds(set) {
  try { localStorage.setItem(HIDDEN_KEY, JSON.stringify([...set])); } catch { /* stockage indisponible, tant pis */ }
}

const STATUS_MAP = {
  "En attente": { Icon: Clock,        label: "En attente de validation", color:"#d97706", bg:"#fffbeb", border:"#fde68a" },
  "Validée":    { Icon: CheckCircle,  label: "Réservation confirmée",    color:"#16a34a", bg:"#f0fdf4", border:"#86efac" },
  "Refusée":    { Icon: XCircle,      label: "Refusée par l'admin",      color:"#e11d48", bg:"#fff1f2", border:"#fda4af" },
  "Annulée":    { Icon: XCircle,      label: "Annulée",                  color:"#64748b", bg:"#f8fafc", border:"#cbd5e1" },
};

function StatusBadge({ statut }) {
  const info = STATUS_MAP[statut] || STATUS_MAP["En attente"];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:".72rem", fontWeight:700,
      color:info.color, background:info.bg, border:`1px solid ${info.border}`, borderRadius:20, padding:"4px 10px" }}>
      <info.Icon size={11} /> {info.label}
    </span>
  );
}

export default function MesReservations({ myReservationIds = [] }) {
  const { reservations, loadMyReservations } = useAppContext();
  const [openRecuFor, setOpenRecuFor] = useState(null); // id de réservation dont le reçu est affiché
  const [downloadingId, setDownloadingId] = useState(null);
  const [hiddenIds, setHiddenIds] = useState(loadHiddenIds);

  useEffect(() => {
    loadMyReservations();
  }, [loadMyReservations]);

  const hideAfterDownload = (resaId) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(String(resaId));
      saveHiddenIds(next);
      return next;
    });
    toast.success("Reçu téléchargé — retiré de la liste.");
  };

  const sessionResas = reservations.filter((r) =>
    myReservationIds.includes(r.id_reservation || r.id) && !hiddenIds.has(String(r.id_reservation || r.id))
  );

  const handleQuickDownload = async (resaId) => {
    setDownloadingId(resaId);
    try {
      const recu = await getRecuByReservation(resaId);
      await downloadRecuPdf(recu.id, `${recu.numero_recu}.pdf`);
      hideAfterDownload(resaId);
    } catch (err) {
      toast.error(err.message || "Reçu introuvable.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (sessionResas.length === 0) return (
    <div>
      <div className="toolbar">
        <div>
          <h2 className="section-title">Mes réservations</h2>
          <p className="text-muted" style={{ marginTop:4 }}>Suivi de vos demandes</p>
        </div>
      </div>
      <div className="empty-state card card-body" style={{ textAlign:"center", padding:56 }}>
        <Ticket size={48} style={{ opacity:.2, display:"block", margin:"0 auto 12px" }} />
        <p>Aucune réservation pour l'instant.</p>
        <p style={{ fontSize:".78rem", marginTop:6 }}>Réservez un voyage depuis l'onglet « Voyages ».</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="toolbar">
        <div>
          <h2 className="section-title">Mes réservations</h2>
          <p className="text-muted" style={{ marginTop:4 }}>
            {sessionResas.length} réservation{sessionResas.length > 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadMyReservations} style={{ display:"flex", alignItems:"center", gap:6 }}>
          <RefreshCw size={13} /> Actualiser
        </button>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {sessionResas.map((r) => {
          const info    = STATUS_MAP[r.statut] || STATUS_MAP["En attente"];
          const voyage  = r.voyage;
          const resaId  = r.id_reservation || r.id;
          return (
            <div key={resaId} className="card"
              style={{ padding:0, overflow:"hidden", border:`1.5px solid ${info.border}` }}>
              <div style={{ height:4, background:info.color }} />
              <div style={{ padding:"18px 20px", display:"flex", alignItems:"flex-start", gap:16, flexWrap:"wrap" }}>
                <div style={{ width:44, height:44, borderRadius:12, background:info.bg,
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <info.Icon size={22} color={info.color} />
                </div>
                <div style={{ flex:1, minWidth:180 }}>
                  <div style={{ fontWeight:800, color:"var(--navy)", fontSize:"1rem", marginBottom:4 }}>
                    {r.ville_depart || voyage?.ville_depart || "–"}
                    {" "}<ArrowRight size={13} style={{ display:"inline", verticalAlign:"middle" }} />{" "}
                    {r.ville_arrivee || voyage?.ville_arrivee || "–"}
                  </div>
                  <div style={{ fontSize:".8rem", color:"var(--muted)", display:"flex", flexWrap:"wrap", gap:"4px 12px" }}>
                    {(r.date_depart || voyage?.date_depart) && (
                      <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <MapPin size={11} /> {r.date_depart || voyage?.date_depart}
                      </span>
                    )}
                    {r.numero_place && <span>· Place <strong style={{ color:"var(--navy)" }}>#{r.numero_place}</strong></span>}
                    {r.mode && <span>· {r.mode}</span>}
                  </div>
                  <div style={{ marginTop:10 }}><StatusBadge statut={r.statut} /></div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontWeight:800, color:"var(--navy)", fontSize:"1.05rem" }}>
                    {Number(r.prix || voyage?.prix || 0).toLocaleString()} Ar
                  </div>
                  <div style={{ fontSize:".68rem", color:"var(--muted)", marginTop:4 }}>
                    Réf : {String(resaId).slice(0, 12)}
                  </div>
                </div>
              </div>
              {r.statut === "Validée" && (
                <div style={{ background:"#f0fdf4", borderTop:"1px solid #86efac", padding:"10px 20px" }}>
                  <div style={{ fontSize:".78rem", color:"#16a34a", fontWeight:600, marginBottom:10 }}>
                    Réservation confirmée. Présentez votre reçu au guichet ou le jour du départ.
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setOpenRecuFor(resaId)}>
                      <FileText size={13} /> Voir le reçu
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleQuickDownload(resaId)} disabled={downloadingId === resaId}>
                      <Download size={13} /> {downloadingId === resaId ? "Téléchargement…" : "Télécharger le PDF"}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setOpenRecuFor(resaId)}>
                      <Printer size={13} /> Imprimer
                    </button>
                  </div>
                </div>
              )}
              {r.statut === "Refusée" && (
                <div style={{ background:"#fff1f2", borderTop:"1px solid #fda4af", padding:"10px 20px", fontSize:".78rem", color:"#e11d48", fontWeight:600 }}>
                  Réservation refusée. Veuillez contacter la coopérative.
                </div>
              )}
              {r.statut === "En attente" && (
                <div style={{ background:"#fffbeb", borderTop:"1px solid #fde68a", padding:"10px 20px", fontSize:".78rem", color:"#92400e" }}>
                  En attente de validation. Vous serez notifié par SMS ou WhatsApp.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {openRecuFor && (
        <RecuVoyageur
          reservationId={openRecuFor}
          onClose={() => setOpenRecuFor(null)}
          onDownloaded={(resaId) => { hideAfterDownload(resaId); setOpenRecuFor(null); }}
        />
      )}
    </div>
  );
}