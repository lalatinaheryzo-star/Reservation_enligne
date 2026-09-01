// pages/user/PlaceClient.jsx — charge les places depuis le backend
import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { getPlacesForVoyage } from "../../api/services";
import sprinter18 from "../../assets/images/sprinter-18-places.png";
import sprinter22 from "../../assets/images/sprinter-22-places.png";
import sprinter26 from "../../assets/images/sprinter-26-places.png";
import sprinter30 from "../../assets/images/sprinter-30-places.png";
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

  // Même design photo-réaliste pour toutes les capacités.
  // Seule l'image de fond change selon le nombre de places ;
  // les boutons interactifs gardent exactement le même rendu que pour 18 places.
  const realisticVehicle = React.useMemo(() => {
    const vehicles = {
      18: { image: sprinter18, height: 1536, extraRows: 0 },
      22: { image: sprinter22, height: 1766, extraRows: 1 },
      26: { image: sprinter26, height: 1996, extraRows: 2 },
      30: { image: sprinter30, height: 2226, extraRows: 3 },
    };

    // Pour une capacité non prévue par une image dédiée, on conserve
    // le même rendu de siège (fallback vers le modèle 18 places).
    return vehicles[capacity] || {
      image: sprinter18,
      height: 1536,
      extraRows: Math.max(0, Math.ceil((capacity - 18) / 4)),
    };
  }, [capacity]);

  const seatPositions = React.useMemo(() => {
    if (!realisticVehicle) return {};
    const frontY = 292;
    const originalRearY = [538, 768, 998];
    const lastOriginalRearY = 1229;
    const rowStep = 230;
    const positions = {
      1: { x: 54, y: frontY },
      2: { x: 71, y: frontY },
    };
    const rearY = [
      ...originalRearY,
      ...Array.from({ length: realisticVehicle.extraRows + 1 }, (_, i) =>
        lastOriginalRearY + rowStep * i
      ),
    ];
    rearY.forEach((y, rowIndex) => {
      const first = 3 + rowIndex * 4;
      [[first,27],[first+1,41],[first+2,60],[first+3,75]].forEach(([numero,x]) => {
        positions[numero] = { x, y };
      });
    });
    return positions;
  }, [realisticVehicle]);

  const useRealisticImage = Boolean(realisticVehicle);

  const { frontBench, rearRows } = React.useMemo(() => {
    if (!places.length) return { frontBench: [], rearRows: [] };
    const fb = places.slice(0, 2);
    const rear = places.slice(2);
    const rows = [];
    for (let i = 0; i < rear.length; i += 4) rows.push(rear.slice(i, i + 4));
    return { frontBench: fb, rearRows: rows };
  }, [places]);

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
          ) : useRealisticImage ? (
            <div className="vehicle-stage sprinter-image-stage">
              <div
                className="sprinter-image-map"
                style={{
                  backgroundImage: `url(${realisticVehicle.image})`,
                  aspectRatio: `1024 / ${realisticVehicle.height}`,
                }}
                aria-label={`Plan réaliste du Sprinter ${capacity} places`}
              >
                <div className="sprinter-image-overlay" aria-hidden="true" />
                <div className="sprinter-driver-hotspot" aria-hidden="true">
                  <span>Chauffeur</span>
                </div>
                {places.map((place) => {
                  const position = seatPositions[Number(place.numero_place)];
                  if (!position) return null;
                  return (
                    <div
                      key={place.id || place.numero_place}
                      className="sprinter-seat-hotspot"
                      style={{ left: `${position.x}%`, top: `${(position.y / realisticVehicle.height) * 100}%` }}
                    >
                      <SeatButton place={place} selected={selectedId} onSelect={selectSeat} />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="vehicle-stage">
              <div className="sprinter-shell">
                <div className="vehicle-mirror left"  aria-hidden="true" />
                <div className="vehicle-mirror right" aria-hidden="true" />
                <div className="vehicle-wheel front"  aria-hidden="true" />
                <div className="vehicle-wheel rear"   aria-hidden="true" />
                <div className="vehicle-door"         aria-hidden="true" />
                <span className="vehicle-door-label">Porte coulissante</span>
                <div className="sprinter-windshield"  aria-hidden="true" />

                <div className="sprinter-cabin-row">
                  <div className="driver-seat">
                    <span className="driver-icon" aria-hidden="true">DR</span>
                    <strong>Chauffeur</strong>
                  </div>
                  <div className="sprinter-front-aisle" aria-hidden="true">Allée</div>
                  <div className="front-bench">
                    {frontBench.map((place) => (
                      <SeatButton key={place.id || place.numero_place} place={place} selected={selectedId} onSelect={selectSeat} />
                    ))}
                  </div>
                </div>

                <div className="sprinter-cabin-divider"><span>Accès passagers</span></div>

                <div className="sprinter-rear-rows">
                  {rearRows.map((row, ri) => (
                    <div className="sprinter-passenger-row" key={`rear-row-${ri}`}>
                      <div className="sprinter-side-pair">
                        {row.slice(0, 2).map((place) => (
                          <SeatButton key={place.id || place.numero_place} place={place} selected={selectedId} onSelect={selectSeat} />
                        ))}
                      </div>
                      <div className="sprinter-center-aisle" aria-hidden="true" />
                      <div className="sprinter-side-pair">
                        {row.slice(2, 4).map((place) => (
                          <SeatButton key={place.id || place.numero_place} place={place} selected={selectedId} onSelect={selectSeat} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
