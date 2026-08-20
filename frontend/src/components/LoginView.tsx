import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Camera,
  Video
} from 'lucide-react';

interface LoginViewProps {
  onSuccessLogin: () => void;
  onNavigateLanding: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccessLogin, onNavigateLanding }) => {
  const [email, setEmail] = useState('alex.vance@aitraffic.systems');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccessLogin();
    }, 600);
  };

  const handleDemoSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccessLogin();
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden text-[#F0F0F0]">
      {/* Background glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#0e0e0e] rounded p-8 border border-white/10 shadow-2xl relative z-10">
        {/* Brand Icon Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded bg-white text-black flex items-center justify-center p-2.5 shadow-lg mb-4">
            <Video className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-xl font-light tracking-tight text-[#F0F0F0]">
            Traffic Analyzer
          </h1>
          <p className="text-[10px] text-white/40 mt-1 font-mono-data uppercase tracking-widest">
            Obsidian Edge Telemetry Terminal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div>
            <label className="text-white/50 block mb-1 font-medium">Operator Email</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded py-2.5 pl-9 pr-3 text-white font-mono-data focus:outline-none focus:border-white/40 placeholder-white/20"
                placeholder="operator@traffic.gov"
              />
            </div>
          </div>

          <div>
            <label className="text-white/50 block mb-1 font-medium">Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-white/40 placeholder-white/20"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/40 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-[#121212] border-white/20 text-white focus:ring-0"
              />
              <span>Remember terminal</span>
            </label>

            <button
              type="button"
              onClick={() => alert('Password reset instructions sent to registered system administrator.')}
              className="text-white/60 hover:text-white hover:underline text-[11px]"
            >
              Forgot password?
            </button>
          </div>

          <div className="flex flex-col gap-2.5 mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-white/90 font-semibold text-[10px] uppercase tracking-widest py-3 rounded flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating Node...</span>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full bg-transparent border border-white/20 hover:bg-white hover:text-black text-white font-medium text-[10px] uppercase tracking-widest py-2.5 rounded flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Quick Demo Access
            </button>
          </div>
        </form>

        {/* Back to landing link */}
        <div className="text-center mt-6 pt-4 border-t border-white/10 text-xs text-white/40">
          <button
            onClick={onNavigateLanding}
            className="text-white/60 hover:text-white hover:underline text-[11px] uppercase tracking-wider"
          >
            ← Return to Public Overview
          </button>
        </div>
      </div>
    </div>
  );
};
