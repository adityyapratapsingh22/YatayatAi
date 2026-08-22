import React from 'react';
import { NavTab, UserProfile } from '../types';
import { 
  Radio, 
  FileText, 
  History as HistoryIcon, 
  BarChart3, 
  Settings as SettingsIcon, 
  Info, 
  Download, 
  User, 
  LogOut, 
  Search, 
  Bell, 
  HelpCircle,
  Menu,
  X,
  Sparkles,
  Camera
} from 'lucide-react';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  user: UserProfile;
  onDeployClick: () => void;
  onExportLiveClick: () => void;
  onNotificationClick: () => void;
  onHelpClick: () => void;
  onLogout: () => void;
  notificationsCount: number;
}

export const Sidebar: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onExportLiveClick,
  onLogout,
}) => {
  return (
    <aside className="hidden md:flex flex-col h-screen sticky top-0 bg-[#0c0c0c] text-white/80 w-64 border-r border-white/10 shrink-0 select-none z-30">
      {/* Brand Header */}
      <div 
        onClick={() => setActiveTab('landing')}
        className="p-5 border-b border-white/10 flex items-center gap-3 cursor-pointer hover:bg-white/[0.03] transition-colors"
      >
        <div className="w-9 h-9 rounded bg-white text-black flex items-center justify-center font-bold shadow-sm">
          <Camera className="w-4 h-4 text-black" />
        </div>
        <div>
          <h1 className="text-[15px] font-medium tracking-tight text-[#F0F0F0] leading-tight">
            Traffic Analyzer
          </h1>
          <p className="text-[10px] font-mono-data uppercase tracking-widest text-white/40">
            Obsidian Core 4.2
          </p>
        </div>
      </div>

      {/* Main Nav Items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-xs tracking-wider uppercase transition-all duration-150 text-left ${
            activeTab === 'dashboard'
              ? 'text-white font-medium bg-white/10 border-r-2 border-white'
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <Radio className="w-4 h-4 text-white" />
          <span>Live Monitor</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-xs tracking-wider uppercase transition-all duration-150 text-left ${
            activeTab === 'reports'
              ? 'text-white font-medium bg-white/10 border-r-2 border-white'
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Reports</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-xs tracking-wider uppercase transition-all duration-150 text-left ${
            activeTab === 'history'
              ? 'text-white font-medium bg-white/10 border-r-2 border-white'
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <HistoryIcon className="w-4 h-4" />
          <span>History</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-xs tracking-wider uppercase transition-all duration-150 text-left ${
            activeTab === 'analytics'
              ? 'text-white font-medium bg-white/10 border-r-2 border-white'
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-xs tracking-wider uppercase transition-all duration-150 text-left ${
            activeTab === 'settings'
              ? 'text-white font-medium bg-white/10 border-r-2 border-white'
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>System Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-xs tracking-wider uppercase transition-all duration-150 text-left ${
            activeTab === 'about'
              ? 'text-white font-medium bg-white/10 border-r-2 border-white'
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Project Info</span>
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="p-3.5 border-t border-white/10 flex flex-col gap-2">
        <button
          onClick={onExportLiveClick}
          className="w-full bg-transparent border border-white/20 hover:bg-white hover:text-black text-white/90 py-2.5 px-3 rounded text-[10px] uppercase tracking-widest font-medium transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-3.5 h-3.5" />
          Export Live Data
        </button>

        <div className="flex flex-col gap-0.5 mt-1 pt-2 border-t border-white/10">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-3 py-2 rounded text-[11px] uppercase tracking-wider transition-colors text-left ${
              activeTab === 'profile'
                ? 'text-white bg-white/10 font-medium'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2 rounded text-[11px] uppercase tracking-wider text-rose-400/80 hover:bg-rose-950/30 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export const TopNavbar: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  user,
  onDeployClick,
  onNotificationClick,
  onHelpClick,
  onLogout,
  notificationsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <>
      <nav className="h-16 w-full bg-[#080808]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
        {/* Left: Brand & Links */}
        <div className="flex items-center gap-8">
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded bg-white text-black flex items-center justify-center font-bold">
              <Camera className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="text-sm font-semibold tracking-widest uppercase text-white">
              Traffic Analyzer
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
            <button
              onClick={() => setActiveTab('landing')}
              className={`transition-colors py-1 ${
                activeTab === 'landing' ? 'text-white border-b border-white' : 'hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`transition-colors py-1 ${
                activeTab === 'dashboard' ? 'text-white border-b border-white' : 'hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`transition-colors py-1 ${
                activeTab === 'reports' ? 'text-white border-b border-white' : 'hover:text-white'
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`transition-colors py-1 ${
                activeTab === 'history' ? 'text-white border-b border-white' : 'hover:text-white'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`transition-colors py-1 ${
                activeTab === 'settings' ? 'text-white border-b border-white' : 'hover:text-white'
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`transition-colors py-1 ${
                activeTab === 'about' ? 'text-white border-b border-white' : 'hover:text-white'
              }`}
            >
              About
            </button>
          </div>
        </div>

        {/* Right: Search, Deploy, Notifications, Avatar */}
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="SEARCH NODES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#121212] border border-white/10 rounded py-1.5 pl-8 pr-3 text-[11px] font-mono-data focus:outline-none focus:border-white/40 transition-all text-[#F0F0F0] placeholder-white/30 w-36 md:w-48 tracking-wider"
            />
          </div>

          {/* Notifications */}
          <button
            onClick={onNotificationClick}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            )}
          </button>

          {/* Help */}
          <button
            onClick={onHelpClick}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded transition-colors hidden sm:block"
            title="System Documentation"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Deploy Model CTA */}
          <button
            onClick={onDeployClick}
            className="border border-white/20 hover:bg-white hover:text-black text-white text-[10px] font-semibold uppercase tracking-widest px-3.5 py-1.5 rounded transition-all duration-200 flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden md:inline">Deploy Model</span>
            <span className="md:hidden">Deploy</span>
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => setActiveTab('profile')}
            className="w-7 h-7 rounded-full border border-white/20 overflow-hidden hover:border-white transition-colors relative group"
            title={user.name}
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover grayscale contrast-125"
            />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/60 hover:text-white rounded"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0c0c] border-b border-white/10 px-4 py-4 flex flex-col gap-2 z-40 sticky top-16 shadow-2xl">
          <button
            onClick={() => { setActiveTab('landing'); setMobileMenuOpen(false); }}
            className="text-left py-2 px-3 text-xs tracking-wider uppercase text-white hover:bg-white/5 rounded"
          >
            Home Overview
          </button>
          <button
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className="text-left py-2 px-3 text-xs tracking-wider uppercase text-white hover:bg-white/5 rounded"
          >
            Live Monitor Dashboard
          </button>
          <button
            onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }}
            className="text-left py-2 px-3 text-xs tracking-wider uppercase text-white hover:bg-white/5 rounded"
          >
            Analysis Reports
          </button>
          <button
            onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
            className="text-left py-2 px-3 text-xs tracking-wider uppercase text-white hover:bg-white/5 rounded"
          >
            Archive Sessions
          </button>
          <button
            onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
            className="text-left py-2 px-3 text-xs tracking-wider uppercase text-white hover:bg-white/5 rounded"
          >
            System Settings
          </button>
          <button
            onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); }}
            className="text-left py-2 px-3 text-xs tracking-wider uppercase text-white hover:bg-white/5 rounded"
          >
            About & Architecture
          </button>
          <button
            onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
            className="text-left py-2 px-3 text-xs tracking-wider uppercase text-white hover:bg-white/5 rounded"
          >
            User Profile
          </button>
          <button
            onClick={() => { onLogout(); setMobileMenuOpen(false); }}
            className="text-left py-2 px-3 text-xs tracking-wider uppercase text-rose-400 hover:bg-rose-950/20 rounded"
          >
            Sign Out
          </button>
        </div>
      )}
    </>
  );
};