import axios from 'axios';
import store from '../redux/store';
import { logout } from '../redux/authSlice';

const instance = axios.create({
  baseURL: '',
  // ❌ DO NOT set Content-Type here
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default instance;
