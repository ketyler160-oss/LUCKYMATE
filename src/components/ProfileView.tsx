import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Gift,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  UserPlus,
  Wallet,
} from 'lucide-react';
import {
  ApiError,
  loginUser,
  logoutUser,
  recoverAccountPassword,
  registerAccount,
} from '../lib/api';
import { COUNTRIES, COUNTRY_ORDER, getCountryConfig } from '../lib/countries';
import { AuthResponse, CountryOption, ReferralSummary, RegisterDirectResponse } from '../types';
import { CountryFlag } from './BrandVisuals';
import { SettingsAndSupportView } from './SecondaryViews';

const RECOVERY_LOAD_MS = 10_000;

async function copyTextSafely(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function formatLocalPhoneForInput(rawPhone: string, targetCountry: CountryOption): string {
  const cleaned = rawPhone.replace(/[\s\-()]/g, '');
  if (!cleaned) return '';
  if (targetCountry === 'Kenya' && cleaned.startsWith('+254')) {
    return `0${cleaned.slice(4).replace(/^0+/, '')}`;
  }
  if (targetCountry === 'Ghana' && cleaned.startsWith('+233')) {
    return `0${cleaned.slice(4).replace(/^0+/, '')}`;
  }
  if (targetCountry === "Côte d'Ivoire" && cleaned.startsWith('+225')) {
    return cleaned.slice(4);
  }
  return rawPhone;
}

interface ProfileViewProps {
  demoUser: string | null;
  registeredPhone: string | null;
  registeredEmail: string | null;
  memberSince: string | null;
  country: CountryOption;
  realBalance: number;
  demoBalance: number;
  lastDepositAmount: number;
  lastDepositDate: string;
  referralCode: string | null;
  referralSummary: ReferralSummary | null;
  pendingReferralCode?: string | null;
  referrerName?: string | null;
  onSelectCountry: (country: CountryOption) => void;
  onOpenWallet: () => void;
  onRegistered: (reg: RegisterDirectResponse) => void;
  onAuthComplete: (auth: AuthResponse | null) => void;
  onRefreshReferrals?: () => Promise<void>;
  onResetDemo: () => Promise<void>;
}

export function ProfileView({
  demoUser,
  registeredPhone,
  registeredEmail,
  country,
  pendingReferralCode,
  referrerName,
  onSelectCountry,
  onOpenWallet,
  onRegistered,
  onAuthComplete,
  onResetDemo,
}: ProfileViewProps) {
  const [formMode, setFormMode] = useState<'save' | 'login' | 'forgot'>('save');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [referralInput, setReferralInput] = useState(() => (pendingReferralCode || '').toUpperCase());

  useEffect(() => {
    const nextCode = (pendingReferralCode || '').trim().toUpperCase();
    if (nextCode) {
      setReferralInput((prev) => (prev.trim() ? prev : nextCode));
    }
  }, [pendingReferralCode]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [recovering, setRecovering] = useState(false);
  const [recoverSecondsLeft, setRecoverSecondsLeft] = useState(10);
  const [recoverProgress, setRecoverProgress] = useState(0);
  const [recoveredPassword, setRecoveredPassword] = useState<string | null>(null);
  const [copiedRecovered, setCopiedRecovered] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const recoveryIntervalRef = useRef<number | null>(null);
  const recoveryAbortedRef = useRef(false);

  const stopRecoveryTimer = () => {
    if (recoveryIntervalRef.current !== null) {
      window.clearInterval(recoveryIntervalRef.current);
      recoveryIntervalRef.current = null;
    }
  };

  useEffect(() => {
    recoveryAbortedRef.current = false;
    return () => {
      recoveryAbortedRef.current = true;
      stopRecoveryTimer();
    };
  }, []);

  const countryCfg = getCountryConfig(country);
  const displayPhone = registeredPhone || '';
  const isSignedIn = Boolean(demoUser);

  const handleSaveOrLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!phone.trim()) {
      setError('Enter your phone number.');
      return;
    }

    if (formMode === 'forgot') {
      stopRecoveryTimer();
      setRecovering(true);
      setRecoveredPassword(null);
      setCopiedRecovered(false);
      setRecoverSecondsLeft(10);
      setRecoverProgress(0);

      const startedAt = Date.now();
      recoveryIntervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const pct = Math.min(100, Math.round((elapsed / RECOVERY_LOAD_MS) * 100));
        const secsLeft = Math.max(0, Math.ceil((RECOVERY_LOAD_MS - elapsed) / 1000));
        setRecoverProgress(pct);
        setRecoverSecondsLeft(secsLeft);
      }, 100);

      try {
        const res = await recoverAccountPassword({ phone: phone.trim(), country });
        const elapsed = Date.now() - startedAt;
        const remainingMs = Math.max(0, RECOVERY_LOAD_MS - elapsed);
        if (remainingMs > 0) {
          await new Promise<void>((resolve) => {
            window.setTimeout(resolve, remainingMs);
          });
        }
        if (recoveryAbortedRef.current) return;
        stopRecoveryTimer();
        setRecoverProgress(100);
        setRecoverSecondsLeft(0);
        setRecovering(false);

        const resolvedCountry = res.country || country;
        if (res.country && res.country !== country) {
          onSelectCountry(res.country);
        }
        if (res.phone) {
          setPhone(formatLocalPhoneForInput(res.phone, resolvedCountry));
        }
        setRecoveredPassword(res.previousPassword);
      } catch (err) {
        if (recoveryAbortedRef.current) return;
        stopRecoveryTimer();
        setRecovering(false);
        setRecoverProgress(0);
        setRecoverSecondsLeft(10);
        setError(err instanceof Error ? err.message : 'Unable to recover password.');
      }
      return;
    }

    const trimmedPass = password.trim();
    if (trimmedPass.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formMode === 'save') {
      const trimmedEmail = email.trim().toLowerCase();
      if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
        setError('Enter a valid email address or leave it blank.');
        return;
      }
      if (trimmedPass !== confirmPassword.trim()) {
        setError('Passwords do not match.');
        return;
      }
      setSubmitting(true);
      try {
        const regRes = await registerAccount({
          phone: phone.trim(),
          email: trimmedEmail || undefined,
          password: trimmedPass,
          confirmPassword: confirmPassword.trim(),
          country,
          acceptedTerms: true,
          referralCode: referralInput.trim() || undefined,
        });
        onRegistered(regRes);
        const auth = await loginUser(regRes.phone || phone.trim(), trimmedPass, country);
        onAuthComplete(auth);
        setPassword('');
        setConfirmPassword('');
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          setFormMode('login');
          setError(
            'This phone number is already registered. You cannot register the same number again. Enter your password to log in or click Forgot password.'
          );
        } else {
          setError(err instanceof Error ? err.message : 'Unable to save profile.');
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(true);
    try {
      const auth = await loginUser(phone.trim(), password, country);
      onAuthComplete(auth);
      setPassword('');
      setConfirmPassword('');
      setNotice('Signed in! Your saved details and wallet are ready.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setSubmitting(true);
    try {
      await logoutUser();
    } finally {
      setSubmitting(false);
      setPhone('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirm(false);
      setError(null);
      setNotice(null);
      setFormMode('login');
      onAuthComplete(null);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-xl space-y-4 px-3 py-5 sm:px-5">
        <div className="lm-card rounded-2xl p-6 space-y-5">
          <div className="border-b border-[#183044] pb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1929] border border-[#1d3954] text-[#9fb3c8]">
                  <UserPlus className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    {formMode === 'forgot' ? 'Recover Previous Password' : 'Your Profile is Empty'}
                  </h2>
                  <p className="text-xs text-[#8bb0ab]">
                    {formMode === 'forgot'
                      ? 'Enter your registered phone number to retrieve your previous password.'
                      : 'Save your phone number and password for easy access & wallet deposits.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#081322] p-1 border border-[#1c3248]">
            <button
              type="button"
              disabled={recovering}
              onClick={() => {
                stopRecoveryTimer();
                setRecoveredPassword(null);
                setFormMode('save');
                setError(null);
                setNotice(null);
              }}
              className={`min-h-[36px] rounded-md text-xs font-bold cursor-pointer disabled:opacity-50 ${
                formMode === 'save'
                  ? 'bg-[#7bc114] text-[#0b1404]'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Save Details (New)
            </button>
            <button
              type="button"
              disabled={recovering}
              onClick={() => {
                stopRecoveryTimer();
                setRecoveredPassword(null);
                setFormMode('login');
                setError(null);
                setNotice(null);
              }}
              className={`min-h-[36px] rounded-md text-xs font-bold cursor-pointer disabled:opacity-50 ${
                formMode === 'login'
                  ? 'bg-[#f5c417] text-[#111827]'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Already Saved? Login
            </button>
          </div>

          <form onSubmit={handleSaveOrLogin} className="space-y-4">
            <div>
              <p className="block text-xs font-bold text-white">Country &amp; Currency</p>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {COUNTRY_ORDER.map((c) => {
                  const item = COUNTRIES[c];
                  const active = c === country;
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={recovering}
                      onClick={() => {
                        onSelectCountry(c);
                        setError(null);
                      }}
                      className={`flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-center text-xs font-bold cursor-pointer disabled:opacity-50 ${
                        active
                          ? 'border-[#7bc114] bg-[#7bc114]/15 text-white'
                          : 'border-[#223952] bg-[#091523] text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      {formMode === 'save' && (
                        <CountryFlag country={c} className="h-4 w-6 rounded-[2px]" />
                      )}
                      <span className="w-full truncate text-[11px]">{item.label}</span>
                      <span className="font-mono text-[10px] text-[#94a3b8]">
                        {item.dialCode} · {item.currency}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="profile-phone" className="block text-xs font-bold text-white">
                Phone Number
              </label>
              <div className="mt-1.5 flex items-center overflow-hidden rounded-lg border border-[#243d56] bg-[#0a1524] focus-within:ring-2 focus-within:ring-[#7bc114]">
                <div className="flex items-center gap-1.5 border-r border-[#243d56] bg-[#0e1c2f] px-3 py-3 text-xs font-bold text-white shrink-0">
                  {formMode === 'save' && (
                    <CountryFlag country={country} className="h-3.5 w-5 rounded-[2px]" />
                  )}
                  <span className="font-mono">{countryCfg.dialCode}</span>
                </div>
                <input
                  id="profile-phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  disabled={recovering}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={countryCfg.phonePlaceholder}
                  className="min-h-[44px] w-full bg-transparent px-3 text-sm text-white placeholder:text-[#64748b] focus:outline-none disabled:opacity-60"
                />
              </div>
            </div>

            {formMode === 'forgot' && recovering && (
              <div
                aria-live="polite"
                className="rounded-xl border border-[#f5c417]/40 bg-[#1a180d] p-4 space-y-3"
              >
                <div className="flex items-center gap-2.5">
                  <Loader2 className="h-5 w-5 animate-spin text-[#f5c417] shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-extrabold text-white">
                      Recovering your previous password...
                    </p>
                    <p className="text-[11px] text-[#f5c417] font-mono tabular-nums">
                      Please wait {recoverSecondsLeft}s
                    </p>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#2a2717]">
                  <div
                    className="h-full rounded-full bg-[#f5c417] transition-all duration-100"
                    style={{ width: `${recoverProgress}%` }}
                  />
                </div>
              </div>
            )}

            {formMode === 'forgot' && !recovering && recoveredPassword && (
              <div className="rounded-xl border border-[#2d5a3b] bg-[#0e1f18] p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#98e02a]">
                  <KeyRound className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Previous Password Found</span>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg border border-[#244734] bg-[#08130f] px-3 py-2.5">
                  <span className="select-all break-all font-mono text-sm font-extrabold text-white">
                    {recoveredPassword}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await copyTextSafely(recoveredPassword);
                      if (ok) {
                        setCopiedRecovered(true);
                        window.setTimeout(() => setCopiedRecovered(false), 2500);
                      }
                    }}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#7bc114] px-3 py-1.5 text-xs font-extrabold text-[#0b1404] hover:bg-[#8cd61e] cursor-pointer"
                  >
                    {copiedRecovered ? (
                      <>
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        Copy Password
                      </>
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await copyTextSafely(recoveredPassword);
                    setFormMode('login');
                    setRecoveredPassword(null);
                    setPassword('');
                    setNotice('Password copied! Paste it below and log in.');
                  }}
                  className="min-h-[42px] w-full rounded-lg bg-[#f5c417] px-4 py-2 text-xs font-extrabold text-[#111827] hover:bg-[#fae07d] cursor-pointer"
                >
                  Copy Password &amp; Go to Login
                </button>
              </div>
            )}

            {formMode === 'save' && (
              <div>
                <label htmlFor="profile-email" className="block text-xs font-bold text-white">
                  Email Address <span className="font-normal text-[#8bb0ab]">(optional confirmation email)</span>
                </label>
                <div className="relative mt-1.5">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]"
                    aria-hidden="true"
                  />
                  <input
                    id="profile-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="min-h-[44px] w-full rounded-lg border border-[#243d56] bg-[#0a1524] pl-9 pr-3.5 text-sm text-white placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#7bc114]"
                  />
                </div>
              </div>
            )}

            {formMode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="profile-password" className="block text-xs font-bold text-white">
                    Password <span className="font-normal text-[#8bb0ab]">(hidden)</span>
                  </label>
                  {formMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormMode('forgot');
                        setError(null);
                        setNotice(null);
                        setRecoveredPassword(null);
                      }}
                      className="text-[11px] font-semibold text-[#f5c417] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative mt-1.5">
                  <input
                    id="profile-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={formMode === 'save' ? 'new-password' : 'current-password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min 6 characters)"
                    className="min-h-[44px] w-full rounded-lg border border-[#243d56] bg-[#0a1524] px-3.5 pr-10 text-sm text-white placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#7bc114]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#94a3b8] hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {formMode === 'save' && (
              <div>
                <label htmlFor="profile-confirm-password" className="block text-xs font-bold text-white">
                  Confirm Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="profile-confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="min-h-[44px] w-full rounded-lg border border-[#243d56] bg-[#0a1524] px-3.5 pr-10 text-sm text-white placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#7bc114]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#94a3b8] hover:text-white cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {formMode === 'save' && (
              <div>
                <label htmlFor="profile-referral-code" className="block text-xs font-bold text-white">
                  Referral / Invite Code <span className="font-normal text-[#8bb0ab]">(optional)</span>
                </label>
                <div className="relative mt-1.5">
                  <Gift
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]"
                    aria-hidden="true"
                  />
                  <input
                    id="profile-referral-code"
                    type="text"
                    value={referralInput}
                    onChange={(e) =>
                      setReferralInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12))
                    }
                    placeholder="e.g. LM8K4P2X"
                    className="min-h-[44px] w-full rounded-lg border border-[#243d56] bg-[#0a1524] pl-9 pr-3.5 font-mono text-sm uppercase tracking-wider text-white placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#7bc114]"
                  />
                </div>
                {referrerName && referralInput.trim() && (
                  <p className="mt-1 text-[11px] font-semibold text-[#98e02a]">
                    Invited by {referrerName} · Deposit $6.00 USD to unlock their $3.00 USD reward.
                  </p>
                )}
              </div>
            )}

            {error && <p className="text-xs font-medium text-[#f87171]">{error}</p>}
            {notice && <p className="text-xs font-medium text-[#2cd4a3]">{notice}</p>}

            {(formMode !== 'forgot' || !recoveredPassword) && (
              <button
                type="submit"
                disabled={submitting || recovering}
                className={`min-h-[46px] w-full rounded-lg px-4 py-2.5 text-sm font-extrabold transition-colors cursor-pointer disabled:opacity-60 ${
                  formMode === 'save'
                    ? 'bg-[#7bc114] text-[#0b1404] hover:bg-[#8cd61e]'
                    : 'bg-[#f5c417] text-[#111827] hover:bg-[#fae07d]'
                }`}
              >
                {formMode === 'forgot'
                  ? recovering
                    ? `Loading Previous Password (${recoverSecondsLeft}s)...`
                    : 'Show Previous Password'
                  : submitting
                  ? formMode === 'save'
                    ? 'Saving & Registering...'
                    : 'Signing In...'
                  : formMode === 'save'
                  ? 'Save Details & Register'
                  : 'Login to Luckymate'}
              </button>
            )}

            {formMode === 'forgot' && (
              <button
                type="button"
                disabled={recovering}
                onClick={() => {
                  stopRecoveryTimer();
                  setFormMode('login');
                  setRecoveredPassword(null);
                  setError(null);
                }}
                className="w-full text-center text-xs font-semibold text-[#94a3b8] hover:text-white cursor-pointer disabled:opacity-50"
              >
                &larr; Back to Login
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-3 py-4 sm:px-5">
      <div className="lm-card rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#183044] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-white">{demoUser}</h2>
              <span className="rounded-full bg-[#2cd4a3]/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#2cd4a3]">
                Signed In
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#8bb0ab]">
              Saved account details ({countryCfg.currency})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onOpenWallet}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#2cd4a3] px-4 py-2 text-xs font-extrabold text-[#051818] cursor-pointer"
            >
              <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
              Deposit / Withdraw
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSignOut}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#2a425b] bg-[#0c1828] px-4 py-2 text-xs font-bold text-[#cbd5e1] hover:text-white cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-[#1b354b] bg-[#0a1421] p-3.5">
            <p className="text-[11px] font-semibold text-[#8bb0ab]">Registered Phone Number</p>
            <p className="mt-1 font-mono text-sm font-bold text-white">{displayPhone}</p>
          </div>

          <div className="rounded-xl border border-[#1b354b] bg-[#0a1421] p-3.5">
            <p className="text-[11px] font-semibold text-[#8bb0ab]">Email Address</p>
            <p className="mt-1 truncate font-mono text-sm font-bold text-white">
              {registeredEmail || 'Not added'}
            </p>
          </div>

          <div className="rounded-xl border border-[#1b354b] bg-[#0a1421] p-3.5">
            <p className="text-[11px] font-semibold text-[#8bb0ab]">Country &amp; Currency</p>
            <div className="mt-1 flex items-center gap-2 text-sm font-bold text-white">
              <span>
                {country} ({countryCfg.currency})
              </span>
            </div>
          </div>
        </div>
      </div>

      <SettingsAndSupportView
        mode="settings"
        country={country}
        onSelectCountry={onSelectCountry}
        onResetDemo={onResetDemo}
      />
    </div>
  );
}
