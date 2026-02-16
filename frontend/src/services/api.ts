import axios from 'axios';

// Backend Go - Usuarios, Roles, Pagos, etc.
const API_GO_URL = import.meta.env.VITE_API_GO_URL || 'http://localhost:8080/api';

// Backend Python - Pistas (legacy)
const API_PYTHON_URL = import.meta.env.VITE_API_PYTHON_URL || 'http://localhost:8000/api';

export const apiGo = axios.create({
  baseURL: API_GO_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiPython = axios.create({
  baseURL: API_PYTHON_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// INTERCEPTOR JWT - Añadir token automáticamente
// ============================================================
const TOKEN_KEY = 'polimanage_token';

// Interceptor para apiGo (backend principal)
apiGo.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para apiPython (backend legacy)
apiPython.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Por defecto, usa el backend Go para nuevas funcionalidades
export const api = apiGo;

export default api;
