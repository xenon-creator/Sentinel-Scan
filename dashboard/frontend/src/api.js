import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:8001/api/dashboard',
  timeout: 10000,
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
export default api;