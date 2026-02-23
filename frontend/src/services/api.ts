import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

// Backend Go - Usuarios, Roles, Pagos, etc.
const API_GO_URL = import.meta.env.VITE_API_GO_URL || 'http://localhost:8080/api';

// Backend Python - Pistas (legacy)
const API_PYTHON_URL = import.meta.env.VITE_API_PYTHON_URL || 'http://localhost:8000/api';

export const apiGo = axios.create({
  baseURL: API_GO_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // V2: Habilitar cookies por defecto
});

export const apiPython = axios.create({
  baseURL: API_PYTHON_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// V2: INTERCEPTOR JWT CON MUTEX Y BROADCASTCHANNEL
// Evita race conditions en refresh y sincroniza entre pestañas
// ============================================================
const TOKEN_KEY = 'polimanage_token';
const DEVICE_ID_KEY = 'polimanage_device_id';

// V2: Control de refresh para evitar múltiples llamadas simultáneas
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

// V2: BroadcastChannel para sincronización entre pestañas
const authChannel = new BroadcastChannel('auth_channel');

// Procesar cola de peticiones fallidas
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// V2: Listener del BroadcastChannel (otras pestañas)
authChannel.onmessage = (event) => {
  if (event.data.type === 'REFRESH_SUCCESS') {
    // Otra pestaña hizo refresh exitoso
    localStorage.setItem(TOKEN_KEY, event.data.token);
    processQueue(null, event.data.token);
  } else if (event.data.type === 'LOGOUT') {
    // Otra pestaña hizo logout
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(DEVICE_ID_KEY);
    window.location.href = '/';
  }
};

// Interceptor para apiGo (backend principal) - Request
apiGo.interceptors.request.use(
  (config) => {
    // V2: Rutas públicas que NO requieren token
    const publicRoutes = ['/auth/register', '/auth/login', '/auth/refresh'];
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));

    // Solo agregar token si NO es ruta pública
    if (!isPublicRoute) {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// V2: Interceptor para apiGo (backend principal) - Response (con mutex)
apiGo.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si el 401 viene del endpoint de login o register, no hagas nada,
    // simplemente devuelve el error al catch del componente.
    if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register')) {
      return Promise.reject(error);
    }

    // Si es error 401 y NO es el endpoint de refresh
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      // ¿Ya intentamos refrescar este request?
      if (originalRequest._retry) {
        // Ya se intentó, redirigir al home
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(DEVICE_ID_KEY);
        authChannel.postMessage({ type: 'LOGOUT' });
        window.location.href = '/';
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // V2: Mutex - ¿Alguien más ya está refrescando?
      if (isRefreshing) {
        // Añadir a la cola de espera
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiGo(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      // Soy el primero en intentar refresh
      isRefreshing = true;

      try {
        // Llamar al endpoint de refresh
        const { data } = await apiGo.post('/auth/refresh', {}, {
          withCredentials: true,
          headers: {}, // Sin token en header, usa cookie
        });

        const newToken = data.accessToken;

        // Guardar nuevo token
        localStorage.setItem(TOKEN_KEY, newToken);

        // V2: Notificar a otras pestañas
        authChannel.postMessage({ type: 'REFRESH_SUCCESS', token: newToken });

        // Actualizar header del request original
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Procesar cola de espera
        processQueue(null, newToken);

        return apiGo(originalRequest);
      } catch (refreshError) {
        // Refresh falló - logout
        processQueue(refreshError as Error, null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(DEVICE_ID_KEY);
        authChannel.postMessage({ type: 'LOGOUT' });
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

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
