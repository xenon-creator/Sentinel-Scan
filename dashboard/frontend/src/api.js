import axios from 'axios';

const DASHBOARD_API_URL = import.meta.env.VITE_DASHBOARD_API_URL || 'http://localhost:8001';
const CORE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${DASHBOARD_API_URL}/api/v1/dashboard`,
  timeout: 10000,
});

const coreApi = axios.create({
  baseURL: `${CORE_API_URL}/api/v1`,
  timeout: 20000,
});

export const fetchStats = async () => {
  const { data } = await api.get('/stats');
  return data;
};
export const fetchThreatTrends = async (days = 30) => {
  const { data } = await api.get('/threat-trends', { params: { days } });
  return data;
};
export const fetchThreatDistribution = async () => {
  const { data } = await api.get('/threat-distribution');
  return data;
};
export const fetchRecentScans = async (limit = 20) => {
  const { data } = await api.get('/recent-scans', { params: { limit } });
  return data;
};
export const fetchTopThreats = async (limit = 5) => {
  const { data } = await api.get('/top-threats', { params: { limit } });
  return data;
};
export const fetchIndicatorDetails = async (indicatorId) => {
  const { data } = await api.get(`/indicator/${indicatorId}`);
  return data;
};
export const fetchEnrichmentData = async (findingId, refresh = false) => {
  const { data } = await coreApi.get(`/enrich/${findingId}`, { params: { refresh } });
  return data;
};
export const fetchIpEnrichment = async (ip) => {
  const { data } = await coreApi.get(`/enrich/ip/${ip}`);
  return data;
};
export const fetchCveEnrichment = async (cveId) => {
  const { data } = await coreApi.get(`/enrich/cve/${cveId}`);
  return data;
};
export const fetchApiStatus = async () => {
  const { data } = await api.get('/api-status');
  return data;
};
export default api;