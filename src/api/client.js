// src/api/client.js
// ============================================================
//  Client HTTP minimal pour parler au serveur Express
//  (dossier ../server / ../backend du dépôt).
//
//  Définissez l'URL de l'API dans un fichier .env à la racine
//  du frontend :  REACT_APP_API_URL=http://localhost:4000/api
// ============================================================
const API_URL = process.env.REACT_APP_API_URL || "https://serveur-springboot.onrender.com/api";
const TOKEN_KEY = "voyagemada_token";

export { API_URL };

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

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content
  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    // réponse sans corps JSON
  }

  if (!response.ok) {
    const message = data?.error || `Erreur HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
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
    throw new Error(message);
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
