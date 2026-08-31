import { authFetchJson } from './httpClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface BackendSettings {
  moderate_threshold: number;
  heavy_threshold: number;
  counting_line_position: number;
  smoothing_window_seconds: number;
  detection_sensitivity: number;
  email_alerts_enabled: boolean;
}

export async function getSettings(): Promise<BackendSettings> {
  return authFetchJson<BackendSettings>(`${API_BASE_URL}/api/settings`);
}

export async function updateSettings(settings: BackendSettings): Promise<BackendSettings> {
  return authFetchJson<BackendSettings>(`${API_BASE_URL}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
}
