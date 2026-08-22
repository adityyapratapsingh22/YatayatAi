import React, { useState } from 'react';
import { Lock, ArrowRight, AlertTriangle, CheckCircle2, Video } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { NavTab } from '../types';

interface ResetPasswordViewProps {
  token: string | null;
  onNavigate: (tab: NavTab) => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ token, onNavigate }) => {
  const { resetPassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing or invalid reset link. Please request a new one.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
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
          <h1 className="text-xl font-light tracking-tight text-[#F0F0F0]">Reset Password</h1>
          <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">Choose a new password</p>
        </div>

        {!token && (
          <div className="flex items-start gap-2 p-2.5 mb-4 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>No reset token found in this link. Request a new one from the Forgot Password page.</span>
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <p className="text-xs text-white/70">Your password has been reset successfully.</p>
            <button
              onClick={() => onNavigate('login')}
              className="w-full bg-white text-black hover:bg-white/90 font-semibold text-[10px] uppercase tracking-widest py-3 rounded flex items-center justify-center gap-2 transition-all mt-2"
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
            <div>
              <label className="text-white/50 block mb-1 font-medium">New Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-white/40 placeholder-white/20"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>

            <div>
              <label className="text-white/50 block mb-1 font-medium">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-white/40 placeholder-white/20"
                  placeholder="Re-enter new password"
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
              disabled={isLoading || !token}
              className="w-full bg-white text-black hover:bg-white/90 font-semibold text-[10px] uppercase tracking-widest py-3 rounded flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Resetting...</span>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
