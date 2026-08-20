import React, { useState } from 'react';
import { 
  Video, 
  Cpu, 
  Route, 
  Calculator, 
  Layers, 
  LayoutDashboard, 
  Terminal, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Code2
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const [activePipelineStep, setActivePipelineStep] = useState<number>(1);

  const pipelineSteps = [
    {
      id: 0,
      title: 'Video Ingestion',
      icon: Video,
      description: 'Captures RTSP/ONVIF streams from traffic IP cameras or offline recordings at up to 60 FPS.',
      tech: 'GStreamer / FFmpeg / OpenCV CUDA',
      details: 'Decodes H.264/H.265 hardware video frames directly into GPU shared memory with zero CPU bottleneck.',
    },
    {
      id: 1,
      title: 'Object Detection',
      icon: Cpu,
      description: 'YOLOv8 vision backbone localized to classify Sedans, SUVs, Heavy Trucks, Buses, and Motorcycles.',
      tech: 'TensorRT / YOLOv8 / ONNX Runtime',
      details: 'Custom pre-trained weights fine-tuned on 1.2M municipal intersection frames in diverse weather & night conditions.',
    },
    {
      id: 2,
      title: 'Multi-Object Tracking',
      icon: Route,
      description: 'Assigns persistent track IDs across frames and handles occlusions using Kalman filtering.',
      tech: 'ByteTrack / DeepSORT / Kalman Filter',
      details: 'Computes IoU association matrices and predicts bounding box vectors to preserve ID continuity through dense traffic.',
    },
    {
      id: 3,
      title: 'Spatial Counting',
      icon: Calculator,
      description: 'Calculates directional vector intersections across customizable virtual counting lines.',
      tech: 'Spatial Geometry / Ray-Casting Math',
      details: 'Tracks entrance and exit coordinates to categorize lane-specific inflow and outflow volumes.',
    },
    {
      id: 4,
      title: 'Density & Speed Analysis',
      icon: Layers,
      description: 'Aggregates vehicle densities per linear meter and calculates smoothed travel velocities.',
      tech: 'Spatial Density Heatmaps / Moving Averages',
      details: 'Applies homography matrix transformation to convert 2D pixel coordinates into real-world geographic distances in meters.',
    },
    {
      id: 5,
      title: 'Telemetry & Visualization',
      icon: LayoutDashboard,
      description: 'Broadcasts low-latency telemetry to the React dashboard and triggers automated webhook alerts.',
      tech: 'WebSockets / REST / Redis PubSub',
      details: 'Sub-millisecond push distribution for live monitoring, reporting, and long-term data archiving.',
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-[1400px] mx-auto w-full text-[#F0F0F0]">
      {/* Hero Section */}
      <div className="bg-[#0e0e0e] rounded p-6 md:p-10 border border-white/10 relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded bg-[#121212] border border-white/20 flex items-center justify-center p-3 shadow-xl shrink-0">
            <Video className="w-12 h-12 text-white" />
          </div>

          <div className="flex flex-col gap-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#121212] border border-white/10 w-fit mx-auto md:mx-0">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-mono-data text-white/70 font-semibold uppercase tracking-widest">
                SYSTEM ARCHITECTURE v4.2
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-light tracking-tight text-[#F0F0F0]">
              Understanding the Core Engine
            </h1>

            <p className="text-xs md:text-sm text-white/50 max-w-2xl leading-relaxed">
              A high-performance pipeline turning raw video pixels into actionable municipal intelligence with sub-millisecond edge telemetry and deep neural object tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Processing Pipeline */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-light text-[#F0F0F0] uppercase tracking-wider">Processing Architecture Pipeline</h2>
            <p className="text-xs text-white/40">Select any phase to inspect the underlying mathematics and models</p>
          </div>
          <span className="text-[10px] font-mono-data text-white/40 uppercase tracking-widest">6 Integrated Stages</span>
        </div>

        {/* Pipeline Nodes Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {pipelineSteps.map((step) => {
            const Icon = step.icon;
            const isSelected = activePipelineStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActivePipelineStep(step.id)}
                className={`p-4 rounded text-left transition-all border flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-[#141414] border-white text-white shadow-lg'
                    : 'bg-[#0e0e0e] border-white/10 text-white/40 hover:bg-[#121212] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded ${isSelected ? 'bg-white text-black' : 'bg-[#121212] text-white/60'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono-data text-[10px] opacity-40">0{step.id + 1}</span>
                </div>
                <span className="text-xs font-semibold mt-1 line-clamp-1">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detailed Card for Selected Node */}
        {pipelineSteps[activePipelineStep] && (
          <div className="bg-[#0e0e0e] p-6 rounded border border-white/10 border-l-2 border-l-white transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/5 rounded border border-white/10 text-white">
                  {React.createElement(pipelineSteps[activePipelineStep].icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#F0F0F0]">
                    Stage 0{activePipelineStep + 1}: {pipelineSteps[activePipelineStep].title}
                  </h3>
                  <span className="text-xs font-mono-data text-white/40">
                    {pipelineSteps[activePipelineStep].tech}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1.5">
                  Functional Purpose
                </span>
                <p className="text-xs text-white/60 leading-relaxed">
                  {pipelineSteps[activePipelineStep].description}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1.5">
                  Algorithmic Details
                </span>
                <p className="text-xs text-white/70 leading-relaxed font-mono-data bg-[#121212] p-3.5 rounded border border-white/5">
                  {pipelineSteps[activePipelineStep].details}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Core Technologies Badges Grid */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-light text-[#F0F0F0] uppercase tracking-wider">Core Technologies</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#0e0e0e] p-5 rounded border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/5 rounded text-white border border-white/10">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F0F0F0]">YOLOv8 & TensorRT</h4>
                <span className="text-[10px] font-mono-data text-white/40 uppercase tracking-widest">Computer Vision</span>
              </div>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Ultra-fast deep neural network object bounding and class categorization compiled to INT8 TensorRT engines.
            </p>
          </div>

          <div className="bg-[#0e0e0e] p-5 rounded border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/5 rounded text-white border border-white/10">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F0F0F0]">Python 3.11 & FastAPI</h4>
                <span className="text-[10px] font-mono-data text-white/40 uppercase tracking-widest">Backend Workers</span>
              </div>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Asynchronous worker architecture with Redis Pub/Sub stream routing for non-blocking telemetry ingestion.
            </p>
          </div>

          <div className="bg-[#0e0e0e] p-5 rounded border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/5 rounded text-white border border-white/10">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F0F0F0]">React 19 & Tailwind CSS</h4>
                <span className="text-[10px] font-mono-data text-white/40 uppercase tracking-widest">Frontend Dashboard</span>
              </div>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Modern high-frequency reactive user interface with 60 FPS live charting and canvas HUD overlays.
            </p>
          </div>
        </div>
      </div>

      {/* Team & Documentation Credits */}
      <div className="bg-[#0e0e0e] p-6 rounded border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F0F0F0]">Documentation & OpenAPI Specification</h4>
          <p className="text-xs text-white/40 mt-0.5">
            Complete SDK guides, WebSocket schema definitions, and RTSP stream integration specs available in repository.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] font-mono-data uppercase tracking-widest text-white/40">Team Delta • Traffic Systems</span>
        </div>
      </div>
    </div>
  );
};
