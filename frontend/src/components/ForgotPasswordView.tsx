import React, { useState } from 'react';
import { Mail, ArrowRight, AlertTriangle, CheckCircle2, Video } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { NavTab } from '../types';

interface ForgotPasswordViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onNavigate }) => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden text-[#F0F0F0]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0e0e0e] rounded p-8 border border-white/10 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded bg-white text-black flex items-center justify-center p-2.5 shadow-lg mb-4">
            <Video className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-xl font-light tracking-tight text-[#F0F0F0]">Forgot Password</h1>
          <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest text-center px-4">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <p className="text-xs text-white/70">
              If an account with that email exists, a reset link has been sent. Check your inbox
              (and spam folder) -- the link expires in 30 minutes.
            </p>
          </div>
        ) : (
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
                <span>Sending...</span>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center mt-6 pt-4 border-t border-white/10 text-xs text-white/40">
          <button onClick={() => onNavigate('login')} className="text-white/60 hover:text-white hover:underline text-[11px] uppercase tracking-wider">
            ← Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
