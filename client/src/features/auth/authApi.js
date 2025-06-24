import api from '../../lib/api';
import { API_CONFIG } from '../../config';

export const loginUser = (credentials) => {
  return api.post(API_CONFIG.ENDPOINTS.LOGIN, credentials);
};

export const verifyUserEmail = (token) => {
  return api.get(`${API_CONFIG.ENDPOINTS.VERIFY_EMAIL}?token=${token}`);
};

export const getMe = () => {
  return api.get(API_CONFIG.ENDPOINTS.ME);
};

export const logoutUser = (refreshToken) => {
  // Ensure refreshToken is passed in the body for POST request
  return api.post(API_CONFIG.ENDPOINTS.LOGOUT, { refreshToken });
}; 