import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

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
