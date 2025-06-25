const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    LOGIN: `/auth/login`,
    REGISTER: `/auth/register`,
    LOGOUT: `/auth/logout`,
    REFRESH: `/auth/refresh`,
    VERIFY_EMAIL: `/auth/verifyemail`,
    ME: `/auth/@me`,
    
    GET_STUDENT: `/student`,
    REPORT_STUDENT: `/student/report`,

    GET_USERS: `/admin/users`,
    CREATE_USER: `/admin/users`,
    UPDATE_USER: (userId) => `/admin/users/${userId}`,
    DELETE_USER: (userId) => `/admin/users/${userId}`,
    GET_USER_LOGS: (email) => `/admin/users/${email}/logs`,

    GET_REPORTS: `/student/reports`,
    SEARCH_REPORTS: `/student/reports/search`,
    CREATE_REPORT: `/student/reports/new`,

    HEALTHCHECK: `/healthcheck`,
  },
}; 