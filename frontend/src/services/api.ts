import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './tokenStorage';
import { refreshTokens } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface UploadResponse {
  video_id: string;
  path: string;
}

export interface SessionSummary {
  id: number;
  video_id: string;
  started_at: string;
  ended_at: string | null;
  total_crossed: number | null;
  final_density: string | null;
}

export interface FrameSnapshot {
  frame_index: number;
  active_vehicles: number;
  avg_active_vehicles: number;
  density_level: string;
}

export interface SessionDetail extends SessionSummary {
  counts_by_class: Record<string, number>;
  trend: FrameSnapshot[];
  error?: string;
}

// Ensures only one refresh request is ever in flight at a time, even if multiple
// API calls hit a 401 simultaneously -- they all await the same refresh instead of
// each independently trying to refresh (which would race and invalidate each other).
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

/** fetch wrapper that attaches the current access token, and transparently retries
 * once with a refreshed token if the first attempt comes back 401. */
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

export async function uploadVideo(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await authFetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload video: ${response.statusText}`);
  }
  return response.json();
}

export async function getSessions(): Promise<SessionSummary[]> {
  const response = await authFetch(`${API_BASE_URL}/api/sessions`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sessions: ${response.statusText}`);
  }
  return response.json();
}

export async function getSession(sessionId: number): Promise<SessionDetail> {
  const response = await authFetch(`${API_BASE_URL}/api/sessions/${sessionId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch session detail: ${response.statusText}`);
  }
  return response.json();
}
