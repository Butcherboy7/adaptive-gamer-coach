import { API_BASE_URL } from './constants';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new Error("Can't reach the analysis server. Start it with `python backend/main.py` and try again.");
  }
  if (!res.ok) {
    let detail = `Server error (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.detail === 'string') detail = body.detail;
    } catch { /* keep the generic message */ }
    throw new Error(detail);
  }
  return res.json();
}

export const api = {
  health: () => request('/health'),
  search: (q, signal) => request(`/players/search?q=${encodeURIComponent(q)}`, { signal }),
  lookup: (riotId) => request(`/players/lookup?riot_id=${encodeURIComponent(riotId)}`),
  predict: (values, signal) => request('/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
    signal,
  }),
};
