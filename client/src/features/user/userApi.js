import api from '../../lib/api';
import { API_CONFIG } from '../../config';

export const getAllUsers = () => {
  return api.get(API_CONFIG.ENDPOINTS.GET_USERS);
};

export const updateUser = (userId, userData) => {
  return api.put(API_CONFIG.ENDPOINTS.UPDATE_USER(userId), userData);
};

export const createUser = (userData) => {
  return api.post(API_CONFIG.ENDPOINTS.CREATE_USER, userData);
};

export const getUserLogs = (email, { page, limit } = {}) => {
  return api.get(API_CONFIG.ENDPOINTS.GET_USER_LOGS(email), {
    params: { page, limit }
  });
};

export const deleteUser = (userId) => {
  return api.delete(API_CONFIG.ENDPOINTS.DELETE_USER(userId));
}; 