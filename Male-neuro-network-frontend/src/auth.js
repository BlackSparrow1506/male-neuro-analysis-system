// Small utilities for client-side auth-session bookkeeping. Keeping them
// here means App.jsx and any other view can read or clear the locally
// cached identity without each one inlining the same Object.values dance.

import { STORAGE_KEYS } from './constants';
import { getToken } from './api';

const PROFILE_KEYS = [
  STORAGE_KEYS.EMAIL,
  STORAGE_KEYS.USERNAME,
  STORAGE_KEYS.EMAIL_VERIFIED,
  STORAGE_KEYS.ADMIN,
];

/** Decode a JWT payload (no signature check) and answer "is exp in the future?". */
export function isTokenAlive() {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

/** Persist the four user-profile keys produced by login / register / google. */
export function persistAuthProfile(data) {
  localStorage.setItem(STORAGE_KEYS.EMAIL,          data.email          || '');
  localStorage.setItem(STORAGE_KEYS.USERNAME,       data.username       || '');
  localStorage.setItem(STORAGE_KEYS.EMAIL_VERIFIED, data.emailVerified ? 'true' : 'false');
  localStorage.setItem(STORAGE_KEYS.ADMIN,          data.admin         ? 'true' : 'false');
}

/** Drop every cached identity field. Used on logout AND on session-expired. */
export function clearStoredAuth() {
  for (const key of PROFILE_KEYS) localStorage.removeItem(key);
}
