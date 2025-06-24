import axios from 'axios';
import { API_CONFIG } from '../config';

export function clearLocalStorage() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

let isRefreshing = false;
let subscribers = [];

export async function refreshAccessToken(api) {
  if (isRefreshing) {
    return new Promise(resolve => {
      subscribers.push(resolve);
    });
  }

  isRefreshing = true;
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.get(API_CONFIG.ENDPOINTS.REFRESH, { params: { refreshToken } });
    const { accessToken, refreshToken: newRefreshToken } = response.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    if (api) {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }

    subscribers.forEach(callback => callback(accessToken));
    subscribers = [];
    return accessToken;
  } catch (error) {
    console.error("Token refresh failed, logging out.", error);
    clearLocalStorage();
    window.location.href = '/auth/login'; // Force redirect to login
    return Promise.reject(error);
  } finally {
    isRefreshing = false;
  }
} 