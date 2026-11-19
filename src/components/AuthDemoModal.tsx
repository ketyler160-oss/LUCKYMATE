import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  Copy,
  Eye,
  EyeOff,
  Gift,
  KeyRound,
  Loader2,
  Mail,
  UserCheck,
  X,
} from 'lucide-react';
import {
  ApiError,
  guestLogin,
  loginUser,
  logoutUser,
  recoverAccountPassword,
  registerAccount,
} from '../lib/api';
import { COUNTRIES, COUNTRY_ORDER, getCountryConfig } from '../lib/countries';
import { AuthResponse, CountryOption, RegisterDirectResponse } from '../types';
import { CountryFlag } from './BrandVisuals';
import { ReferralRegistrationBanner } from './ReferralProgramCard';

interface AuthDemoModalProps {
  initialMode: 'login' | 'register';
  country: CountryOption;
  currentUser: string | null;
  promptNotice?: string | null;
  initialReferralCode?: string | null;
  referrerName?: string | null;
  onSelectCountry: (country: CountryOption) => void;
  onRegistered?: (reg: RegisterDirectResponse) => void;
  onAuthComplete: (auth: AuthResponse | null) => void;
  onClose: () => void;
}

const RECOVERY_LOAD_MS = 10_000;

async function copyTextSafely(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below for iframe contexts
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

export function AuthDemoModal({
  initialMode,
  country,
  currentUser,
  promptNotice,
  initialReferralCode,
  referrerName,
  onSelectCountry,
  onRegistered,
  onAuthComplete,
  onClose,
}: AuthDemoModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [referralInput, setReferralInput] = useState(() => (initialReferralCode || '').toUpperCase());

  useEffect(() => {
    const nextCode = (initialReferralCode || '').trim().toUpperCase();
    if (nextCode) {
      setReferralInput((prev) => (prev.trim() ? prev : nextCode));
    }
  }, [initialReferralCode]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerNotice, setRegisterNotice] = useState<string | null>(null);
  const [createdReferralCode, setCreatedReferralCode] = useState<string | null>(null);
  const [alreadyRegisteredConflict, setAlreadyRegisteredConflict] = useState(false);
  const [accountNotFoundConflict, setAccountNotFoundConflict] = useState(false);

  // Forgot Password 10-second recovery flow state
  const [forgotMode, setForgotMode] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [recoverSecondsLeft, setRecoverSecondsLeft] = useState(10);
  const [recoverProgress, setRecoverProgress] = useState(0);
  const [recoveredPassword, setRecoveredPassword] = useState<string | null>(null);
  const [copiedRecovered, setCopiedRecovered] = useState(false);
  const [recoveryNotice, setRecoveryNotice] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const openForgotPasswordMode = () => {
    stopRecoveryTimer();
    setForgotMode(true);
    setMode('login');
    setRecovering(false);
    setRecoverSecondsLeft(10);
    setRecoverProgress(0);
    setRecoveredPassword(null);
    setCopiedRecovered(false);
    setRecoveryNotice(null);
    setAlreadyRegisteredConflict(false);
    setAccountNotFoundConflict(false);
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  const exitForgotPasswordMode = (noticeMsg?: string) => {
    stopRecoveryTimer();
    setForgotMode(false);
    setMode('login');
    setRecovering(false);
    setRecoverSecondsLeft(10);
    setRecoverProgress(0);
    setRecoveredPassword(null);
    setCopiedRecovered(false);
    setError(null);
    setPassword('');
    setConfirmPassword('');
    if (noticeMsg) {
      setRecoveryNotice(noticeMsg);
    }
  };

  const handleCopyRecoveredPassword = async () => {
    if (!recoveredPassword) return;
    const ok = await copyTextSafely(recoveredPassword);
    if (ok) {
      setCopiedRecovered(true);
      window.setTimeout(() => setCopiedRecovered(false), 2500);
    }
  };

  const handleCopyAndGoToLogin = async () => {
    if (recoveredPassword) {
      await copyTextSafely(recoveredPassword);
    }
    exitForgotPasswordMode(
      'Previous password copied! Paste it into the Password field below and click Login.'
    );
  };

  const handleSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setAccountNotFoundConflict(false);

    if (forgotMode) {
      if (!phone.trim()) {
        setError('Enter your registered phone number.');
        return;
      }
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
        const res = await recoverAccountPassword({
          phone: phone.trim(),
          country,
        });
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
        if (err instanceof ApiError && err.accountNotFound) {
          setAccountNotFoundConflict(true);
        }
        setError(err instanceof Error ? err.message : 'Unable to recover password.');
      }
      return;
    }

    if (mode === 'login') {
      setSubmitting(true);
      setRecoveryNotice(null);
      try {
        const auth = await loginUser(phone.trim(), password, country);
        onAuthComplete(auth);
        onClose();
      } catch (err) {
        if (err instanceof ApiError && err.accountNotFound) {
          setAccountNotFoundConflict(true);
        }
        setError(err instanceof Error ? err.message : 'Login failed.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
      setError('Enter a valid email address or leave it blank.');
      return;
    }
    if (password.trim().length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password.trim() !== confirmPassword.trim()) {
      setError('Passwords do not match.');
      return;
    }
    if (!acceptedTerms) {
      setError('Please confirm that you agree to the Terms, Privacy policy, and are 18+.');
      return;
    }

    setSubmitting(true);
    setAlreadyRegisteredConflict(false);
    setRecoveryNotice(null);
    try {
      const regRes = await registerAccount({
        phone: phone.trim(),
        email: trimmedEmail || undefined,
        password: password.trim(),
        confirmPassword: confirmPassword.trim(),
        country,
        acceptedTerms,
        referralCode: referralInput.trim() || undefined,
      });
      onRegistered?.(regRes);
      if (regRes.phone) {
        setPhone(formatLocalPhoneForInput(regRes.phone, regRes.country || country));
      }
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setCreatedReferralCode(regRes.referralCode || null);
      setRegisterNotice('Account registered! Log in with your phone number and password.');
      setMode('login');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setAlreadyRegisteredConflict(true);
      }
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const auth = await guestLogin();
      onAuthComplete(auth);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start guest session.');
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
      onAuthComplete(null);
      onClose();
    }
  };

  const modalTitle = forgotMode
    ? 'Forgot Password'
    : mode === 'register'
    ? 'Register'
    : 'Login';

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={modalTitle}
    >
      <div className="lm-modal-pop flex min-h-screen w-full flex-col bg-[#121821] text-white sm:my-auto sm:min-h-0 sm:max-w-[430px] sm:rounded-2xl sm:border sm:border-[#243041] sm:shadow-2xl">
        {/* Top Navigation Bar: [<] [Register / Login / Forgot Password] [X] */}
        <div className="flex h-13 items-center justify-between border-b border-[#1d2736] px-4">
          <button
            type="button"
            onClick={forgotMode ? () => exitForgotPasswordMode() : onClose}
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-[#1c2534] cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <h2 className="text-sm font-bold tracking-tight text-white">{modalTitle}</h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-[#1c2534] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 px-5 py-5">
          {/* Written Brand Name */}
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center font-display text-lg font-black uppercase tracking-[0.06em] leading-none">
              <span className="text-[#f5c417]">LUCKY</span>
              <span className="text-white">MATE</span>
            </div>
          </div>

          {promptNotice && !forgotMode && (
            <div className="mt-3 rounded-lg border border-[#614e1a] bg-[#1b180b] px-3 py-2 text-xs text-[#f5c417]">
              {promptNotice}
            </div>
          )}

          {registerNotice && mode === 'login' && !forgotMode && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#2c4f31] bg-[#14251a] p-3 text-xs font-semibold text-[#98e02a]">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{registerNotice}</span>
            </div>
          )}

          {createdReferralCode && mode === 'login' && !forgotMode && (
            <ReferralRegistrationBanner referralCode={createdReferralCode} country={country} />
          )}

          {mode === 'register' && !forgotMode && referralInput.trim() && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#2d5a3b] bg-[#0e1f18] px-3 py-2.5 text-xs text-[#cbd5e1]">
              <Gift className="h-4 w-4 shrink-0 text-[#7bc114]" aria-hidden="true" />
              <span>
                {referrerName ? (
                  <>
                    Invited by <strong className="text-white">{referrerName}</strong> (
                    <span className="font-mono font-bold text-[#f5c417]">{referralInput.trim()}</span>
                    ) — deposit <strong className="text-[#f5c417]">$6.00 USD</strong> to trigger
                    their <strong className="text-[#98e02a]">$3.00 USD</strong> bonus.
                  </>
                ) : (
                  <>
                    Referral code{' '}
                    <span className="font-mono font-bold text-[#f5c417]">{referralInput.trim()}</span>{' '}
                    applied.
                  </>
                )}
              </span>
            </div>
          )}

          {recoveryNotice && mode === 'login' && !forgotMode && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#2c4f31] bg-[#14251a] p-3 text-xs font-semibold text-[#98e02a]">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{recoveryNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmitForm} className="mt-4 space-y-3.5">
            {/* Helper Copy */}
            <p className="text-xs leading-relaxed text-[#cbd5e1]">
              {forgotMode
                ? `Enter your registered ${countryCfg.label} (${countryCfg.dialCode}) phone number to recover your previous password.`
                : mode === 'register'
                ? `Register with your ${countryCfg.label} (${countryCfg.dialCode}) phone number and hidden password. Each phone number can only register once.`
                : `Enter your registered ${countryCfg.label} (${countryCfg.dialCode}) phone number and password below to log in.`}
            </p>

            {/* Login / Register Mode Switch */}
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#1a2330] p-1">
              <button
                type="button"
                disabled={recovering}
                onClick={() => {
                  stopRecoveryTimer();
                  setForgotMode(false);
                  setRecovering(false);
                  setRecoveredPassword(null);
                  setMode('register');
                  setRegisterNotice(null);
                  setRecoveryNotice(null);
                  setAlreadyRegisteredConflict(false);
                  setAccountNotFoundConflict(false);
                  setError(null);
                }}
                className={`min-h-[36px] rounded-md text-xs font-bold cursor-pointer disabled:opacity-50 ${
                  mode === 'register' && !forgotMode
                    ? 'bg-[#7bc114] text-[#0b1404]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Register
              </button>
              <button
                type="button"
                disabled={recovering}
                onClick={() => {
                  stopRecoveryTimer();
                  setForgotMode(false);
                  setRecovering(false);
                  setRecoveredPassword(null);
                  setMode('login');
                  setAlreadyRegisteredConflict(false);
                  setAccountNotFoundConflict(false);
                  setError(null);
                }}
                className={`min-h-[36px] rounded-md text-xs font-bold cursor-pointer disabled:opacity-50 ${
                  mode === 'login' && !forgotMode
                    ? 'bg-[#f5c417] text-[#111827]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Login
              </button>
            </div>

            {/* Country Selector: Flags + full country names shown strictly on Registration */}
            {mode === 'register' && !forgotMode ? (
              <div>
                <p className="block text-xs font-bold text-white">Country</p>
                <div
                  role="group"
                  aria-label="Choose your country for registration"
                  className="mt-1.5 grid grid-cols-3 gap-2"
                >
                  {COUNTRY_ORDER.map((c) => {
                    const item = COUNTRIES[c];
                    const active = c === country;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          onSelectCountry(c);
                          setError(null);
                        }}
                        aria-pressed={active}
                        className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-center transition-colors cursor-pointer ${
                          active
                            ? 'border-[#7bc114] bg-[#7bc114]/15 text-white'
                            : 'border-[#243041] bg-[#18212e] text-[#cbd5e1] hover:border-[#3b4d66] hover:text-white'
                        }`}
                      >
                        <CountryFlag country={c} className="h-4 w-6 rounded-[2px]" />
                        <span className="w-full truncate text-[11px] font-bold">{item.label}</span>
                        <span className="font-mono text-[10px] text-[#94a3b8]">{item.dialCode}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <p className="block text-xs font-bold text-white">Country Code</p>
                <div
                  role="group"
                  aria-label="Choose your country"
                  className="mt-1.5 grid grid-cols-3 gap-2"
                >
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
                        aria-pressed={active}
                        className={`rounded-lg border px-2 py-2 text-center text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                          active
                            ? 'border-[#f5c417] bg-[#f5c417]/15 text-white'
                            : 'border-[#243041] bg-[#18212e] text-[#94a3b8] hover:text-white'
                        }`}
                      >
                        <span className="block truncate">{item.label}</span>
                        <span className="font-mono text-[10px] text-[#94a3b8]">{item.dialCode}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Phone Number Input (Flag shown only during registration) */}
            <div>
              <label htmlFor="auth-phone" className="block text-xs font-bold text-white">
                Phone Number
              </label>
              <div className="mt-1.5 flex items-center overflow-hidden rounded-lg bg-[#2a3441] focus-within:ring-2 focus-within:ring-[#7bc114]">
                <div className="flex items-center gap-1.5 border-r border-[#3b4757] bg-[#222b37] px-3 py-3 text-xs font-bold text-white shrink-0">
                  {mode === 'register' && !forgotMode && (
                    <CountryFlag country={country} className="h-3.5 w-5 rounded-[2px]" />
                  )}
                  <span className="font-mono">{countryCfg.dialCode}</span>
                </div>
                <input
                  id="auth-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  disabled={recovering}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={countryCfg.phonePlaceholder}
                  className="min-h-[44px] w-full bg-transparent px-3 text-sm text-white placeholder:text-[#8c9aa9] focus:outline-none disabled:opacity-60"
                />
              </div>
              <p className="mt-1 text-[11px] text-[#94a3b8]">Enter your phone number</p>
            </div>

            {/* Forgot Password 10-Second Loader */}
            {forgotMode && recovering && (
              <div
                aria-live="polite"
                className="rounded-xl border border-[#f5c417]/40 bg-[#1a180d] p-4 space-y-3"
              >
                <div className="flex items-center gap-2.5">
                  <Loader2 className="h-5 w-5 animate-spin text-[#f5c417] shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
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

            {/* Recovered Previous Password Reveal Card */}
            {forgotMode && !recovering && recoveredPassword && (
              <div className="rounded-xl border border-[#2d5a3b] bg-[#0e1f18] p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#98e02a]">
                  <KeyRound className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Previous Password Found</span>
                </div>
                <p className="text-[11px] leading-snug text-[#cbd5e1]">
                  Copy your previous password below, then return to Login and paste it to sign in.
                </p>
                <div className="flex items-center justify-between gap-2 rounded-lg border border-[#244734] bg-[#08130f] px-3 py-2.5">
                  <span
                    data-testid="recovered-password-value"
                    className="select-all break-all font-mono text-sm font-extrabold tracking-wide text-white"
                  >
                    {recoveredPassword}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRecoveredPassword}
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
                  onClick={handleCopyAndGoToLogin}
                  className="min-h-[42px] w-full rounded-lg bg-[#f5c417] px-4 py-2 text-xs font-extrabold text-[#111827] hover:bg-[#fae07d] cursor-pointer"
                >
                  Copy Password &amp; Go to Login
                </button>
              </div>
            )}

            {/* Email Input (Register Mode) */}
            {mode === 'register' && !forgotMode && (
              <div>
                <label htmlFor="auth-email" className="block text-xs font-bold text-white">
                  Email Address <span className="font-normal text-[#94a3b8]">(optional)</span>
                </label>
                <div className="relative mt-1.5">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c9aa9]"
                    aria-hidden="true"
                  />
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="min-h-[44px] w-full rounded-lg bg-[#2a3441] pl-9 pr-3.5 text-sm text-white placeholder:text-[#8c9aa9] focus:outline-none focus:ring-2 focus:ring-[#7bc114]"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#94a3b8]">
                  Receive a registration confirmation email here
                </p>
              </div>
            )}

            {/* Password (Shown in Register & Login modes, hidden in Forgot Password mode) */}
            {!forgotMode && (
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={mode === 'register' ? 'auth-reg-password' : 'auth-login-password'}
                    className="block text-xs font-bold text-white"
                  >
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={openForgotPasswordMode}
                      className="text-[11px] font-semibold text-[#f5c417] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative mt-1.5">
                  <input
                    key={mode === 'register' ? 'reg-pass' : 'login-pass'}
                    id={mode === 'register' ? 'auth-reg-password' : 'auth-login-password'}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="min-h-[44px] w-full rounded-lg bg-[#2a3441] px-3.5 pr-10 text-sm text-white placeholder:text-[#8c9aa9] focus:outline-none focus:ring-2 focus:ring-[#7bc114]"
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
                <p className="mt-1 text-[11px] text-[#94a3b8]">Enter your password</p>
              </div>
            )}

            {/* Confirm Password (Register mode only) */}
            {mode === 'register' && !forgotMode && (
              <div>
                <label htmlFor="auth-confirm-password" className="block text-xs font-bold text-white">
                  Confirm Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="min-h-[44px] w-full rounded-lg bg-[#2a3441] px-3.5 pr-10 text-sm text-white placeholder:text-[#8c9aa9] focus:outline-none focus:ring-2 focus:ring-[#7bc114]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#94a3b8] hover:text-white cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-[#94a3b8]">Confirm your password</p>
              </div>
            )}

            {/* Optional Friend Referral Code (Register mode) */}
            {mode === 'register' && !forgotMode && (
              <div>
                <label htmlFor="auth-referral-code" className="block text-xs font-bold text-white">
                  Referral / Invite Code <span className="font-normal text-[#94a3b8]">(optional)</span>
                </label>
                <div className="relative mt-1.5">
                  <Gift
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c9aa9]"
                    aria-hidden="true"
                  />
                  <input
                    id="auth-referral-code"
                    type="text"
                    value={referralInput}
                    onChange={(e) =>
                      setReferralInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12))
                    }
                    placeholder="e.g. LM8K4P2X"
                    className="min-h-[42px] w-full rounded-lg bg-[#2a3441] pl-9 pr-3.5 font-mono text-sm uppercase tracking-wider text-white placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-[#8c9aa9] focus:outline-none focus:ring-2 focus:ring-[#7bc114]"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#94a3b8]">
                  You will also receive your own invite link after registration — earn $3 USD per
                  friend who deposits $6 USD (deposit $6 USD yourself to unlock bonuses into your
                  Real Balance).
                </p>
              </div>
            )}

            {/* 18+ Terms & Conditions Checkbox */}
            {mode === 'register' && !forgotMode && (
              <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border border-[#475569] bg-[#1e293b] accent-[#7bc114] cursor-pointer"
                />
                <span className="text-[11px] leading-snug text-[#cbd5e1]">
                  By clicking Register you confirm to have read in detail, understood and agreed to the{' '}
                  <span className="text-[#7bc114]">Terms and Conditions</span>, the{' '}
                  <span className="text-[#7bc114]">Privacy policy</span> and also that you are over
                  18 years of age.
                </span>
              </label>
            )}

            {error && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-[#f87171]">{error}</p>
                {alreadyRegisteredConflict && mode === 'register' && !forgotMode && (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setAlreadyRegisteredConflict(false);
                        setError(null);
                        setMode('login');
                      }}
                      className="text-xs font-bold text-[#f5c417] hover:underline cursor-pointer"
                    >
                      Switch to Login &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={openForgotPasswordMode}
                      className="text-xs font-bold text-[#98e02a] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
                {accountNotFoundConflict && (mode === 'login' || forgotMode) && (
                  <button
                    type="button"
                    onClick={() => {
                      stopRecoveryTimer();
                      setForgotMode(false);
                      setRecovering(false);
                      setAccountNotFoundConflict(false);
                      setError(null);
                      setMode('register');
                    }}
                    className="text-xs font-bold text-[#7bc114] hover:underline cursor-pointer"
                  >
                    Register this phone number &rarr;
                  </button>
                )}
              </div>
            )}

            {/* Primary Action Button */}
            {(!forgotMode || !recoveredPassword) && (
              <button
                type="submit"
                disabled={submitting || recovering}
                className={`min-h-[46px] w-full rounded-lg px-4 py-2.5 text-sm font-extrabold transition-colors cursor-pointer disabled:opacity-60 ${
                  mode === 'register' && !forgotMode
                    ? 'bg-[#7bc114] text-[#0b1404] hover:bg-[#8cd61e]'
                    : 'bg-[#f5c417] text-[#111827] hover:bg-[#fae07d]'
                }`}
              >
                {forgotMode
                  ? recovering
                    ? `Loading Previous Password (${recoverSecondsLeft}s)...`
                    : 'Show Previous Password'
                  : submitting
                  ? mode === 'register'
                    ? 'Registering...'
                    : 'Signing In...'
                  : mode === 'register'
                  ? 'Register'
                  : 'Login to Luckymate'}
              </button>
            )}

            {forgotMode && (
              <button
                type="button"
                disabled={recovering}
                onClick={() => exitForgotPasswordMode()}
                className="w-full text-center text-xs font-semibold text-[#94a3b8] hover:text-white cursor-pointer disabled:opacity-50"
              >
                &larr; Back to Login
              </button>
            )}

            <div className="border-t border-[#1d2736] pt-3 space-y-2">
              <button
                type="button"
                disabled={submitting || recovering}
                onClick={handleGuest}
                className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg border border-[#2b3749] bg-[#18212e] px-4 py-2 text-xs font-bold text-[#7bc114] hover:border-[#7bc114] cursor-pointer disabled:opacity-50"
              >
                <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Play Demo as Guest
              </button>

              {currentUser && (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="min-h-[38px] w-full rounded-lg border border-[#243041] bg-[#0e141d] px-4 py-2 text-xs font-semibold text-[#94a3b8] hover:text-white cursor-pointer"
                >
                  Sign Out
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
