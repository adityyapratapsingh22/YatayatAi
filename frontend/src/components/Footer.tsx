import React from 'react';
import { NavTab } from '../types';
import { Video, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavClick: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  return (
    <footer className="w-full bg-[#050505] border-t border-white/10 text-white/50 text-xs py-10 px-6 md:px-12 mt-auto">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand & Coordinates */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center font-bold">
              <Video className="w-3 h-3 text-black" />
            </div>
            <span className="text-white font-medium uppercase tracking-[0.2em] text-[11px]">
              Traffic Analyzer
            </span>
          </div>

          <span className="hidden sm:inline text-white/20">•</span>

          <div className="text-[10px] font-mono-data text-white/30 tracking-widest uppercase">
            <span>Stockholm, SE</span>
            <span className="mx-2">•</span>
            <span>59.3293° N, 18.0686° E</span>
          </div>
        </div>

        {/* Center Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-mono-data uppercase tracking-widest text-white/40">
          <button
            onClick={() => onNavClick('landing')}
            className="hover:text-white transition-colors"
          >
            Overview
          </button>
          <button
            onClick={() => onNavClick('dashboard')}
            className="hover:text-white transition-colors"
          >
            Live Monitor
          </button>
          <button
            onClick={() => onNavClick('reports')}
            className="hover:text-white transition-colors"
          >
            Reports
          </button>
          <button
            onClick={() => onNavClick('history')}
            className="hover:text-white transition-colors"
          >
            Archives
          </button>
          <button
            onClick={() => onNavClick('about')}
            className="hover:text-white transition-colors"
          >
            Architecture
          </button>
        </div>

        {/* Right: Live Connection Active */}
        <div className="flex items-center gap-2 text-[10px] font-mono-data uppercase tracking-widest text-white/40">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>Live Connection Active</span>
        </div>
      </div>
    </footer>
  );
};
