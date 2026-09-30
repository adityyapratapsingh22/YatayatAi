import { useState, useRef, useCallback } from 'react';

function getWsBaseUrl(): string {
  const envWs = import.meta.env.VITE_WS_BASE_URL;
  if (envWs && typeof envWs === 'string' && envWs.trim() !== '') {
    return envWs.trim().replace(/\/+$/, '');
  }

  const envApi = import.meta.env.VITE_API_BASE_URL;
  if (envApi && typeof envApi === 'string' && envApi.trim() !== '') {
    const cleanApi = envApi.trim().replace(/\/+$/, '');
    const wsProto = cleanApi.startsWith('https') ? 'wss' : 'ws';
    const host = cleanApi.replace(/^https?:\/\//, '');
    return `${wsProto}://${host}/ws/analytics`;
  }

  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return `wss://${window.location.host}/ws/analytics`;
  }

  return 'ws://localhost:8000/ws/analytics';
}

const WS_BASE_URL = getWsBaseUrl();

// Render free tier can take up to 50 seconds to cold-start.
// Retry up to MAX_RETRIES times with increasing delays before giving up.
const MAX_RETRIES = 5;
const RETRY_DELAYS_MS = [3000, 5000, 8000, 12000, 15000]; // total ~43s of retry window

export interface TelemetryUpdate {
  frame_index: number;
  active_vehicles: number;
  avg_active_vehicles: number;
  density_level: 'Light' | 'Moderate' | 'Heavy' | string;
  total_crossed: number;
  counts_by_class: Record<string, number>;
  error?: string;
}

export function useAnalyticsSocket() {
  const [connected, setConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [latest, setLatest] = useState<TelemetryUpdate | null>(null);
  const [history, setHistory] = useState<TelemetryUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeVideoIdRef = useRef<string>('');
  const activeTokenRef = useRef<string>('');
  const attemptRef = useRef<number>(0);
  const cancelledRef = useRef<boolean>(false);

  const clearRetryTimer = () => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  };

  // token is required now -- the backend rejects the WebSocket handshake (code 4401)
  // if it's missing or invalid, since this endpoint is authenticated per-user.
  const attemptConnect = useCallback((videoId: string, token: string, attempt: number) => {
    if (cancelledRef.current) return;

    setConnecting(true);
    setRetryCount(attempt);

    const cleanBase = WS_BASE_URL.replace(/\/+$/, '');
    const cleanVideoId = encodeURIComponent(videoId.replace(/^\/+/, ''));
    const wsUrl = `${cleanBase}/${cleanVideoId}?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (cancelledRef.current) { ws.close(); return; }
      setConnected(true);
      setConnecting(false);
      setError(null);
      setRetryCount(0);
    };

    ws.onclose = (event) => {
      if (cancelledRef.current) return;
      setConnected(false);
      setConnecting(false);

      if (event.code === 4401) {
        setError('Your session has expired. Please log in again.');
        return;
      }
      // Normal close after processing finished — not an error
      if (event.wasClean) return;
    };

    ws.onerror = () => {
      if (cancelledRef.current) return;
      setConnected(false);

      const nextAttempt = attempt + 1;
      if (nextAttempt <= MAX_RETRIES) {
        const delay = RETRY_DELAYS_MS[attempt] ?? 15000;
        const remaining = MAX_RETRIES - attempt;
        setError(
          `Backend is waking up — retrying in ${Math.round(delay / 1000)}s ` +
          `(attempt ${nextAttempt}/${MAX_RETRIES}, ${remaining} left)…`
        );
        retryTimerRef.current = setTimeout(() => {
          if (!cancelledRef.current) {
            attemptConnect(activeVideoIdRef.current, activeTokenRef.current, nextAttempt);
          }
        }, delay);
      } else {
        setConnecting(false);
        setError(
          `Could not connect to the backend after ${MAX_RETRIES} attempts. ` +
          `Please visit https://yatayatai.onrender.com to wake it up, then try again.`
        );
      }
    };

    ws.onmessage = (event) => {
      try {
        const data: TelemetryUpdate = JSON.parse(event.data);
        if (data.error) {
          setError(data.error);
          return;
        }
        setLatest(data);
        setHistory((prev) => [...prev.slice(-99), data]);
      } catch (err) {
        console.error('Failed to parse WebSocket message', err);
      }
    };
  }, []);

  const connect = useCallback((videoId: string, token: string) => {
    // Cancel any in-progress retry loop
    cancelledRef.current = true;
    clearRetryTimer();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Reset all state for new session
    cancelledRef.current = false;
    activeVideoIdRef.current = videoId;
    activeTokenRef.current = token;
    attemptRef.current = 0;

    setHistory([]);
    setError(null);
    setLatest(null);
    setConnected(false);
    setConnecting(true);
    setRetryCount(0);

    attemptConnect(videoId, token, 0);
  }, [attemptConnect]);

  const disconnect = useCallback(() => {
    cancelledRef.current = true;
    clearRetryTimer();
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
    setConnecting(false);
  }, []);

  return { connected, connecting, retryCount, latest, history, error, connect, disconnect };
}
