import { authFetchJson } from './httpClient';

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

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return authFetchJson<AnalyticsSummary>(`${API_BASE_URL}/api/analytics/summary`);
}
