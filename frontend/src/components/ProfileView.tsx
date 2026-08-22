import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Lock, Save, KeyRound, AlertTriangle, CheckCircle2, Video, Car, Calendar, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { changePassword, getMyStats } from '../services/authApi';
import type { ProfileStats } from '../services/authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const ProfileView: React.FC = () => {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be under 5MB');
      return;
    }

    setAvatarError(null);
    setAvatarUploading(true);
    try {
      await uploadAvatar(file);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setAvatarUploading(false);
    }
  };

  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [stats, setStats] = useState<ProfileStats | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    getMyStats().then(setStats).catch(() => setStats(null));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSaving(true);
    try {
      await updateProfile(fullName, email);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const memberSince = stats
    ? new Date(stats.member_since).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
    : '--';

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl">
      <div>
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Account</span>
        <h1 className="text-2xl font-light text-white mt-1">Profile</h1>
      </div>

      {/* Header card with real stats */}
      <div className="bg-[#0e0e0e] rounded p-5 border border-white/10 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-lg font-medium overflow-hidden relative"
              title="Change photo"
            >
              {user?.avatar_url ? (
                <img
                  src={`${API_BASE_URL}${user.avatar_url}`}
                  alt={user.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                (user?.full_name ?? '?').charAt(0).toUpperCase()
              )}

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {avatarUploading ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </div>
            </button>
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">{user?.full_name}</h2>
            <p className="text-xs text-white/40">{user?.email}</p>
            {avatarError && <p className="text-[11px] text-rose-400 mt-1">{avatarError}</p>}
          </div>
        </div>

        <div className="flex gap-6 text-center">
          <div>
            <div className="flex items-center gap-1.5 justify-center text-white">
              <Video className="w-3.5 h-3.5" />
              <span className="text-xl font-light">{stats?.videos_analyzed ?? '--'}</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-white/40">Videos Analyzed</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 justify-center text-white">
              <Car className="w-3.5 h-3.5" />
              <span className="text-xl font-light">{stats?.total_vehicles_counted ?? '--'}</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-white/40">Vehicles Counted</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 justify-center text-white">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xl font-light">{memberSince}</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-white/40">Member Since</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account info */}
        <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-white" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Account Information</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 text-xs">
            <div>
              <label className="text-white/50 block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            <div>
              <label className="text-white/50 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            {profileError && (
              <div className="flex items-start gap-2 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{profileError}</span>
              </div>
            )}

            <div className="flex items-center gap-3 mt-1">
              <button
                type="submit"
                disabled={profileSaving}
                className="bg-white text-black hover:bg-white/90 font-semibold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
              {profileSaved && (
                <span className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Security */}
        <div className="bg-[#0e0e0e] rounded p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-white" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Security &amp; Password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-4 text-xs">
            <div>
              <label className="text-white/50 block mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded py-2.5 px-3 text-white focus:outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="text-white/50 block mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded py-2.5 px-3 text-white focus:outline-none focus:border-white/40"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="text-white/50 block mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded py-2.5 px-3 text-white focus:outline-none focus:border-white/40"
              />
            </div>

            {passwordError && (
              <div className="flex items-start gap-2 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="flex items-center gap-3 mt-1">
              <button
                type="submit"
                disabled={passwordSaving}
                className="bg-white text-black hover:bg-white/90 font-semibold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <KeyRound className="w-3.5 h-3.5" />
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
              {passwordSaved && (
                <span className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Updated
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
