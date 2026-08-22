// ============================================================
//  firebase/services.js
//  CRUD pour toutes les entités du MCD
// ============================================================
import {
  collection, doc, addDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy,
  serverTimestamp, onSnapshot, Timestamp
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { db, auth } from "./config";

/* ─── AUTH ─────────────────────────────────────────────── */
export const registerUser = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);

/* ─── COOPÉRATIVES ──────────────────────────────────────── */
export const getCooperatives = async () => {
  const snap = await getDocs(collection(db, "cooperatives"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addCooperative = (data) =>
  addDoc(collection(db, "cooperatives"), { ...data, createdAt: serverTimestamp() });

export const updateCooperative = (id, data) =>
  updateDoc(doc(db, "cooperatives", id), data);

export const deleteCooperative = (id) =>
  deleteDoc(doc(db, "cooperatives", id));

/* ─── VOYAGES ───────────────────────────────────────────── */
export const getVoyages = async () => {
  const snap = await getDocs(
    query(collection(db, "voyages"), orderBy("date_depart", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getVoyageById = async (id) => {
  const snap = await getDoc(doc(db, "voyages", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const addVoyage = (data) =>
  addDoc(collection(db, "voyages"), { ...data, createdAt: serverTimestamp() });

export const updateVoyage = (id, data) =>
  updateDoc(doc(db, "voyages", id), data);

export const deleteVoyage = (id) => deleteDoc(doc(db, "voyages", id));

export const subscribeVoyages = (callback) =>
  onSnapshot(
    query(collection(db, "voyages"), orderBy("date_depart", "asc")),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );

/* ─── PLACES ────────────────────────────────────────────── */
export const getPlacesByVoyage = async (voyageId) => {
  const snap = await getDocs(
    query(collection(db, "places"), where("voyageId", "==", voyageId))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addPlace = (data) =>
  addDoc(collection(db, "places"), { ...data, statut: "disponible" });

export const updatePlace = (id, data) =>
  updateDoc(doc(db, "places", id), data);

/* ─── UTILISATEURS ──────────────────────────────────────── */
export const getUtilisateurs = async () => {
  const snap = await getDocs(collection(db, "utilisateurs"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getUtilisateurByEmail = async (email) => {
  const snap = await getDocs(
    query(collection(db, "utilisateurs"), where("email", "==", email))
  );
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
};

export const addUtilisateur = (data) =>
  addDoc(collection(db, "utilisateurs"), { ...data, createdAt: serverTimestamp() });

export const updateUtilisateur = (id, data) =>
  updateDoc(doc(db, "utilisateurs", id), data);

/* ─── RÉSERVATIONS ──────────────────────────────────────── */
export const getReservations = async () => {
  const snap = await getDocs(
    query(collection(db, "reservations"), orderBy("date_reservation", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};


export const getReservationsByUser = async (userId) => {
  const snap = await getDocs(
    query(collection(db, "reservations"), where("utilisateurId", "==", userId))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addReservation = (data) =>
  addDoc(collection(db, "reservations"), {
    ...data,
    statut: "En attente",
    date_reservation: serverTimestamp(),
  });

export const updateReservation = (id, data) =>
  updateDoc(doc(db, "reservations", id), data);

export const subscribeReservations = (callback) =>
  onSnapshot(
    query(collection(db, "reservations"), orderBy("date_reservation", "desc")),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );

/* ─── PAIEMENTS ─────────────────────────────────────────── */
export const getPaiements = async () => {
  const snap = await getDocs(
    query(collection(db, "paiements"), orderBy("date_paiement", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addPaiement = (data) =>
  addDoc(collection(db, "paiements"), {
    ...data,
    date_paiement: serverTimestamp(),
  });

export const updatePaiement = (id, data) =>
  updateDoc(doc(db, "paiements", id), data);

/* ─── REÇUS ─────────────────────────────────────────────── */
export const getRecus = async () => {
  const snap = await getDocs(collection(db, "recus"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addRecu = (data) =>
  addDoc(collection(db, "recus"), {
    ...data,
    date_generation: serverTimestamp(),
    numero_recu: `REC-${Date.now()}`,
  });

/* ─── NOTIFICATIONS ─────────────────────────────────────── */
export const getNotifications = async () => {
  const snap = await getDocs(
    query(collection(db, "notifications"), orderBy("date_envoi", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addNotification = (data) =>
  addDoc(collection(db, "notifications"), {
    ...data,
    date_envoi: serverTimestamp(),
    statut: "Envoyé",
  });

/* ─── STATS DASHBOARD ───────────────────────────────────── */
export const getDashboardStats = async () => {
  const [voyages, reservations, paiements, utilisateurs] = await Promise.all([
    getDocs(collection(db, "voyages")),
    getDocs(collection(db, "reservations")),
    getDocs(collection(db, "paiements")),
    getDocs(collection(db, "utilisateurs")),
  ]);
  const resaData = reservations.docs.map((d) => d.data());
  const paiData = paiements.docs.map((d) => d.data());
  return {
    totalVoyages: voyages.size,
    totalReservations: reservations.size,
    totalUtilisateurs: utilisateurs.size,
    revenuTotal: paiData
      .filter((p) => p.statut === "Réussi")
      .reduce((s, p) => s + (p.montant || 0), 0),
    reservationsEnAttente: resaData.filter((r) => r.statut === "En attente").length,
    reservationsValidees: resaData.filter((r) => r.statut === "Validée").length,
    reservationsRefusees: resaData.filter((r) => r.statut === "Refusée").length,
    reservationsAnnulees: resaData.filter((r) => r.statut === "Annulée").length,
  };
};
