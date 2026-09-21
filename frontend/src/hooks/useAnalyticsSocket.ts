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
  const [latest, setLatest] = useState<TelemetryUpdate | null>(null);
  const [history, setHistory] = useState<TelemetryUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // token is required now -- the backend rejects the WebSocket handshake (code 4401)
  // if it's missing or invalid, since this endpoint is authenticated per-user.
  const connect = useCallback((videoId: string, token: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setHistory([]);
    setError(null);
    setLatest(null);

    const cleanBase = WS_BASE_URL.replace(/\/+$/, '');
    const cleanVideoId = encodeURIComponent(videoId.replace(/^\/+/, ''));
    const wsUrl = `${cleanBase}/${cleanVideoId}?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = (event) => {
      setConnected(false);
      if (event.code === 4401) {
        setError('Your session has expired. Please log in again.');
      }
    };
    ws.onerror = () => {
      setError(`WebSocket connection error connecting to ${cleanBase}. Ensure the backend is online and reachable.`);
      setConnected(false);
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

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
  }, []);

  return { connected, latest, history, error, connect, disconnect };
}
