import React, { useState } from 'react';
import { X, User, Lock, Mail, Download, Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { register, login, exportUserData, deleteUserAccount, UserSession } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession | null;
  onUserChange: (user: UserSession | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [infoMsg, setInfoMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        const user = await register(email, password, name);
        onUserChange(user);
        setInfoMsg('Account created successfully!');
      } else {
        const user = await login(email, password);
        onUserChange(user);
        setInfoMsg('Logged in successfully!');
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `breathesmart_profile_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setInfoMsg('Profile data exported successfully (JSON format).');
    } catch (err: any) {
      setError(err.message || 'Failed to export data');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete your account and all associated data? This action is irreversible.')) {
      try {
        await deleteUserAccount();
        onUserChange(null);
        setInfoMsg('Account and all personal data deleted.');
        setTimeout(() => onClose(), 800);
      } catch (err: any) {
        setError(err.message || 'Failed to delete account');
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 id="auth-modal-title" className="text-base font-bold text-white">
              {currentUser ? 'User Account & Privacy Center' : (isRegisterMode ? 'Create BreatheSmart Account' : 'Sign In')}
            </h3>
            <p className="text-xs text-slate-400">
              {currentUser ? `Signed in as ${currentUser.name}` : 'Sync your personalized low-emission routine across devices'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {infoMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{infoMsg}</span>
          </div>
        )}

        {currentUser ? (
          /* Logged In View: Privacy & Profile Management */
          <div className="space-y-4">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="text-white font-medium">{currentUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-white font-medium">{currentUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Encryption:</span>
                <span className="text-emerald-400 font-mono">PBKDF2-SHA512 Salted</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Data Privacy Guarantee:</strong> We collect only necessary lifestyle parameters to calculate pollution dosages. No telemetry is shared with third-party advertisers.
              </span>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleExport}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export My Data (GDPR Portability)</span>
              </button>

              <button
                onClick={handleDelete}
                className="w-full py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 border border-rose-800/60 transition"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Delete Account & Wipe Data</span>
              </button>

              <button
                onClick={() => {
                  onUserChange(null);
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs transition mt-1"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Register Form */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegisterMode && (
              <div>
                <label className="text-xs text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-slate-300 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50 shadow-lg shadow-emerald-900/30"
            >
              {isSubmitting ? 'Processing...' : (isRegisterMode ? 'Create Account' : 'Sign In')}
            </button>

            <div className="pt-2 text-center text-xs text-slate-400">
              {isRegisterMode ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(false)}
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    Sign in
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(true)}
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    Register free
                  </button>
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
