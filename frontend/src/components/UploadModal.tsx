import React, { useState, useRef } from 'react';
import { X, Upload, Film, Cpu, AlertTriangle } from 'lucide-react';
import { uploadVideo } from '../services/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (result: { video_id: string; filename: string; file: File }) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onAnalysisComplete,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const startAnalysis = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await uploadVideo(selectedFile);
      // Hand off to the parent: it opens the real WebSocket using this video_id.
      // No fake numbers here -- the dashboard will fill in as real data streams in.
      onAnalysisComplete({ video_id: res.video_id, filename: selectedFile.name, file: selectedFile });
      onClose();
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? `Upload failed: ${err.message}. Is the backend running at http://localhost:8000?`
          : 'Upload failed. Is the backend running?'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e0e0e] w-full max-w-lg rounded border border-white/10 shadow-2xl overflow-hidden text-[#F0F0F0]">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/5 rounded border border-white/10 text-white">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F0F0F0]">Upload Video Footage</h3>
              <p className="text-xs text-white/40">Run real detection + tracking on this footage</p>
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
          {!isUploading ? (
            <>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-white/20 hover:border-white bg-[#121212] rounded p-8 text-center cursor-pointer transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded bg-white/5 text-white flex items-center justify-center mx-auto mb-3 border border-white/10">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-white mb-1">
                  {selectedFile ? selectedFile.name : 'Select or drop video to upload'}
                </p>
                <p className="text-[11px] text-white/40">MP4, WebM, AVI, or MOV</p>
              </div>

              {uploadError && (
                <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3 border-t border-white/10">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded text-[10px] uppercase tracking-wider font-semibold text-white/40 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={startAnalysis}
                  disabled={!selectedFile}
                  className="bg-white text-black font-semibold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded flex items-center gap-2 hover:bg-white/90 transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  Upload & Analyze
                </button>
              </div>
            </>
          ) : (
            <div className="py-8 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white flex items-center justify-center text-white animate-spin">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-light text-white mb-1">Uploading to backend...</h4>
                <p className="text-[11px] text-white/40">
                  This may take a moment for larger files.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
