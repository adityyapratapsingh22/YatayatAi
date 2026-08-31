import React, { useState } from 'react';
import { NavTab, UserProfile } from './types';
import { DEFAULT_USER_PROFILE } from './data';
import { useAnalyticsSocket } from './hooks/useAnalyticsSocket';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getAccessToken } from './services/tokenStorage';
import { Sidebar, TopNavbar } from './components/Navigation';
import { Footer } from './components/Footer';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { ReportsView } from './components/ReportsView';
import { AnalyticsView } from './components/AnalyticsView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { ProfileView } from './components/ProfileView';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { ForgotPasswordView } from './components/ForgotPasswordView';
import { ResetPasswordView } from './components/ResetPasswordView';
import { UploadModal } from './components/UploadModal';
import { Check, Bell, X, BellOff } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const PROTECTED_TABS: NavTab[] = ['dashboard', 'reports', 'history', 'analytics', 'settings', 'profile'];

function AppShell() {
  const { isAuthenticated, isLoading, user, logout, avatarVersion } = useAuth();

  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    if (window.location.pathname === '/reset-password') return 'reset-password';
    return 'landing';
  });
  const [resetToken] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token');
  });

  const { connected, latest, history, error: wsError, connect } = useAnalyticsSocket();
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const navigate = (tab: NavTab) => setActiveTab(tab);

  const handleExportLiveData = () => {
    if (!latest) {
      showToast('No live data yet -- run an analysis first.');
      return;
    }
    const rows = [
      'Timestamp,Frame,Active Vehicles,Avg Active (smoothed),Total Crossed,Density Level',
      `"${new Date().toISOString()}",${latest.frame_index},${latest.active_vehicles},${latest.avg_active_vehicles},${latest.total_crossed},"${latest.density_level}"`,
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `live_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Live telemetry CSV exported.');
  };

  const handleAnalysisComplete = (result: { video_id: string; filename: string; file: File }) => {
    const token = getAccessToken();
    if (!token) {
      showToast('You must be logged in to run an analysis.');
      return;
    }
    setPreviewFile(result.file);
    connect(result.video_id, token);
    showToast(`Analyzing ${result.filename}...`);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    logout();
    showToast('Signed out.');
    setActiveTab('landing');
  };

  // --- Standalone, unauthenticated pages (no sidebar/topbar) ---

  if (activeTab === 'login') {
    return (
      <LoginView
        onSuccessLogin={() => { showToast(`Welcome back, ${user?.full_name ?? ''}`); setActiveTab('dashboard'); }}
        onNavigate={navigate}
      />
    );
  }

  if (activeTab === 'register') {
    return (
      <RegisterView
        onSuccessRegister={() => { showToast('Account created!'); setActiveTab('dashboard'); }}
        onNavigate={navigate}
      />
    );
  }

  if (activeTab === 'forgot-password') {
    return <ForgotPasswordView onNavigate={navigate} />;
  }

  if (activeTab === 'reset-password') {
    return <ResetPasswordView token={resetToken} onNavigate={navigate} />;
  }

  if (activeTab === 'landing') {
    return (
      <div className="flex flex-col min-h-screen bg-[#080808] text-[#F0F0F0] font-sans">
        <LandingView onNavigate={navigate} />
        <Footer onNavClick={navigate} />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0e0e0e] border border-white/20 text-white px-4 py-3 rounded shadow-2xl flex items-center gap-2 text-xs font-medium">
            <Check className="w-4 h-4 text-white" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // --- Protected pages: redirect to login if not authenticated ---
  if (PROTECTED_TABS.includes(activeTab)) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white/40 text-xs uppercase tracking-widest">
          Checking session...
        </div>
      );
    }
    if (!isAuthenticated) {
      return <LoginView onSuccessLogin={() => setActiveTab('dashboard')} onNavigate={navigate} />;
    }
  }

  // Real photo (cache-busted) if uploaded, otherwise the default placeholder
  const displayUser: UserProfile = user
    ? {
        ...DEFAULT_USER_PROFILE,
        name: user.full_name,
        email: user.email,
        avatarUrl: user.avatar_url
          ? `${API_BASE_URL}${user.avatar_url}?v=${avatarVersion}`
          : DEFAULT_USER_PROFILE.avatarUrl,
      }
    : DEFAULT_USER_PROFILE;

  return (
    <div className="flex min-h-screen bg-[#080808] text-[#F0F0F0] font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={navigate}
        user={displayUser}
        onExportLiveClick={handleExportLiveData}
        onNotificationClick={() => setNotificationsOpen(!notificationsOpen)}
        onHelpClick={() => setActiveTab('about')}
        onLogout={handleLogout}
        notificationsCount={0}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar
          activeTab={activeTab}
          setActiveTab={navigate}
          user={displayUser}
          onExportLiveClick={handleExportLiveData}
          onNotificationClick={() => setNotificationsOpen(!notificationsOpen)}
          onHelpClick={() => setActiveTab('about')}
          onLogout={handleLogout}
          notificationsCount={0}
        />

        <main className="flex-1 pb-12">
          {activeTab === 'dashboard' && (
            <DashboardView
              connected={connected}
              latest={latest}
              history={history}
              error={wsError}
              previewFile={previewFile}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
            />
          )}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'about' && <AboutView />}
          {activeTab === 'profile' && <ProfileView />}
        </main>

        <Footer onNavClick={navigate} />
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAnalysisComplete={handleAnalysisComplete}
      />

      {notificationsOpen && (
        <div className="fixed top-16 right-4 z-50 w-80 bg-[#0e0e0e] rounded border border-white/15 shadow-2xl p-4 text-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-white" />
              <span className="font-semibold uppercase tracking-wider text-white">Notifications</span>
            </div>
            <button onClick={() => setNotificationsOpen(false)} className="text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-2 py-6 text-white/30">
            <BellOff className="w-6 h-6" />
            <p className="text-[11px] text-center">
              No notifications yet. Enable email alerts in Settings to get notified when a session reaches Heavy density.
            </p>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0e0e0e] border border-white/20 text-white px-4 py-3 rounded shadow-2xl flex items-center gap-2 text-xs font-medium">
          <Check className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
