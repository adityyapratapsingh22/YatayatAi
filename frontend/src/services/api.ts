import { authFetch, authFetchJson } from './httpClient';

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

export async function uploadVideo(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return authFetchJson<UploadResponse>(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });
}

export async function getSessions(): Promise<SessionSummary[]> {
  return authFetchJson<SessionSummary[]>(`${API_BASE_URL}/api/sessions`);
}

export async function getSession(sessionId: number): Promise<SessionDetail> {
  return authFetchJson<SessionDetail>(`${API_BASE_URL}/api/sessions/${sessionId}`);
}

/** Downloads a session's PDF report. This can't be a plain <a href> link, since the
 * endpoint requires an Authorization header -- so we fetch it as a blob and trigger
 * the browser's save dialog manually instead. */
export async function downloadSessionReport(sessionId: number, suggestedFilename?: string): Promise<void> {
  const response = await authFetch(`${API_BASE_URL}/api/sessions/${sessionId}/report`);
  if (!response.ok) {
    throw new Error(`Failed to generate report: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const disposition = response.headers.get('Content-Disposition');
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? suggestedFilename ?? `traffic_report_${sessionId}.pdf`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
