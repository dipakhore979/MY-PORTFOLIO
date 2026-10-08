import axios from 'axios';

export const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
  /\/$/,
  '',
);

export const api = axios.create({
  baseURL: apiBase,
  withCredentials: true, // send the httpOnly auth cookie (used by the admin dashboard)
  timeout: 20000,
});

export const getErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (err?.message === 'Network Error') return 'Cannot reach the server. Please try again later.';
  return fallback;
};
