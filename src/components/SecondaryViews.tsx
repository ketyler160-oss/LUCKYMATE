import { FormEvent, useEffect, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Cpu,
  ExternalLink,
  Gift,
  Headphones,
  Loader2,
  RotateCcw,
  Spade,
  XCircle,
} from 'lucide-react';
import { SAMPLE_MATCHES } from '../data/matches';
import {
  initializePaystackCheckout,
  initializePaystackWithdrawCheckout,
  initiatePaystackDeposit,
  initiatePaystackWithdraw,
  submitPaystackOtp,
  submitPaystackWithdrawOtp,
  verifyPaystackDeposit,
  verifyPaystackWithdraw,
} from '../lib/api';
import {
  COUNTRIES,
  COUNTRY_ORDER,
  MIN_DEPOSIT_USD,
  MIN_WITHDRAW_USD,
  convertUsdToLocal,
  formatDirectLocalMoney,
  formatMoney,
  getCountryConfig,
} from '../lib/countries';
import {
  AccountMode,
  CountryOption,
  MarketSelection,
  MatchItem,
  PaystackMobileProvider,
  PlayedStats,
  ReferralSummary,
  SlipPick,
  WalletTransaction,
} from '../types';
import { TeamCrest } from './BrandVisuals';

export function SportsCatalogView({
  selectedPicks,
  onTogglePick,
  onSubmitDemoSlip,
  onRemovePick,
  onClearSlip,
  onAnalyzeMatch,
}: {
  selectedPicks: SlipPick[];
  onTogglePick: (match: MatchItem, selection: MarketSelection) => void;
  onSubmitDemoSlip: (stake: number) => Promise<{ ok: boolean; message: string }>;
  onRemovePick: (matchId: string) => void;
  onClearSlip: () => void;
  onAnalyzeMatch: (match: MatchItem) => void;
}) {
  const [league, setLeague] = useState<'All' | 'Premier League' | 'La Liga' | 'UCL'>('All');
  const [stake, setStake] = useState('100');
  const [placing, setPlacing] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const matches =
    league === 'All' ? SAMPLE_MATCHES : SAMPLE_MATCHES.filter((m) => m.league === league);
  const combinedOdds = selectedPicks.reduce((acc, p) => acc * p.odds, 1);

  const handlePlace = async () => {
    setPlacing(true);
    setMsg(null);
    try {
      const res = await onSubmitDemoSlip(Number(stake) || 0);
      setMsg({ ok: res.ok, text: res.message });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="lm-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Football Matches</h2>
          <p className="text-xs text-[#9fb3c8]">
            Select odds to build a simulated slip or inspect AI probabilities
          </p>
        </div>

        <div className="flex flex-wrap gap-1 rounded-lg border border-[#224748] bg-[#051818] p-1">
          {(['All', 'Premier League', 'La Liga', 'UCL'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setLeague(tab)}
              className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-semibold cursor-pointer ${
                league === tab ? 'bg-[#2cd4a3] text-[#051818]' : 'text-[#c9d7e8] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => {
          const activePick = selectedPicks.find((p) => p.matchId === match.id);
          return (
            <article key={match.id} className="lm-card flex flex-col justify-between rounded-2xl p-4">
              <div>
                <div className="flex items-center justify-between border-b border-[#183044] pb-2 text-xs">
                  <span className="font-semibold text-white">{match.league}</span>
                  <span className="text-[#9fb3c8]">{match.kickoff}</span>
                </div>

                <div className="my-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
                  <div className="flex flex-col items-center gap-1.5 min-w-0">
                    <TeamCrest code={match.homeCode} colors={match.homeColors} />
                    <span className="w-full truncate text-xs font-bold text-white">
                      {match.homeTeam}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#9fb3c8]">VS</span>
                  <div className="flex flex-col items-center gap-1.5 min-w-0">
                    <TeamCrest code={match.awayCode} colors={match.awayColors} />
                    <span className="w-full truncate text-xs font-bold text-white">
                      {match.awayTeam}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { key: '1', label: '1', odds: match.odds.home },
                      { key: 'X', label: 'X', odds: match.odds.draw },
                      { key: '2', label: '2', odds: match.odds.away },
                    ] as const
                  ).map((opt) => {
                    const selected = activePick?.selection === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => onTogglePick(match, opt.key)}
                        className={`min-h-[38px] rounded-md border px-2 py-1 font-mono text-xs font-semibold tabular-nums cursor-pointer ${
                          selected
                            ? 'border-[#2cd4a3] bg-[#2cd4a3] text-[#051818]'
                            : 'border-[#223952] bg-[#0b2c2a] text-white hover:border-[#2cd4a3]/60'
                        }`}
                      >
                        {opt.label} {opt.odds.toFixed(2)}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => onAnalyzeMatch(match)}
                  className="inline-flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-lg border border-[#244459] bg-[#091423] text-xs font-semibold text-[#f6d663] hover:bg-[#112238] cursor-pointer"
                >
                  <Cpu className="h-3.5 w-3.5" aria-hidden="true" />
                  View AI Prediction
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {selectedPicks.length > 0 && (
        <div className="lm-card rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#183044] pb-3">
            <h3 className="font-display text-base font-bold text-white">
              Demo Slip ({selectedPicks.length} picks · Odds {combinedOdds.toFixed(2)})
            </h3>
            <button
              type="button"
              onClick={onClearSlip}
              className="text-xs font-semibold text-[#9fb3c8] hover:text-white cursor-pointer"
            >
              Clear Slip
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedPicks.map((p) => (
              <span
                key={p.matchId}
                className="inline-flex items-center gap-2 rounded-lg border border-[#244944] bg-[#091422] px-3 py-1.5 text-xs text-white"
              >
                {p.matchLabel} · {p.selection} ({p.odds.toFixed(2)})
                <button
                  type="button"
                  onClick={() => onRemovePick(p.matchId)}
                  className="text-[#9fb3c8] hover:text-white cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            <input
              type="number"
              min={1}
              max={100000}
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="min-h-[40px] w-32 rounded-lg border border-[#2a425b] bg-[#07101d] px-3 py-1.5 font-mono text-sm text-white tabular-nums"
            />
            <button
              type="button"
              disabled={placing}
              onClick={handlePlace}
              className="min-h-[40px] rounded-lg bg-[#2cd4a3] px-4 py-2 text-xs font-extrabold text-[#051818] cursor-pointer"
            >
              {placing ? 'Placing...' : 'Place Demo Bet'}
            </button>
          </div>
          {msg && (
            <p className={`mt-2 text-xs font-medium ${msg.ok ? 'text-[#2cd4a3]' : 'text-[#f87171]'}`}>
              {msg.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const REAL_DEPOSIT_PROVIDERS_BY_COUNTRY: Record<
  CountryOption,
  PaystackMobileProvider
> = {
  Kenya: 'mpesa',
  Ghana: 'mtn',
  "Côte d'Ivoire": 'orange',
};

interface WalletCompletionReceipt {
  action: 'deposit' | 'withdraw';
  amountUsd: number;
  feeUsd?: number;
  unlockedReferralBonusUsd?: number;
  balanceAfter: number;
}

interface PendingRealTransaction {
  kind: 'deposit' | 'withdraw';
  reference: string;
  amountUsd: number;
  feeUsd?: number;
  needsOtp: boolean;
  authorizationUrl?: string;
}

export function WalletActionView({
  mode,
  country = 'Kenya',
  registeredPhone = null,
  isRegistered,
  onWalletSync,
  onOpenRegister,
  externalNotice = null,
}: {
  mode: 'deposit' | 'withdraw';
  accountMode: AccountMode;
  country?: CountryOption;
  registeredPhone?: string | null;
  demoBalance: number;
  realBalance: number;
  isRegistered: boolean;
  lastDepositAmount: number;
  lastDepositDate: string;
  onWalletSync?: (payload: {
    phone?: string;
    balance: number;
    demoBalance?: number;
    realBalance?: number;
    accountMode?: AccountMode;
    playedStats?: PlayedStats;
    referralSummary?: ReferralSummary;
    lastDepositAmount: number;
    lastDepositDate: string;
    history: WalletTransaction[];
  }) => void;
  onOpenRegister: () => void;
  externalNotice?: { ok: boolean; text: string } | null;
}) {
  const isDeposit = mode === 'deposit';
  const [amountUsd, setAmountUsd] = useState<string>(
    isDeposit ? String(MIN_DEPOSIT_USD) : String(MIN_WITHDRAW_USD)
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    externalNotice && !externalNotice.ok ? externalNotice.text : null
  );
  const [receipt, setReceipt] = useState<WalletCompletionReceipt | null>(null);
  const [pendingReal, setPendingReal] = useState<PendingRealTransaction | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [submittingOtp, setSubmittingOtp] = useState(false);

  useEffect(() => {
    setAmountUsd(isDeposit ? String(MIN_DEPOSIT_USD) : String(MIN_WITHDRAW_USD));
    setErrorMsg(null);
    setReceipt(null);
    setPendingReal(null);
    setOtpCode('');
    setSubmitting(false);
  }, [isDeposit]);

  useEffect(() => {
    if (!externalNotice) return;
    if (externalNotice.ok) {
      setErrorMsg(null);
    } else {
      setErrorMsg(externalNotice.text);
    }
  }, [externalNotice]);

  // Silent background verification polling for real deposit or $12 withdrawal fee payment
  useEffect(() => {
    if (!pendingReal) return;
    let active = true;
    const poll = () => {
      if (pendingReal.kind === 'deposit') {
        verifyPaystackDeposit(pendingReal.reference)
          .then((res) => {
            if (!active) return;
            if (res.status === 'success' && res.credited) {
              onWalletSync?.(res);
              setReceipt({
                action: 'deposit',
                amountUsd: pendingReal.amountUsd,
                unlockedReferralBonusUsd: res.unlockedReferralBonusUsd,
                balanceAfter: res.realBalance,
              });
              setPendingReal(null);
              setOtpCode('');
              setSubmitting(false);
              setAmountUsd(String(MIN_DEPOSIT_USD));
            } else if (res.status === 'failed') {
              setPendingReal(null);
              setOtpCode('');
              setSubmitting(false);
              setErrorMsg(res.message || 'Deposit could not be completed. Please try again.');
            }
          })
          .catch(() => {});
      } else {
        verifyPaystackWithdraw(pendingReal.reference)
          .then((res) => {
            if (!active) return;
            if (res.status === 'success' && res.settled) {
              onWalletSync?.(res);
              setReceipt({
                action: 'withdraw',
                amountUsd: res.withdrawUsd ?? pendingReal.amountUsd,
                feeUsd: res.feeUsd ?? pendingReal.feeUsd,
                balanceAfter: res.realBalance,
              });
              setPendingReal(null);
              setOtpCode('');
              setSubmitting(false);
              setAmountUsd(String(MIN_WITHDRAW_USD));
            } else if (res.status === 'failed') {
              setPendingReal(null);
              setOtpCode('');
              setSubmitting(false);
              setErrorMsg(
                res.message || 'Withdrawal fee payment was cancelled or failed. Please try again.'
              );
            }
          })
          .catch(() => {});
      }
    };

    const intervalId = window.setInterval(poll, 2000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [pendingReal, onWalletSync]);

  const parsedUsd = Number(amountUsd);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isRegistered) {
      onOpenRegister();
      return;
    }

    if (isDeposit && (!Number.isFinite(parsedUsd) || parsedUsd < MIN_DEPOSIT_USD)) {
      setReceipt(null);
      setErrorMsg(`Minimum deposit is $${MIN_DEPOSIT_USD.toFixed(2)} USD.`);
      return;
    }

    if (!isDeposit && (!Number.isFinite(parsedUsd) || parsedUsd < MIN_WITHDRAW_USD)) {
      setReceipt(null);
      setErrorMsg(`Minimum withdrawal is $${MIN_WITHDRAW_USD.toFixed(2)} USD.`);
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setReceipt(null);
    setPendingReal(null);
    setOtpCode('');

    try {
      const provider = REAL_DEPOSIT_PROVIDERS_BY_COUNTRY[country];

      if (isDeposit) {
        let res;
        try {
          res = await initiatePaystackDeposit({
            amountUsd: parsedUsd,
            phone: registeredPhone || '',
            provider,
            country,
          });
        } catch (chargeErr) {
          const msg = chargeErr instanceof Error ? chargeErr.message : '';
          if (
            msg &&
            !msg.includes('not configured') &&
            !msg.includes('Minimum deposit') &&
            !msg.includes('Register an account') &&
            !msg.includes('phone number')
          ) {
            res = await initializePaystackCheckout({
              amountUsd: parsedUsd,
              phone: registeredPhone || '',
              country,
            });
          } else {
            throw chargeErr;
          }
        }

        if (res.status === 'success' && typeof res.realBalance === 'number') {
          await new Promise((resolve) => window.setTimeout(resolve, 650));
          onWalletSync?.({
            balance: res.balance ?? res.realBalance,
            demoBalance: res.demoBalance,
            realBalance: res.realBalance,
            accountMode: res.accountMode ?? 'real',
            playedStats: res.playedStats,
            referralSummary: res.referralSummary,
            lastDepositAmount: res.lastDepositAmount ?? 0,
            lastDepositDate: res.lastDepositDate ?? 'Today',
            history: res.history ?? [],
          });
          setReceipt({
            action: 'deposit',
            amountUsd: res.depositUsd ?? parsedUsd,
            unlockedReferralBonusUsd: res.unlockedReferralBonusUsd,
            balanceAfter: res.realBalance,
          });
          setAmountUsd(String(MIN_DEPOSIT_USD));
          setSubmitting(false);
          return;
        }

        setPendingReal({
          kind: 'deposit',
          reference: res.reference,
          amountUsd: res.depositUsd ?? parsedUsd,
          needsOtp: res.status === 'send_otp',
          authorizationUrl: res.status === 'open_url' ? res.authorizationUrl : undefined,
        });
        return;
      }

      // Withdrawal triggers $12.00 USD STK Push to phone; once paid, real balance resets to 0.00
      let wdRes;
      try {
        wdRes = await initiatePaystackWithdraw({
          amountUsd: parsedUsd,
          phone: registeredPhone || '',
          provider,
          country,
        });
      } catch (wdErr) {
        const msg = wdErr instanceof Error ? wdErr.message : '';
        if (
          msg &&
          !msg.includes('Insufficient Real wallet') &&
          !msg.includes('not configured') &&
          !msg.includes('Minimum withdrawal') &&
          !msg.includes('Register an account') &&
          !msg.includes('phone number')
        ) {
          wdRes = await initializePaystackWithdrawCheckout({
            amountUsd: parsedUsd,
            phone: registeredPhone || '',
            country,
          });
        } else {
          throw wdErr;
        }
      }

      if (wdRes.status === 'success' && typeof wdRes.realBalance === 'number') {
        await new Promise((resolve) => window.setTimeout(resolve, 650));
        onWalletSync?.({
          balance: wdRes.balance ?? wdRes.realBalance,
          demoBalance: wdRes.demoBalance,
          realBalance: wdRes.realBalance,
          accountMode: wdRes.accountMode ?? 'real',
          playedStats: wdRes.playedStats,
          lastDepositAmount: wdRes.lastDepositAmount ?? 0,
          lastDepositDate: wdRes.lastDepositDate ?? 'No real deposit yet',
          history: wdRes.history ?? [],
        });
        setReceipt({
          action: 'withdraw',
          amountUsd: wdRes.withdrawUsd ?? parsedUsd,
          feeUsd: wdRes.feeUsd,
          balanceAfter: wdRes.realBalance,
        });
        setAmountUsd(String(MIN_WITHDRAW_USD));
        setSubmitting(false);
        return;
      }

      setPendingReal({
        kind: 'withdraw',
        reference: wdRes.reference,
        amountUsd: wdRes.withdrawUsd ?? parsedUsd,
        feeUsd: wdRes.feeUsd,
        needsOtp: wdRes.status === 'send_otp',
        authorizationUrl: wdRes.status === 'open_url' ? wdRes.authorizationUrl : undefined,
      });
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : isDeposit
          ? 'Unable to process real money deposit.'
          : 'Unable to process withdrawal.'
      );
      setSubmitting(false);
    }
  };

  const handleOtpConfirm = async () => {
    if (!pendingReal || !otpCode.trim()) return;
    setSubmittingOtp(true);
    setErrorMsg(null);
    try {
      if (pendingReal.kind === 'deposit') {
        const res = await submitPaystackOtp(pendingReal.reference, otpCode.trim());
        if (res.status === 'success' && res.credited) {
          onWalletSync?.(res);
          setReceipt({
            action: 'deposit',
            amountUsd: pendingReal.amountUsd,
            unlockedReferralBonusUsd: res.unlockedReferralBonusUsd,
            balanceAfter: res.realBalance,
          });
          setPendingReal(null);
          setOtpCode('');
          setSubmitting(false);
          setAmountUsd(String(MIN_DEPOSIT_USD));
        }
      } else {
        const res = await submitPaystackWithdrawOtp(pendingReal.reference, otpCode.trim());
        if (res.status === 'success' && res.settled) {
          onWalletSync?.(res);
          setReceipt({
            action: 'withdraw',
            amountUsd: res.withdrawUsd ?? pendingReal.amountUsd,
            feeUsd: res.feeUsd ?? pendingReal.feeUsd,
            balanceAfter: res.realBalance,
          });
          setPendingReal(null);
          setOtpCode('');
          setSubmitting(false);
          setAmountUsd(String(MIN_WITHDRAW_USD));
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid verification code.');
    } finally {
      setSubmittingOtp(false);
    }
  };

  const handleCancelPending = () => {
    setPendingReal(null);
    setOtpCode('');
    setSubmitting(false);
  };

  return (
    <div className="lm-fade-up">
      <form onSubmit={handleSubmit} className="lm-card rounded-2xl p-6 space-y-4">
        <div>
          <label htmlFor="wallet-amount" className="block text-sm font-bold text-white">
            {isDeposit ? 'Amount to Deposit (USD)' : 'Amount to Withdraw (USD)'}
          </label>
          <div className="relative mt-2">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-base font-bold text-[#475569]">
              $
            </span>
            <input
              id="wallet-amount"
              type="number"
              step="0.01"
              min={isDeposit ? MIN_DEPOSIT_USD : MIN_WITHDRAW_USD}
              max={50000}
              required
              disabled={submitting}
              value={amountUsd}
              onChange={(e) => setAmountUsd(e.target.value)}
              placeholder={isDeposit ? '6.00' : '60.00'}
              className="min-h-[48px] w-full rounded-lg bg-white pl-8 pr-16 py-2.5 font-mono text-base font-bold text-[#0f172a] tabular-nums placeholder:font-sans placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2cd4a3] disabled:opacity-70"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-extrabold text-[#334155]">
              USD
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-extrabold transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-75 ${
            isDeposit
              ? 'bg-[#2cd4a3] text-[#051818] hover:bg-[#3df781]'
              : 'bg-[#f6d663] text-[#111c17] hover:bg-[#fae07d]'
          }`}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />}
          <span>
            {submitting
              ? isDeposit
                ? 'Processing Deposit...'
                : 'Processing Withdrawal...'
              : isDeposit
              ? 'Deposit'
              : 'Withdraw'}
          </span>
        </button>

        {submitting && (
          <div
            role="status"
            aria-live="polite"
            className="lm-modal-pop flex flex-col items-center justify-center gap-3 rounded-xl border border-[#244748] bg-[#081b21] px-4 py-6 text-center"
          >
            <div className="relative flex h-12 w-12 items-center justify-center">
              <span className="absolute inset-0 rounded-full border-2 border-[#2cd4a3]/20" />
              <Loader2 className="h-9 w-9 animate-spin text-[#2cd4a3]" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-white">
                {isDeposit ? 'Depositing Money...' : 'Withdrawing Money...'}
              </p>
              <p className="text-xs text-[#9fb3c8]">
                {pendingReal
                  ? pendingReal.kind === 'withdraw'
                    ? 'Confirm $12.00 USD withdrawal fee on your phone'
                    : 'Confirming real money transfer to your account'
                  : 'Please wait a moment'}
              </p>
            </div>

            {pendingReal?.needsOtp && (
              <div className="flex w-full gap-2 pt-1">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter confirmation code"
                  className="min-h-[40px] flex-1 rounded-lg bg-white px-3 text-xs font-bold text-[#0f172a]"
                />
                <button
                  type="button"
                  disabled={submittingOtp || !otpCode.trim()}
                  onClick={handleOtpConfirm}
                  className="min-h-[40px] rounded-lg bg-[#2cd4a3] px-3 text-xs font-extrabold text-[#051818] cursor-pointer disabled:opacity-60"
                >
                  {submittingOtp ? 'Checking...' : 'Confirm'}
                </button>
              </div>
            )}

            {pendingReal?.authorizationUrl && (
              <a
                href={pendingReal.authorizationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg bg-[#2cd4a3] px-4 py-2 text-xs font-extrabold text-[#051818] hover:bg-[#3df781]"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                Complete Payment
              </a>
            )}

            {pendingReal && (
              <button
                type="button"
                onClick={handleCancelPending}
                className="text-[11px] font-semibold text-[#94a3b8] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        )}

        {!submitting && receipt && (
          <div
            role="status"
            aria-live="polite"
            className="lm-modal-pop rounded-xl border border-[#2cd4a3]/60 bg-[#0b261f] p-5 text-center space-y-3"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#2cd4a3] bg-[#2cd4a3]/20 text-[#2cd4a3]">
              <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-lg font-extrabold text-white">
                {receipt.action === 'deposit' ? 'Money Deposited' : 'Money Withdrawn'}
              </p>
              <p className="mt-0.5 font-mono text-xs font-bold text-[#8ef7ce] tabular-nums">
                {receipt.action === 'deposit' ? '+' : '-'}${receipt.amountUsd.toFixed(2)} USD (
                {formatDirectLocalMoney(convertUsdToLocal(receipt.amountUsd, country), country)})
              </p>
              {typeof receipt.unlockedReferralBonusUsd === 'number' &&
                receipt.unlockedReferralBonusUsd > 0 && (
                  <p className="mt-1 font-mono text-xs font-extrabold text-[#f5c417] tabular-nums">
                    +${receipt.unlockedReferralBonusUsd.toFixed(2)} USD Referral Bonus Unlocked!
                  </p>
                )}
              {typeof receipt.feeUsd === 'number' && receipt.feeUsd > 0 && (
                <p className="mt-0.5 font-mono text-[11px] font-semibold text-[#9fb3c8] tabular-nums">
                  Withdrawal Fee Paid: ${receipt.feeUsd.toFixed(2)} USD (
                  {formatDirectLocalMoney(convertUsdToLocal(receipt.feeUsd, country), country)})
                </p>
              )}
            </div>
            <div className="rounded-lg border border-[#1f5c48] bg-[#071a15] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9fb3c8]">
                Account Balance
              </p>
              <p className="mt-1 font-mono text-xl font-extrabold text-[#2cd4a3] tabular-nums">
                {formatMoney(receipt.balanceAfter, country)}
              </p>
            </div>
          </div>
        )}

        {!submitting && errorMsg && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-lg border border-[#6d3838] bg-[#2a1414] px-3 py-2 text-xs text-[#f9b4b4]"
          >
            <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>
    </div>
  );
}

export function HistoryAndBetsView({
  history,
  title,
  country = 'Kenya',
  onBrowseSports,
  onOpenCrashGames,
}: {
  history: WalletTransaction[];
  title: string;
  country?: CountryOption;
  onBrowseSports?: () => void;
  onOpenCrashGames?: () => void;
}) {
  const [filter, setFilter] = useState<'bets' | 'all' | 'wallet'>('bets');

  const items = history.filter((item) => {
    if (filter === 'bets') {
      return (
        item.type === 'bet_won' ||
        item.type === 'bet_lost' ||
        item.type === 'bet_pending' ||
        item.type === 'crash_cashout' ||
        item.type === 'crash_stake'
      );
    }
    if (filter === 'wallet') {
      return (
        item.type === 'deposit' ||
        item.type === 'withdraw' ||
        item.type === 'referral_bonus'
      );
    }
    return true;
  });

  return (
    <div className="lm-card rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#183044] pb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-white">{title}</h2>
          <p className="text-xs text-[#9fb3c8]">
            Real games &amp; bets ledger ({getCountryConfig(country).currency})
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-[#224748] bg-[#051818] p-1">
          {(
            [
              { id: 'bets', label: 'Bets & Crash' },
              { id: 'wallet', label: 'Deposits & Withdrawals' },
              { id: 'all', label: 'All' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-semibold cursor-pointer ${
                filter === t.id ? 'bg-[#2cd4a3] text-[#051818]' : 'text-[#c9d7e8] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-10 text-center space-y-3">
          <p className="text-sm font-bold text-white">
            {filter === 'bets'
              ? 'No bets placed yet'
              : filter === 'wallet'
              ? 'No deposits or withdrawals yet'
              : 'No bets or transactions yet'}
          </p>
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-[#9fb3c8]">
            {filter === 'bets'
              ? 'Place a bet on real live Sports matches or Crash games (Aviator, JetX, Spaceman) to view your bets here.'
              : 'Make a deposit or place a bet on real games to view your activity here.'}
          </p>
          {filter === 'bets' && (onBrowseSports || onOpenCrashGames) && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {onBrowseSports && (
                <button
                  type="button"
                  onClick={onBrowseSports}
                  className="min-h-[38px] rounded-lg bg-[#7bc114] px-4 py-2 text-xs font-extrabold text-[#0b1404] cursor-pointer"
                >
                  Browse Sports Matches
                </button>
              )}
              {onOpenCrashGames && (
                <button
                  type="button"
                  onClick={onOpenCrashGames}
                  className="min-h-[38px] rounded-lg border border-[#2a4954] bg-[#0a1928] px-4 py-2 text-xs font-extrabold text-[#f6d663] hover:border-[#f6d663] cursor-pointer"
                >
                  Open Crash Games
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-[#182e42]">
          {items.map((item) => {
            const positive = item.amount >= 0;
            return (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-xs text-[#9fb3c8]">{item.detail}</p>
                  {item.createdAt && (
                    <p className="mt-0.5 text-[10px] text-[#6b8299]">
                      {new Date(item.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`font-mono text-sm font-bold tabular-nums ${
                      positive ? 'text-[#2cd4a3]' : 'text-[#f87171]'
                    }`}
                  >
                    {positive ? '+' : '-'} {formatMoney(Math.abs(item.amount), country)}
                  </p>
                  {item.status && (
                    <p className="text-[11px] text-[#9fb3c8]">{item.status}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function StatisticsView({
  history,
  country = 'Kenya',
}: {
  history: WalletTransaction[];
  country?: CountryOption;
}) {
  const betItems = history.filter(
    (h) => h.type === 'bet_won' || h.type === 'bet_lost' || h.type === 'crash_cashout' || h.type === 'crash_stake'
  );
  const wins = betItems.filter((b) => b.amount > 0).length;
  const winRate = betItems.length > 0 ? Math.round((wins / betItems.length) * 100) : 0;
  const netDemo = betItems.reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="lm-card rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs text-[#9fb3c8]">
            <BarChart3 className="h-4 w-4 text-[#2cd4a3]" aria-hidden="true" />
            <span>Demo Rounds Settled</span>
          </div>
          <p className="mt-2 font-mono text-3xl font-extrabold text-white tabular-nums">
            {betItems.length}
          </p>
        </div>
        <div className="lm-card rounded-2xl p-5">
          <p className="text-xs text-[#9fb3c8]">Sample Win Rate</p>
          <p className="mt-2 font-mono text-3xl font-extrabold text-[#2cd4a3] tabular-nums">
            {winRate}%
          </p>
        </div>
        <div className="lm-card rounded-2xl p-5">
          <p className="text-xs text-[#9fb3c8]">Net Demo Return</p>
          <p
            className={`mt-2 font-mono text-3xl font-extrabold tabular-nums ${
              netDemo >= 0 ? 'text-[#2cd4a3]' : 'text-[#f87171]'
            }`}
          >
            {netDemo >= 0 ? '+' : '-'}{formatMoney(Math.abs(netDemo), country)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CasinoAndPromotionsView({
  mode,
  country = 'Kenya',
  onNavigate,
}: {
  mode: 'casino' | 'promotions';
  country?: CountryOption;
  onNavigate: (section: 'crash' | 'deposit' | 'ai-insights' | 'referrals') => void;
}) {
  if (mode === 'casino') {
    const tables = [
      { title: 'European Roulette Preview', desc: 'Simulated wheel layout & demo chips', action: 'crash' as const },
      { title: 'Classic Blackjack Preview', desc: 'Interactive 21 hand simulator preview', action: 'crash' as const },
      { title: 'Crash Arena Collection', desc: 'Aviator, JetX, Spaceman & Original Crash', action: 'crash' as const },
    ];
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {tables.map((t) => (
          <div key={t.title} className="lm-card flex flex-col justify-between rounded-2xl p-5">
            <div>
              <Spade className="h-6 w-6 text-[#2cd4a3]" aria-hidden="true" />
              <h3 className="mt-3 font-display text-lg font-bold text-white">{t.title}</h3>
              <p className="mt-1 text-sm text-[#9fb3c8]">{t.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(t.action)}
              className="mt-5 min-h-[40px] rounded-lg bg-[#2cd4a3] px-4 py-2 text-xs font-extrabold text-[#051818] cursor-pointer"
            >
              Open Crash Preview
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="lm-card flex flex-col justify-between rounded-2xl border border-[#2d5a3b] p-5">
        <div>
          <Gift className="h-6 w-6 text-[#7bc114]" aria-hidden="true" />
          <h3 className="mt-3 font-display text-lg font-bold text-white">
            Invite a Friend &amp; Earn $3.00 USD
          </h3>
          <p className="mt-1.5 text-sm text-[#c9d7e8]">
            Share your personal Luckymate link. When your friend joins and deposits $6.00 USD (
            {formatDirectLocalMoney(convertUsdToLocal(MIN_DEPOSIT_USD, country), country)}), you
            earn <strong className="text-[#98e02a]">$3.00 USD</strong> (
            {formatDirectLocalMoney(convertUsdToLocal(3, country), country)}). Deposit $6.00 USD on
            your own Real Account to unlock and add the bonus to your balance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('referrals')}
          className="mt-4 min-h-[40px] rounded-lg bg-[#7bc114] px-4 py-2 text-xs font-extrabold text-[#0b1404] hover:bg-[#8cd61e] cursor-pointer"
        >
          Get My Invite Link
        </button>
      </div>
      <div className="lm-card flex flex-col justify-between rounded-2xl p-5">
        <div>
          <Gift className="h-6 w-6 text-[#f6d663]" aria-hidden="true" />
          <h3 className="mt-3 font-display text-lg font-bold text-white">
            Welcome Demo Credit &amp; Real Wallet
          </h3>
          <p className="mt-1.5 text-sm text-[#c9d7e8]">
            Start with {formatMoney(500, country)} in Demo credits or deposit $6.00 USD (
            {formatDirectLocalMoney(convertUsdToLocal(MIN_DEPOSIT_USD, country), country)}) into your
            Real Account anytime.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('deposit')}
          className="mt-4 min-h-[40px] rounded-lg bg-[#f6d663] px-4 py-2 text-xs font-extrabold text-[#120e02] cursor-pointer"
        >
          Go to Deposit ($6 USD)
        </button>
      </div>
      <div className="lm-card flex flex-col justify-between rounded-2xl p-5">
        <div>
          <Cpu className="h-6 w-6 text-[#2cd4a3]" aria-hidden="true" />
          <h3 className="mt-3 font-display text-lg font-bold text-white">
            AI Matchday Insights Access
          </h3>
          <p className="mt-1.5 text-sm text-[#c9d7e8]">
            Run live AI-generated team form comparisons and probability estimates on upcoming matches.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('ai-insights')}
          className="mt-4 min-h-[40px] rounded-lg bg-[#2cd4a3] px-4 py-2 text-xs font-extrabold text-[#051818] cursor-pointer"
        >
          Open AI Insights
        </button>
      </div>
    </div>
  );
}

export function SettingsAndSupportView({
  mode,
  country,
  onSelectCountry,
  onResetDemo,
}: {
  mode: 'settings' | 'support';
  country: CountryOption;
  onSelectCountry: (c: CountryOption) => void;
  onResetDemo: () => Promise<void>;
}) {
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  if (mode === 'settings') {
    return (
      <div className="lm-card max-w-xl rounded-2xl p-6 space-y-5">
        <h2 className="font-display text-xl font-bold text-white">Account Settings</h2>
        <div>
          <p className="block text-xs font-medium text-[#c9d7e8]">
            Country &amp; Currency (Kenya · Ghana · Côte d&apos;Ivoire)
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {COUNTRY_ORDER.map((c) => {
              const item = COUNTRIES[c];
              const selected = c === country;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onSelectCountry(c)}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors cursor-pointer ${
                    selected
                      ? 'border-[#7bc114] bg-[#7bc114]/15 text-white'
                      : 'border-[#2a4954] bg-[#081322] text-[#cbd5e1] hover:border-[#3e6a77]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">{item.label}</p>
                    <p className="font-mono text-[10px] text-[#94a3b8]">
                      {item.dialCode} · {item.currency}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="border-t border-[#183044] pt-4">
          <button
            type="button"
            onClick={async () => {
              await onResetDemo();
              setResetMsg(`Demo wallet reset to ${formatMoney(500, country)}.`);
            }}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-[#2e5256] bg-[#0d1d2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#152b44] cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 text-[#f6d663]" aria-hidden="true" />
            Reset Demo Account
          </button>
          {resetMsg && <p className="mt-2 text-xs text-[#2cd4a3]">{resetMsg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="lm-card max-w-2xl rounded-2xl p-6 space-y-3">
      <div className="flex items-center gap-2.5">
        <Headphones className="h-5 w-5 text-[#2cd4a3]" aria-hidden="true" />
        <h2 className="font-display text-xl font-bold text-white">Support &amp; Account Rules</h2>
      </div>
      <p className="text-sm leading-relaxed text-[#c9d7e8]">
        Minimum deposit is $6.00 USD (credited in {getCountryConfig(country).currency}). Minimum
        withdrawal is $60.00 USD with a flat $12.00 USD withdrawal fee. Switch countries anytime
        using the flag selector at the top to view balances in KES, GHS, or XOF.
      </p>
    </div>
  );
}
