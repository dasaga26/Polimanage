import axios from 'axios';

const API_GO_URL = import.meta.env.VITE_API_GO_URL || 'http://localhost:8080/api';
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

// Interceptors para manejo de errores
apiGo.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Go Error:', error);
        return Promise.reject(error);
    }
);

apiPython.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Python Error:', error);
        return Promise.reject(error);
    }
);
