import React, { useEffect, useState } from 'react';
import { FileText, Download, Loader2, AlertTriangle, Car } from 'lucide-react';
import { getSessions, downloadSessionReport } from '../services/api';
import type { SessionSummary } from '../services/api';

const DENSITY_STYLES: Record<string, string> = {
  Light: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  Moderate: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Heavy: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
};

export const ReportsView: React.FC = () => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load sessions'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDownload = async (session: SessionSummary) => {
    setDownloadError(null);
    setDownloadingId(session.id);
    try {
      await downloadSessionReport(session.id);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Failed to download report');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Analysis Archive</span>
        <h1 className="text-2xl font-light text-white mt-1">Reports</h1>
        <p className="text-xs text-white/40 mt-1">
          Download a detailed PDF report for any completed session -- summary stats, trend chart, and a full class breakdown.
        </p>
      </div>

      {downloadError && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}

      {isLoading && <div className="text-white/40 text-xs uppercase tracking-widest">Loading sessions...</div>}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!isLoading && !error && sessions.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-20 border border-dashed border-white/10 rounded bg-[#0e0e0e]">
          <FileText className="w-8 h-8 text-white/20" />
          <p className="text-white/40 text-sm">No sessions yet -- run an analysis first to generate a report.</p>
        </div>
      )}

      {!isLoading && sessions.length > 0 && (
        <div className="bg-[#0e0e0e] rounded border border-white/10 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                <th className="text-left px-4 py-3 font-medium">Video</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Total Crossed</th>
                <th className="text-left px-4 py-3 font-medium">Density</th>
                <th className="text-right px-4 py-3 font-medium">Report</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white font-medium truncate max-w-[220px]">{session.video_id}</td>
                  <td className="px-4 py-3 text-white/60">
                    {session.started_at ? new Date(session.started_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '--'}
                  </td>
                  <td className="px-4 py-3 text-white/80">
                    <span className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-white/40" />
                      {session.total_crossed ?? '--'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded border text-[10px] font-medium uppercase tracking-wider ${DENSITY_STYLES[session.final_density ?? ''] ?? 'text-white/40 bg-white/5 border-white/10'}`}>
                      {session.final_density ?? '--'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDownload(session)}
                      disabled={downloadingId === session.id || !session.ended_at}
                      title={!session.ended_at ? 'Session still in progress' : 'Download PDF report'}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-white/20 text-white text-[10px] font-semibold uppercase tracking-wider hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {downloadingId === session.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
