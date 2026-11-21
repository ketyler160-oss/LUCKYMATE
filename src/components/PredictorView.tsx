import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Crosshair,
  Eye,
  EyeOff,
  Globe,
  Grid,
  KeyRound,
  Lock,
  LogOut,
  Plane,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';
import {
  changePredictorPassword,
  fetchPredictorAll,
  getStoredPredictorServerUrl,
  getStoredPredictorToken,
  normalizeServerBaseUrl,
  storePredictorServerUrl,
  storePredictorToken,
  unlockPredictor,
  verifyPredictorChangeCode,
} from '../lib/predictorApi';
import { CrashGameId, PredictorGameSnapshot } from '../types';

interface PredictorViewProps {
  initialGameId?: CrashGameId;
  standalone?: boolean;
  onClose?: () => void;
}

function formatTimer(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds));
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function PredictorView({
  initialGameId = 'aviator',
  standalone = false,
  onClose,
}: PredictorViewProps) {
  const [token, setToken] = useState<string>(() => getStoredPredictorToken());
  const [serverUrl, setServerUrl] = useState<string>(() => getStoredPredictorServerUrl());
  const [showServerConfig, setShowServerConfig] = useState<boolean>(() => Boolean(getStoredPredictorServerUrl()));
  const [accessCode, setAccessCode] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [changePwOpen, setChangePwOpen] = useState(false);
  const [changeCodeVerified, setChangeCodeVerified] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showChangePw, setShowChangePw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [changePwFeedback, setChangePwFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const [selectedGame, setSelectedGame] = useState<CrashGameId>(initialGameId);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [showAllResults, setShowAllResults] = useState(false);

  const [games, setGames] = useState<PredictorGameSnapshot[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadSnapshots = useCallback(
    async (activeToken: string, activeServerUrl: string) => {
      if (!activeToken) return;
      try {
        const res = await fetchPredictorAll(activeToken, activeServerUrl);
        setGames(res.games);
        setFetchError(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to sync live signals.';
        if (msg.toLowerCase().includes('forbidden') || msg.includes('403')) {
          storePredictorToken(null);
          setToken('');
          setAuthError('Session expired. Enter predictor password to log in.');
        } else {
          setFetchError(msg);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!token) return;
    loadSnapshots(token, serverUrl);
    const timer = window.setInterval(() => {
      loadSnapshots(token, serverUrl);
    }, 300);
    return () => window.clearInterval(timer);
  }, [token, serverUrl, loadSnapshots]);

  const handleUnlock = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;
    setUnlocking(true);
    setAuthError(null);
    const normalizedUrl = normalizeServerBaseUrl(serverUrl);
    storePredictorServerUrl(normalizedUrl);
    setServerUrl(normalizedUrl);
    try {
      const res = await unlockPredictor(accessCode.trim(), normalizedUrl);
      setToken(res.predictorToken);
      setAccessCode('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Invalid predictor password.');
    } finally {
      setUnlocking(false);
    }
  };

  const resetChangePasswordPanel = () => {
    setChangePwOpen(false);
    setChangeCodeVerified(false);
    setVerifyCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setChangePwFeedback(null);
  };

  const handleVerifyChangeCode = async (e: FormEvent) => {
    e.preventDefault();
    setChangePwFeedback(null);
    if (!verifyCode.trim()) {
      setChangePwFeedback({ ok: false, text: 'Enter the security code to continue.' });
      return;
    }

    setVerifyingCode(true);
    const normalizedUrl = normalizeServerBaseUrl(serverUrl);
    storePredictorServerUrl(normalizedUrl);
    setServerUrl(normalizedUrl);
    try {
      const res = await verifyPredictorChangeCode(verifyCode.trim(), normalizedUrl);
      setChangeCodeVerified(true);
      setChangePwFeedback({ ok: true, text: res.message || 'Code verified. Enter your new password below.' });
    } catch (err) {
      setChangeCodeVerified(false);
      setChangePwFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'Invalid security code.',
      });
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setChangePwFeedback(null);
    if (!changeCodeVerified || !verifyCode.trim()) {
      setChangePwFeedback({ ok: false, text: 'Verify the security code first.' });
      return;
    }
    if (newPassword.trim().length < 4) {
      setChangePwFeedback({ ok: false, text: 'New password must be at least 4 characters.' });
      return;
    }
    if (newPassword.trim() !== confirmNewPassword.trim()) {
      setChangePwFeedback({ ok: false, text: 'New passwords do not match.' });
      return;
    }

    setChangingPw(true);
    const normalizedUrl = normalizeServerBaseUrl(serverUrl);
    storePredictorServerUrl(normalizedUrl);
    setServerUrl(normalizedUrl);
    try {
      const res = await changePredictorPassword(
        verifyCode.trim(),
        newPassword.trim(),
        token || undefined,
        normalizedUrl
      );
      if (res.predictorToken) {
        setToken(res.predictorToken);
      }
      setChangeCodeVerified(false);
      setVerifyCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setChangePwFeedback({ ok: true, text: res.message || 'Password updated successfully.' });
    } catch (err) {
      setChangePwFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'Unable to update password.',
      });
    } finally {
      setChangingPw(false);
    }
  };

  const handleLock = () => {
    storePredictorToken(null);
    setToken('');
    setGames([]);
    setFetchError(null);
    resetChangePasswordPanel();
    if (!standalone) {
      onClose?.();
    }
  };

  const handleCopyLink = async () => {
    try {
      const link = `${window.location.origin}/predictor`;
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const renderChangePasswordForm = () => (
    <form
      onSubmit={changeCodeVerified ? handleChangePassword : handleVerifyChangeCode}
      className="space-y-3 rounded-2xl border border-[#253042] bg-[#090d15] p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <KeyRound className="h-4 w-4 text-[#f59e0b]" aria-hidden="true" />
          <h2 className="font-display text-sm font-extrabold">Change Predictor Password</h2>
        </div>
        <button
          type="button"
          onClick={resetChangePasswordPanel}
          aria-label="Close change password"
          className="rounded-lg p-1 text-[#94a3b8] hover:bg-[#1a2230] hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {!changeCodeVerified ? (
        <>
          <p className="text-xs text-[#94a3b8]">
            Enter the security code first to unlock the new password fields.
          </p>

          <div>
            <label htmlFor="predictor-verify-code" className="block text-xs font-semibold text-[#94a3b8] mb-1">
              Security Code
            </label>
            <input
              id="predictor-verify-code"
              type={showChangePw ? 'text' : 'password'}
              autoFocus
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              placeholder="Enter security code..."
              className="min-h-[40px] w-full rounded-xl border border-[#2a3649] bg-[#06090f] px-3 py-2 text-sm text-white placeholder:text-[#475569] focus:border-[#f59e0b] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowChangePw((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#94a3b8] hover:text-white cursor-pointer"
          >
            {showChangePw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{showChangePw ? 'Hide code' : 'Show code'}</span>
          </button>

          {changePwFeedback && (
            <p
              role="alert"
              className={`text-xs font-semibold ${changePwFeedback.ok ? 'text-[#22c55e]' : 'text-[#f87171]'}`}
            >
              {changePwFeedback.text}
            </p>
          )}

          <button
            type="submit"
            disabled={verifyingCode}
            className="min-h-[40px] w-full rounded-xl bg-gradient-to-r from-[#d97706] to-[#f59e0b] px-4 py-2 text-xs font-extrabold text-[#0b0f17] shadow hover:brightness-110 disabled:opacity-60 cursor-pointer"
          >
            {verifyingCode ? 'Verifying Code...' : 'Verify Code'}
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-1.5 rounded-xl border border-[#22c55e]/30 bg-[#22c55e]/10 px-3 py-2 text-xs font-semibold text-[#22c55e]">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Code verified — enter your new Predictor password</span>
          </div>

          <div>
            <label htmlFor="predictor-new-password" className="block text-xs font-semibold text-[#94a3b8] mb-1">
              New Predictor Password
            </label>
            <input
              id="predictor-new-password"
              type={showChangePw ? 'text' : 'password'}
              autoFocus
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password..."
              className="min-h-[40px] w-full rounded-xl border border-[#2a3649] bg-[#06090f] px-3 py-2 text-sm text-white placeholder:text-[#475569] focus:border-[#22c55e] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="predictor-confirm-password" className="block text-xs font-semibold text-[#94a3b8] mb-1">
              Confirm New Password
            </label>
            <input
              id="predictor-confirm-password"
              type={showChangePw ? 'text' : 'password'}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Re-enter new password..."
              className="min-h-[40px] w-full rounded-xl border border-[#2a3649] bg-[#06090f] px-3 py-2 text-sm text-white placeholder:text-[#475569] focus:border-[#22c55e] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowChangePw((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#94a3b8] hover:text-white cursor-pointer"
          >
            {showChangePw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{showChangePw ? 'Hide passwords' : 'Show passwords'}</span>
          </button>

          {changePwFeedback && (
            <p
              role="alert"
              className={`text-xs font-semibold ${changePwFeedback.ok ? 'text-[#22c55e]' : 'text-[#f87171]'}`}
            >
              {changePwFeedback.text}
            </p>
          )}

          <button
            type="submit"
            disabled={changingPw}
            className="min-h-[40px] w-full rounded-xl bg-gradient-to-r from-[#16a34a] to-[#22c55e] px-4 py-2 text-xs font-extrabold text-[#04140a] shadow hover:brightness-110 disabled:opacity-60 cursor-pointer"
          >
            {changingPw ? 'Saving...' : 'Save New Password'}
          </button>
        </>
      )}
    </form>
  );

  const outerWrapperClass = standalone
    ? 'min-h-screen w-full bg-[#04060a] px-3 py-5 sm:p-6 flex items-center justify-center'
    : 'fixed inset-0 z-50 flex items-center justify-center bg-[#04060a]/95 p-4 backdrop-blur-md';

  if (!token) {
    return (
      <div className={outerWrapperClass}>
        <div className="w-full max-w-sm rounded-2xl border border-[#222c3c] bg-[#0b0f17] p-6 shadow-[0_0_50px_rgba(239,68,68,0.14)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ef4444]/40 bg-[#ef4444]/15 text-[#ef4444]">
                <Plane className="h-5 w-5 -rotate-12 fill-current" aria-hidden="true" />
              </div>
              <div className="leading-tight">
                <h1 className="font-display text-base font-black tracking-tight text-white">
                  Crash Predictor
                </h1>
                <p className="text-[11px] font-medium text-[#94a3b8]">Standalone Signal Console</p>
              </div>
            </div>
            {!standalone && onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Exit"
                className="rounded-lg p-1.5 text-[#8e9bae] hover:bg-[#1a2230] hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {changePwOpen ? (
            renderChangePasswordForm()
          ) : (
            <form onSubmit={handleUnlock} className="space-y-3.5">
              <div>
                <label
                  htmlFor="predictor-code-input"
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#94a3b8] mb-1.5"
                >
                  <Lock className="h-3.5 w-3.5 text-[#ef4444]" aria-hidden="true" />
                  <span>Predictor Password</span>
                </label>
                <div className="relative">
                  <input
                    id="predictor-code-input"
                    type={showLoginPassword ? 'text' : 'password'}
                    autoFocus
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter predictor password..."
                    className="min-h-[42px] w-full rounded-xl border border-[#2a3649] bg-[#070a0f] pl-3.5 pr-10 py-2 text-sm text-white placeholder:text-[#475569] focus:border-[#ef4444] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748b] hover:text-white cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowServerConfig((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#94a3b8] hover:text-white cursor-pointer"
                >
                  <Globe className="h-3.5 w-3.5 text-[#38bdf8]" aria-hidden="true" />
                  <span>
                    {showServerConfig ? 'Hide Server Connection' : 'Connect Remote Game Server (Optional)'}
                  </span>
                </button>

                {showServerConfig && (
                  <div className="mt-2">
                    <label htmlFor="predictor-server-input" className="block text-[11px] text-[#64748b] mb-1">
                      Leave blank to use this server, or enter your deployed Luckymate URL
                    </label>
                    <input
                      id="predictor-server-input"
                      type="url"
                      value={serverUrl}
                      onChange={(e) => setServerUrl(e.target.value)}
                      placeholder="https://your-luckymate-domain.com"
                      className="min-h-[40px] w-full rounded-xl border border-[#2a3649] bg-[#070a0f] px-3 py-2 text-xs text-white placeholder:text-[#475569] focus:border-[#38bdf8] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {authError && (
                <p role="alert" className="text-xs font-medium text-[#f87171]">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={unlocking}
                className="min-h-[42px] w-full rounded-xl bg-gradient-to-r from-[#dc2626] to-[#ef4444] px-4 py-2 text-sm font-extrabold text-white shadow-lg hover:brightness-110 disabled:opacity-60 cursor-pointer"
              >
                {unlocking ? 'Verifying...' : 'Log In to Predictor'}
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setChangePwOpen(true);
                    setChangePwFeedback(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f59e0b] hover:underline cursor-pointer"
                >
                  <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Change Password</span>
                </button>

                {standalone && (
                  <a
                    href="/"
                    className="text-xs font-semibold text-[#64748b] hover:text-white"
                  >
                    Back to Luckymate
                  </a>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  const active = games.find((g) => g.game === selectedGame) ?? games[0];
  const recentLimit = showAllResults ? 12 : 6;

  return (
    <div
      className={
        standalone
          ? 'min-h-screen w-full bg-[#030508] p-3 sm:p-5'
          : 'fixed inset-0 z-50 overflow-y-auto bg-[#030508]/95 p-3 sm:p-5 backdrop-blur-md'
      }
    >
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#1f2937] bg-gradient-to-b from-[#070b11] via-[#090d14] to-[#05070b] p-4 sm:p-5 shadow-[0_0_50px_rgba(239,68,68,0.18)]">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/40 text-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.25)]">
              <Plane className="h-6 w-6 -rotate-12 fill-current" aria-hidden="true" />
            </div>
            <div className="leading-none">
              <p className="font-display text-2xl font-black italic tracking-tight text-[#ef4444]">
                {active ? active.gameTitle : 'Aviator'}
              </p>
              <p className="font-display text-base font-black italic tracking-widest text-white">
                PREDICTOR
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-[#1f2937] bg-[#0d131d] px-3 py-1.5 text-right">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <ShieldCheck className="h-4 w-4 text-[#22c55e]" aria-hidden="true" />
                <span>Trusted Signal</span>
              </div>
              <div className="mt-0.5 flex items-center justify-end gap-1.5 text-[11px] font-bold text-[#22c55e]">
                <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span>Live</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (changePwOpen) {
                  resetChangePasswordPanel();
                } else {
                  setChangePwOpen(true);
                  setChangeCodeVerified(false);
                  setChangePwFeedback(null);
                }
              }}
              title="Change Password"
              className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold cursor-pointer ${
                changePwOpen
                  ? 'border-[#f59e0b] bg-[#f59e0b]/15 text-[#fbbf24]'
                  : 'border-[#253042] bg-[#0e141f] text-[#cbd5e1] hover:text-white'
              }`}
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Change Password</span>
            </button>

            {standalone && (
              <button
                type="button"
                onClick={handleCopyLink}
                title="Copy standalone predictor link"
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#253042] bg-[#0e141f] px-3 text-xs font-bold text-[#cbd5e1] hover:text-white cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4 text-[#22c55e]" aria-hidden="true" />
                    <span className="hidden sm:inline text-[#22c55e]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Link</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setViewMode((m) => (m === 'single' ? 'all' : 'single'))}
              title="Toggle All 11 Crash Games Grid"
              className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold cursor-pointer ${
                viewMode === 'all'
                  ? 'border-[#22c55e] bg-[#22c55e]/15 text-[#22c55e]'
                  : 'border-[#253042] bg-[#0e141f] text-[#cbd5e1] hover:text-white'
              }`}
            >
              <Grid className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">All 11</span>
            </button>

            <button
              type="button"
              onClick={handleLock}
              aria-label={standalone ? 'Lock predictor' : 'Lock and close predictor'}
              title="Lock Predictor"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#253042] bg-[#0e141f] text-[#94a3b8] hover:border-[#ef4444] hover:text-white cursor-pointer"
            >
              {standalone ? <LogOut className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {changePwOpen && <div className="mb-3.5">{renderChangePasswordForm()}</div>}

        {/* All 11 Crash Games Switcher Pills */}
        <div className="no-scrollbar mb-3.5 flex items-center gap-1.5 overflow-x-auto pb-1">
          {games.map((g) => {
            const isSelected = viewMode === 'single' && g.game === selectedGame;
            return (
              <button
                key={g.game}
                type="button"
                onClick={() => {
                  setSelectedGame(g.game);
                  setViewMode('single');
                }}
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-[#ef4444] bg-[#ef4444]/20 text-white shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                    : 'border-[#1f2937] bg-[#0c111a] text-[#94a3b8] hover:border-[#334155] hover:text-white'
                }`}
              >
                {g.gameTitle}{' '}
                <span className="ml-1 font-mono text-[#ef4444]">
                  {g.predictedNextOdd.toFixed(2)}x
                </span>
              </button>
            );
          })}
        </div>

        {fetchError && (
          <div className="mb-3 rounded-xl border border-[#7f1d1d] bg-[#2a1215] px-3 py-2 text-xs text-[#fecaca]">
            {fetchError}
          </div>
        )}

        {viewMode === 'all' ? (
          /* Simultaneous Live Grid for ALL 11 Crash Games */
          <div className="grid gap-2.5 sm:grid-cols-2">
            {games.map((g) => (
              <button
                key={g.game}
                type="button"
                onClick={() => {
                  setSelectedGame(g.game);
                  setViewMode('single');
                }}
                className="rounded-2xl border border-[#ef4444]/60 bg-[#0b0e15] p-3.5 text-left shadow-[0_0_18px_rgba(239,68,68,0.12)] hover:border-[#ef4444] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-black text-white">
                    {g.gameTitle}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                      g.status === 'betting'
                        ? 'bg-[#22c55e]/20 text-[#22c55e]'
                        : g.status === 'running'
                        ? 'bg-[#ef4444]/20 text-[#ef4444]'
                        : 'bg-[#f59e0b]/20 text-[#fbbf24]'
                    }`}
                  >
                    {g.status === 'betting'
                      ? `Betting ${g.countdownSeconds.toFixed(0)}s`
                      : g.status === 'running'
                      ? `Flying ${g.liveMultiplier.toFixed(2)}x`
                      : `Next in ${g.countdownSeconds.toFixed(0)}s`}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                      Round #{g.targetRoundNumber} Next Crash
                    </p>
                    <p className="font-mono text-2xl font-black text-[#ef4444] tabular-nums">
                      {g.predictedNextOdd.toFixed(2)}x
                    </p>
                  </div>

                  {g.status === 'running' && (
                    <div className="text-right">
                      <p className="text-[10px] text-[#94a3b8]">Round #{g.roundNumber} Target</p>
                      <p className="font-mono text-sm font-extrabold text-[#fbbf24] tabular-nums">
                        {g.currentRoundCrashPoint.toFixed(2)}x
                      </p>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : active ? (
          <div className="space-y-3.5">
            {/* RED NEON PREDICTION CARD (Matches Screenshot) */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-[#ef4444] bg-gradient-to-b from-[#13090c] to-[#0a0c12] p-4 sm:p-5 shadow-[0_0_28px_rgba(239,68,68,0.28)]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                  NEXT ODD PREDICTION · ROUND #{active.targetRoundNumber}
                </p>
                {active.status === 'running' && (
                  <span className="rounded-full border border-[#fbbf24]/50 bg-[#fbbf24]/15 px-2.5 py-0.5 font-mono text-[11px] font-extrabold text-[#fde047] tabular-nums">
                    Live #{active.roundNumber} Crash: {active.currentRoundCrashPoint.toFixed(2)}x
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between gap-4">
                <p className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-[#ef4444] drop-shadow-[0_0_20px_rgba(239,68,68,0.55)] tabular-nums">
                  {active.predictedNextOdd.toFixed(2)}x
                </p>

                {/* Signal Bars + Plane Silhouette on Right */}
                <div className="relative flex items-end gap-1.5 pr-1 pt-2" aria-hidden="true">
                  {[66, 58, 50, 42, 34, 26, 18, 12].map((h, i) => (
                    <span
                      key={i}
                      className="w-2 rounded-t bg-gradient-to-t from-[#7f1d1d] to-[#ef4444]"
                      style={{ height: `${h}px`, opacity: 0.9 - i * 0.06 }}
                    />
                  ))}
                  <Plane className="absolute -top-1 right-1 h-9 w-9 text-[#ef4444] fill-current drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]" />
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-center gap-2 rounded-full border border-[#f87171]/60 bg-gradient-to-r from-[#991b1b] via-[#dc2626] to-[#991b1b] px-4 py-2 text-sm sm:text-base font-extrabold text-white shadow-[0_0_18px_rgba(239,68,68,0.4)]">
                <Zap className="h-4 w-4 fill-current" aria-hidden="true" />
                <span>
                  Next Crash at {active.predictedNextOdd.toFixed(2)}x ({active.gameTitle})
                </span>
              </div>
            </div>

            {/* GREEN NEON COUNTDOWN CARD (Matches Screenshot) */}
            <div className="rounded-2xl border-2 border-[#22c55e] bg-gradient-to-b from-[#07160d] to-[#060d09] p-4 shadow-[0_0_24px_rgba(34,197,94,0.25)]">
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-[#e2e8f0]">
                <Clock className="h-4 w-4 text-[#22c55e]" aria-hidden="true" />
                <span>
                  {active.status === 'running'
                    ? `Live Flight (${active.liveMultiplier.toFixed(2)}x)`
                    : 'Countdown'}
                </span>
              </div>

              <p className="mt-1 text-center font-mono text-4xl sm:text-5xl font-black tracking-wider text-white tabular-nums">
                {active.status === 'running'
                  ? `${active.liveMultiplier.toFixed(2)}x`
                  : formatTimer(active.countdownSeconds)}
              </p>

              <div className="mt-3 rounded-full bg-gradient-to-r from-[#15803d] via-[#22c55e] to-[#15803d] px-4 py-2 text-center text-xs sm:text-sm font-black uppercase tracking-wide text-white shadow-[0_0_16px_rgba(34,197,94,0.45)]">
                {active.status === 'betting'
                  ? `BETTING OPEN — LOCK IN BEFORE ${active.predictedNextOdd.toFixed(2)}x`
                  : active.status === 'running'
                  ? `ROUND #${active.roundNumber} CRASHES AT ${active.currentRoundCrashPoint.toFixed(2)}x — NEXT #${active.targetRoundNumber}: ${active.predictedNextOdd.toFixed(2)}x`
                  : 'WAIT FOR THE NEXT ROUND...'}
              </div>
            </div>

            {/* RECENT RESULTS STRIP (Matches Screenshot) */}
            <div className="rounded-2xl border border-[#1f2937] bg-[#0b1018] p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <BarChart3 className="h-4 w-4 text-[#94a3b8]" aria-hidden="true" />
                  <span>Recent Results</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllResults((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#38bdf8] hover:underline cursor-pointer"
                >
                  <span>{showAllResults ? 'Show Less' : 'View All'}</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {active.recentCrashPoints.slice(0, recentLimit).map((r) => {
                  const isHigh = r.crashPoint >= 2.0;
                  return (
                    <span
                      key={r.roundNumber}
                      title={`Round #${r.roundNumber}`}
                      className={`rounded-full border px-3 py-1 font-mono text-xs font-extrabold tabular-nums ${
                        isHigh
                          ? 'border-[#22c55e]/60 bg-[#071e11] text-[#22c55e]'
                          : 'border-[#ef4444]/60 bg-[#1f0a0e] text-[#ef4444]'
                      }`}
                    >
                      {r.crashPoint.toFixed(2)}x
                    </span>
                  );
                })}
              </div>
            </div>

            {/* BOTTOM 3-COLUMN TRUST BAR (Matches Screenshot) */}
            <div className="grid grid-cols-3 divide-x divide-[#1e293b] rounded-2xl border border-[#1f2937] bg-[#0b1018] py-3 px-2 text-center">
              <div className="flex items-center justify-center gap-2 px-1">
                <Crosshair className="h-4 w-4 shrink-0 text-[#ef4444]" aria-hidden="true" />
                <span className="text-[11px] font-semibold text-[#cbd5e1] leading-tight text-left">
                  High Accuracy Prediction
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 px-1">
                <Zap className="h-4 w-4 shrink-0 text-[#facc15] fill-current" aria-hidden="true" />
                <span className="text-[11px] font-semibold text-[#cbd5e1] leading-tight text-left">
                  Real-Time Analysis
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 px-1">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22c55e]" aria-hidden="true" />
                <span className="text-[11px] font-semibold text-[#cbd5e1] leading-tight text-left">
                  Play Smart Win More
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-[#94a3b8]">
            Connecting to crash engine signals...
          </div>
        )}
      </div>
    </div>
  );
}
