import React, { useState } from 'react';
import { INITIAL_EVENTS } from '../data';
import { TrafficEvent } from '../types';
import { 
  FileDown, 
  Filter, 
  Search, 
  Calendar, 
  ChevronDown, 
  Printer, 
  TrendingUp, 
  Car, 
  Clock, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';

interface ReportsViewProps {
  onOpenPdfModal: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onOpenPdfModal }) => {
  const [selectedDate, setSelectedDate] = useState('2023-10-24');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'spike' | 'normal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<TrafficEvent[]>(INITIAL_EVENTS);

  const filteredEvents = events.filter((e) => {
    if (filterSeverity !== 'all' && e.type !== filterSeverity) return false;
    if (searchQuery && !e.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto w-full text-[#F0F0F0]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono-data uppercase tracking-widest text-white/40">
            <span>REPORTS & ANALYTICS</span>
            <span>/</span>
            <span className="text-white">INTERSECTION INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight text-[#F0F0F0] mt-1">
            Historical Volume & Anomaly Report
          </h1>
        </div>

        {/* Date & Export Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#121212] border border-white/10 rounded px-3 py-1.5 text-xs text-white">
            <Calendar className="w-3.5 h-3.5 text-white/40" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-none font-mono-data text-white text-xs cursor-pointer"
            />
          </div>

          <button
            onClick={onOpenPdfModal}
            className="border border-white/20 hover:bg-white hover:text-black text-white text-[10px] uppercase tracking-widest font-semibold px-4 py-2 rounded flex items-center gap-2 transition-all"
          >
            <FileDown className="w-3.5 h-3.5" />
            Export Document
          </button>
        </div>
      </div>

      {/* 4 Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
          <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40 block">
            Total Vehicles
          </span>
          <div className="text-3xl font-light font-mono-data text-white mt-2">
            14,205
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-white/40">
            <span className="text-emerald-400 font-mono-data">+14%</span>
            <span>vs prior day</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
          <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40 block">
            Primary Class
          </span>
          <div className="text-2xl font-light text-white mt-2">
            Sedan / SUV
          </div>
          <div className="mt-2 text-xs text-white/40">
            <span className="font-mono-data text-white font-medium">81.2%</span> total fleet share
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
          <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40 block">
            Peak Density
          </span>
          <div className="text-3xl font-light font-mono-data text-white mt-2">
            94 <span className="text-sm font-normal text-white/40">v/m</span>
          </div>
          <div className="mt-2 text-xs text-white/40">
            Recorded at <span className="font-mono-data text-white">08:45 UTC</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
          <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40 block">
            Average Speed
          </span>
          <div className="text-3xl font-light font-mono-data text-white mt-2">
            42.0 <span className="text-sm font-normal text-white/40">mph</span>
          </div>
          <div className="mt-2 text-xs text-white/40">
            <span>Standard deviation: 4.8 mph</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 24h Volume Curve */}
        <div className="lg:col-span-2 bg-[#0e0e0e] rounded p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-[#F0F0F0]">Hourly Inbound vs Outbound Flow</h3>
                <p className="text-xs text-white/40">Cumulative volume vectors across 24 hours</p>
              </div>

              <div className="flex items-center gap-4 text-[10px] font-mono-data uppercase tracking-widest text-white/60">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-white" />
                  <span>Inbound (North)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-white/40 border-b border-dashed border-white/60" />
                  <span>Outbound (South)</span>
                </div>
              </div>
            </div>

            {/* SVG 24h Trend Chart */}
            <div className="h-64 w-full relative">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 200">
                {/* Horizontal Grid lines */}
                <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3,3" strokeWidth="0.5" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3,3" strokeWidth="0.5" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3,3" strokeWidth="0.5" />

                {/* Inbound Curve (Solid White) */}
                <path
                  d="M 0,180 C 100,160 150,40 200,50 C 250,60 300,130 350,120 C 400,110 450,20 500,40 C 550,60 580,140 600,170"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Outbound Curve (Translucent White) */}
                <path
                  d="M 0,190 C 80,180 140,80 200,90 C 260,100 320,150 380,140 C 440,130 480,50 540,65 C 570,80 590,150 600,185"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  strokeLinecap="round"
                />

                {/* High Peak Markers */}
                <circle cx="200" cy="50" r="4" fill="#ffffff" />
                <circle cx="500" cy="40" r="4" fill="#ffffff" />
              </svg>
            </div>

            {/* X-axis Timeline Labels */}
            <div className="flex justify-between text-[10px] font-mono-data text-white/30 pt-4 border-t border-white/10 uppercase tracking-widest">
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00 (AM Peak)</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>18:00 (PM Peak)</span>
              <span>23:59</span>
            </div>
          </div>
        </div>

        {/* Right Col: Category Distribution Bars */}
        <div className="bg-[#0e0e0e] rounded p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wider text-[#F0F0F0] mb-1">
              Vehicle Classification Tally
            </h3>
            <p className="text-xs text-white/40 mb-6">Total fleet breakdown by neural model</p>

            <div className="flex flex-col gap-4 text-xs">
              <div>
                <div className="flex justify-between text-white/60 mb-1.5">
                  <span className="font-medium text-white">Passenger Sedans</span>
                  <span className="font-mono-data text-white">8,420 (59.3%)</span>
                </div>
                <div className="w-full bg-[#121212] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-[59.3%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-white/60 mb-1.5">
                  <span className="font-medium text-white">SUVs & Crossovers</span>
                  <span className="font-mono-data text-white">3,105 (21.9%)</span>
                </div>
                <div className="w-full bg-[#121212] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-white/70 h-full w-[21.9%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-white/60 mb-1.5">
                  <span className="font-medium text-white">Commercial Trucks</span>
                  <span className="font-mono-data text-white">1,840 (13.0%)</span>
                </div>
                <div className="w-full bg-[#121212] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-white/50 h-full w-[13.0%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-white/60 mb-1.5">
                  <span className="font-medium text-white">Motorcycles</span>
                  <span className="font-mono-data text-white">680 (4.8%)</span>
                </div>
                <div className="w-full bg-[#121212] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-white/30 h-full w-[4.8%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-white/60 mb-1.5">
                  <span className="font-medium text-white">Transit Buses</span>
                  <span className="font-mono-data text-white">160 (1.1%)</span>
                </div>
                <div className="w-full bg-[#121212] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-white/20 h-full w-[1.1%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-[10px] font-mono-data text-white/40 uppercase tracking-widest">
            Dataset model confidence: &gt;96.4% IoU
          </div>
        </div>
      </div>

      {/* Notable Event Log Table */}
      <div className="bg-[#0e0e0e] rounded p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wider text-[#F0F0F0]">Notable Event Logs</h3>
            <p className="text-xs text-white/40">Real-time alerts and trigger history</p>
          </div>

          {/* Filter and Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Buttons */}
            <div className="flex bg-[#121212] border border-white/10 rounded p-0.5 text-[10px] uppercase font-semibold">
              <button
                onClick={() => setFilterSeverity('all')}
                className={`px-3 py-1 rounded transition-colors ${filterSeverity === 'all' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterSeverity('critical')}
                className={`px-3 py-1 rounded transition-colors ${filterSeverity === 'critical' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilterSeverity('spike')}
                className={`px-3 py-1 rounded transition-colors ${filterSeverity === 'spike' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                Spike
              </button>
              <button
                onClick={() => setFilterSeverity('normal')}
                className={`px-3 py-1 rounded transition-colors ${filterSeverity === 'normal' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                Normal
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-white/30 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#121212] border border-white/10 rounded py-1 pl-8 pr-3 text-xs font-mono-data text-white placeholder-white/30 focus:outline-none focus:border-white/40 w-36 sm:w-48"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-data">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-[10px] uppercase tracking-widest bg-[#121212]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Telemetry Impact</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-white/60">{evt.timestamp}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        evt.severity === 'high'
                          ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                          : evt.severity === 'medium'
                          ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                          : 'bg-white/5 text-white/80 border-white/10'
                      }`}
                    >
                      {evt.type === 'critical' ? 'Critical Density' : evt.type === 'spike' ? 'Density Spike' : 'Flow Normal'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-sans text-xs">{evt.description}</td>
                  <td className="py-3 px-4 text-white/80">{evt.metricsImpact}</td>
                  <td className="py-3 px-4">
                    <span className="text-white/40 text-[10px] uppercase">RESOLVED</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
