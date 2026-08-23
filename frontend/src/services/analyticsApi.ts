import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './tokenStorage';
import { refreshTokens } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface BusiestSession {
  id: number;
  video_id: string;
  total_crossed: number;
}

export interface SessionsOverTimePoint {
  date: string;
  total_crossed: number;
}

export interface AnalyticsSummary {
  total_sessions: number;
  total_vehicles_counted: number;
  average_vehicles_per_session: number;
  density_distribution: Record<string, number>;
  class_distribution: Record<string, number>;
  sessions_over_time: SessionsOverTimePoint[];
  busiest_session: BusiestSession | null;
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

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const response = await authFetch(`${API_BASE_URL}/api/analytics/summary`);
  if (!response.ok) {
    throw new Error(`Failed to load analytics: ${response.statusText}`);
  }
  return response.json();
}
