import React, { useState, useEffect } from 'react';
import { NavTab } from '../types';
import { 
  Car, 
  Route, 
  Calculator, 
  Layers, 
  Video, 
  Cpu, 
  BarChart2, 
  LayoutDashboard,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';

interface LandingViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  const [liveCount, setLiveCount] = useState(42);
  const [fps, setFps] = useState(30.0);
  const [latency, setLatency] = useState(12);

  // Subtle telemetry jitter for realistic dynamic edge feel
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(36, Math.min(54, prev + delta));
      });
      setFps(+(29.8 + Math.random() * 0.4).toFixed(1));
      setLatency(Math.floor(11 + Math.random() * 3));
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#080808] text-[#F0F0F0]">
      {/* Top Brand Bar for Landing */}
      <header className="h-20 w-full bg-[#080808]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-bold">
            <Video className="w-4 h-4 text-black" />
          </div>
          <span className="text-sm font-semibold tracking-[0.2em] uppercase text-white">
            Traffic Analyzer
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[10px] font-medium uppercase tracking-[0.25em] text-white/40">
          <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
            Architecture
          </button>
          <button onClick={() => onNavigate('login')} className="hover:text-white transition-colors">
            Terminal Login
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="border border-white/20 py-2.5 px-5 text-[10px] uppercase tracking-widest font-semibold hover:bg-white hover:text-black transition-colors rounded"
          >
            Launch Monitor
          </button>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="px-6 md:px-12 py-16 md:py-24 max-w-[1440px] mx-auto relative overflow-hidden">
          {/* Subtle Monochrome Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white/[0.02] rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-6 flex flex-col gap-6 z-10">
              <div className="flex items-center gap-2 bg-[#121212] w-fit px-3 py-1 rounded border border-white/10">
                <div className="pulse-indicator" />
                <span className="text-[10px] font-medium tracking-[0.2em] text-white/60 uppercase">
                  Obsidian Engine Active • v4.2
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-light leading-[1.05] tracking-tight text-[#F0F0F0]">
                Turn any traffic camera into{' '}
                <span className="font-normal italic text-white underline decoration-white/30 underline-offset-8">
                  real-time intelligence
                </span>
                .
              </h1>

              <p className="text-sm text-white/50 leading-relaxed max-w-xl">
                Advanced computer vision for vehicle detection, multi-object tracking, precise spatial counting, and density estimation engineered for low-latency edge deployment.
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="bg-white text-black px-7 py-3 rounded font-medium text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all flex items-center gap-2 active:scale-95 shadow-[0_0_24px_rgba(255,255,255,0.15)]"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Try the Dashboard
                </button>

                <button
                  onClick={() => onNavigate('about')}
                  className="border border-white/20 text-white/80 px-7 py-3 rounded font-medium text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                >
                  View Documentation
                </button>
              </div>

              {/* Badges strip */}
              <div className="flex items-center gap-8 pt-6 text-[10px] font-mono-data uppercase tracking-widest text-white/30 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>99.4% Precision Model</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>&lt;15ms Edge Latency</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Mockup */}
            <div className="lg:col-span-6 relative w-full aspect-video bg-[#121212] rounded overflow-hidden border border-white/10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.9)] z-10 group">
              {/* Camera Stream Still */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjC_TtJENjoHNTGv7p2FEMHC30ikM9Ggmyec_NxH6l036zAU9Kc1ppdieCRKqeOsQjd5pSBfb1DMaOeo7fktd8MBjkoIv9vxxs2uBJVshM26uoKs6gWtm9WJCZuT0P2HyWcxBQ7P1X8tYNXG4XdzS13cVmuN47E_GsgRTOBoNn_SNmF9xYZiMp22oRfL6xnR30fVJe7DEjn5OpDNn4O5OQVhdc6xt0i6c6xMSp7B4ytk96VRrigVYN"
                alt="Traffic feed"
                className="w-full h-full object-cover opacity-35 grayscale contrast-125 select-none"
              />

              {/* Bounding Box 1 (Car) */}
              <div className="absolute top-[28%] left-[20%] w-24 h-16 border border-white bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-transform duration-700">
                <div className="absolute -top-5 left-0 bg-white text-black font-mono-data text-[9px] font-bold px-1.5 py-0.5 tracking-wider uppercase">
                  CAR 0.98
                </div>
              </div>

              {/* Bounding Box 2 (Truck) */}
              <div className="absolute top-[42%] left-[58%] w-32 h-20 border border-white/70 bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                <div className="absolute -top-5 left-0 bg-white/90 text-black font-mono-data text-[9px] font-bold px-1.5 py-0.5 tracking-wider uppercase">
                  TRUCK 0.92
                </div>
              </div>

              {/* Bounding Box 3 (Car) */}
              <div className="absolute top-[58%] left-[34%] w-20 h-14 border border-white bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                <div className="absolute -top-5 left-0 bg-white text-black font-mono-data text-[9px] font-bold px-1.5 py-0.5 tracking-wider uppercase">
                  CAR 0.95
                </div>
              </div>

              {/* Scan Line Animation */}
              <div className="scan-line pointer-events-none" />

              {/* Analytics HUD Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="flex gap-2">
                  <div className="bg-[#080808]/90 backdrop-blur px-3 py-2 rounded border border-white/10">
                    <span className="block text-[9px] font-medium uppercase tracking-widest text-white/40 mb-0.5">
                      FPS
                    </span>
                    <span className="font-mono-data text-xs font-medium text-white">
                      {fps}
                    </span>
                  </div>
                  <div className="bg-[#080808]/90 backdrop-blur px-3 py-2 rounded border border-white/10">
                    <span className="block text-[9px] font-medium uppercase tracking-widest text-white/40 mb-0.5">
                      LATENCY
                    </span>
                    <span className="font-mono-data text-xs font-medium text-white">
                      {latency}ms
                    </span>
                  </div>
                </div>

                <div className="bg-[#080808]/90 backdrop-blur px-4 py-2 rounded border border-white/10 text-right">
                  <span className="block text-[9px] font-medium uppercase tracking-widest text-white/40 mb-0.5">
                    CURRENT COUNT
                  </span>
                  <span className="text-xl font-light font-mono-data text-white">
                    {liveCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid Section */}
        <section className="px-6 md:px-12 py-20 bg-[#050505] border-t border-white/10">
          <div className="max-w-[1440px] mx-auto">
            <div className="mb-14">
              <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 block mb-2">
                Capabilities
              </span>
              <h2 className="text-2xl md:text-3xl font-light text-[#F0F0F0]">
                Core Architecture Modules
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div 
                onClick={() => onNavigate('dashboard')}
                className="bg-[#0e0e0e] p-6 rounded border border-white/10 hover:border-white/30 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 bg-white/5 rounded border border-white/10 flex items-center justify-center mb-6 text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <Car className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-[#F0F0F0] mb-2">
                  Vehicle Detection
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Real-time identification of diverse vehicle classes with &gt;98% accuracy in varied lighting conditions.
                </p>
              </div>

              {/* Feature 2 */}
              <div 
                onClick={() => onNavigate('dashboard')}
                className="bg-[#0e0e0e] p-6 rounded border border-white/10 hover:border-white/30 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 bg-white/5 rounded border border-white/10 flex items-center justify-center mb-6 text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <Route className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-[#F0F0F0] mb-2">
                  Multi-Object Tracking
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Persistent ID assignment across frames to track trajectories and behavioral anomalies.
                </p>
              </div>

              {/* Feature 3 */}
              <div 
                onClick={() => onNavigate('reports')}
                className="bg-[#0e0e0e] p-6 rounded border border-white/10 hover:border-white/30 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 bg-white/5 rounded border border-white/10 flex items-center justify-center mb-6 text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-[#F0F0F0] mb-2">
                  Smart Counting
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Directional line-crossing algorithms for precise inflow and outflow metrics per lane.
                </p>
              </div>

              {/* Feature 4 */}
              <div 
                onClick={() => onNavigate('settings')}
                className="bg-[#0e0e0e] p-6 rounded border border-white/10 hover:border-white/30 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 bg-white/5 rounded border border-white/10 flex items-center justify-center mb-6 text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-[#F0F0F0] mb-2">
                  Density Estimation
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Aggregated spatial analysis to detect congestion levels and trigger automated alerts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Pipeline Section */}
        <section className="px-6 md:px-12 py-20 bg-[#080808] border-t border-white/10">
          <div className="max-w-[1440px] mx-auto">
            <div className="mb-14 text-center">
              <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 block mb-2">
                Execution Pipeline
              </span>
              <h2 className="text-2xl md:text-3xl font-light text-[#F0F0F0]">
                How It Works
              </h2>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 relative">
              {/* Step 1 */}
              <div className="bg-[#0e0e0e] w-full lg:w-64 p-6 rounded border border-white/10 text-center z-10 relative">
                <span className="text-[9px] font-mono-data text-white/30 block mb-3 uppercase tracking-widest">
                  STAGE 01
                </span>
                <Video className="w-8 h-8 text-white/60 mx-auto mb-3" />
                <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[#F0F0F0] mb-2">
                  Ingestion
                </h4>
                <p className="text-xs text-white/40 leading-relaxed">
                  RTSP stream capture from existing IP cameras.
                </p>
              </div>

              <ArrowRight className="text-white/20 hidden lg:block w-5 h-5 shrink-0" />

              {/* Step 2 */}
              <div className="bg-[#0e0e0e] w-full lg:w-64 p-6 rounded border border-white/30 text-center z-10 relative">
                <span className="text-[9px] font-mono-data text-white/80 block mb-3 uppercase tracking-widest">
                  STAGE 02
                </span>
                <Cpu className="w-8 h-8 text-white mx-auto mb-3" />
                <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[#F0F0F0] mb-2">
                  Inference
                </h4>
                <p className="text-xs text-white/40 leading-relaxed">
                  YOLOv8 model executes object detection & tracking.
                </p>
              </div>

              <ArrowRight className="text-white/20 hidden lg:block w-5 h-5 shrink-0" />

              {/* Step 3 */}
              <div className="bg-[#0e0e0e] w-full lg:w-64 p-6 rounded border border-white/10 text-center z-10 relative">
                <span className="text-[9px] font-mono-data text-white/30 block mb-3 uppercase tracking-widest">
                  STAGE 03
                </span>
                <BarChart2 className="w-8 h-8 text-white/60 mx-auto mb-3" />
                <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[#F0F0F0] mb-2">
                  Analysis
                </h4>
                <p className="text-xs text-white/40 leading-relaxed">
                  Spatial logic calculates speeds, counts, and density.
                </p>
              </div>

              <ArrowRight className="text-white/20 hidden lg:block w-5 h-5 shrink-0" />

              {/* Step 4 */}
              <div className="bg-[#0e0e0e] w-full lg:w-64 p-6 rounded border border-white/10 text-center z-10 relative">
                <span className="text-[9px] font-mono-data text-white/30 block mb-3 uppercase tracking-widest">
                  STAGE 04
                </span>
                <LayoutDashboard className="w-8 h-8 text-white/60 mx-auto mb-3" />
                <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[#F0F0F0] mb-2">
                  Visualization
                </h4>
                <p className="text-xs text-white/40 leading-relaxed">
                  Data stream to dashboard and API endpoints.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
