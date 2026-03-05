import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_PROXY as string | undefined;
const baseURL = apiBaseUrl ? `${apiBaseUrl}/api/v1` : '/api/v1';

const api = axios.create({
  baseURL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('studyflow_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se for 401, limpar token e redirecionar para login
    if (error.response?.status === 401) {
      localStorage.removeItem('studyflow_token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
