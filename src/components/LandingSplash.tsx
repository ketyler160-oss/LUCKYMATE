import { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, Trophy, Zap } from 'lucide-react';
import { getCountryConfig } from '../lib/countries';
import { CountryOption } from '../types';

interface LandingSplashProps {
  country: CountryOption;
  durationMs?: number;
  onComplete: () => void;
}

const LOADING_STEPS = [
  'Initializing Luckymate Sportsbook...',
  'Syncing live matches, odds & fixtures...',
  'Preparing Crash Arena & Multi-Currency Wallet...',
];

export function LandingSplash({
  country,
  durationMs = 6000,
  onComplete,
}: LandingSplashProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [exiting, setExiting] = useState(false);

  const countryCfg = getCountryConfig(country);
  const progressPct = Math.min(100, Math.round((elapsedMs / durationMs) * 100));
  const secondsLeft = Math.max(0, Math.ceil((durationMs - elapsedMs) / 1000));
  const stageIndex =
    progressPct < 35 ? 0 : progressPct < 72 ? 1 : 2;

  useEffect(() => {
    const start = performance.now();
    const intervalId = window.setInterval(() => {
      const next = performance.now() - start;
      if (next >= durationMs) {
        setElapsedMs(durationMs);
        window.clearInterval(intervalId);
      } else {
        setElapsedMs(next);
      }
    }, 50);

    const exitTimer = window.setTimeout(() => {
      setExiting(true);
    }, Math.max(0, durationMs - 260));

    const doneTimer = window.setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [durationMs, onComplete]);

  const handleEnterNow = () => {
    setExiting(true);
    window.setTimeout(() => onComplete(), 180);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Luckymate"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden bg-[#0c121b] px-5 py-8 text-white transition-opacity duration-300 ${
        exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Stadium Spotlight Backdrops */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#7bc114]/12 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#f5c417]/10 blur-3xl"
      />

      {/* Top Region Bar */}
      <div className="relative z-10 flex w-full max-w-md items-center justify-between text-xs text-[#94a3b8]">
        <span className="font-semibold text-[#e2e8f0]">
          {countryCfg.label} · {countryCfg.currency}
        </span>
        <span className="font-mono text-[11px] tabular-nums text-[#94a3b8]">
          Loading in {secondsLeft}s
        </span>
      </div>

      {/* Center Brand Name Showcase */}
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <h1 className="font-display text-4xl font-black uppercase tracking-[0.06em] sm:text-5xl leading-none">
          <span className="text-[#f5c417]">LUCKY</span>
          <span className="text-white">MATE</span>
        </h1>
        <div className="mt-3 h-1 w-20 rounded-full bg-[#7bc114]" />

        <p className="mt-2.5 text-sm font-medium text-[#cbd5e1] sm:text-base max-w-md text-balance">
          Sportsbook, Live Fixtures, Aviator &amp; Instant Mobile Money Wallet
        </p>

        {/* Feature Row (Unboxed clean metadata separators) */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold text-[#94a3b8]">
          <span className="inline-flex items-center gap-1.5 text-[#e2e8f0]">
            <Trophy className="h-3.5 w-3.5 text-[#f5c417]" aria-hidden="true" />
            Live Football &amp; Sports
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5 text-[#e2e8f0]">
            <Zap className="h-3.5 w-3.5 text-[#7bc114]" aria-hidden="true" />
            Aviator &amp; Crash Arena
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5 text-[#e2e8f0]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#38bdf8]" aria-hidden="true" />
            Instant Wallet Deposits
          </span>
        </div>

        {/* 6-Second Smooth Progress Track */}
        <div className="mt-8 w-full max-w-sm space-y-2.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a2433] border border-[#243245]">
            <div
              className="h-full origin-left rounded-full bg-gradient-to-r from-[#7bc114] via-[#a3e635] to-[#f5c417] transition-transform duration-100 ease-linear"
              style={{ transform: `scaleX(${progressPct / 100})` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#94a3b8]">
            <span>{LOADING_STEPS[stageIndex]}</span>
            <span className="font-mono font-bold text-white tabular-nums">{progressPct}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleEnterNow}
          className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#7bc114] px-6 py-2.5 text-sm font-extrabold text-[#0b1404] hover:bg-[#8cd61e] active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Enter Luckymate Now</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="text-[11px] text-[#64748b]">
          18+ Play Responsibly · Real &amp; Demo Wallets
        </p>
      </div>
    </div>
  );
}
