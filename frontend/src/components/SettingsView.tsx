import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, CheckCircle2, Gauge, Ruler, Timer, ScanEye, Mail } from 'lucide-react';
import { getSettings, updateSettings } from '../services/settingsApi';
import type { BackendSettings } from '../services/settingsApi';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<BackendSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load settings'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (field: keyof BackendSettings, value: number | boolean) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-white/40 text-xs uppercase tracking-widest">Loading settings...</div>;
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4" />
          <span>{error ?? 'Could not load settings.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-3xl">
      <div>
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Configuration</span>
        <h1 className="text-2xl font-light text-white mt-1">System Settings</h1>
        <p className="text-xs text-white/40 mt-1">
          These values are saved to your account and used the next time you run an analysis.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Density thresholds */}
      <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Gauge className="w-4 h-4 text-white" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Density Thresholds</h3>
        </div>
        <p className="text-[11px] text-white/40 mb-4">
          Measured in average active vehicles visible at once -- matches what your dashboard's "Avg Active" stat shows.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-white/50 block mb-1.5">Moderate begins at</label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={settings.moderate_threshold}
              onChange={(e) => handleChange('moderate_threshold', parseFloat(e.target.value))}
              className="w-full bg-[#121212] border border-white/10 rounded py-2 px-3 text-white focus:outline-none focus:border-white/40"
            />
          </div>
          <div>
            <label className="text-white/50 block mb-1.5">Heavy begins at</label>
            <input
              type="number"
              min={settings.moderate_threshold + 0.5}
              step={0.5}
              value={settings.heavy_threshold}
              onChange={(e) => handleChange('heavy_threshold', parseFloat(e.target.value))}
              className="w-full bg-[#121212] border border-white/10 rounded py-2 px-3 text-white focus:outline-none focus:border-white/40"
            />
          </div>
        </div>

        {/* Live preview strip */}
        <div className="mt-4 h-2 w-full rounded-full overflow-hidden flex text-[9px]">
          <div className="bg-emerald-500 h-full" style={{ flex: settings.moderate_threshold }} title="Light" />
          <div className="bg-amber-500 h-full" style={{ flex: settings.heavy_threshold - settings.moderate_threshold }} title="Moderate" />
          <div className="bg-rose-500 h-full" style={{ flex: 4 }} title="Heavy" />
        </div>
        <div className="flex justify-between text-[10px] text-white/30 mt-1">
          <span>0</span>
          <span>Light → Moderate → Heavy</span>
        </div>
      </div>

      {/* Counting line */}
      <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Ruler className="w-4 h-4 text-white" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Counting Line Position</h3>
        </div>
        <p className="text-[11px] text-white/40 mb-4">
          Where the vertical counting line sits, as a percentage down the video frame.
        </p>
        <input
          type="range"
          min={10}
          max={90}
          step={1}
          value={settings.counting_line_position}
          onChange={(e) => handleChange('counting_line_position', parseFloat(e.target.value))}
          className="w-full accent-white"
        />
        <div className="flex justify-between text-[11px] text-white/50 mt-1">
          <span>10%</span>
          <span className="text-white font-medium">{settings.counting_line_position}%</span>
          <span>90%</span>
        </div>
      </div>

      {/* Smoothing window */}
      <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <Timer className="w-4 h-4 text-white" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Smoothing Window</h3>
        </div>
        <p className="text-[11px] text-white/40 mb-4">
          How many seconds of recent frames are averaged for the density reading. Higher values reduce flicker but react slower.
        </p>
        <input
          type="range"
          min={0.5}
          max={10}
          step={0.5}
          value={settings.smoothing_window_seconds}
          onChange={(e) => handleChange('smoothing_window_seconds', parseFloat(e.target.value))}
          className="w-full accent-white"
        />
        <div className="flex justify-between text-[11px] text-white/50 mt-1">
          <span>0.5s</span>
          <span className="text-white font-medium">{settings.smoothing_window_seconds}s</span>
          <span>10s</span>
        </div>
      </div>

      {/* Detection sensitivity */}
      <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <ScanEye className="w-4 h-4 text-white" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Detection Sensitivity</h3>
        </div>
        <p className="text-[11px] text-white/40 mb-4">
          Controls YOLO's confidence threshold. Higher sensitivity detects more vehicles but risks more false positives.
        </p>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={settings.detection_sensitivity}
          onChange={(e) => handleChange('detection_sensitivity', parseFloat(e.target.value))}
          className="w-full accent-white"
        />
        <div className="flex justify-between text-[11px] text-white/50 mt-1">
          <span>Strict</span>
          <span className="text-white font-medium">{settings.detection_sensitivity}%</span>
          <span>Sensitive</span>
        </div>
      </div>

      {/* Email alerts */}
      <div className="bg-[#0e0e0e] rounded p-5 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4 text-white" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Email Alerts</h3>
            <p className="text-[11px] text-white/40 mt-0.5">Email me when a session reaches Heavy density</p>
          </div>
        </div>
        <button
          onClick={() => handleChange('email_alerts_enabled', !settings.email_alerts_enabled)}
          className={`w-11 h-6 rounded-full relative transition-colors ${
            settings.email_alerts_enabled ? 'bg-emerald-500' : 'bg-white/10'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              settings.email_alerts_enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-white text-black hover:bg-white/90 font-semibold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4" /> Saved
          </span>
        )}
      </div>
    </div>
  );
};
