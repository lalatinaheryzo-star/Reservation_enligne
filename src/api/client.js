// src/api/client.js
// ============================================================
//  Client HTTP double backend :
//  - API_URL (Spring Boot : port 4000 par défaut) -> login, register, voyages, réservations, etc.
//  - AUTH_API_URL (Serveur Express JS : port 4001 par défaut) -> mot de passe oublié & code vérification
// ============================================================

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
   window.location.hostname === "127.0.0.1" ||
   window.location.hostname === "");

// En local, pointe par défaut vers les ports locaux configurés
const DEFAULT_SPRING_URL = isLocalhost
  ? "http://localhost:4000/api"
  : "https://serveur-springboot.onrender.com/api";

const DEFAULT_AUTH_URL = isLocalhost
  ? "http://localhost:4001/api"
  : "https://serveur-mail-voyage.onrender.com/api";

const API_URL = process.env.REACT_APP_API_URL || DEFAULT_SPRING_URL;
const AUTH_API_URL = process.env.REACT_APP_AUTH_URL || DEFAULT_AUTH_URL;
const TOKEN_KEY = "voyagemada_token";

export { API_URL, AUTH_API_URL };

let inMemoryToken = null;

export function setToken(token) {
  inMemoryToken = token;
  try {
    if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
    else window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // sessionStorage indisponible (ex: contexte sandboxé) : on garde juste la valeur en mémoire
  }
  try { window.dispatchEvent(new Event("auth-token-changed")); } catch { /* no-op */ }
}

export function getToken() {
  if (inMemoryToken) return inMemoryToken;
  try {
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function request(path, { method = "GET", body, headers = {} } = {}, baseUrl = API_URL) {
  const token = getToken();

  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // Message clair si le serveur cible n'est pas démarré
    const isAuthServer = baseUrl === AUTH_API_URL;
    const serverName = isAuthServer
      ? "serveur JavaScript Node.js (port 4001)"
      : "serveur Spring Boot (port 4000)";
    throw new Error(`Impossible de contacter le ${serverName}. Assurez-vous qu'il est bien démarré.`);
  }

  // 204 No Content
  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    // réponse sans corps JSON
  }

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      (typeof data === "string" ? data : null) ||
      `Erreur HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

// Client principal (Spring Boot) : voyages, utilisateurs, réservations, paiements, etc.
export const apiClient = {
  get: (path) => request(path, {}, API_URL),
  post: (path, body) => request(path, { method: "POST", body }, API_URL),
  put: (path, body) => request(path, { method: "PUT", body }, API_URL),
  patch: (path, body) => request(path, { method: "PATCH", body }, API_URL),
  delete: (path) => request(path, { method: "DELETE" }, API_URL),
};

// Client secondaire (Serveur Express Node.js) : mot de passe oublié & code de vérification
export const authClient = {
  get: (path) => request(path, {}, AUTH_API_URL),
  post: (path, body) => request(path, { method: "POST", body }, AUTH_API_URL),
};

/**
 * Télécharge un fichier binaire protégé (ex: reçu PDF) en injectant le
 * token JWT dans l'en-tête Authorization, puis déclenche le téléchargement
 * dans le navigateur via un lien temporaire.
 */
export async function downloadProtectedFile(path, filename) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    let message = `Erreur HTTP ${response.status}`;
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // corps non JSON (ex: PDF déjà en cours de génération)
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "recu.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
