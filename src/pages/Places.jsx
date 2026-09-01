// pages/Places.jsx (espace ADMIN)
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";

function getSeatStatus(place, selectedSeat) {
  if (place.id === selectedSeat) return "selected";
  return place.statut === "disponible" ? "available" : "occupied";
}

function SeatButton({ place, selectedSeat, onSelect }) {
  const status = getSeatStatus(place, selectedSeat);
  const isOccupied = status === "occupied";
  return (
    <button
      type="button"
      className={`sprinter-seat ${status}`}
      onClick={() => onSelect(place)}
      disabled={isOccupied}
      aria-label={`Place ${place.numero_place} ${isOccupied ? "occupée" : "disponible"}`}
    >
      <span className="sprinter-seat-number">{place.numero_place}</span>
      <span className="sprinter-seat-label">
        {status === "selected" ? "Choisie" : isOccupied ? "Occupée" : "Libre"}
      </span>
    </button>
  );
}

export default function Places() {
  const { voyages, getPlacesForVoyage, reservePlace } = useAppContext();

  const [selectedVoyageId, setSelectedVoyageId] = useState("");
  const [places, setPlaces]                     = useState([]);
  const [selectedSeat, setSelectedSeat]         = useState(null);
  const [loadingPlaces, setLoadingPlaces]       = useState(false);

  const selectedVoyage = voyages.find((v) => v.id === selectedVoyageId) || null;

  const loadVoyage = async (vid) => {
    setSelectedVoyageId(vid);
    setSelectedSeat(null);
    setPlaces([]);
    if (!vid) return;
    setLoadingPlaces(true);
    try {
      const data = await getPlacesForVoyage(vid);
      setPlaces(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erreur lors du chargement des places.");
    } finally {
      setLoadingPlaces(false);
    }
  };

  const selectSeat = (place) => {
    if (place.statut !== "disponible") { toast.error("Cette place est déjà occupée."); return; }
    setSelectedSeat(place.id);
    toast.success(`Place ${place.numero_place} choisie.`);
  };

  const confirmReservation = async () => {
    if (!selectedSeat) return;
    const seat = places.find((p) => p.id === selectedSeat);
    if (!seat) return;
    try {
      await reservePlace(seat.id);
      // Recharger les places depuis le contexte
      const fresh = await getPlacesForVoyage(selectedVoyageId);
      setPlaces(Array.isArray(fresh) ? fresh : []);
      setSelectedSeat(null);
      toast.success(`Place ${seat.numero_place} réservée par l'administrateur !`);
    } catch (err) {
      toast.error(err?.message || "Erreur lors de la réservation.");
    }
  };

  const cancelSelection = () => setSelectedSeat(null);

  const availableCount = places.filter((p) => p.statut === "disponible").length;
  const occupiedCount  = places.length - availableCount;
  const selectedPlace  = places.find((p) => p.id === selectedSeat) || null;

  const { frontBench, rearRows } = useMemo(() => {
    if (!places.length) return { frontBench: [], rearRows: [] };
    const fb   = places.slice(0, 2);
    const rear = places.slice(2);
    const rows = [];
    for (let i = 0; i < rear.length; i += 4) rows.push(rear.slice(i, i + 4));
    return { frontBench: fb, rearRows: rows };
  }, [places]);

  return (
    <div>
      <div className="toolbar">
        <span className="section-title">Gestion des places</span>
        <select
          className="places-trip-select"
          value={selectedVoyageId}
          onChange={(e) => loadVoyage(e.target.value)}
        >
          <option value="">-- Choisir un voyage --</option>
          {voyages.map((v) => (
            <option key={v.id} value={v.id}>
              {v.ville_depart} → {v.ville_arrivee} ({v.date_depart}) — {v.vehicule_nom || "Sprinter"}
            </option>
          ))}
        </select>
      </div>

      {loadingPlaces && (
        <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Chargement des places…</div>
      )}

      {selectedVoyageId && !loadingPlaces ? (
        <div className="places-page-grid">
          <section className="card">
            <div className="card-header places-card-header">
              <div>
                <h3>Plan du véhicule</h3>
                <p className="places-card-subtitle">
                  {selectedVoyage?.vehicule_nom || "Sprinter"} — disposition cabine avant + rangées arrière.
                </p>
              </div>
              <div className="places-counts">
                <span className="places-count available">{availableCount} disponibles</span>
                <span className="places-count occupied">{occupiedCount} occupées</span>
                <span className="places-count total">{places.length} total</span>
              </div>
            </div>

            <div className="card-body places-body">
              <div className="places-summary-grid">
                <div className="places-summary-panel">
                  <span className="places-summary-kicker">Disponibilité</span>
                  <strong>{availableCount} / {places.length} places libres</strong>
                  <p>Les places vertes peuvent être sélectionnées directement sur le plan.</p>
                </div>
                <div className={`places-summary-panel ${selectedPlace ? "selected" : ""}`}>
                  <span className="places-summary-kicker">Sélection</span>
                  <strong>{selectedPlace ? `Place ${selectedPlace.numero_place}` : "Aucune place choisie"}</strong>
                  <p>
                    {selectedPlace
                      ? "Confirmez pour réserver cette place (visible côté utilisateur)."
                      : "Choisissez une place disponible dans le véhicule."}
                  </p>
                  {selectedPlace && (
                    <div className="places-summary-actions">
                      <button className="btn btn-primary btn-sm" onClick={confirmReservation}>
                        <CheckCircle2 size={14} /> Confirmer
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={cancelSelection}>
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <section className="sprinter-reservation">
                <div className="sprinter-reservation-header">
                  <div>
                    <span className="sprinter-kicker">Intérieur du véhicule</span>
                    <h3>{selectedVoyage?.vehicule_nom || "Sprinter"}</h3>
                    <p>1 chauffeur + 2 places avant, puis rangées de 4 places.</p>
                  </div>
                  <span className="sprinter-capacity">
                    {selectedVoyage?.vehicule_nom || "Sprinter"} · {places.length} places
                  </span>
                </div>

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
                          <SeatButton key={place.id} place={place} selectedSeat={selectedSeat} onSelect={selectSeat} />
                        ))}
                      </div>
                    </div>

                    <div className="sprinter-cabin-divider"><span>Accès passagers</span></div>

                    <div className="sprinter-rear-rows">
                      {rearRows.map((row, ri) => (
                        <div className="sprinter-passenger-row" key={`rear-row-${ri}`}>
                          <div className="sprinter-side-pair">
                            {row.slice(0, 2).map((place) => (
                              <SeatButton key={place.id} place={place} selectedSeat={selectedSeat} onSelect={selectSeat} />
                            ))}
                          </div>
                          <div className="sprinter-center-aisle" aria-hidden="true" />
                          <div className="sprinter-side-pair">
                            {row.slice(2, 4).map((place) => (
                              <SeatButton key={place.id} place={place} selectedSeat={selectedSeat} onSelect={selectSeat} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sprinter-legend" aria-label="Légende des couleurs">
                  <span><i className="legend-swatch available" /> Disponible</span>
                  <span><i className="legend-swatch occupied"  /> Occupée</span>
                  <span><i className="legend-swatch selected"  /> Sélectionnée</span>
                  <span><i className="legend-swatch driver"    /> Chauffeur</span>
                </div>
              </section>
            </div>
          </section>
        </div>
      ) : !loadingPlaces && !selectedVoyageId ? (
        <div className="empty-state card card-body">
          <p>Sélectionnez un voyage pour gérer ses places.</p>
        </div>
      ) : null}
    </div>
  );
}
