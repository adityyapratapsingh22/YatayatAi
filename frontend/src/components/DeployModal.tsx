import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Cpu, 
  Check, 
  Zap
} from 'lucide-react';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployModal: React.FC<DeployModalProps> = ({ isOpen, onClose }) => {
  const [modelWeights, setModelWeights] = useState('YOLOv8s (Balanced 11.2M params)');
  const [targetDevice, setTargetDevice] = useState('NVIDIA Jetson AGX Orin 64GB');
  const [precision, setPrecision] = useState('INT8 (TensorRT Accelerated)');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedSuccess, setDeployedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      setDeployedSuccess(true);
      setTimeout(() => {
        setDeployedSuccess(false);
        onClose();
      }, 1600);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e0e0e] w-full max-w-lg rounded border border-white/10 shadow-2xl overflow-hidden text-[#F0F0F0]">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/5 rounded border border-white/10 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F0F0F0]">Deploy Edge AI Model</h3>
              <p className="text-xs text-white/40">Push compiled TensorRT weights to active edge nodes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white rounded hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 text-xs">
          <div>
            <label className="text-white/40 block mb-1.5 font-semibold uppercase tracking-widest text-[10px]">
              Vision Backbone Architecture
            </label>
            <select
              value={modelWeights}
              onChange={(e) => setModelWeights(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-white/40 font-mono-data text-xs"
            >
              <option value="YOLOv8n (Nano 3.2M params - 120 FPS)">YOLOv8n (Nano 3.2M params - 120 FPS)</option>
              <option value="YOLOv8s (Balanced 11.2M params)">YOLOv8s (Balanced 11.2M params)</option>
              <option value="YOLOv8m (Medium 25.9M params - High Accuracy)">YOLOv8m (Medium 25.9M params - High Accuracy)</option>
              <option value="YOLOv8x (Extra Large 68.2M params)">YOLOv8x (Extra Large 68.2M params)</option>
            </select>
          </div>

          <div>
            <label className="text-white/40 block mb-1.5 font-semibold uppercase tracking-widest text-[10px]">
              Target Edge Hardware Node
            </label>
            <select
              value={targetDevice}
              onChange={(e) => setTargetDevice(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-white/40 font-mono-data text-xs"
            >
              <option value="NVIDIA Jetson AGX Orin 64GB">NVIDIA Jetson AGX Orin 64GB (Primary Node 01)</option>
              <option value="NVIDIA Jetson Orin Nano 8GB">NVIDIA Jetson Orin Nano 8GB (Bridge Node 02)</option>
              <option value="AWS EC2 G5.xlarge (A10G GPU)">AWS EC2 G5.xlarge (A10G Cloud Inference)</option>
              <option value="Raspberry Pi 5 + Hailo-8 NPU">Raspberry Pi 5 + Hailo-8 NPU (Local Gateway)</option>
            </select>
          </div>

          <div>
            <label className="text-white/40 block mb-1.5 font-semibold uppercase tracking-widest text-[10px]">
              Quantization Precision Engine
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['INT8 (TensorRT Accelerated)', 'FP16 (Half Precision)', 'FP32 (Standard)'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrecision(p)}
                  className={`p-2.5 rounded border text-center font-mono-data text-xs transition-all ${
                    precision === p
                      ? 'bg-white text-black border-white font-medium'
                      : 'bg-[#121212] border-white/10 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {p.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Node Summary strip */}
          <div className="bg-[#121212] p-3.5 rounded border border-white/10 flex items-center justify-between font-mono-data text-xs">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white/40">Target Ready:</span>
              <span className="text-white">Active</span>
            </div>
            <span className="text-white/80">Latency: &lt;14ms</span>
          </div>

          {/* Actions */}
          <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-[10px] uppercase tracking-wider font-semibold text-white/40 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleDeploy}
              disabled={isDeploying || deployedSuccess}
              className={`font-semibold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded flex items-center gap-2 transition-all shadow-md active:scale-95 ${
                deployedSuccess
                  ? 'bg-emerald-400 text-black'
                  : 'bg-white text-black hover:bg-white/90'
              }`}
            >
              {isDeploying ? (
                <>
                  <Zap className="w-3.5 h-3.5 animate-spin" />
                  Compiling TensorRT Engine...
                </>
              ) : deployedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Deployed to Edge Node!
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Deploy Model
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
