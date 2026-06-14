const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USERNAME_KEY = 'auth_username';

function getAuthToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? '';
}

function getAuthUsername() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(AUTH_USERNAME_KEY) ?? '';
}

function setAuthSession({ token, username }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USERNAME_KEY, username);
}

function clearAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USERNAME_KEY);
}

function hasAuthSession() {
  return Boolean(getAuthToken());
}

export {
  AUTH_TOKEN_KEY,
  AUTH_USERNAME_KEY,
  getAuthToken,
  getAuthUsername,
  setAuthSession,
  clearAuthSession,
  hasAuthSession,
};
