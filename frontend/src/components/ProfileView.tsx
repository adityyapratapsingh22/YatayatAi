import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Key, 
  Check, 
  Save, 
  Video, 
  Car, 
  Calendar,
  Lock,
  Sparkles
} from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser }) => {
  const [firstName, setFirstName] = useState('Alex');
  const [lastName, setLastName] = useState('Vance');
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountSaved, setAccountSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: `Dr. ${firstName} ${lastName}`.trim(),
      email,
    });
    setAccountSaved(true);
    setTimeout(() => setAccountSaved(false), 2500);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSaved(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1200px] mx-auto w-full text-[#F0F0F0]">
      {/* Top Header */}
      <div className="pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-[10px] font-mono-data uppercase tracking-widest text-white/40">
          <span>OPERATOR MANAGEMENT</span>
          <span>/</span>
          <span className="text-white">USER PROFILE</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-light tracking-tight text-[#F0F0F0] mt-1">
          Analyst Profile & Security
        </h1>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-[#0e0e0e] rounded p-6 md:p-8 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
          <div className="w-20 h-20 rounded-full border border-white/30 overflow-hidden p-0.5 shadow-xl relative">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover rounded-full grayscale contrast-125"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-1">
              <h2 className="text-xl font-medium text-[#F0F0F0]">{user.name}</h2>
              <span className="bg-white/10 text-white border border-white/20 px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-white/40 font-mono-data">{user.email}</p>
          </div>
        </div>

        {/* 3 Lifetime stats */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto text-center font-mono-data">
          <div className="bg-[#121212] p-3.5 rounded border border-white/10 min-w-[100px]">
            <span className="text-xl font-light text-white block">{user.videosAnalyzed}</span>
            <span className="text-[9px] text-white/40 uppercase tracking-widest">Videos Run</span>
          </div>

          <div className="bg-[#121212] p-3.5 rounded border border-white/10 min-w-[100px]">
            <span className="text-xl font-light text-white block">{user.vehiclesCounted}</span>
            <span className="text-[9px] text-white/40 uppercase tracking-widest">Counted</span>
          </div>

          <div className="bg-[#121212] p-3.5 rounded border border-white/10 min-w-[100px]">
            <span className="text-sm font-medium text-white block mt-1">{user.memberSince}</span>
            <span className="text-[9px] text-white/40 uppercase tracking-widest">Joined</span>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form 1: Account Information */}
        <div className="bg-[#0e0e0e] rounded p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 bg-white/5 rounded text-white border border-white/10">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F0F0F0]">Account Information</h3>
                <p className="text-xs text-white/40">Personal details & contact info</p>
              </div>
            </div>

            <form onSubmit={handleSaveAccount} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 block mb-1 font-medium">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="text-white/50 block mb-1 font-medium">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/50 block mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded p-2.5 text-white font-mono-data focus:outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="text-white/50 block mb-1 font-medium">Role & Clearance</label>
                <input
                  type="text"
                  disabled
                  value="Senior Analyst (Full Infrastructure Access)"
                  className="w-full bg-[#121212]/50 border border-white/5 rounded p-2.5 text-white/40 cursor-not-allowed"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className={`font-semibold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded flex items-center gap-2 transition-all shadow-md active:scale-95 ${
                    accountSaved
                      ? 'bg-emerald-400 text-black'
                      : 'bg-white text-black hover:bg-white/90'
                  }`}
                >
                  {accountSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Updated Profile!
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Form 2: Security & Credentials */}
        <div className="bg-[#0e0e0e] rounded p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 bg-white/5 rounded text-white border border-white/10">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F0F0F0]">Security & Credentials</h3>
                <p className="text-xs text-white/40">Update your operator password</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="text-white/50 block mb-1 font-medium">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="text-white/50 block mb-1 font-medium">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="text-white/50 block mb-1 font-medium">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded p-2.5 text-white focus:outline-none focus:border-white/40"
                />
              </div>

              {passwordError && (
                <div className="text-xs text-rose-300 bg-rose-950/40 p-2.5 rounded border border-rose-500/30">
                  {passwordError}
                </div>
              )}

              <div className="pt-3">
                <button
                  type="submit"
                  className={`font-semibold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded flex items-center gap-2 transition-all shadow-md active:scale-95 ${
                    passwordSaved
                      ? 'bg-emerald-400 text-black'
                      : 'border border-white/20 hover:bg-white hover:text-black text-white'
                  }`}
                >
                  {passwordSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Password Updated!
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
