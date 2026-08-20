import React, { useState, useEffect } from 'react';
import {
  Upload,
  Car,
  Truck,
  Bus,
  Bike,
  Layers,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import type { TelemetryUpdate } from '../hooks/useAnalyticsSocket';

interface DashboardViewProps {
  connected: boolean;
  latest: TelemetryUpdate | null;
  history: TelemetryUpdate[];
  error: string | null;
  previewFile: File | null;
  onOpenUploadModal: () => void;
}

const DENSITY_STYLES: Record<string, { bg: string; dot: string; text: string }> = {
  Light: { bg: 'bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-400', text: 'text-emerald-300' },
  Moderate: { bg: 'bg-amber-500/10 border-amber-500/30', dot: 'bg-amber-400', text: 'text-amber-300' },
  Heavy: { bg: 'bg-rose-500/10 border-rose-500/30', dot: 'bg-rose-400', text: 'text-rose-300' },
};

const CLASS_ICONS: Record<string, React.ElementType> = {
  car: Car,
  truck: Truck,
  bus: Bus,
  motorcycle: Bike,
  bicycle: Bike,
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  connected,
  latest,
  history,
  error,
  previewFile,
  onOpenUploadModal,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!previewFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(previewFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [previewFile]);

  const hasData = latest !== null;
  const densityStyle = latest ? DENSITY_STYLES[latest.density_level] ?? DENSITY_STYLES.Moderate : null;

  const classCounts = latest?.counts_by_class ?? {};
  const totalClassCount = Object.values(classCounts).reduce((a, b) => a + b, 0) || 1;

  // Trend values for the sparkline, scaled against the highest value seen so far
  const trendValues = history.map((h) => h.avg_active_vehicles);
  const trendMax = Math.max(...trendValues, 5);

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
            Live Analysis
          </span>
          <h1 className="text-2xl font-light text-white mt-1">Real-time Traffic Intelligence</h1>
        </div>
        <div className="flex items-center gap-3">
          {connected && (
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
          )}
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-semibold uppercase tracking-wider rounded hover:bg-white/90 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Video
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty state */}
      {!hasData && !previewUrl && (
        <div className="flex flex-col items-center justify-center gap-3 py-24 border border-dashed border-white/10 rounded bg-[#0e0e0e]">
          <Upload className="w-8 h-8 text-white/20" />
          <p className="text-white/40 text-sm">No analysis yet — upload a video to get started.</p>
          <button
            onClick={onOpenUploadModal}
            className="mt-2 px-4 py-2 bg-white text-black text-xs font-semibold uppercase tracking-wider rounded hover:bg-white/90 transition-colors"
          >
            Upload Video
          </button>
        </div>
      )}

      {(hasData || previewUrl) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: video preview + trend chart */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F0F0F0] mb-3">
                Video Preview
              </h3>
              {previewUrl ? (
                <video src={previewUrl} controls className="w-full rounded border border-white/10" />
              ) : (
                <div className="w-full aspect-video bg-[#121212] rounded flex items-center justify-center text-white/20 text-sm">
                  No video selected
                </div>
              )}
            </div>

            <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F0F0F0]">
                    Active Vehicles Trend
                  </h3>
                  <p className="text-[11px] text-white/40">Smoothed average, this session</p>
                </div>
                {trendValues.length > 0 && (
                  <span className="text-[10px] font-mono text-white bg-[#121212] px-2.5 py-1 rounded border border-white/10 uppercase tracking-widest">
                    PEAK: {Math.max(...trendValues).toFixed(1)}
                  </span>
                )}
              </div>

              <div className="h-28 w-full relative">
                {trendValues.length > 1 ? (
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 100">
                    <line x1="0" y1="25" x2="400" y2="25" stroke="rgba(255,255,255,0.08)" strokeDasharray="2,2" strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.08)" strokeDasharray="2,2" strokeWidth="0.5" />
                    <line x1="0" y1="75" x2="400" y2="75" stroke="rgba(255,255,255,0.08)" strokeDasharray="2,2" strokeWidth="0.5" />
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d={`M 0,100 ${trendValues
                        .map((val, idx) => {
                          const x = (idx / (trendValues.length - 1)) * 400;
                          const y = 100 - (val / trendMax) * 90;
                          return `L ${x},${y}`;
                        })
                        .join(' ')} L 400,100 Z`}
                      fill="url(#trendGradient)"
                    />
                    <path
                      d={`M ${trendValues
                        .map((val, idx) => {
                          const x = (idx / (trendValues.length - 1)) * 400;
                          const y = 100 - (val / trendMax) * 90;
                          return `${idx === 0 ? '' : 'L '}${x},${y}`;
                        })
                        .join(' ')}`}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="400"
                      cy={100 - (trendValues[trendValues.length - 1] / trendMax) * 90}
                      r="3.5"
                      fill="#ffffff"
                      className="animate-pulse"
                    />
                  </svg>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                    Waiting for data...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: stat cards + class breakdown */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">
                    Active Vehicles
                  </span>
                  <div className="text-3xl font-light font-mono text-white mt-2">
                    {latest?.active_vehicles ?? '--'}
                  </div>
                </div>
                <div className="p-2.5 bg-white/5 rounded border border-white/10 text-white">
                  <Car className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-xs text-white/40">Raw count, this frame</div>
            </div>

            <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">
                    Avg Active (smoothed)
                  </span>
                  <div className="text-3xl font-light font-mono text-white mt-2">
                    {latest?.avg_active_vehicles ?? '--'}
                  </div>
                </div>
                <div className="p-2.5 bg-white/5 rounded border border-white/10 text-white">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-xs text-white/40">Rolling average, drives density</div>
            </div>

            <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">
                    Total Crossed
                  </span>
                  <div className="text-3xl font-light font-mono text-white mt-2">
                    {latest?.total_crossed?.toLocaleString() ?? '--'}
                  </div>
                </div>
                <div className="p-2.5 bg-white/5 rounded border border-white/10 text-white">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-xs text-white/40">Line-crossing count, this session</div>
            </div>

            {/* Density */}
            <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
              <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40 block mb-2">
                Traffic Density
              </span>
              {densityStyle ? (
                <div className={`p-3 rounded border flex items-center justify-between ${densityStyle.bg}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${densityStyle.dot}`} />
                    <span className={`font-semibold text-xs uppercase tracking-wider ${densityStyle.text}`}>
                      {latest?.density_level}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded border border-white/10 text-white/30 text-xs">--</div>
              )}
            </div>

            {/* Class breakdown -- real classes only (car/truck/bus/etc), no fabricated categories */}
            <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white mb-4">
                Vehicles Crossed by Class
              </h4>
              {Object.keys(classCounts).length === 0 ? (
                <p className="text-white/30 text-xs">No vehicles have crossed yet.</p>
              ) : (
                <div className="flex flex-col gap-3 text-xs">
                  {Object.entries(classCounts).map(([className, count]) => {
                    const Icon = CLASS_ICONS[className] ?? Car;
                    const pct = Math.round((count / totalClassCount) * 100);
                    return (
                      <div key={className}>
                        <div className="flex justify-between text-white/60 mb-1">
                          <span className="flex items-center gap-1.5 capitalize">
                            <Icon className="w-3.5 h-3.5" /> {className}
                          </span>
                          <span className="font-mono text-white font-medium">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#121212] h-1 rounded-full overflow-hidden">
                          <div className="bg-white h-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
