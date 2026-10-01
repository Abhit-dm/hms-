const API_URL = import.meta.env.PROD ? 'https://abhitcare.cloud/api' : import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export async function api(path, options = {}) {
  const token = localStorage.getItem('hms_token');
  let response;
  try { response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }, ...options }); } catch { throw new Error(`Unable to reach HMS API at ${API_URL}. Start the backend with npm --prefix backend run dev.`); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}
export const auth = { login: (email, password) => api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }), me: () => api('/auth/me') };
