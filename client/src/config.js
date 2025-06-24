const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    // AUTH
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verifyemail`,
    ME: `${API_BASE_URL}/auth/@me`,
    
    // STUDENT
    GET_STUDENT: `${API_BASE_URL}/student`,
    REPORT_STUDENT: `${API_BASE_URL}/student/report`,

    // USER
    GET_USERS: `${API_BASE_URL}/admin/users`,

    // User (Admin)
    CREATE_USER: '/admin/users',
    UPDATE_USER: (userId) => `/admin/users/${userId}`,
    DELETE_USER: (userId) => `/admin/users/${userId}`,
    GET_USER_LOGS: (email) => `/admin/users/${email}/logs`,

    // Report
    GET_REPORTS: '/student/reports',
    SEARCH_REPORTS: '/student/reports/search',
    CREATE_REPORT: '/student/reports/new',

    // Healthcheck
    HEALTHCHECK: '/health',
  },
}; 