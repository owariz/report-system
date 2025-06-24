// VITE_API_BASE_URL should be set to `/api/v1` in .env for consistency,
// or just rely on the fallback '/api/v1'.
// The vite proxy handles prepending `http://localhost:4000` to this.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL, // This will be used by axios instance directly
  ENDPOINTS: {
    // AUTH - Relative to API_BASE_URL
    LOGIN: `/auth/login`,
    REGISTER: `/auth/register`,
    LOGOUT: `/auth/logout`,
    REFRESH: `/auth/refresh`,
    VERIFY_EMAIL: `/auth/verifyemail`,
    ME: `/auth/@me`, // Assuming backend route is /api/v1/auth/@me
    
    // STUDENT - Relative to API_BASE_URL
    // Note: Original had /student, assuming it should be /api/v1/student
    // If backend routes are /api/v1/student/...
    GET_STUDENT: `/student`, // e.g. /api/v1/student
    REPORT_STUDENT: `/student/report`, // e.g. /api/v1/student/report

    // USER (Admin) - Relative to API_BASE_URL
    // Note: Original had /admin/users for GET_USERS but different for others.
    // Assuming all admin user routes are under /api/v1/admin/users
    GET_USERS: `/admin/users`,
    CREATE_USER: `/admin/users`, // POST to /api/v1/admin/users
    UPDATE_USER: (userId) => `/admin/users/${userId}`, // PUT to /api/v1/admin/users/:userId
    DELETE_USER: (userId) => `/admin/users/${userId}`, // DELETE to /api/v1/admin/users/:userId
    GET_USER_LOGS: (email) => `/admin/users/${email}/logs`, // GET /api/v1/admin/users/:email/logs

    // Report - Relative to API_BASE_URL
    // Note: Original had /student/reports. Assuming /api/v1/student/reports
    GET_REPORTS: `/student/reports`,
    SEARCH_REPORTS: `/student/reports/search`,
    CREATE_REPORT: `/student/reports/new`,

    // Healthcheck - Relative to API_BASE_URL
    // Note: Original had /health. Assuming /api/v1/healthcheck based on backend routes
    HEALTHCHECK: `/healthcheck`, // Corrected based on backend api/index.js
  },
}; 