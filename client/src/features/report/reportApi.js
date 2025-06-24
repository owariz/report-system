import api from '../../lib/api';
import { API_CONFIG } from '../../config';

export const getReports = (params) => {
  return api.get(API_CONFIG.ENDPOINTS.GET_REPORTS, { params });
};

export const searchReports = (query) => {
  return api.get(`${API_CONFIG.ENDPOINTS.SEARCH_REPORTS}?search=${query}`);
};

export const createReport = (reportData) => {
  return api.post(API_CONFIG.ENDPOINTS.CREATE_REPORT, reportData);
}; 