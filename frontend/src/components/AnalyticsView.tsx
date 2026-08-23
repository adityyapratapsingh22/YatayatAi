import React, { useEffect, useState } from 'react';
import { BarChart3, Car, Layers, TrendingUp, Trophy, AlertTriangle, Truck, Bus, Bike } from 'lucide-react';
import { getAnalyticsSummary } from '../services/analyticsApi';
import type { AnalyticsSummary } from '../services/analyticsApi';

const DENSITY_COLORS: Record<string, string> = {
  Light: '#10B981',
  Moderate: '#F59E0B',
  Heavy: '#EF4444',
};

const CLASS_ICONS: Record<string, React.ElementType> = {
  car: Car,
  truck: Truck,
  bus: Bus,
  motorcycle: Bike,
  bicycle: Bike,
};

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAnalyticsSummary()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load analytics'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="p-6 text-white/40 text-xs uppercase tracking-widest">Crunching aggregate analytics...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4" />
          <span>{error ?? 'Could not load analytics.'}</span>
        </div>
      </div>
    );
  }

  if (data.total_sessions === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center gap-2 py-20 border border-dashed border-white/10 rounded bg-[#0e0e0e]">
          <BarChart3 className="w-8 h-8 text-white/20" />
          <p className="text-white/40 text-sm">Run a few analyses first -- Analytics aggregates across your full session history.</p>
        </div>
      </div>
    );
  }

  const totalDensity = Object.values(data.density_distribution).reduce((a, b) => a + b, 0) || 1;
  const totalClass = Object.values(data.class_distribution).reduce((a, b) => a + b, 0) || 1;
  const trendMax = Math.max(...data.sessions_over_time.map((p) => p.total_crossed), 1);

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Aggregate Insights</span>
        <h1 className="text-2xl font-light text-white mt-1">Analytics</h1>
        <p className="text-xs text-white/40 mt-1">
          Combined statistics across all {data.total_sessions} of your recorded sessions.
        </p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0e0e0e] rounded p-4 border border-white/10">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[9px] uppercase tracking-wider">Total Sessions</span>
          </div>
          <div className="text-2xl font-light text-white">{data.total_sessions}</div>
        </div>
        <div className="bg-[#0e0e0e] rounded p-4 border border-white/10">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <Car className="w-3.5 h-3.5" />
            <span className="text-[9px] uppercase tracking-wider">Vehicles Counted</span>
          </div>
          <div className="text-2xl font-light text-white">{data.total_vehicles_counted}</div>
        </div>
        <div className="bg-[#0e0e0e] rounded p-4 border border-white/10">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-[9px] uppercase tracking-wider">Avg / Session</span>
          </div>
          <div className="text-2xl font-light text-white">{data.average_vehicles_per_session}</div>
        </div>
        <div className="bg-[#0e0e0e] rounded p-4 border border-white/10">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span className="text-[9px] uppercase tracking-wider">Busiest Session</span>
          </div>
          <div className="text-lg font-light text-white truncate">
            {data.busiest_session ? `${data.busiest_session.total_crossed} vehicles` : '--'}
          </div>
          {data.busiest_session && (
            <div className="text-[10px] text-white/30 truncate mt-0.5">{data.busiest_session.video_id}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Density distribution */}
        <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white mb-4">
            Density Distribution
          </h3>
          {Object.keys(data.density_distribution).length === 0 ? (
            <p className="text-white/30 text-xs">No completed sessions yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {(['Light', 'Moderate', 'Heavy'] as const).map((level) => {
                const count = data.density_distribution[level] ?? 0;
                const pct = Math.round((count / totalDensity) * 100);
                return (
                  <div key={level} className="text-xs">
                    <div className="flex justify-between text-white/60 mb-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DENSITY_COLORS[level] }} />
                        {level}
                      </span>
                      <span className="font-mono text-white">{count} session{count !== 1 ? 's' : ''} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-[#1a1a1a] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full" style={{ width: `${pct}%`, backgroundColor: DENSITY_COLORS[level] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Class distribution */}
        <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white mb-4">
            Vehicle Types (All-Time)
          </h3>
          {Object.keys(data.class_distribution).length === 0 ? (
            <p className="text-white/30 text-xs">No vehicles counted yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(data.class_distribution)
                .sort(([, a], [, b]) => b - a)
                .map(([className, count]) => {
                  const Icon = CLASS_ICONS[className] ?? Car;
                  const pct = Math.round((count / totalClass) * 100);
                  return (
                    <div key={className} className="text-xs">
                      <div className="flex justify-between text-white/60 mb-1">
                        <span className="flex items-center gap-1.5 capitalize">
                          <Icon className="w-3.5 h-3.5" /> {className}
                        </span>
                        <span className="font-mono text-white">{count}</span>
                      </div>
                      <div className="w-full bg-[#1a1a1a] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-white h-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Activity over time */}
      <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white mb-4">
          Vehicles Counted Over Time
        </h3>
        {data.sessions_over_time.length === 0 ? (
          <p className="text-white/30 text-xs">No activity yet.</p>
        ) : (
          <div className="h-40 flex items-end gap-2">
            {data.sessions_over_time.map((point) => (
              <div key={point.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className="text-[9px] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  {point.total_crossed}
                </span>
                <div
                  className="w-full bg-white/80 hover:bg-white rounded-t transition-colors"
                  style={{ height: `${Math.max(4, (point.total_crossed / trendMax) * 120)}px` }}
                />
                <span className="text-[9px] text-white/30 whitespace-nowrap">
                  {new Date(point.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
