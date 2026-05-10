import { STORAGE_KEYS, EVENTS, ERROR_CODES, API_PATHS, HTTP_HEADERS, MIME } from './constants';

const BASE = `${import.meta.env.VITE_API_BASE_URL || ''}/api`;

// ─── Token storage ─────────────────────────────────────────────────────────────
export const getToken    = ()  => localStorage.getItem(STORAGE_KEYS.TOKEN);
export const setToken    = (t) => localStorage.setItem(STORAGE_KEYS.TOKEN, t);
export const removeToken = ()  => localStorage.removeItem(STORAGE_KEYS.TOKEN);

// ─── Request plumbing (single source of truth) ────────────────────────────────
// Every endpoint below routes through `request()`, so there is one place to
// edit JSON-content negotiation, auth-header injection, 401 handling, the
// shared error envelope, and 204 unwrapping. Adding an endpoint = one line.

function buildHeaders({ auth = true, json = true } = {}) {
  const headers = {};
  if (json) headers[HTTP_HEADERS.CONTENT_TYPE] = MIME.JSON;
  if (auth) {
    const token = getToken();
    if (token) headers[HTTP_HEADERS.AUTHORIZATION] = `Bearer ${token}`;
  }
  return headers;
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

async function request(method, path, { body, auth = true, parse = true } = {}) {
  const init = { method, headers: buildHeaders({ auth, json: body !== undefined }) };
  if (body !== undefined) init.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, init);
  return parse ? handleResponse(res) : res;
}

const apiGet    = (path, opts)       => request('GET',    path, opts);
const apiPost   = (path, body, opts) => request('POST',   path, { ...opts, body });
const apiPut    = (path, body, opts) => request('PUT',    path, { ...opts, body });
const apiDelete = (path, opts)       => request('DELETE', path, opts);

// ─── Auth ──────────────────────────────────────────────────────────────────────
// Register requires a username + email + password. Returns a "verify your email"
// response — no token is issued until the user verifies via the emailed link.
export function register(username, email, password) {
  return apiPost(API_PATHS.AUTH.REGISTER, { username, email, password }, { auth: false });
}

// Login accepts a username (or email) + password. Backend returns 403 with
// { emailVerified:false } if the account hasn't been verified yet.
export async function login(usernameOrEmail, password) {
  const res = await request('POST', API_PATHS.AUTH.LOGIN, {
    body: { username: usernameOrEmail, password },
    auth: false,
    parse: false,
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
  const data = await apiPost(API_PATHS.AUTH.GOOGLE, { idToken }, { auth: false });
  setToken(data.token);
  return data;
}

export function resendVerification(email) {
  return apiPost(API_PATHS.AUTH.RESEND_VERIFICATION, { email }, { auth: false });
}

export function logout() {
  removeToken();
}

export function getMe()                                        { return apiGet(API_PATHS.AUTH.ME); }
export function changePassword(currentPassword, newPassword)   { return apiPut(API_PATHS.AUTH.PASSWORD, { currentPassword, newPassword }); }
export function deleteAccount()                                { return apiDelete(API_PATHS.AUTH.ACCOUNT); }

// ─── Profiles ─────────────────────────────────────────────────────────────────
export const fetchProfiles  = ()         => apiGet(API_PATHS.PROFILES);
export const fetchProfile   = (id)       => apiGet(`${API_PATHS.PROFILES}/${id}`);
export const createProfile  = (data)     => apiPost(API_PATHS.PROFILES, data);
export const updateProfile  = (id, data) => apiPut(`${API_PATHS.PROFILES}/${id}`, data);
export const deleteProfile  = (id)       => apiDelete(`${API_PATHS.PROFILES}/${id}`);

// ─── Chat ─────────────────────────────────────────────────────────────────────
export const clearChatHistory = (profileId)         => apiDelete(`${API_PATHS.CHAT}/${profileId}/history`);
export const sendChatMessage  = (profileId, message) => apiPost(`${API_PATHS.CHAT}/${profileId}`, { message });
export const fetchChatHistory = (profileId)         => apiGet(`${API_PATHS.CHAT}/${profileId}/history`);

export async function checkHealth() {
  const res = await fetch(`${BASE}${API_PATHS.HEALTH}`);
  return res.json();
}

// ─── Gita Guidance ────────────────────────────────────────────────────────────
export const fetchGitaGuidance = (profileId)         => apiGet(`${API_PATHS.GITA.GUIDANCE}/${profileId}/guidance`);
export const translateGitaText = (text, language)    => apiPost(API_PATHS.GITA.TRANSLATE, { text, language });

// ─── Audit Log ────────────────────────────────────────────────────────────────
export const fetchMyAuditLog = (limit = 50)          => apiGet(`${API_PATHS.AUDIT.ME}?limit=${limit}`);

// ─── Metrics / SLA snapshot ───────────────────────────────────────────────────
export const fetchMetrics = (windowSeconds = 3600)   => apiGet(`${API_PATHS.METRICS}?windowSeconds=${windowSeconds}`);

// ─── Agent orchestration trace ────────────────────────────────────────────────
export const fetchAgentRun = (runId)                 => apiGet(API_PATHS.CHAT_AGENT_RUN(runId));

// ─── Admin / Governance ───────────────────────────────────────────────────────
export const fetchAdminOverview  = ()                => apiGet(API_PATHS.ADMIN.OVERVIEW);
export const fetchAdminAudit     = (limit = 100)     => apiGet(`${API_PATHS.ADMIN.AUDIT}?limit=${limit}`);
export const fetchAdminAgentRuns = (limit = 100)     => apiGet(`${API_PATHS.ADMIN.AGENT_RUNS}?limit=${limit}`);

// ─── TTS ──────────────────────────────────────────────────────────────────────
// Returns an object URL for the audio blob. The caller is responsible for
// revoking it via URL.revokeObjectURL once playback ends.
export async function synthesizeSpeech(text) {
  const res = await request('POST', API_PATHS.TTS, { body: { text }, parse: false });
  if (!res.ok) throw new Error('TTS failed');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
