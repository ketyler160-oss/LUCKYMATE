import { useEffect } from 'react';
import { Wallet, X } from 'lucide-react';
import { CRASH_GAMES } from '../../data/matches';
import { formatMoney } from '../../lib/countries';
import { CountryOption, CrashGameConfig, CrashGameId } from '../../types';

interface PlayModeGateModalProps {
  gameId: CrashGameId;
  country?: CountryOption;
  demoBalance: number;
  realBalance: number;
  isRegistered: boolean;
  onChooseDemo: (gameId: CrashGameId) => void;
  onChooseReal: (gameId: CrashGameId) => void;
  onGoToDeposit: () => void;
  onClose: () => void;
}

function RealisticCardStageArtwork({ game }: { game: CrashGameConfig }) {
  switch (game.id) {
    case 'aviator':
      return (
        <div className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-[#020306] px-4 pt-6 pb-8">
          {/* Subtle atmospheric crimson spotlight */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/3 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
            style={{ background: '#e11d48' }}
          />

          {/* Realistic Crimson Aerobatic Plane */}
          <svg
            viewBox="0 0 260 155"
            className="lm-turbulence-float relative z-10 mt-1 h-40 w-full drop-shadow-[0_12px_20px_rgba(225,29,72,0.28)]"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="avPlaneBody" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ef233c" />
                <stop offset="55%" stopColor="#c8102e" />
                <stop offset="100%" stopColor="#7f091b" />
              </linearGradient>
              <linearGradient id="avWingLight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff4d6d" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
              <linearGradient id="avPropBlade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef233c" />
                <stop offset="50%" stopColor="#880d1e" />
                <stop offset="100%" stopColor="#ef233c" />
              </linearGradient>
            </defs>

            <g transform="translate(8, 10) rotate(-14 130 78)">
              {/* Rear Horizontal Stabilizer & Tail Fin */}
              <polygon points="28,84 14,74 34,76 48,84" fill="#9b0c22" stroke="#180408" strokeWidth="1.4" />
              <polygon points="26,86 18,98 44,96 52,86" fill="url(#avPlaneBody)" stroke="#180408" strokeWidth="1.4" />

              {/* Main Fuselage */}
              <path
                d="M36,88 Q96,68 178,74 Q198,77 202,88 Q198,99 175,103 Q98,110 38,94 Z"
                fill="url(#avPlaneBody)"
                stroke="#140407"
                strokeWidth="1.8"
              />

              {/* Upper Wing */}
              <polygon
                points="82,76 142,56 154,60 112,78"
                fill="url(#avWingLight)"
                stroke="#140407"
                strokeWidth="1.4"
              />

              {/* Cockpit Canopy with Glass Glint */}
              <path
                d="M114,72 Q132,57 154,66 L146,74 L112,76 Z"
                fill="#111827"
                stroke="#ef233c"
                strokeWidth="1.6"
              />
              <path d="M122,67 Q134,61 146,66" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />

              {/* Lower Swept Wing */}
              <polygon
                points="68,94 142,88 158,100 84,109"
                fill="url(#avWingLight)"
                stroke="#140407"
                strokeWidth="1.8"
              />
              <line x1="78" y1="100" x2="144" y2="94" stroke="#5c0612" strokeWidth="2" />

              {/* Side Racing 'X' Decal */}
              <path d="M168,81 L178,94 M178,81 L168,94" stroke="#090a0f" strokeWidth="3.2" strokeLinecap="round" />
              <polygon points="150,82 164,84 164,92 150,94" fill="#090a0f" />

              {/* Propeller Spinner Cone */}
              <path d="M200,80 L214,88 L200,96 Z" fill="#ef233c" stroke="#140407" strokeWidth="1.4" />

              {/* High-Speed Spinning Propeller Blades */}
              <g className="lm-propeller-spin" transform="translate(206, 88)">
                <ellipse cx="0" cy="-24" rx="4.5" ry="26" fill="url(#avPropBlade)" stroke="#140407" strokeWidth="1.2" transform="rotate(-14)" />
                <ellipse cx="0" cy="24" rx="4.5" ry="26" fill="url(#avPropBlade)" stroke="#140407" strokeWidth="1.2" transform="rotate(-14)" />
                <ellipse cx="0" cy="0" rx="2.5" ry="44" fill="#fca5a5" opacity="0.22" transform="rotate(-14)" />
              </g>
            </g>
          </svg>

          {/* Bold Stylized Aviator Wordmark behind the action buttons */}
          <div className="relative z-0 mb-8 select-none text-center">
            <span
              className="block font-display text-[52px] font-black italic leading-none tracking-tight text-[#d91c34] drop-shadow-[0_6px_18px_rgba(217,28,52,0.35)]"
            >
              Aviator
            </span>
          </div>
        </div>
      );

    case 'jetx':
      return (
        <div
          className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-4 pt-6 pb-8"
          style={{
            background: 'radial-gradient(circle at 55% 28%, #1e3a8a 0%, #0a1020 55%, #020306 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute right-2 top-8 h-40 w-40 rounded-full opacity-45 blur-2xl"
            style={{ background: '#fbbf24' }}
          />
          <svg viewBox="0 0 240 140" className="lm-turbulence-float relative z-10 mt-2 h-36 w-full" aria-hidden="true">
            <defs>
              <linearGradient id="gateJetFlame" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
            </defs>
            <g transform="translate(22, 18) rotate(-22 105 58)">
              <path d="M-24,62 Q20,52 54,54 L54,66 Q18,68 -24,62 Z" fill="url(#gateJetFlame)" className="lm-flame-flicker" />
              <polygon points="56,54 34,20 74,42" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
              <path d="M48,54 L156,42 L204,50 L150,64 L44,68 Z" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.8" />
              <polygon points="154,42 204,50 156,60" fill="#fbbf24" />
              <path d="M106,45 Q128,31 150,43 Z" fill="#0ea5e9" stroke="#e0f2fe" strokeWidth="1.2" />
            </g>
          </svg>
          <div className="relative z-0 mb-8 select-none text-center italic">
            <span className="font-display text-5xl font-black text-white">Jet</span>
            <span className="font-display text-5xl font-black text-[#fbbf24]">X</span>
          </div>
        </div>
      );

    case 'spaceman':
      return (
        <div
          className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-4 pt-6 pb-8"
          style={{
            background: 'radial-gradient(circle at 50% 30%, #6d28d9 0%, #1e1142 58%, #04030c 100%)',
          }}
        >
          <svg viewBox="0 0 220 140" className="lm-float-gentle relative z-10 mt-1 h-36 w-full" aria-hidden="true">
            <circle cx="32" cy="24" r="1.8" fill="#ffffff" />
            <circle cx="188" cy="28" r="2" fill="#fde047" />
            <circle cx="164" cy="108" r="1.5" fill="#38bdf8" />
            <g transform="translate(110, 68) rotate(-10)">
              <path d="M-44,8 Q-24,2 -14,2 L-14,16 Q-24,18 -44,8 Z" fill="#38bdf8" className="lm-flame-flicker" />
              <rect x="-18" y="-12" width="12" height="30" rx="5" fill="#94a3b8" />
              <rect x="-8" y="-16" width="26" height="38" rx="11" fill="#f8fafc" />
              <circle cx="5" cy="-24" r="16" fill="#ffffff" />
              <rect x="-4" y="-32" width="20" height="13" rx="6" fill="#0284c7" stroke="#7dd3fc" strokeWidth="1.5" />
            </g>
          </svg>
          <div className="relative z-0 mb-8 select-none text-center">
            <span className="font-display text-4xl font-black uppercase tracking-wider text-[#f472b6] drop-shadow-[0_4px_16px_rgba(244,114,182,0.5)]">
              SPACEMAN
            </span>
          </div>
        </div>
      );

    case 'comet-crash':
      return (
        <div
          className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-4 pt-6 pb-8"
          style={{
            background: 'radial-gradient(circle at 60% 28%, #581c87 0%, #1e1b4b 56%, #020308 100%)',
          }}
        >
          <svg viewBox="0 0 240 150" className="lm-turbulence-float relative z-10 mt-1 h-40 w-full" aria-hidden="true">
            <defs>
              <linearGradient id="gateCometTail" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
                <stop offset="55%" stopColor="#fb923c" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
            </defs>
            <circle cx="38" cy="26" r="1.6" fill="#ffffff" />
            <circle cx="204" cy="34" r="2" fill="#fde047" />
            <circle cx="192" cy="112" r="1.5" fill="#5eead4" />
            <circle cx="132" cy="44" r="24" fill="#4c1d95" stroke="#a78bfa" strokeWidth="1.5" />
            <ellipse cx="132" cy="44" rx="44" ry="10" fill="none" stroke="#c084fc" strokeWidth="3" transform="rotate(-14 132 44)" />
            <path d="M18,122 Q86,86 154,54 L144,74 Q82,102 18,122 Z" fill="url(#gateCometTail)" className="lm-flame-flicker" />
            <ellipse cx="158" cy="60" rx="18" ry="13" fill="#2dd4bf" stroke="#ecfeff" strokeWidth="1.5" transform="rotate(-24 158 60)" />
          </svg>
          <div className="relative z-0 mb-8 select-none text-center leading-none">
            <span className="block font-display text-4xl font-black text-white">
              C<span className="text-[#fb923c]">o</span>met
            </span>
            <span className="block font-display text-4xl font-black text-[#5eead4]">Crash</span>
          </div>
        </div>
      );

    case 'swimminator':
      return (
        <div
          className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-4 pt-6 pb-8"
          style={{
            background: 'radial-gradient(circle at 50% 24%, #0284c7 0%, #083344 58%, #020810 100%)',
          }}
        >
          <svg viewBox="0 0 240 150" className="lm-float-gentle relative z-10 mt-1 h-40 w-full" aria-hidden="true">
            <circle cx="46" cy="108" r="6" fill="none" stroke="#a5f3fc" strokeWidth="1.8" opacity="0.7" />
            <circle cx="192" cy="42" r="7" fill="none" stroke="#a5f3fc" strokeWidth="1.8" opacity="0.7" />
            <g transform="translate(120, 68) rotate(-14)">
              <path d="M-76,0 Q-48,-8 -36,0 L-36,6 Q-50,10 -76,0 Z" fill="#67e8f9" className="lm-flame-flicker" opacity="0.75" />
              <ellipse cx="0" cy="0" rx="44" ry="19" fill="#06b6d4" stroke="#cffafe" strokeWidth="2" />
              <rect x="-12" y="-27" width="18" height="12" rx="4" fill="#0891b2" stroke="#cffafe" strokeWidth="1.5" />
              <polygon points="-58,-14 -36,0 -58,14" fill="#fde047" stroke="#083344" strokeWidth="1.5" />
              <circle cx="18" cy="-2" r="8" fill="#0c4a6e" stroke="#fde047" strokeWidth="2.5" />
            </g>
          </svg>
          <div className="relative z-0 mb-8 select-none text-center">
            <span className="font-display text-3xl font-black tracking-tight text-white">
              SWIM<span className="text-[#22d3ee]">INATOR</span>
            </span>
          </div>
        </div>
      );

    case 'b-crash':
      return (
        <div
          className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-4 pt-6 pb-8"
          style={{
            background: 'radial-gradient(circle at 50% 30%, #1d4ed8 0%, #0f172a 62%, #020308 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute left-1/2 top-1/3 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
            style={{ background: '#facc15' }}
          />
          <div className="lm-float-gentle relative z-10 mt-4 flex flex-col items-center">
            <span className="font-display text-[92px] font-black italic leading-none text-[#fde047] drop-shadow-[0_10px_24px_rgba(250,204,21,0.45)]">
              B!
            </span>
          </div>
          <div className="relative z-0 mb-8 select-none text-center">
            <span className="font-display text-4xl font-black tracking-widest text-[#38bdf8]">
              B! CRASH
            </span>
          </div>
        </div>
      );

    case 'punchinator':
      return (
        <div
          className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-4 pt-6 pb-8"
          style={{
            background: 'radial-gradient(circle at 50% 28%, #be123c 0%, #3b0714 58%, #040204 100%)',
          }}
        >
          <svg viewBox="0 0 220 140" className="lm-float-gentle relative z-10 mt-1 h-38 w-full" aria-hidden="true">
            <g transform="translate(110, 68) rotate(-14)">
              <rect x="-22" y="28" width="44" height="22" rx="6" fill="#ffffff" stroke="#18181b" strokeWidth="2" />
              <path
                d="M-32,26 C-36,-14 -18,-36 10,-34 C34,-32 42,-10 38,16 C35,28 24,32 10,32 L-22,32 Z"
                fill="#ef4444"
                stroke="#fecaca"
                strokeWidth="2.5"
              />
              <path d="M-10,-20 C4,-24 18,-18 22,-6" fill="none" stroke="#fca5a5" strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
          <div className="relative z-0 mb-8 select-none text-center leading-none">
            <span className="font-display text-4xl font-black uppercase tracking-tight text-white">
              PUNCH<span className="text-[#fb7185]">INATOR</span>
            </span>
          </div>
        </div>
      );

    case 'crash-3dx':
      return (
        <div
          className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-4 pt-6 pb-8"
          style={{
            background: 'radial-gradient(circle at 50% 28%, #6d28d9 0%, #1e1b4b 58%, #03020a 100%)',
          }}
        >
          <svg viewBox="0 0 240 150" className="lm-turbulence-float relative z-10 mt-1 h-40 w-full" aria-hidden="true">
            <g transform="translate(122, 74) rotate(-25)">
              <path d="M-74,0 L-34,-12 L-34,12 Z" fill="#f97316" className="lm-flame-flicker" />
              <polygon points="-32,-16 -52,-38 -12,-24" fill="#fb7185" />
              <polygon points="-32,16 -52,38 -12,24" fill="#e11d48" />
              <ellipse cx="10" cy="0" rx="46" ry="24" fill="#f8fafc" stroke="#1e1b4b" strokeWidth="2" />
              <path d="M36,-22 Q78,0 36,22 Z" fill="#ec4899" />
              <circle cx="14" cy="-2" r="10" fill="#22d3ee" stroke="#4f46e5" strokeWidth="2.5" />
            </g>
          </svg>
          <div className="relative z-0 mb-8 select-none text-center">
            <span className="font-display text-4xl font-black uppercase tracking-tight text-white">
              CRASH <span className="text-[#e879f9]">3DX</span>
            </span>
          </div>
        </div>
      );

    case 'crash-royale':
      return (
        <div
          className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-4 pt-6 pb-8"
          style={{
            background: 'radial-gradient(circle at 50% 28%, #b45309 0%, #271a04 58%, #050401 100%)',
          }}
        >
          <svg viewBox="0 0 220 140" className="lm-float-gentle relative z-10 mt-2 h-38 w-full" aria-hidden="true">
            <g transform="translate(110, 74)">
              <path
                d="M-58,28 L-66,-22 L-24,4 L0,-36 L24,4 L66,-22 L58,28 Z"
                fill="#facc15"
                stroke="#fef08a"
                strokeWidth="2.5"
              />
              <rect x="-58" y="28" width="116" height="14" rx="4" fill="#d97706" stroke="#fef08a" strokeWidth="1.5" />
              <circle cx="0" cy="-38" r="6" fill="#fef08a" />
              <circle cx="-66" cy="-24" r="5" fill="#fef08a" />
              <circle cx="66" cy="-24" r="5" fill="#fef08a" />
            </g>
          </svg>
          <div className="relative z-0 mb-8 select-none text-center">
            <span className="font-display text-4xl font-black uppercase tracking-tight text-[#fde047]">
              CRASH ROYALE
            </span>
          </div>
        </div>
      );

    case 'fortune-spins':
      return (
        <div
          className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-4 pt-6 pb-8"
          style={{
            background: 'radial-gradient(circle at 50% 28%, #059669 0%, #052e1b 58%, #020a06 100%)',
          }}
        >
          <svg viewBox="0 0 200 140" className="lm-wheel-spin relative z-10 mt-1 h-38 w-full" aria-hidden="true">
            <g transform="translate(100, 70)">
              <circle cx="0" cy="0" r="56" fill="#064e3b" stroke="#fde047" strokeWidth="4" />
              <path d="M0,0 L0,-52 A52,52 0 0,1 52,0 Z" fill="#f59e0b" />
              <path d="M0,0 L52,0 A52,52 0 0,1 0,52 Z" fill="#ec4899" />
              <path d="M0,0 L0,52 A52,52 0 0,1 -52,0 Z" fill="#38bdf8" />
              <path d="M0,0 L-52,0 A52,52 0 0,1 0,-52 Z" fill="#10b981" />
              <circle cx="0" cy="0" r="14" fill="#fde047" stroke="#ffffff" strokeWidth="2.5" />
            </g>
          </svg>
          <div className="relative z-0 mb-8 select-none text-center">
            <span className="font-display text-4xl font-black tracking-tight text-[#34d399]">
              Fortune <span className="text-[#fde047]">Spins</span>
            </span>
          </div>
        </div>
      );

    default:
      return (
        <div
          className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-4 pt-6 pb-8"
          style={{
            background: 'radial-gradient(circle at 50% 28%, #15803d 0%, #062814 58%, #020804 100%)',
          }}
        >
          <svg viewBox="0 0 200 140" className="lm-spark-pulse relative z-10 mt-1 h-38 w-full drop-shadow-[0_0_24px_rgba(74,222,128,0.6)]" aria-hidden="true">
            <polygon
              points="114,12 58,80 96,80 84,132 144,62 104,62"
              fill="#fde047"
              stroke="#ffffff"
              strokeWidth="2.5"
            />
          </svg>
          <div className="relative z-0 mb-8 select-none text-center">
            <span className="block font-display text-4xl font-black uppercase tracking-tight text-[#4ade80]">
              {game.title}
            </span>
          </div>
        </div>
      );
  }
}

export function PlayModeGateModal({
  gameId,
  country = 'Kenya',
  demoBalance,
  realBalance,
  isRegistered,
  onChooseDemo,
  onChooseReal,
  onGoToDeposit,
  onClose,
}: PlayModeGateModalProps) {
  const game = CRASH_GAMES.find((g) => g.id === gameId) ?? CRASH_GAMES[0];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060b12]/85 p-5 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="play-mode-gate-title"
    >
      {/* Realistic Centered Game Card Matching Screenshot */}
      <div
        className="lm-modal-pop relative aspect-[3/4] w-full max-w-[320px] overflow-hidden rounded-[26px] border-[1.5px] border-[#527fb8]/75 bg-[#020306] shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_32px_rgba(82,127,184,0.22)]"
      >
        <h3 id="play-mode-gate-title" className="sr-only">
          Choose Real Play or Demo Play for {game.title}
        </h3>

        {/* Subtle Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${game.title}`}
          className="absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Realistic Shaded Game Artwork Backdrop */}
        <RealisticCardStageArtwork game={game} />

        {/* Stacked Action Buttons Overlaid Directly on Card */}
        <div className="absolute inset-x-0 bottom-7 z-20 flex flex-col gap-3.5 px-6">
          <button
            type="button"
            onClick={() => onChooseReal(gameId)}
            className="flex h-[54px] w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#78b824] to-[#5f9718] text-[19px] font-extrabold tracking-tight text-white shadow-[0_8px_22px_rgba(108,168,28,0.45),inset_0_1px_0_rgba(255,255,255,0.28)] transition-all hover:brightness-110 active:scale-[0.97] cursor-pointer"
          >
            Real Play
          </button>

          <button
            type="button"
            onClick={() => onChooseDemo(gameId)}
            className="flex h-[54px] w-full items-center justify-center rounded-2xl bg-white text-[19px] font-extrabold tracking-tight text-[#5e9618] shadow-[0_8px_22px_rgba(0,0,0,0.55)] transition-all hover:bg-[#f1f5f9] active:scale-[0.97] cursor-pointer"
          >
            Demo Play
          </button>
        </div>
      </div>

      {/* Unobtrusive Balance & Deposit Strip Below the Card (logged-in clients only) */}
      {isRegistered && (
        <div className="lm-fade-up mt-3.5 flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold text-[#94a3b8]">
          <span className="font-mono tabular-nums">
            Real: <strong className="text-[#f5c417]">{formatMoney(realBalance, country)}</strong>
          </span>
          <span>·</span>
          <span className="font-mono tabular-nums">
            Demo: <strong className="text-[#7bc114]">{formatMoney(demoBalance, country)}</strong>
          </span>
          {realBalance <= 0 && (
            <>
              <span>·</span>
              <button
                type="button"
                onClick={onGoToDeposit}
                className="inline-flex items-center gap-1 font-bold text-[#f5c417] hover:underline cursor-pointer"
              >
                <Wallet className="h-3 w-3" aria-hidden="true" />
                Deposit $6 USD
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
