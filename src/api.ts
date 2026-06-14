const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

async function api(path: string, options?: RequestInit) {
  const token = localStorage.getItem('domita_token') || '';
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export const login = (username: string, password: string) =>
  api('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });

export const getDashboard = () => api('/api/dashboard');
export const getNavigation = () => api('/api/navigation');
export const getInsurances = () => api('/api/insurances');
export const getFuel = () => api('/api/fuel');
export const getExpenses = () => api('/api/expenses');
export const getMooring = () => api('/api/mooring');
export const getRefitBudget = () => api('/api/refit-budget');
export const getRefitPayments = () => api('/api/refit-payments');
export const getParts = () => api('/api/parts');
export const exportData = () => api('/api/export');

export const createNavigation = (data: any) => api('/api/navigation', { method: 'POST', body: JSON.stringify(data) });
export const createInsurance = (data: any) => api('/api/insurances', { method: 'POST', body: JSON.stringify(data) });
export const createFuel = (data: any) => api('/api/fuel', { method: 'POST', body: JSON.stringify(data) });
export const createExpense = (data: any) => api('/api/expenses', { method: 'POST', body: JSON.stringify(data) });
export const createMooring = (data: any) => api('/api/mooring', { method: 'POST', body: JSON.stringify(data) });
export const createRefitPayment = (data: any) => api('/api/refit-payments', { method: 'POST', body: JSON.stringify(data) });
export const createPart = (data: any) => api('/api/parts', { method: 'POST', body: JSON.stringify(data) });

export const updateNavigation = (id: string, data: any) => api(`/api/navigation/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const updateInsurance = (id: string, data: any) => api(`/api/insurances/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const updateFuel = (id: string, data: any) => api(`/api/fuel/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const updateExpense = (id: string, data: any) => api(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const updateMooring = (id: string, data: any) => api(`/api/mooring/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const updateRefitBudget = (id: string, data: any) => api(`/api/refit-budget/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const updateRefitPayment = (id: string, data: any) => api(`/api/refit-payments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const updatePart = (id: string, data: any) => api(`/api/parts/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteNavigation = (id: string) => api(`/api/navigation/${id}`, { method: 'DELETE' });
export const deleteInsurance = (id: string) => api(`/api/insurances/${id}`, { method: 'DELETE' });
export const deleteFuel = (id: string) => api(`/api/fuel/${id}`, { method: 'DELETE' });
export const deleteExpense = (id: string) => api(`/api/expenses/${id}`, { method: 'DELETE' });
export const deleteMooring = (id: string) => api(`/api/mooring/${id}`, { method: 'DELETE' });
export const deleteRefitPayment = (id: string) => api(`/api/refit-payments/${id}`, { method: 'DELETE' });
export const deletePart = (id: string) => api(`/api/parts/${id}`, { method: 'DELETE' });
