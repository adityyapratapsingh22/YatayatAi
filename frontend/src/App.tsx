import React, { useState } from 'react';
import { NavTab, SystemConfig, UserProfile } from './types';
import { DEFAULT_SYSTEM_CONFIG, DEFAULT_USER_PROFILE } from './data';
import { useAnalyticsSocket } from './hooks/useAnalyticsSocket';
import { Sidebar, TopNavbar } from './components/Navigation';
import { Footer } from './components/Footer';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { ReportsView } from './components/ReportsView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { ProfileView } from './components/ProfileView';
import { LoginView } from './components/LoginView';
import { UploadModal } from './components/UploadModal';
import { DeployModal } from './components/DeployModal';
import { PdfExportModal } from './components/PdfExportModal';
import { Check, Bell, X } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('landing');
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);

  // The one real WebSocket connection for this session, owned here so both the
  // upload flow and the dashboard display can share the same live data.
  const { connected, latest, history, error: wsError, connect } = useAnalyticsSocket();
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  // Modals
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  // Called once the video has genuinely finished uploading to the backend.
  // Connects the real WebSocket -- the dashboard fills in as frames actually stream in,
  // there is no fabricated result here.
  const handleAnalysisComplete = (result: { video_id: string; filename: string; file: File }) => {
    setPreviewFile(result.file);
    connect(result.video_id);
    showToast(`Analyzing ${result.filename}...`);
    setActiveTab('dashboard');
  };

  // Render Login view standalone without layout if selected
  if (activeTab === 'login') {
    return (
      <LoginView
        onSuccessLogin={() => {
          showToast('Welcome back, Dr. Alex Vance');
          setActiveTab('dashboard');
        }}
        onNavigateLanding={() => setActiveTab('landing')}
      />
    );
  }

  // Render Landing page standalone with full hero and footer if on landing
  if (activeTab === 'landing') {
    return (
      <div className="flex flex-col min-h-screen bg-[#080808] text-[#F0F0F0] font-sans">
        <LandingView onNavigate={(tab) => setActiveTab(tab)} />
        <Footer onNavClick={(tab) => setActiveTab(tab)} />

        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0e0e0e] border border-white/20 text-white px-4 py-3 rounded shadow-2xl flex items-center gap-2 text-xs font-medium">
            <Check className="w-4 h-4 text-white" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // Dashboard / App Workspace layout with Sidebar + Topbar
  return (
    <div className="flex min-h-screen bg-[#080808] text-[#F0F0F0] font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onDeployClick={() => setIsDeployModalOpen(true)}
        onExportLiveClick={handleExportLiveData}
        onNotificationClick={() => setNotificationsOpen(!notificationsOpen)}
        onHelpClick={() => setActiveTab('about')}
        notificationsCount={2}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onDeployClick={() => setIsDeployModalOpen(true)}
          onExportLiveClick={handleExportLiveData}
          onNotificationClick={() => setNotificationsOpen(!notificationsOpen)}
          onHelpClick={() => setActiveTab('about')}
          notificationsCount={2}
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

          {activeTab === 'reports' && <ReportsView onOpenPdfModal={() => setIsPdfModalOpen(true)} />}

          {activeTab === 'history' && <HistoryView />}

          {activeTab === 'analytics' && <ReportsView onOpenPdfModal={() => setIsPdfModalOpen(true)} />}

          {activeTab === 'settings' && (
            <SettingsView
              config={config}
              onSaveConfig={(newConf) => {
                setConfig(newConf);
                showToast('System configuration saved successfully!');
              }}
            />
          )}

          {activeTab === 'about' && <AboutView />}

          {activeTab === 'profile' && (
            <ProfileView
              user={user}
              onUpdateUser={(updated) => {
                setUser((prev) => ({ ...prev, ...updated }));
                showToast('Profile updated!');
              }}
            />
          )}
        </main>

        <Footer onNavClick={(tab) => setActiveTab(tab)} />
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAnalysisComplete={handleAnalysisComplete}
      />

      <DeployModal isOpen={isDeployModalOpen} onClose={() => setIsDeployModalOpen(false)} />

      <PdfExportModal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} />

      {notificationsOpen && (
        <div className="fixed top-16 right-4 z-50 w-80 bg-[#0e0e0e] rounded border border-white/15 shadow-2xl p-4 text-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-white" />
              <span className="font-semibold uppercase tracking-wider text-white">System Alerts (2)</span>
            </div>
            <button onClick={() => setNotificationsOpen(false)} className="text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="p-2.5 bg-[#121212] rounded border border-rose-500/30">
              <span className="text-rose-300 font-medium block mb-0.5">Critical Density Reached</span>
              <p className="text-white/50 text-[11px]">A monitored session reported Heavy density.</p>
            </div>
            <div className="p-2.5 bg-[#121212] rounded border border-white/20">
              <span className="text-white font-medium block mb-0.5">Backend Connected</span>
              <p className="text-white/50 text-[11px]">WebSocket link to the analysis pipeline is active.</p>
            </div>
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

export default App;
