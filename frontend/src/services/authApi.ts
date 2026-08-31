import { authFetchJson } from './httpClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  avatar_url: string | null;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ProfileStats {
  videos_analyzed: number;
  total_vehicles_counted: number;
  member_since: string;
}

async function handlePublicResponse<T>(response: Response): Promise<T> {
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

// --- Public endpoints (no auth token needed/available yet) -- plain fetch ---

export async function register(email: string, fullName: string, password: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, full_name: fullName, password }),
  });
  return handlePublicResponse<AuthUser>(response);
}

export async function login(email: string, password: string): Promise<TokenPair> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handlePublicResponse<TokenPair>(response);
}

export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return handlePublicResponse<TokenPair>(response);
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handlePublicResponse(response);
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  return handlePublicResponse(response);
}

// --- Protected endpoints -- use authFetch/authFetchJson, so these now correctly
// auto-refresh an expired token instead of failing outright (the bug this fixes) ---

export async function getMe(): Promise<AuthUser> {
  return authFetchJson<AuthUser>(`${API_BASE_URL}/api/auth/me`);
}

export async function updateProfile(fullName: string, email: string): Promise<AuthUser> {
  return authFetchJson<AuthUser>(`${API_BASE_URL}/api/auth/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: fullName, email }),
  });
}

export async function uploadAvatar(file: File): Promise<AuthUser> {
  const formData = new FormData();
  formData.append('file', file);

  // Deliberately not setting Content-Type -- the browser sets its own multipart
  // boundary automatically when the body is a FormData object.
  return authFetchJson<AuthUser>(`${API_BASE_URL}/api/auth/me/avatar`, {
    method: 'POST',
    body: formData,
  });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  return authFetchJson(`${API_BASE_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

export async function getMyStats(): Promise<ProfileStats> {
  return authFetchJson<ProfileStats>(`${API_BASE_URL}/api/auth/me/stats`);
}
