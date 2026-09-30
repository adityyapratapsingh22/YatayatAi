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

function getHttpBaseUrl(): string {
  const envApi = import.meta.env.VITE_API_BASE_URL;
  if (envApi && typeof envApi === 'string' && envApi.trim() !== '') {
    return envApi.trim().replace(/\/+$/, '');
  }
  return 'http://localhost:8000';
}

const WS_BASE_URL = getWsBaseUrl();
const HTTP_BASE_URL = getHttpBaseUrl();

// Render free tier takes up to 60 seconds to cold-start.
// Strategy: first ping HTTP to wake the server, then open WebSocket.
// If WebSocket still fails, keep retrying for up to ~90 seconds total.
const MAX_RETRIES = 8;
// Delays between WS retries (ms). Total window ~87 seconds.
const RETRY_DELAYS_MS = [3000, 5000, 8000, 10000, 12000, 15000, 17000, 17000];

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

  const wsRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoIdRef = useRef<string>('');
  const tokenRef = useRef<string>('');
  const cancelledRef = useRef<boolean>(false);
  // Track whether we are mid-retry so onclose doesn't prematurely clear connecting
  const willRetryRef = useRef<boolean>(false);

  const clearRetryTimer = () => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  };

  const openWebSocket = useCallback((attempt: number) => {
    if (cancelledRef.current) return;

    const cleanBase = WS_BASE_URL.replace(/\/+$/, '');
    const cleanVideoId = encodeURIComponent(videoIdRef.current.replace(/^\/+/, ''));
    const wsUrl = `${cleanBase}/${cleanVideoId}?token=${encodeURIComponent(tokenRef.current)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (cancelledRef.current) { ws.close(); return; }
      willRetryRef.current = false;
      setConnected(true);
      setConnecting(false);
      setError(null);
    };

    ws.onerror = () => {
      if (cancelledRef.current) return;

      const nextAttempt = attempt + 1;
      if (nextAttempt <= MAX_RETRIES) {
        // Mark that we will retry so onclose doesn't clear connecting state
        willRetryRef.current = true;
        const delay = RETRY_DELAYS_MS[attempt] ?? 17000;
        const totalSecsLeft = RETRY_DELAYS_MS
          .slice(nextAttempt - 1)
          .reduce((a, b) => a + b, 0) / 1000;
        setError(
          `Backend is waking up — retrying in ${Math.round(delay / 1000)}s ` +
          `(attempt ${nextAttempt}/${MAX_RETRIES}, ~${Math.round(totalSecsLeft)}s window left)…`
        );
        retryTimerRef.current = setTimeout(() => {
          if (!cancelledRef.current) {
            willRetryRef.current = false;
            openWebSocket(nextAttempt);
          }
        }, delay);
      } else {
        // All retries exhausted — give up
        willRetryRef.current = false;
        setConnecting(false);
        setError(
          `Could not reach the backend after ${MAX_RETRIES} attempts (~90s). ` +
          `Visit https://yatayatai.onrender.com in a new tab to wake it up, then upload again.`
        );
      }
    };

    ws.onclose = (event) => {
      if (cancelledRef.current) return;
      setConnected(false);

      if (event.code === 4401) {
        willRetryRef.current = false;
        setConnecting(false);
        setError('Your session has expired. Please log in again.');
        return;
      }

      // If we're about to retry (willRetryRef is true), keep connecting=true
      // so the blue spinner stays visible and the error banner shows retry message
      if (!willRetryRef.current) {
        setConnecting(false);
      }

      // Clean close after pipeline finished — not an error
      if (event.wasClean && event.code === 1000) {
        setError(null);
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

  // Ping HTTP health endpoint first to wake Render before opening WebSocket.
  // This dramatically reduces cold-start time because the HTTP ping triggers
  // the container to start, and by the time we open the WebSocket the server
  // is usually already initializing.
  const pingThenConnect = useCallback(async () => {
    if (cancelledRef.current) return;
    try {
      await fetch(`${HTTP_BASE_URL}/`, { method: 'GET', signal: AbortSignal.timeout(10000) });
    } catch {
      // Ping failed or timed out — proceed anyway, WS retries will handle it
    }
    if (!cancelledRef.current) {
      openWebSocket(0);
    }
  }, [openWebSocket]);

  const connect = useCallback((videoId: string, token: string) => {
    // Cancel any in-progress connection / retry loop
    cancelledRef.current = true;
    willRetryRef.current = false;
    clearRetryTimer();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Reset for new session
    cancelledRef.current = false;
    videoIdRef.current = videoId;
    tokenRef.current = token;

    setHistory([]);
    setError(null);
    setLatest(null);
    setConnected(false);
    setConnecting(true);

    // Ping HTTP first (wakes Render), then open WebSocket
    pingThenConnect();
  }, [pingThenConnect]);

  const disconnect = useCallback(() => {
    cancelledRef.current = true;
    willRetryRef.current = false;
    clearRetryTimer();
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
    setConnecting(false);
  }, []);

  return { connected, connecting, latest, history, error, connect, disconnect };
}
