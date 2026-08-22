// pages/user/PlaceClient.jsx — charge les places depuis le backend
import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { getPlacesForVoyage } from "../../api/services";

function SeatButton({ place, selected, onSelect }) {
  const status =
    place.id === selected      ? "selected"
    : place.statut === "disponible" || place.statut === "libre" ? "available"
    : "occupied";
  const isOccupied = status === "occupied";
  return (
    <button type="button" className={`sprinter-seat ${status}`}
      onClick={() => onSelect(place)} disabled={isOccupied}
      aria-label={`Place ${place.numero_place} ${isOccupied ? "occupée" : "disponible"}`}>
      <span className="sprinter-seat-number">{place.numero_place}</span>
      <span className="sprinter-seat-label">
        {status === "selected" ? "Choisie" : isOccupied ? "Occupée" : "Libre"}
      </span>
    </button>
  );
}

export default function PlaceClient({ voyage, user, onConfirm, onBack }) {
  const voyageId = voyage.id_voyage || voyage.id;
  const capacity = Number(voyage.capacite) || 18;

  const [places,     setPlaces]     = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPlacesForVoyage(voyageId)
      .then((data) => {
        if (!active) return;
        // data peut être un tableau de places ou un objet {places:[]}
        const arr = Array.isArray(data) ? data : (data?.places || []);
        // Si le backend ne retourne pas de places, générer localement
        if (arr.length === 0) {
          setPlaces(Array.from({ length: capacity }, (_, i) => ({
            id:           `seat-${voyageId}-${i + 1}`,
            numero_place:  i + 1,
            statut:        "disponible",
          })));
        } else {
          // Compléter jusqu'à la capacité si nécessaire
          const existing = new Map(arr.map((p) => [Number(p.numero_place), p]));
          const full = Array.from({ length: capacity }, (_, i) => {
            const n = i + 1;
            return existing.get(n) || { id: `seat-${voyageId}-${n}`, numero_place: n, statut: "disponible" };
          });
          setPlaces(full);
        }
      })
      .catch(() => {
        // Fallback local si le backend échoue
        setPlaces(Array.from({ length: capacity }, (_, i) => ({
          id: `seat-${voyageId}-${i + 1}`, numero_place: i + 1, statut: "disponible",
        })));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [voyageId, capacity]);

  const selectSeat = (place) => {
    const dispo = place.statut === "disponible" || place.statut === "libre";
    if (!dispo) { toast.error("Place déjà occupée."); return; }
    setSelectedId(place.id || `seat-${voyageId}-${place.numero_place}`);
    toast.success(`Place ${place.numero_place} sélectionnée.`);
  };

  const handleConfirm = () => {
    const seat = places.find((p) => (p.id || `seat-${voyageId}-${p.numero_place}`) === selectedId);
    if (!seat) { toast.error("Choisissez une place."); return; }
    onConfirm(seat);
  };

  const available     = places.filter((p) => p.statut === "disponible" || p.statut === "libre").length;
  const selectedPlace = places.find((p) => (p.id || `seat-${voyageId}-${p.numero_place}`) === selectedId);

  // Positions des 18 sièges sur l'image Sprinter (vue de dessus).
  // Les boutons restent interactifs : seule leur apparence est remplacée par l'image réaliste.
  const seatPositions = {
    1:  { left: "54%", top: "19%" },
    2:  { left: "71%", top: "19%" },
    3:  { left: "27%", top: "35%" },
    4:  { left: "41%", top: "35%" },
    5:  { left: "60%", top: "35%" },
    6:  { left: "75%", top: "35%" },
    7:  { left: "27%", top: "50%" },
    8:  { left: "41%", top: "50%" },
    9:  { left: "60%", top: "50%" },
    10: { left: "75%", top: "50%" },
    11: { left: "27%", top: "65%" },
    12: { left: "41%", top: "65%" },
    13: { left: "60%", top: "65%" },
    14: { left: "75%", top: "65%" },
    15: { left: "27%", top: "80%" },
    16: { left: "41%", top: "80%" },
    17: { left: "60%", top: "80%" },
    18: { left: "75%", top: "80%" },
  };


  return (
    <div>
      <div className="toolbar">
        <div>
          <button className="auth-back-btn" onClick={onBack}><ArrowLeft size={15} /> Retour aux voyages</button>
          <h2 className="section-title">Choisir votre siège</h2>
          <p className="text-muted" style={{ marginTop:4, display:"flex", alignItems:"center", gap:6 }}>
            <MapPin size={13} />
            {voyage.ville_depart} → {voyage.ville_arrivee} · {voyage.date_depart} · {(voyage.heure_depart||"").slice(0,5)}
          </p>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontWeight:800, fontSize:"1.2rem", color:"var(--navy)" }}>
            {Number(voyage.prix).toLocaleString()} Ar
          </div>
          <div className="text-muted" style={{ fontSize:".75rem" }}>{available} places disponibles</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap:"wrap", gap:12 }}>
          <div>
            <h3>Plan du véhicule</h3>
            <p style={{ fontSize:".8rem", color:"var(--muted)", marginTop:3 }}>
              Cliquez sur un siège vert pour le sélectionner
            </p>
          </div>
          {selectedPlace && (
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:".85rem", color:"var(--navy)", fontWeight:600 }}>
                Place <strong>{selectedPlace.numero_place}</strong> sélectionnée
              </span>
              <button className="btn btn-primary btn-sm" onClick={handleConfirm}>
                Confirmer <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>

        <div className="card-body">
          {loading ? (
            <div style={{ padding:40, textAlign:"center", color:"#64748b" }}>Chargement des places…</div>
          ) : (
            <div className="vehicle-stage sprinter-image-stage">
              <div className="sprinter-image-map" aria-label="Plan réaliste du Sprinter 18 places">
                <div className="sprinter-image-overlay" aria-hidden="true" />
                <div className="sprinter-driver-hotspot" aria-hidden="true">
                  <span>Chauffeur</span>
                </div>
                {places.map((place) => (
                  <div
                    key={place.id || place.numero_place}
                    className="sprinter-seat-hotspot"
                    style={seatPositions[Number(place.numero_place)] || { left: "50%", top: "50%" }}
                  >
                    <SeatButton
                      place={place}
                      selected={selectedId}
                      onSelect={selectSeat}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="sprinter-legend">
            <span><i className="legend-swatch available" /> Disponible</span>
            <span><i className="legend-swatch occupied"  /> Occupée</span>
            <span><i className="legend-swatch selected"  /> Votre choix</span>
          </div>
        </div>
      </div>
    </div>
  );
}
