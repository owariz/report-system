import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
  }
});

let isRefreshing = false;
let subscribers = [];

async function refreshAccessToken() {
  if (isRefreshing) return new Promise((resolve, reject) => subscribers.push({ resolve, reject }));

  isRefreshing = true;
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axios.get('http://localhost:4000/api/auth/refresh', { params: { refreshToken } });
    const newAccessToken = response.data.accessToken;

    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    api.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`;

    // บอกให้ทุก subscriber รู้ว่ามี token ใหม่
    subscribers.forEach(sub => sub.resolve(newAccessToken));
    subscribers = [];
    return newAccessToken;
  } catch (error) {
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    throw new Error('Session expired, please login again.');
  } finally {
    isRefreshing = false;
  }
}

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      try {
        const newAccessToken = await refreshAccessToken();
        error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(error.config);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;