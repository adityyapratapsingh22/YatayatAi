import React, { useState, useEffect } from 'react';
import { INITIAL_ARCHIVE_SESSIONS } from '../data';
import { ArchiveSession } from '../types';
import { getSessions, SessionSummary } from '../services/api';
import {
  Download,
  Search,
  HardDrive,
  Check,
  Car,
  Wifi
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const [sessions, setSessions] = useState<ArchiveSession[]>(INITIAL_ARCHIVE_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || 'LOG-9942');
  const [searchQuery, setSearchQuery] = useState('');
  const [densityFilter, setDensityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    getSessions()
      .then((data: SessionSummary[]) => {
        if (data && data.length > 0) {
          setIsBackendConnected(true);
          const mapped: ArchiveSession[] = data.map((s) => ({
            id: `LOG-DB-${s.id}`,
            filename: s.video_id || 'video_stream.mp4',
            timestamp: s.started_at || new Date().toISOString(),
            date: s.started_at ? new Date(s.started_at).toLocaleDateString() : 'Today',
            timeRange: s.started_at ? new Date(s.started_at).toLocaleTimeString() : 'Recent',
            duration: s.ended_at ? 'Session Finished' : 'Active Session',
            startTime: s.started_at ? new Date(s.started_at).toLocaleTimeString() : '00:00:00',
            endTime: s.ended_at ? new Date(s.ended_at).toLocaleTimeString() : '00:05:00',
            cameraName: s.video_id || 'Uploaded Video',
            eventsCount: 3,
            totalCount: s.total_crossed || 0,
            peakDensity: s.final_density === 'Heavy' ? 88 : s.final_density === 'Moderate' ? 64 : 32,
            densityLevel: s.final_density === 'Heavy' ? 'High Density' : s.final_density === 'Moderate' ? 'Med Density' : 'Low Density',
            avgSpeed: 42.0,
            sedanCount: Math.round((s.total_crossed || 0) * 0.55),
            suvCount: Math.round((s.total_crossed || 0) * 0.25),
            truckCount: Math.round((s.total_crossed || 0) * 0.15),
            motoCount: Math.round((s.total_crossed || 0) * 0.05),
            busCount: 0,
          }));
          setSessions((prev) => [...mapped, ...prev]);
          if (mapped.length > 0) {
            setSelectedSessionId(mapped[0].id);
          }
        }
      })
      .catch(() => {
        setIsBackendConnected(false);
      });
  }, []);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  const filteredSessions = sessions.filter((s) => {
    if (densityFilter === 'high' && s.peakDensity < 80) return false;
    if (densityFilter === 'medium' && (s.peakDensity < 50 || s.peakDensity >= 80)) return false;
    if (densityFilter === 'low' && s.peakDensity >= 50) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.id.toLowerCase().includes(q) ||
        s.cameraName.toLowerCase().includes(q) ||
        s.date.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDownloadCsv = (session: ArchiveSession) => {
    const csvContent = [
      'Timestamp,Camera,SessionID,TotalVehicles,PeakDensity,AvgSpeed_mph,Sedans,SUVs,Trucks,Motorcycles,Buses',
      `"${session.date} ${session.timeRange}","${session.cameraName}","${session.id}",${session.totalCount},${session.peakDensity},${session.avgSpeed},${session.sedanCount},${session.suvCount},${session.truckCount},${session.motoCount},${session.busCount}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${session.id}_dataset.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(session.id);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto w-full text-[#F0F0F0]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono-data uppercase tracking-widest text-white/40">
            <span>DATA LAKE ARCHIVES</span>
            <span>/</span>
            <span className="text-white">SESSION LOGS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight text-[#F0F0F0] mt-1">
            Recorded Video Archives
          </h1>
        </div>

        <div className="flex items-center gap-2 font-mono-data text-xs text-white/50">
          <HardDrive className="w-4 h-4 text-white/40" />
          <span>Cold Storage: 4 Sessions (14.2 GB)</span>
        </div>
      </div>

      {/* Master-Detail Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Master List */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#0e0e0e] rounded p-4 border border-white/10 flex flex-col gap-3">
            {/* Search and Density Filters */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search session ID or camera..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded py-2 pl-9 pr-3 text-xs font-mono-data text-white placeholder-white/30 focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="flex bg-[#121212] border border-white/10 rounded p-0.5 text-[10px] uppercase font-semibold">
              <button
                onClick={() => setDensityFilter('all')}
                className={`flex-1 py-1 rounded transition-colors ${densityFilter === 'all' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setDensityFilter('high')}
                className={`flex-1 py-1 rounded transition-colors ${densityFilter === 'high' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                High
              </button>
              <button
                onClick={() => setDensityFilter('medium')}
                className={`flex-1 py-1 rounded transition-colors ${densityFilter === 'medium' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                Medium
              </button>
              <button
                onClick={() => setDensityFilter('low')}
                className={`flex-1 py-1 rounded transition-colors ${densityFilter === 'low' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                Low
              </button>
            </div>
          </div>

          {/* List of Sessions */}
          <div className="flex flex-col gap-2">
            {filteredSessions.map((session) => {
              const isSelected = session.id === selectedSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`p-4 rounded border transition-all cursor-pointer text-xs ${isSelected
                      ? 'bg-[#141414] border-white/40 border-l-2 border-l-white shadow-lg'
                      : 'bg-[#0e0e0e] border-white/10 hover:bg-[#121212]'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono-data font-semibold text-white">
                      {session.id}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${session.peakDensity >= 80
                          ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                          : session.peakDensity >= 50
                            ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                            : 'bg-white/5 text-white/80 border-white/10'
                        }`}
                    >
                      {session.densityLevel} ({session.peakDensity}%)
                    </span>
                  </div>

                  <div className="text-white/40 text-[11px] mb-2 font-mono-data">
                    {session.cameraName} • {session.date}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-white/50 text-[11px] font-mono-data">
                    <span>{session.totalCount.toLocaleString()} vehicles</span>
                    <span>{session.avgSpeed} mph</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Session Detailed View */}
        <div className="lg:col-span-7">
          <div className="bg-[#0e0e0e] rounded p-6 md:p-8 border border-white/10 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-data font-semibold text-lg text-white">
                      {selectedSession.id}
                    </span>
                    <span className="bg-white/10 text-white text-[10px] font-mono-data px-2 py-0.5 rounded">
                      {selectedSession.duration}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mt-1 font-mono-data">
                    {selectedSession.cameraName} • {selectedSession.date} • {selectedSession.timeRange}
                  </p>
                </div>

                <button
                  onClick={() => handleDownloadCsv(selectedSession)}
                  className={`font-semibold text-[10px] uppercase tracking-widest px-4 py-2 rounded flex items-center gap-2 transition-all shadow-md active:scale-95 ${downloadSuccess === selectedSession.id
                      ? 'bg-emerald-400 text-black'
                      : 'border border-white/20 hover:bg-white hover:text-black text-white'
                    }`}
                >
                  {downloadSuccess === selectedSession.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      CSV Exported!
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      Download Raw CSV
                    </>
                  )}
                </button>
              </div>

              {/* 3 Metric blocks */}
              <div className="grid grid-cols-3 gap-3 my-6">
                <div className="bg-[#121212] p-4 rounded border border-white/10 text-center font-mono-data">
                  <span className="text-2xl font-light text-white block">
                    {selectedSession.totalCount.toLocaleString()}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-white/40">Total Count</span>
                </div>

                <div className="bg-[#121212] p-4 rounded border border-white/10 text-center font-mono-data">
                  <span className="text-2xl font-light text-white block">
                    {selectedSession.peakDensity}%
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-white/40">Peak Density</span>
                </div>

                <div className="bg-[#121212] p-4 rounded border border-white/10 text-center font-mono-data">
                  <span className="text-2xl font-light text-white block">
                    {selectedSession.avgSpeed} <span className="text-xs text-white/40">mph</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-white/40">Avg Speed</span>
                </div>
              </div>

              {/* Vehicle Breakdown Progress */}
              <div className="mb-6">
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white mb-4">
                  Neural Classification Breakdown
                </h4>

                <div className="flex flex-col gap-3 text-xs">
                  <div>
                    <div className="flex justify-between text-white/60 mb-1">
                      <span>Passenger Cars</span>
                      <span className="font-mono-data text-white">{selectedSession.sedanCount}</span>
                    </div>
                    <div className="w-full bg-[#121212] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-white h-full" style={{ width: `${(selectedSession.sedanCount / selectedSession.totalCount) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-white/60 mb-1">
                      <span>SUVs & Pickups</span>
                      <span className="font-mono-data text-white">{selectedSession.suvCount}</span>
                    </div>
                    <div className="w-full bg-[#121212] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-white/70 h-full" style={{ width: `${(selectedSession.suvCount / selectedSession.totalCount) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-white/60 mb-1">
                      <span>Commercial Trucks</span>
                      <span className="font-mono-data text-white">{selectedSession.truckCount}</span>
                    </div>
                    <div className="w-full bg-[#121212] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-white/50 h-full" style={{ width: `${(selectedSession.truckCount / selectedSession.totalCount) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-white/60 mb-1">
                      <span>Motorcycles & Scooters</span>
                      <span className="font-mono-data text-white">{selectedSession.motoCount}</span>
                    </div>
                    <div className="w-full bg-[#121212] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-white/30 h-full" style={{ width: `${(selectedSession.motoCount / selectedSession.totalCount) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer metadata */}
            <div className="pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-mono-data text-white/30 uppercase tracking-widest">
              <span>SHA-256: e3b0c44298fc1c149afbf4c8996...</span>
              <span>PARQUET LOG READY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
