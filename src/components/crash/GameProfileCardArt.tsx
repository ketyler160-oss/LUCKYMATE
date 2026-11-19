import { CrashGameConfig } from '../../types';

export function GameProfileCardArt({ game }: { game: CrashGameConfig }) {
  switch (game.id) {
    case 'aviator':
      return (
        <div
          className="lm-shimmer-sweep relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-2.5 pb-7"
          style={{
            background:
              'radial-gradient(circle at 50% 34%, #ff3b5c 0%, #c81e32 48%, #4c0519 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                'repeating-conic-gradient(from 0deg at 50% 38%, rgba(255,255,255,0.34) 0deg 8deg, transparent 8deg 20deg)',
            }}
          />
          <div
            className="pointer-events-none absolute -top-6 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full opacity-55 blur-xl"
            style={{ background: '#fde047' }}
          />
          <svg
            viewBox="0 0 120 70"
            className="lm-float-gentle relative z-10 h-16 w-28 drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)]"
            aria-hidden="true"
          >
            <g transform="translate(8,6) rotate(-8 56 32)">
              <path d="M-4,33 L16,28 L16,38 Z" fill="#fde047" opacity="0.85" />
              <ellipse cx="98" cy="30" rx="3.2" ry="17" fill="#fef08a" opacity="0.9" />
              <polygon points="14,34 8,16 26,22 30,36" fill="#ffffff" />
              <polygon points="44,18 82,16 74,26 38,26" fill="#ffe4e6" />
              <path d="M14,34 L86,25 Q100,26 98,32 Q95,38 78,39 L22,42 Z" fill="#ffffff" />
              <path d="M70,28 L80,35 M80,28 L70,35" stroke="#e11d48" strokeWidth="2.8" />
              <line x1="64" y1="39" x2="60" y2="50" stroke="#ffffff" strokeWidth="2.5" />
              <circle cx="60" cy="52" r="4.8" fill="#fde047" />
              <circle cx="60" cy="52" r="2.1" fill="#881337" />
            </g>
          </svg>
          <div className="relative z-10 mt-1 text-center">
            <span className="block font-display text-2xl font-black italic tracking-tight text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)]">
              Aviator
            </span>
            <div className="mx-auto mt-1 h-1 w-16 rounded-full bg-gradient-to-r from-[#fde047] via-[#fff] to-[#fde047]" />
          </div>
        </div>
      );

    case 'jetx':
      return (
        <div
          className="lm-shimmer-sweep relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-2.5 pb-7"
          style={{
            background:
              'linear-gradient(145deg, #2563eb 0%, #1e1b4b 38%, #c2410c 74%, #fbbf24 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute -right-5 -top-5 h-36 w-36 rounded-full opacity-75 blur-xl"
            style={{ background: '#fde047' }}
          />
          <div
            className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full opacity-55 blur-xl"
            style={{ background: '#38bdf8' }}
          />
          <svg
            viewBox="0 0 120 70"
            className="lm-float-gentle relative z-10 h-16 w-28 drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)]"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="cardJetFlameBright" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                <stop offset="50%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
            </defs>
            <g transform="translate(14,12) rotate(-22 50 30)">
              <path d="M-10,36 L24,27 L24,35 Z" fill="url(#cardJetFlameBright)" />
              <polygon points="22,28 14,14 28,22" fill="#fde047" />
              <path d="M22,28 L66,22 L88,26 L62,33 L20,35 Z" fill="#ffffff" />
              <polygon points="65,22 88,26 67,31" fill="#fde047" />
              <path d="M44,23 Q54,18 64,23 Z" fill="#0ea5e9" />
            </g>
          </svg>
          <div className="relative z-10 mt-1 flex items-baseline italic tracking-tight">
            <span className="font-display text-2xl font-black text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.8)]">
              Jet
            </span>
            <span className="font-display text-3xl font-black text-[#fde047] drop-shadow-[0_3px_8px_rgba(0,0,0,0.85)]">
              X
            </span>
          </div>
        </div>
      );

    case 'comet-crash':
      return (
        <div
          className="lm-shimmer-sweep relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-2.5 pb-7"
          style={{
            background:
              'radial-gradient(circle at 65% 26%, #9333ea 0%, #4338ca 50%, #0f172a 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute left-1/2 top-6 h-24 w-24 -translate-x-1/2 rounded-full opacity-55 blur-xl"
            style={{ background: '#2dd4bf' }}
          />
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <circle cx="18" cy="20" r="1.8" fill="#ffffff" />
            <circle cx="96" cy="22" r="2.2" fill="#fde047" />
            <circle cx="102" cy="84" r="1.8" fill="#e879f9" />
            <circle cx="24" cy="92" r="2" fill="#5eead4" />
            <circle cx="62" cy="34" r="13" fill="#7e22ce" />
            <ellipse
              cx="62"
              cy="34"
              rx="24"
              ry="5.5"
              fill="none"
              stroke="#e879f9"
              strokeWidth="2.8"
              transform="rotate(-14 62 34)"
            />
            <path d="M6,72 Q34,52 58,50 L48,66 Q24,72 6,72 Z" fill="#fb923c" />
            <path d="M10,112 Q58,78 76,34" fill="none" stroke="#2dd4bf" strokeWidth="4" />
            <polygon points="79,22 68,36 83,40" fill="#5eead4" />
          </svg>
          <div className="relative z-10 mt-3 text-center leading-none">
            <span className="block font-display text-xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              C<span className="text-[#fb923c]">o</span>met
            </span>
            <span className="block font-display text-xl font-black tracking-tight text-[#5eead4] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Crash
            </span>
          </div>
        </div>
      );

    case 'swimminator':
      return (
        <div
          className="lm-shimmer-sweep relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-2.5 pb-7"
          style={{
            background:
              'linear-gradient(180deg, #22d3ee 0%, #0ea5e9 34%, #0284c7 68%, #0f172a 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-45"
            style={{
              backgroundImage:
                'repeating-conic-gradient(from 160deg at 50% 0%, rgba(255,255,255,0.55) 0deg 7deg, transparent 7deg 18deg)',
            }}
          />
          <svg
            viewBox="0 0 120 120"
            className="lm-float-gentle absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <circle cx="24" cy="78" r="5" fill="none" stroke="#ecfeff" strokeWidth="1.8" opacity="0.85" />
            <circle cx="92" cy="36" r="6" fill="none" stroke="#ecfeff" strokeWidth="1.8" opacity="0.85" />
            <circle cx="74" cy="90" r="4" fill="none" stroke="#ecfeff" strokeWidth="1.6" opacity="0.8" />
            <g transform="translate(60, 44) rotate(-14)">
              <ellipse cx="0" cy="0" rx="22" ry="10" fill="#fde047" stroke="#ffffff" strokeWidth="2" />
              <polygon points="-29,-7 -17,0 -29,7" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.2" />
              <circle cx="9" cy="-1" r="4.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          </svg>
          <div className="relative z-10 mt-10 text-center">
            <span className="block font-display text-base font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(3,105,161,0.95)]">
              SWIM<span className="text-[#fde047]">INATOR</span>
            </span>
          </div>
        </div>
      );

    case 'b-crash':
      return (
        <div
          className="lm-shimmer-sweep relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-2.5 pb-7"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, #3b82f6 0%, #1d4ed8 48%, #0f172a 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute h-28 w-28 rounded-full opacity-70 blur-xl"
            style={{ background: '#fde047' }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'repeating-conic-gradient(from 15deg at 50% 45%, rgba(250,204,21,0.4) 0deg 10deg, transparent 10deg 24deg)',
            }}
          />
          <div className="lm-float-gentle relative z-10 flex flex-col items-center text-center leading-none">
            <span className="font-display text-5xl font-black italic text-[#fde047] drop-shadow-[0_4px_12px_rgba(0,0,0,0.75)]">
              B!
            </span>
            <span className="mt-1 font-display text-base font-black tracking-widest text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              CRASH
            </span>
          </div>
        </div>
      );

    case 'punchinator':
      return (
        <div
          className="lm-shimmer-sweep relative flex h-full w-full flex-col items-center justify-between overflow-hidden p-2.5 pb-8"
          style={{
            background: 'linear-gradient(155deg, #fb7185 0%, #e11d48 45%, #4c0519 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-xl"
            style={{ background: '#fde047' }}
          />
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <line x1="0" y1="66" x2="120" y2="54" stroke="#fecdd3" strokeWidth="2" opacity="0.55" />
            <line x1="0" y1="84" x2="120" y2="72" stroke="#fde047" strokeWidth="2" opacity="0.55" />
            <g transform="translate(36,52)" className="lm-float-gentle">
              <rect x="12" y="34" width="24" height="12" rx="3" fill="#ffffff" />
              <path
                d="M10,16 C10,4 38,4 38,18 L38,30 C38,34 34,36 30,36 L14,36 C10,36 8,30 8,24 Z"
                fill="#fde047"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          </svg>
          <div className="relative z-10 mt-1 text-center leading-none">
            <span className="block font-display text-lg font-black uppercase tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
              PUNCH
            </span>
            <span className="block font-display text-sm font-black uppercase tracking-tight text-[#fde047] drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
              INATOR
            </span>
          </div>
          <span className="relative z-10 rounded bg-black/55 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#fde047]">
            KNOCKOUT
          </span>
        </div>
      );

    case 'crash-3dx':
      return (
        <div
          className="lm-shimmer-sweep relative flex h-full w-full flex-col items-center justify-between overflow-hidden p-2.5 pb-8"
          style={{
            background: 'linear-gradient(155deg, #d946ef 0%, #6d28d9 48%, #1e1b4b 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute -top-4 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full opacity-60 blur-xl"
            style={{ background: '#38bdf8' }}
          />
          <svg
            viewBox="0 0 120 80"
            className="lm-float-gentle relative z-10 mt-1 h-16 w-24 drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]"
            aria-hidden="true"
          >
            <g transform="translate(22,8) rotate(-25 36 32)">
              <path d="M2,38 L24,31 L24,43 Z" fill="#fde047" />
              <polygon points="24,26 16,14 32,20" fill="#fb7185" />
              <polygon points="24,44 16,56 32,50" fill="#f43f5e" />
              <ellipse cx="44" cy="35" rx="22" ry="13" fill="#ffffff" />
              <path d="M56,23 Q78,35 56,47 Z" fill="#ec4899" />
              <circle cx="46" cy="33" r="5.5" fill="#22d3ee" stroke="#4f46e5" strokeWidth="1.5" />
            </g>
          </svg>
          <div className="relative z-10 text-center leading-none">
            <span className="block font-display text-base font-black uppercase tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
              CRASH
            </span>
            <span className="block font-display text-2xl font-black uppercase tracking-tight text-[#fde047] drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
              3DX
            </span>
          </div>
        </div>
      );

    case 'crash-royale':
      return (
        <div
          className="lm-shimmer-sweep relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-2.5 pb-7"
          style={{
            background:
              'radial-gradient(circle at 50% 38%, #fef08a 0%, #f59e0b 48%, #78350f 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                'repeating-conic-gradient(from 0deg at 50% 38%, rgba(255,255,255,0.45) 0deg 10deg, transparent 10deg 22deg)',
            }}
          />
          <div className="lm-float-gentle relative z-10 mb-2 flex h-13 w-13 items-center justify-center rounded-full border-2 border-[#fef9c3] bg-gradient-to-br from-[#fef08a] via-[#facc15] to-[#b45309] shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
            <span className="font-display text-base font-black text-[#451a03]">VIP</span>
          </div>
          <div className="relative z-10 text-center leading-none">
            <span className="block font-display text-base font-black uppercase text-[#fef9c3] drop-shadow-[0_2px_4px_rgba(69,26,3,0.95)]">
              CRASH
            </span>
            <span className="block font-display text-lg font-black uppercase text-white drop-shadow-[0_2px_4px_rgba(69,26,3,0.95)]">
              ROYALE
            </span>
          </div>
        </div>
      );

    case 'fortune-spins':
      return (
        <div
          className="lm-shimmer-sweep relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-2.5 pb-7"
          style={{
            background: 'linear-gradient(155deg, #34d399 0%, #059669 48%, #064e3b 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute top-4 h-24 w-24 rounded-full opacity-55 blur-xl"
            style={{ background: '#fde047' }}
          />
          <svg viewBox="0 0 80 80" className="lm-wheel-spin relative z-10 h-14 w-14" aria-hidden="true">
            <circle cx="40" cy="40" r="26" fill="#064e3b" stroke="#fde047" strokeWidth="4" />
            <path d="M40,40 L40,14 A26,26 0 0,1 66,40 Z" fill="#f59e0b" />
            <path d="M40,40 L66,40 A26,26 0 0,1 40,66 Z" fill="#ec4899" />
            <path d="M40,40 L40,66 A26,26 0 0,1 14,40 Z" fill="#38bdf8" />
            <path d="M40,40 L14,40 A26,26 0 0,1 40,14 Z" fill="#10b981" />
            <circle cx="40" cy="40" r="7" fill="#fde047" stroke="#ffffff" strokeWidth="2" />
          </svg>
          <div className="relative z-10 mt-1.5 text-center leading-none">
            <span className="block font-display text-sm font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              Fortune
            </span>
            <span className="block font-display text-base font-black text-[#fde047] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              Spins
            </span>
          </div>
        </div>
      );

    case 'spaceman':
      return (
        <div
          className="lm-shimmer-sweep relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-2.5 pb-7"
          style={{
            background: 'linear-gradient(155deg, #38bdf8 0%, #7c3aed 52%, #ec4899 100%)',
          }}
        >
          <svg
            viewBox="0 0 80 80"
            className="lm-float-gentle relative z-10 h-15 w-15 drop-shadow-[0_6px_12px_rgba(0,0,0,0.45)]"
            aria-hidden="true"
          >
            <circle cx="40" cy="27" r="14" fill="#ffffff" />
            <rect x="31" y="20" width="18" height="11" rx="5" fill="#22d3ee" />
            <rect x="30" y="41" width="20" height="22" rx="7" fill="#f8fafc" />
            <path d="M26,43 L16,55 M54,43 L64,33" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <path d="M35,63 L31,73 M45,63 L49,73" stroke="#fde047" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <span className="relative z-10 mt-1 font-display text-sm font-black uppercase tracking-wider text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
            SPACEMAN
          </span>
        </div>
      );

    default:
      return (
        <div
          className="lm-shimmer-sweep relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-2.5 pb-7"
          style={{
            background: 'linear-gradient(155deg, #4ade80 0%, #16a34a 52%, #052e16 100%)',
          }}
        >
          <svg
            viewBox="0 0 80 80"
            className="lm-spark-pulse relative z-10 h-14 w-14 drop-shadow-[0_0_14px_rgba(250,204,21,0.95)]"
            aria-hidden="true"
          >
            <polygon
              points="45,8 19,44 38,44 33,72 61,35 42,35"
              fill="#fde047"
              stroke="#ffffff"
              strokeWidth="1.8"
            />
          </svg>
          <span className="relative z-10 mt-1 font-display text-xs font-black uppercase tracking-wide text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
            {game.title}
          </span>
        </div>
      );
  }
}
