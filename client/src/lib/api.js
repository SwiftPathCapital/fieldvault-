const BASE = '/api';

const getToken = () => localStorage.getItem('fv_token');

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  get: (path) => fetch(`${BASE}${path}`, { headers: headers() }).then(handle),
  post: (path, body) => fetch(`${BASE}${path}`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  put: (path, body) => fetch(`${BASE}${path}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handle),
  del: (path) => fetch(`${BASE}${path}`, { method: 'DELETE', headers: headers() }).then(handle),
};
