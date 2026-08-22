import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './tokenStorage';
import { refreshTokens } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface BackendSettings {
  moderate_threshold: number;
  heavy_threshold: number;
  counting_line_position: number;
  smoothing_window_seconds: number;
  detection_sensitivity: number;
  email_alerts_enabled: boolean;
}

let refreshInFlight: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = refreshTokens(refreshToken)
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

async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
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

export async function getSettings(): Promise<BackendSettings> {
  const response = await authFetch(`${API_BASE_URL}/api/settings`);
  if (!response.ok) {
    throw new Error(`Failed to load settings: ${response.statusText}`);
  }
  return response.json();
}

export async function updateSettings(settings: BackendSettings): Promise<BackendSettings> {
  const response = await authFetch(`${API_BASE_URL}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
    } catch {
      // not JSON, keep statusText
    }
    throw new Error(detail);
  }
  return response.json();
}
