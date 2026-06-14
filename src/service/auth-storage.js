const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USERNAME_KEY = 'auth_username';
const PRODUCT_CACHE_KEY = 'app-toko-products-cache';
const API_CACHE_KEY = 'api-toko-cache';

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

async function clearAuthSession() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USERNAME_KEY);
  localStorage.removeItem(PRODUCT_CACHE_KEY);

  if ('caches' in window) {
    try {
      await caches.delete(API_CACHE_KEY);
    } catch {
      // Auth data is already cleared; cache deletion must not block logout.
    }
  }
}

function hasAuthSession() {
  return Boolean(getAuthToken());
}

export {
  AUTH_TOKEN_KEY,
  AUTH_USERNAME_KEY,
  PRODUCT_CACHE_KEY,
  API_CACHE_KEY,
  getAuthToken,
  getAuthUsername,
  setAuthSession,
  clearAuthSession,
  hasAuthSession,
};
