import React from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  Camera
} from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e0e0e] w-full max-w-3xl rounded border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#F0F0F0]">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#121212]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-white" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F0F0F0]">Official Traffic Analytics Document</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-white text-black hover:bg-white/90 font-semibold text-[10px] uppercase tracking-widest px-3.5 py-1.5 rounded flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/40 hover:text-white rounded hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Preview Area */}
        <div className="p-8 overflow-y-auto bg-[#080808] flex-1 font-sans text-xs">
          {/* Document Header */}
          <div className="border-b border-white/10 pb-6 mb-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 text-white font-medium text-base tracking-wider uppercase">
                <Camera className="w-4 h-4 text-white" />
                <span>TRAFFIC ANALYZER — MUNICIPAL RECORD</span>
              </div>
              <p className="text-white/40 font-mono-data mt-1 text-[10px] uppercase tracking-widest">
                Ref: MUNI-TRF-20231024-492 • Official Audit Trail
              </p>
            </div>

            <div className="text-right font-mono-data text-white/60 text-[10px] uppercase tracking-widest">
              <div>DATE: OCT 24, 2023</div>
              <div>OPERATOR: DR. ALEX VANCE</div>
            </div>
          </div>

          {/* Report Summary */}
          <div className="grid grid-cols-4 gap-3 mb-6 font-mono-data">
            <div className="bg-[#121212] p-3 rounded border border-white/10">
              <span className="text-white/40 text-[9px] block uppercase tracking-widest">Camera ID</span>
              <span className="text-xs font-semibold text-white">CAM_JCT_NORTH_492</span>
            </div>
            <div className="bg-[#121212] p-3 rounded border border-white/10">
              <span className="text-white/40 text-[9px] block uppercase tracking-widest">Total Volume</span>
              <span className="text-xs font-semibold text-white">14,205 Units</span>
            </div>
            <div className="bg-[#121212] p-3 rounded border border-white/10">
              <span className="text-white/40 text-[9px] block uppercase tracking-widest">Peak Density</span>
              <span className="text-xs font-semibold text-white">94 v/m (Critical)</span>
            </div>
            <div className="bg-[#121212] p-3 rounded border border-white/10">
              <span className="text-white/40 text-[9px] block uppercase tracking-widest">Avg Velocity</span>
              <span className="text-xs font-semibold text-white">42.0 mph</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <h4 className="font-semibold text-white text-[10px] uppercase tracking-widest mb-2">
            Vehicle Class Breakdown Tally
          </h4>
          <table className="w-full text-left font-mono-data border border-white/10 mb-6 text-xs">
            <thead className="bg-[#121212] text-white/40 border-b border-white/10 text-[10px] uppercase tracking-widest">
              <tr>
                <th className="p-2">Vehicle Category</th>
                <th className="p-2">Unit Count</th>
                <th className="p-2">Share %</th>
                <th className="p-2">Confidence Avg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="p-2 text-white">Passenger Sedans</td>
                <td className="p-2 text-white">8,420</td>
                <td className="p-2 text-white/60">59.3%</td>
                <td className="p-2 text-emerald-400">0.96 IoU</td>
              </tr>
              <tr>
                <td className="p-2 text-white">SUVs & Light Trucks</td>
                <td className="p-2 text-white">3,105</td>
                <td className="p-2 text-white/60">21.9%</td>
                <td className="p-2 text-emerald-400">0.95 IoU</td>
              </tr>
              <tr>
                <td className="p-2 text-white">Commercial Heavy Haulers</td>
                <td className="p-2 text-white">1,840</td>
                <td className="p-2 text-white/60">13.0%</td>
                <td className="p-2 text-emerald-400">0.93 IoU</td>
              </tr>
              <tr>
                <td className="p-2 text-white">Motorcycles</td>
                <td className="p-2 text-white">680</td>
                <td className="p-2 text-white/60">4.8%</td>
                <td className="p-2 text-emerald-400">0.91 IoU</td>
              </tr>
              <tr>
                <td className="p-2 text-white">Municipal Transit Buses</td>
                <td className="p-2 text-white">160</td>
                <td className="p-2 text-white/60">1.1%</td>
                <td className="p-2 text-emerald-400">0.94 IoU</td>
              </tr>
            </tbody>
          </table>

          {/* Signoff */}
          <div className="pt-4 border-t border-white/10 text-white/40 flex justify-between items-center text-[10px] font-mono-data uppercase tracking-widest">
            <span>Generated via TensorRT v4.2 Pipeline</span>
            <span>Signature: 0x4F8A9B...VALID</span>
          </div>
        </div>
      </div>
    </div>
  );
};
