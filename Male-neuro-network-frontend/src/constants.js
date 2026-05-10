// Centralised string constants. Anything used in more than one file lives here.

export const STORAGE_KEYS = Object.freeze({
  TOKEN:           'nn_token',
  EMAIL:           'nn_email',
  USERNAME:        'nn_username',
  EMAIL_VERIFIED:  'nn_emailVerified',
});

export const EVENTS = Object.freeze({
  SESSION_EXPIRED: 'nn:sessionExpired',
});

export const ERROR_CODES = Object.freeze({
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
});

export const API_PATHS = Object.freeze({
  AUTH: {
    REGISTER:            '/auth/register',
    LOGIN:               '/auth/login',
    GOOGLE:              '/auth/google',
    RESEND_VERIFICATION: '/auth/resend-verification',
    ME:                  '/auth/me',
    PASSWORD:            '/auth/password',
    ACCOUNT:             '/auth/account',
  },
  PROFILES: '/profiles',
  CHAT:     '/chat',
  GITA: {
    GUIDANCE:  '/gita',          // /gita/{profileId}/guidance
    TRANSLATE: '/gita/translate',
  },
  TTS:      '/tts',
  HEALTH:   '/health',
  AUDIT: {
    ME: '/audit/me',
  },
  METRICS: '/metrics',
  CHAT: {
    AGENT_RUN: (id) => `/chat/agent-run/${id}`,
  },
});

export const HTTP_HEADERS = Object.freeze({
  CONTENT_TYPE:  'Content-Type',
  AUTHORIZATION: 'Authorization',
});

export const MIME = Object.freeze({
  JSON: 'application/json',
});
