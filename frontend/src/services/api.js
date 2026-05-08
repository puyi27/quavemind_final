import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('quave_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status } = error.response || {};
    if (status === 401) {
      localStorage.removeItem('quave_token');
    }
    return Promise.reject(error);
  }
);

export default api;