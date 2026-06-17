const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  getDashboard: () => request('/dashboard'),
  getModels: () => request('/models'),
  getAgents: () => request('/agents'),
  createAgent: (body) => request('/agents', { method: 'POST', body: JSON.stringify(body) }),
  runAgent: (id, task) => request(`/agents/${id}/run`, { method: 'POST', body: JSON.stringify({ task }) }),
  runAllAgents: (task) => request('/agents/run-all', { method: 'POST', body: JSON.stringify({ task }) }),
  registerAgent: (id) => request(`/agents/${id}/register`, { method: 'POST' }),
  getTransactions: () => request('/transactions'),
  getRegistry: () => request('/registry'),
  getWallet: () => request('/wallet'),
  getSettings: () => request('/settings'),
  getHealth: () => request('/health'),
};

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
