import { clearAuthSession, getAuthToken } from './auth-storage.js';

const DEV_API_PROXY_PREFIX = '/__api';

function trimTrailingSlash(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function resolveApiBaseUrl() {
  const envApiUrl = (import.meta.env.VITE_API_URL ?? '').trim();
  if (!envApiUrl) return '';

  const isAbsoluteUrl = /^https?:\/\//i.test(envApiUrl);
  if (!isAbsoluteUrl) {
    return trimTrailingSlash(envApiUrl);
  }

  try {
    const parsedUrl = new URL(envApiUrl);

    if (import.meta.env.DEV) {
      return DEV_API_PROXY_PREFIX;
    }

    return trimTrailingSlash(parsedUrl.toString());
  } catch {
    return trimTrailingSlash(envApiUrl);
  }
}

const API_BASE_URL = resolveApiBaseUrl();

class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status ?? 0;
    this.responseData = options.responseData ?? null;
    this.errors = options.errors ?? options.responseData?.errors ?? {};
    this.isUnauthorized = options.isUnauthorized ?? false;
  }
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;

  // Reload the application entry point first. React Router will then direct
  // unauthenticated users to /login without requesting that SPA route directly.
  window.location.replace('/');
}

async function handleUnauthorized(responseData) {
  await clearAuthSession();
  redirectToLogin();

  throw new ApiError(responseData?.message || 'Akses Ditolak!', {
    status: 401,
    responseData,
    isUnauthorized: true,
  });
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function apiFetch(
  path,
  {
    method = 'GET',
    body,
    headers = {},
    requiresAuth = true,
    parseAsJson = true,
  } = {},
) {
  if (!API_BASE_URL) {
    throw new ApiError('VITE_API_URL belum diatur.');
  }

  const requestUrl = `${API_BASE_URL}/${String(path).replace(/^\/+/, '')}`;
  const requestHeaders = new Headers(headers);

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  let requestBody;
  if (body !== undefined) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    if (isFormData) {
      requestBody = body;
    } else if (typeof body === 'string') {
      requestBody = body;
      if (!requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
      }
    } else {
      requestBody = JSON.stringify(body);
      if (!requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
      }
    }
  }

  let response;
  try {
    response = await fetch(requestUrl, {
      method,
      headers: requestHeaders,
      body: requestBody,
    });
  } catch (error) {
    const browserMessage = error instanceof Error ? error.message : '';
    const blockedHint = browserMessage.includes('Failed to fetch')
      ? ' Request kemungkinan diblokir browser, extension, DNS, atau antivirus.'
      : '';

    throw new ApiError(
      `Tidak bisa menghubungi API: ${requestUrl}.${blockedHint}`,
      { responseData: { browserMessage } },
    );
  }

  const responseData = parseAsJson ? await parseResponse(response) : null;
  const unauthorizedByMessage = responseData?.message === 'Akses Ditolak!';

  if (response.status === 401 || unauthorizedByMessage) {
    await handleUnauthorized(responseData);
  }

  if (!response.ok) {
    throw new ApiError(responseData?.message || `Request gagal: ${response.status}`, {
      status: response.status,
      responseData,
    });
  }

  if (responseData?.status === 'error') {
    throw new ApiError(responseData?.message || 'Terjadi kesalahan dari API.', {
      status: response.status,
      responseData,
    });
  }

  return responseData;
}

export { ApiError, apiFetch };
