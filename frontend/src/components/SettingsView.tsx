import React, { useState } from 'react';
import { SystemConfig } from '../types';
import { 
  Sliders, 
  Save, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  Route, 
  Bell, 
  Cpu, 
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Layers
} from 'lucide-react';

interface SettingsViewProps {
  config: SystemConfig;
  onSaveConfig: (newConfig: SystemConfig) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ config, onSaveConfig }) => {
  const [localConfig, setLocalConfig] = useState<SystemConfig>(config);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(localConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1400px] mx-auto w-full text-[#F0F0F0]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono-data uppercase tracking-widest text-white/40">
            <span>CALIBRATION</span>
            <span>/</span>
            <span className="text-white">SYSTEM PARAMETERS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight text-[#F0F0F0] mt-1">
            Detection & Threshold Settings
          </h1>
        </div>

        <button
          onClick={handleSave}
          className={`font-semibold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded flex items-center gap-2 transition-all shadow-md active:scale-95 ${
            savedSuccess
              ? 'bg-emerald-400 text-black'
              : 'bg-white text-black hover:bg-white/90'
          }`}
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Settings Saved!
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              Save Configuration
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Density Thresholds */}
        <div className="bg-[#0e0e0e] rounded p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 bg-white/5 rounded border border-white/10 text-white">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-[#F0F0F0]">Density Alert Levels</h3>
                <p className="text-xs text-white/40">Calibrate municipal triggers for traffic warnings</p>
              </div>
            </div>

            <div className="flex flex-col gap-6 text-xs">
              {/* Amber Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Elevated Warning Threshold (Amber)
                  </span>
                  <span className="font-mono-data font-semibold text-white bg-[#121212] px-2 py-0.5 rounded border border-white/10">
                    {localConfig.amberThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="80"
                  value={localConfig.amberThreshold}
                  onChange={(e) => setLocalConfig({ ...localConfig, amberThreshold: Number(e.target.value) })}
                  className="w-full"
                />
                <p className="text-[11px] text-white/40 mt-1">
                  Triggers secondary notification when camera lane occupancy exceeds this limit.
                </p>
              </div>

              {/* Red Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Critical Congestion Threshold (Red)
                  </span>
                  <span className="font-mono-data font-semibold text-white bg-[#121212] px-2 py-0.5 rounded border border-white/10">
                    {localConfig.redThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="98"
                  value={localConfig.redThreshold}
                  onChange={(e) => setLocalConfig({ ...localConfig, redThreshold: Number(e.target.value) })}
                  className="w-full"
                />
                <p className="text-[11px] text-white/40 mt-1">
                  Triggers immediate municipal incident dispatch and traffic signal override routines.
                </p>
              </div>

              {/* Smoothing Window */}
              <div>
                <label className="text-white/60 block mb-1.5 font-medium">
                  Temporal Smoothing Window (Seconds)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={localConfig.smoothingWindow}
                  onChange={(e) => setLocalConfig({ ...localConfig, smoothingWindow: Number(e.target.value) })}
                  className="w-full bg-[#121212] border border-white/10 rounded p-2.5 text-white font-mono-data focus:outline-none focus:border-white/40"
                />
                <p className="text-[11px] text-white/40 mt-1">
                  Moving average window to prevent instantaneous telemetry noise from momentary occlusions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Counting Line Position Calibration */}
        <div className="bg-[#0e0e0e] rounded p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 bg-white/5 rounded border border-white/10 text-white">
                <Route className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-[#F0F0F0]">Virtual Counting Line Offset</h3>
                <p className="text-xs text-white/40">Adjust vector intersection plane coordinates</p>
              </div>
            </div>

            {/* Live Visual Road Calibration Box */}
            <div className="relative w-full h-44 bg-[#050505] rounded border border-white/10 overflow-hidden mb-4 select-none">
              {/* Lane Markings */}
              <div className="absolute inset-0 flex justify-around pointer-events-none opacity-20">
                <div className="w-0.5 h-full border-r border-dashed border-white" />
                <div className="w-0.5 h-full border-r border-dashed border-white" />
              </div>

              {/* Dynamic Adjustable Line */}
              <div
                style={{ top: `${localConfig.countingLineY}%` }}
                className="absolute left-0 right-0 h-0.5 bg-white border-t border-dashed border-white/90 shadow-[0_0_10px_rgba(255,255,255,0.6)]"
              >
                <div className="absolute -top-6 right-3 bg-white text-black font-mono-data text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Y-AXIS: {localConfig.countingLineY}%
                </div>
              </div>

              {/* Ambient Road Label */}
              <div className="absolute bottom-2 left-3 text-[9px] font-mono-data text-white/30 uppercase tracking-widest">
                PERSPECTIVE ROAD BED VIEW
              </div>
            </div>

            {/* Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-white">Counting Line Vertical Offset</span>
                <span className="font-mono-data font-semibold text-white bg-[#121212] px-2 py-0.5 rounded border border-white/10 text-xs">
                  {localConfig.countingLineY}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="85"
                value={localConfig.countingLineY}
                onChange={(e) => setLocalConfig({ ...localConfig, countingLineY: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Panel 3: Automations & Notifications */}
        <div className="bg-[#0e0e0e] rounded p-6 border border-white/10">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2 bg-white/5 rounded border border-white/10 text-white">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider text-[#F0F0F0]">Automated Workflows</h3>
              <p className="text-xs text-white/40">Manage event webhooks & automatic archiving</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-[#121212] rounded border border-white/5">
              <div>
                <span className="font-medium text-white block">Email Dispatch on Red Alerts</span>
                <span className="text-[11px] text-white/40">Transmit instantaneous alert packets to DOT incident desk</span>
              </div>
              <button
                type="button"
                onClick={() => setLocalConfig({ ...localConfig, emailAlerts: !localConfig.emailAlerts })}
                className="text-white hover:opacity-80 transition-opacity"
              >
                {localConfig.emailAlerts ? (
                  <ToggleRight className="w-7 h-7 text-white" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-white/20" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#121212] rounded border border-white/5">
              <div>
                <span className="font-medium text-white block">Auto-Export Daily Midnight Logs</span>
                <span className="text-[11px] text-white/40">Compile 24-hour telemetry into parquet archive automatically</span>
              </div>
              <button
                type="button"
                onClick={() => setLocalConfig({ ...localConfig, autoExportLogs: !localConfig.autoExportLogs })}
                className="text-white hover:opacity-80 transition-opacity"
              >
                {localConfig.autoExportLogs ? (
                  <ToggleRight className="w-7 h-7 text-white" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-white/20" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Panel 4: Hardware & Runtime Specifications */}
        <div className="bg-[#0e0e0e] rounded p-6 border border-white/10">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2 bg-white/5 rounded border border-white/10 text-white">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider text-[#F0F0F0]">Edge Engine Runtime</h3>
              <p className="text-xs text-white/40">Hardware acceleration & model metadata</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono-data">
            <div className="bg-[#121212] p-3 rounded border border-white/5">
              <span className="text-white/40 text-[10px] block uppercase tracking-widest">Inference Device</span>
              <span className="text-white font-medium">NVIDIA Jetson AGX Orin</span>
            </div>
            <div className="bg-[#121212] p-3 rounded border border-white/5">
              <span className="text-white/40 text-[10px] block uppercase tracking-widest">Vision Model</span>
              <span className="text-white font-medium">YOLOv8s INT8 TensorRT</span>
            </div>
            <div className="bg-[#121212] p-3 rounded border border-white/5">
              <span className="text-white/40 text-[10px] block uppercase tracking-widest">CUDA Cores</span>
              <span className="text-white font-medium">2048 (Ampere)</span>
            </div>
            <div className="bg-[#121212] p-3 rounded border border-white/5">
              <span className="text-white/40 text-[10px] block uppercase tracking-widest">Stream Decoding</span>
              <span className="text-white font-medium">NVDEC GStreamer v1.22</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
