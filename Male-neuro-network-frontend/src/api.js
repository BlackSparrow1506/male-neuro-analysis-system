import { STORAGE_KEYS, EVENTS, ERROR_CODES, API_PATHS, HTTP_HEADERS, MIME } from './constants';

const BASE = `${import.meta.env.VITE_API_BASE_URL || ''}/api`;

// ─── Token storage ─────────────────────────────────────────────────────────────
export const getToken    = ()  => localStorage.getItem(STORAGE_KEYS.TOKEN);
export const setToken    = (t) => localStorage.setItem(STORAGE_KEYS.TOKEN, t);
export const removeToken = ()  => localStorage.removeItem(STORAGE_KEYS.TOKEN);

function jsonHeaders() {
  return { [HTTP_HEADERS.CONTENT_TYPE]: MIME.JSON };
}

function authHeaders() {
  const token = getToken();
  return {
    [HTTP_HEADERS.CONTENT_TYPE]: MIME.JSON,
    ...(token ? { [HTTP_HEADERS.AUTHORIZATION]: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  if (res.status === 401) {
    removeToken();
    window.dispatchEvent(new CustomEvent(EVENTS.SESSION_EXPIRED));
    throw new Error('Session expired. Please sign in again.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || `Request failed: ${res.status}`);
    if (res.status === 429) {
      err.code = 'RATE_LIMITED';
      err.retryAfterSeconds = body.retryAfterSeconds || Number(res.headers.get('Retry-After')) || null;
    } else if (res.status === 422 && body.error === 'GUARDRAIL_BLOCKED') {
      err.code = 'GUARDRAIL_BLOCKED';
      err.category = body.category;
    }
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
// Register requires a username + email + password. Returns a "verify your email"
// response — no token is issued until the user verifies via the emailed link.
export async function register(username, email, password) {
  const res = await fetch(`${BASE}${API_PATHS.AUTH.REGISTER}`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ username, email, password }),
  });
  return handleResponse(res);
}

// Login accepts a username (or email) + password. Backend returns 403 with
// { emailVerified:false } if the account hasn't been verified yet.
export async function login(usernameOrEmail, password) {
  const res = await fetch(`${BASE}${API_PATHS.AUTH.LOGIN}`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ username: usernameOrEmail, password }),
  });
  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || 'Please verify your email before signing in.');
    err.code = ERROR_CODES.EMAIL_NOT_VERIFIED;
    err.email = body.email;
    throw err;
  }
  const data = await handleResponse(res);
  setToken(data.token);
  return data;
}

// Sign in (or auto-register) with a Google ID token. Returns the same shape
// as login() and stores the JWT.
export async function googleSignIn(idToken) {
  const res = await fetch(`${BASE}${API_PATHS.AUTH.GOOGLE}`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ idToken }),
  });
  const data = await handleResponse(res);
  setToken(data.token);
  return data;
}

export async function resendVerification(email) {
  const res = await fetch(`${BASE}${API_PATHS.AUTH.RESEND_VERIFICATION}`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}

export function logout() {
  removeToken();
}

export async function getMe() {
  const res = await fetch(`${BASE}${API_PATHS.AUTH.ME}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function changePassword(currentPassword, newPassword) {
  const res = await fetch(`${BASE}${API_PATHS.AUTH.PASSWORD}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return handleResponse(res);
}

export async function deleteAccount() {
  const res = await fetch(`${BASE}${API_PATHS.AUTH.ACCOUNT}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ─── Profiles ─────────────────────────────────────────────────────────────────
export async function fetchProfiles() {
  const res = await fetch(`${BASE}${API_PATHS.PROFILES}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function fetchProfile(id) {
  const res = await fetch(`${BASE}${API_PATHS.PROFILES}/${id}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createProfile(data) {
  const res = await fetch(`${BASE}${API_PATHS.PROFILES}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateProfile(id, data) {
  const res = await fetch(`${BASE}${API_PATHS.PROFILES}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteProfile(id) {
  const res = await fetch(`${BASE}${API_PATHS.PROFILES}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export async function clearChatHistory(profileId) {
  const res = await fetch(`${BASE}${API_PATHS.CHAT}/${profileId}/history`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function sendChatMessage(profileId, message) {
  const res = await fetch(`${BASE}${API_PATHS.CHAT}/${profileId}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ message }),
  });
  return handleResponse(res);
}

export async function fetchChatHistory(profileId) {
  const res = await fetch(`${BASE}${API_PATHS.CHAT}/${profileId}/history`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function checkHealth() {
  const res = await fetch(`${BASE}${API_PATHS.HEALTH}`);
  return res.json();
}

// ─── Gita Guidance ────────────────────────────────────────────────────────────
export async function fetchGitaGuidance(profileId) {
  const res = await fetch(`${BASE}${API_PATHS.GITA.GUIDANCE}/${profileId}/guidance`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function translateGitaText(text, language) {
  const res = await fetch(`${BASE}${API_PATHS.GITA.TRANSLATE}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ text, language }),
  });
  return handleResponse(res);
}

// ─── Audit Log ────────────────────────────────────────────────────────────────
export async function fetchMyAuditLog(limit = 50) {
  const res = await fetch(`${BASE}${API_PATHS.AUDIT.ME}?limit=${limit}`, { headers: authHeaders() });
  return handleResponse(res);
}

// ─── Metrics / SLA snapshot ───────────────────────────────────────────────────
export async function fetchMetrics(windowSeconds = 3600) {
  const res = await fetch(`${BASE}${API_PATHS.METRICS}?windowSeconds=${windowSeconds}`, { headers: authHeaders() });
  return handleResponse(res);
}

// ─── TTS ──────────────────────────────────────────────────────────────────────
export async function synthesizeSpeech(text) {
  const res = await fetch(`${BASE}${API_PATHS.TTS}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('TTS failed');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
