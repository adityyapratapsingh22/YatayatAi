import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Ensures only one refresh request is ever in flight at a time, even if multiple
// API calls hit a 401 simultaneously -- they all await the same refresh instead of
// each independently trying to refresh (which would race and invalidate each other).
let refreshInFlight: Promise<string | null> | null = null;

/** A raw, unauthenticated call to the refresh endpoint -- deliberately NOT imported from
 * authApi.ts, since authApi.ts itself uses authFetch()/authFetchJson() below for its
 * protected endpoints. Importing refreshTokens from authApi.ts here would create a
 * circular module dependency; this tiny inline version avoids that entirely. */
async function rawRefresh(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!response.ok) throw new Error('Refresh failed');
  return response.json();
}

async function tryRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = rawRefresh(refreshToken)
      .then((tokens) => {
        setTokens(tokens.access_token, tokens.refresh_token);
        return tokens.access_token;
      })
      .catch(() => {
        clearTokens();
        return null;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/**
 * fetch wrapper used by every API service file. Attaches the current access token,
 * and transparently retries once with a refreshed token if the first attempt comes
 * back 401. This is the single source of truth for that behavior -- previously it was
 * copy-pasted (inconsistently) across api.ts, settingsApi.ts, and analyticsApi.ts, while
 * authApi.ts had none of it at all, meaning an expired token on the Profile page failed
 * outright instead of silently refreshing like it did everywhere else.
 */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response = await fetch(input, { ...init, headers });

  if (response.status === 401) {
    const newToken = await tryRefresh();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(input, { ...init, headers });
    }
  }

  return response;
}

/** Same as authFetch, but throws with a readable message on failure and parses JSON --
 * saves repeating the same error-extraction boilerplate in every service file. */
export async function authFetchJson<T>(input: string, init: RequestInit = {}): Promise<T> {
  const response = await authFetch(input, init);
  if (!response.ok) {
    let detail: string = response.statusText;
    try {
      const body = await response.json();
      detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail ?? body);
    } catch {
      // response body wasn't JSON -- fall back to statusText
    }
    throw new Error(detail);
  }
  return response.json();
}
