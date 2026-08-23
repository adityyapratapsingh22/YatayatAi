import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, FileText, Loader2, AlertTriangle, Car, Truck, Bus, Bike, HardDrive } from 'lucide-react';
import { getSessions, getSession, downloadSessionReport } from '../services/api';
import type { SessionSummary, SessionDetail } from '../services/api';

const DENSITY_STYLES: Record<string, string> = {
  Light: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  Moderate: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Heavy: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
};

const CLASS_ICONS: Record<string, React.ElementType> = {
  car: Car,
  truck: Truck,
  bus: Bus,
  motorcycle: Bike,
  bicycle: Bike,
};

type DensityFilter = 'All' | 'Heavy' | 'Moderate' | 'Light';

function triggerCsvDownload(detail: SessionDetail) {
  const rows = [
    'Frame,Active Vehicles,Avg Active (smoothed),Density Level',
    ...detail.trend.map((t) => `${t.frame_index},${t.active_vehicles},${t.avg_active_vehicles},"${t.density_level}"`),
  ].join('\n');

  const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${detail.video_id.replace(/\.[^/.]+$/, '')}_trend.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const HistoryView: React.FC = () => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [densityFilter, setDensityFilter] = useState<DensityFilter>('All');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    getSessions()
      .then((data) => {
        setSessions(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load sessions'))
      .finally(() => setIsLoadingList(false));
  }, []);

  useEffect(() => {
    if (selectedId == null) return;
    setIsLoadingDetail(true);
    getSession(selectedId)
      .then(setDetail)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load session detail'))
      .finally(() => setIsLoadingDetail(false));
  }, [selectedId]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesSearch = s.video_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDensity = densityFilter === 'All' || s.final_density === densityFilter;
      return matchesSearch && matchesDensity;
    });
  }, [sessions, searchQuery, densityFilter]);

  const classCounts = detail?.counts_by_class ?? {};
  const totalClassCount = Object.values(classCounts).reduce((a, b) => a + b, 0) || 1;
  const peakActive = detail?.trend.length ? Math.max(...detail.trend.map((t) => t.avg_active_vehicles)) : 0;

  const handleDownloadPdf = async () => {
    if (!selectedId) return;
    setDownloadingPdf(true);
    try {
      await downloadSessionReport(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Session Archive</span>
          <h1 className="text-2xl font-light text-white mt-1">Analysis History</h1>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-white/40">
          <HardDrive className="w-3.5 h-3.5" />
          <span>{sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoadingList ? (
        <div className="text-white/40 text-xs uppercase tracking-widest">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-20 border border-dashed border-white/10 rounded bg-[#0e0e0e]">
          <FileText className="w-8 h-8 text-white/20" />
          <p className="text-white/40 text-sm">No sessions yet — run an analysis to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: search, filter, list */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by video name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-white/40 placeholder-white/30"
              />
            </div>

            <div className="flex bg-[#121212] border border-white/10 rounded p-1 text-[10px] uppercase tracking-wider">
              {(['All', 'Heavy', 'Moderate', 'Light'] as DensityFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setDensityFilter(f)}
                  className={`flex-1 py-1.5 rounded transition-colors ${
                    densityFilter === f ? 'bg-white text-black font-semibold' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 max-h-[560px] overflow-y-auto pr-1">
              {filteredSessions.length === 0 ? (
                <p className="text-white/30 text-xs text-center py-8">No sessions match your search/filter.</p>
              ) : (
                filteredSessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`text-left p-3.5 rounded border transition-all ${
                      selectedId === s.id
                        ? 'bg-white/10 border-white/30'
                        : 'bg-[#0e0e0e] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white text-sm font-medium truncate">{s.video_id}</span>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded border text-[9px] font-medium uppercase tracking-wider ${DENSITY_STYLES[s.final_density ?? ''] ?? 'text-white/40 bg-white/5 border-white/10'}`}>
                        {s.final_density ?? 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5 text-[11px] text-white/40">
                      <span>{s.started_at ? new Date(s.started_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '--'}</span>
                      <span>{s.total_crossed ?? 0} vehicles</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: detail panel */}
          <div className="lg:col-span-3 bg-[#0e0e0e] rounded border border-white/10 p-5">
            {isLoadingDetail || !detail ? (
              <div className="text-white/40 text-xs uppercase tracking-widest py-8 text-center">
                {isLoadingDetail ? 'Loading session...' : 'Select a session'}
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between flex-wrap gap-3 mb-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-medium text-white">{detail.video_id}</h2>
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-medium uppercase tracking-wider ${detail.ended_at ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30'}`}>
                        {detail.ended_at ? 'Finished' : 'In Progress'}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40 mt-1">
                      {detail.started_at ? new Date(detail.started_at).toLocaleString() : '--'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => triggerCsvDownload(detail)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded border border-white/20 text-white text-[10px] font-semibold uppercase tracking-wider hover:bg-white/10 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      CSV
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      disabled={downloadingPdf || !detail.ended_at}
                      className="flex items-center gap-1.5 px-3 py-2 rounded bg-white text-black text-[10px] font-semibold uppercase tracking-wider hover:bg-white/90 transition-all disabled:opacity-40"
                    >
                      {downloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                      PDF Report
                    </button>
                  </div>
                </div>

                <div className="h-px bg-white/10 my-4" />

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-[#121212] border border-white/10 rounded p-4 text-center">
                    <div className="text-2xl font-light text-white">{detail.total_crossed ?? 0}</div>
                    <div className="text-[9px] uppercase tracking-wider text-white/40 mt-1">Total Crossed</div>
                  </div>
                  <div className="bg-[#121212] border border-white/10 rounded p-4 text-center">
                    <div className={`text-2xl font-light ${detail.final_density ? DENSITY_STYLES[detail.final_density]?.split(' ')[0] : 'text-white'}`}>
                      {detail.final_density ?? '--'}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-white/40 mt-1">Final Density</div>
                  </div>
                  <div className="bg-[#121212] border border-white/10 rounded p-4 text-center">
                    <div className="text-2xl font-light text-white">{peakActive.toFixed(1)}</div>
                    <div className="text-[9px] uppercase tracking-wider text-white/40 mt-1">Peak Avg Active</div>
                  </div>
                </div>

                <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white mb-3">
                  Vehicle Classification Breakdown
                </h3>
                {Object.keys(classCounts).length === 0 ? (
                  <p className="text-white/30 text-xs">No vehicles crossed the counting line in this session.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {Object.entries(classCounts)
                      .sort(([, a], [, b]) => b - a)
                      .map(([className, count]) => {
                        const Icon = CLASS_ICONS[className] ?? Car;
                        const pct = Math.round((count / totalClassCount) * 100);
                        return (
                          <div key={className} className="text-xs">
                            <div className="flex justify-between text-white/60 mb-1">
                              <span className="flex items-center gap-1.5 capitalize">
                                <Icon className="w-3.5 h-3.5" /> {className}
                              </span>
                              <span className="font-mono text-white font-medium">{count}</span>
                            </div>
                            <div className="w-full bg-[#1a1a1a] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-white h-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
