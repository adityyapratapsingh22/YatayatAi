import { useState, useRef, useCallback } from 'react';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws/analytics';

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

  const connect = useCallback((videoId: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setHistory([]);
    setError(null);
    setLatest(null);

    const ws = new WebSocket(`${WS_BASE_URL}/${videoId}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => {
      setError('WebSocket connection error -- verify backend server is running at http://localhost:8000');
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
