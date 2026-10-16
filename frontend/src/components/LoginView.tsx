import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertTriangle, Video } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { NavTab } from '../types';

interface LoginViewProps {
  onSuccessLogin: () => void;
  onNavigate: (tab: NavTab) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccessLogin, onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      onSuccessLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden text-[#F0F0F0]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0e0e0e] rounded p-8 border border-white/10 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/logo.svg" alt="YatayatAi Logo" className="w-12 h-12 rounded object-contain mb-4 shadow-lg" />
          <h1 className="text-xl font-light tracking-tight text-[#F0F0F0]">YatayatAi</h1>
          <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div>
            <label className="text-white/50 block mb-1 font-medium">Email</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-white/40 placeholder-white/20"
                placeholder="you@example.com"
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

          <div className="flex items-center justify-end text-xs text-white/40 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="text-white/60 hover:text-white hover:underline text-[11px]"
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black hover:bg-white/90 font-semibold text-[10px] uppercase tracking-widest py-3 rounded flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-white/10 text-xs text-white/40">
          <span>Don't have an account? </span>
          <button
            onClick={() => onNavigate('register')}
            className="text-white hover:underline font-medium"
          >
            Sign up
          </button>
        </div>

        <div className="text-center mt-3 text-xs text-white/40">
          <button
            onClick={() => onNavigate('landing')}
            className="text-white/60 hover:text-white hover:underline text-[11px] uppercase tracking-wider"
          >
            ← Return to Public Overview
          </button>
        </div>
      </div>
    </div>
  );
};
