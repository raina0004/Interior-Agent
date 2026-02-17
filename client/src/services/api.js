import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

export async function sendChatMessage(message, sessionId) {
  const { data } = await api.post('/ai/chat', { message, sessionId });
  return data;
}

export async function getEstimate(carpetArea, budget, rooms) {
  const { data } = await api.post('/estimate', { carpetArea, budget, rooms });
  return data;
}

export async function getRecommendation(projectDetails) {
  const { data } = await api.post('/ai/recommendation', projectDetails);
  return data;
}

export async function createLead(leadData) {
  const { data } = await api.post('/lead', leadData);
  return data;
}

export async function getAllLeads(params = {}) {
  const { data } = await api.get('/leads', { params });
  return data;
}

export async function getLeadById(id) {
  const { data } = await api.get(`/lead/${id}`);
  return data;
}

export async function clearSession(sessionId) {
  const { data } = await api.post('/ai/clear-session', { sessionId });
  return data;
}

export default api;
