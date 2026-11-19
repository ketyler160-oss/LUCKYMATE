import { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { CRASH_GAMES } from '../../data/matches';
import { AccountMode, CrashGameId } from '../../types';
import { GameProfileCardArt } from './GameProfileCardArt';

interface GameLoadingOverlayProps {
  gameId: CrashGameId;
  accountMode: AccountMode;
  onComplete: (gameId: CrashGameId) => void;
}

const LOAD_DURATION_MS = 700;

export function GameLoadingOverlay({
  gameId,
  accountMode,
  onComplete,
}: GameLoadingOverlayProps) {
  const [progress, setProgress] = useState(0);
  const game = CRASH_GAMES.find((g) => g.id === gameId) ?? CRASH_GAMES[0];
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const start = performance.now();
    let rafId = 0;
    let finished = false;

    const step = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / LOAD_DURATION_MS) * 100);
      setProgress(pct);
      if (elapsed >= LOAD_DURATION_MS) {
        if (!finished) {
          finished = true;
          onCompleteRef.current(gameId);
        }
        return;
      }
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [gameId]);

  const secondsLeft = Math.max(1, Math.ceil(((100 - progress) / 100) * 0.7));

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090d14] px-5 text-white"
      role="status"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 50% 42%, ${game.accentHex}, transparent 62%)`,
        }}
      />

      <div className="lm-modal-pop relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        {/* Vibrant Mini Card Preview */}
        <div
          className="lm-float-gentle h-36 w-28 overflow-hidden rounded-2xl border-2 shadow-2xl"
          style={{
            borderColor: game.accentHex,
            boxShadow: `0 0 36px ${game.accentHex}55`,
          }}
        >
          <GameProfileCardArt game={game} />
        </div>

        <span
          className={`mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${
            accountMode === 'real'
              ? 'bg-[#f5c417] text-[#111827]'
              : 'bg-[#2cd4a3] text-[#051818]'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {accountMode === 'real' ? 'Real Account Mode' : 'Demo Account Mode'}
        </span>

        <h2 className="mt-3 font-display text-2xl font-black tracking-tight text-white">
          Loading {game.title}...
        </h2>
        <p className="mt-1 text-xs text-[#94a3b8]">
          Connecting to live room · Entering in {secondsLeft}s
        </p>

        {/* Smooth 3-Second Progress Bar */}
        <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-[#141b26]">
          <div
            className="h-full rounded-full transition-[width] duration-75"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${game.accentHex}, #fde047)`,
              boxShadow: `0 0 12px ${game.accentHex}`,
            }}
          />
        </div>
        <p className="mt-2 font-mono text-[11px] font-bold text-[#cbd5e1] tabular-nums">
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}
