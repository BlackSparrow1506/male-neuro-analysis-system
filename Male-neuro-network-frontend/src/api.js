const BASE = `${import.meta.env.VITE_API_BASE_URL || ''}/api`;

// ─── Token storage ─────────────────────────────────────────────────────────────
export const getToken   = ()  => localStorage.getItem('nn_token');
export const setToken   = (t) => localStorage.setItem('nn_token', t);
export const removeToken = () => localStorage.removeItem('nn_token');

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  if (res.status === 401) {
    removeToken();
    window.dispatchEvent(new CustomEvent('nn:sessionExpired'));
    throw new Error('Session expired. Please sign in again.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
// Register requires a username + email + password. Returns a "verify your email"
// response — no token is issued until the user verifies via the emailed link.
export async function register(username, email, password) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return handleResponse(res);
}

// Login accepts a username (or email) + password. Backend returns 403 with
// { emailVerified:false } if the account hasn't been verified yet.
export async function login(usernameOrEmail, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: usernameOrEmail, password }),
  });
  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || 'Please verify your email before signing in.');
    err.code = 'EMAIL_NOT_VERIFIED';
    err.email = body.email;
    throw err;
  }
  const data = await handleResponse(res);
  setToken(data.token);
  return data;
}

export async function resendVerification(email) {
  const res = await fetch(`${BASE}/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}

export function logout() {
  removeToken();
}

export async function getMe() {
  const res = await fetch(`${BASE}/auth/me`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function changePassword(currentPassword, newPassword) {
  const res = await fetch(`${BASE}/auth/password`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return handleResponse(res);
}

export async function deleteAccount() {
  const res = await fetch(`${BASE}/auth/account`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ─── Profiles ─────────────────────────────────────────────────────────────────
export async function fetchProfiles() {
  const res = await fetch(`${BASE}/profiles`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function fetchProfile(id) {
  const res = await fetch(`${BASE}/profiles/${id}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createProfile(data) {
  const res = await fetch(`${BASE}/profiles`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateProfile(id, data) {
  const res = await fetch(`${BASE}/profiles/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteProfile(id) {
  const res = await fetch(`${BASE}/profiles/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export async function clearChatHistory(profileId) {
  const res = await fetch(`${BASE}/chat/${profileId}/history`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function sendChatMessage(profileId, message) {
  const res = await fetch(`${BASE}/chat/${profileId}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ message }),
  });
  return handleResponse(res);
}

export async function fetchChatHistory(profileId) {
  const res = await fetch(`${BASE}/chat/${profileId}/history`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function checkHealth() {
  const res = await fetch(`${BASE}/health`);
  return res.json();
}

// ─── Gita Guidance ────────────────────────────────────────────────────────────
export async function fetchGitaGuidance(profileId) {
  const res = await fetch(`${BASE}/gita/${profileId}/guidance`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function translateGitaText(text, language) {
  const res = await fetch(`${BASE}/gita/translate`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ text, language }),
  });
  return handleResponse(res);
}

// ─── TTS ──────────────────────────────────────────────────────────────────────
export async function synthesizeSpeech(text) {
  const res = await fetch(`${BASE}/tts`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('TTS failed');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
