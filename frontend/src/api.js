import axios from "axios";

const resolveBackendUrl = () => {
  const configured = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL;
  if (configured) return configured;

  const isLocalhost = ["localhost", "127.0.0.1", "0.0.0.0"].includes(window.location.hostname);
  if (isLocalhost && window.location.port && Number(window.location.port) >= 3000) {
    return "http://127.0.0.1:8002";
  }

  return window.location.origin;
};

const BACKEND_URL = resolveBackendUrl();
export const API = `${BACKEND_URL.replace(/\/$/, "")}/api`;

const TOKEN_KEY = "redwork_admin_token";

// Daha sicheres Token-Storage (sessionStorage statt localStorage):
// - Sicher gegen XSS-Angriffe persistenter (Token wird beim Tab-Schließen gelöscht)
// - Vorbereitung für httpOnly-Cookies in Zukunft
export const tokenStorage = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (token) => sessionStorage.setItem(TOKEN_KEY, token),
  remove: () => sessionStorage.removeItem(TOKEN_KEY),
};

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname.startsWith("/admin")) {
      tokenStorage.remove();
      if (!window.location.pathname.endsWith("/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
