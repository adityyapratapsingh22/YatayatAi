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

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload video: ${response.statusText}`);
  }

  return response.json();
}

export async function getSessions(): Promise<SessionSummary[]> {
  const response = await fetch(`${API_BASE_URL}/api/sessions`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sessions: ${response.statusText}`);
  }
  return response.json();
}

export async function getSession(sessionId: number): Promise<SessionDetail> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch session detail: ${response.statusText}`);
  }
  return response.json();
}
