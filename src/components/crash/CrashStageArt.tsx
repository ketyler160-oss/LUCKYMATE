interface StageProps {
  roomStatus: 'betting' | 'running' | 'crashed';
  multiplier: number;
  countdown: number;
  lastCrashedPoint: number | null;
  activeBetsCount: number;
  connectedPlayers: number;
  animationsEnabled?: boolean;
}

export function JetXStage({
  roomStatus,
  multiplier,
  countdown,
  lastCrashedPoint,
  activeBetsCount,
  connectedPlayers,
  animationsEnabled = true,
}: StageProps) {
  const progress = Math.min(1, Math.log(Math.max(1, multiplier)) / Math.log(8));
  const jetX = 95 + (animationsEnabled ? progress * 135 : 40);
  const jetY = 128 - (animationsEnabled ? progress * 72 : 24);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#272f42] px-4 py-5 ${
        roomStatus === 'crashed' && animationsEnabled ? 'lm-crash-shake' : ''
      }`}
      style={{
        background:
          'linear-gradient(180deg, #161d2b 0%, #242f44 50%, #151923 100%)',
      }}
    >
      <div className="relative flex h-56 flex-col items-center justify-center sm:h-64">
        <svg
          viewBox="0 0 360 190"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="jetFlameGrad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="45%" stopColor="#f97316" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Drifting Supersonic Wind & Cloud Streaks */}
          {animationsEnabled && (
            <g className={roomStatus === 'running' ? 'lm-cloud-drift' : ''} opacity="0.24">
              <line x1="20" y1="36" x2="90" y2="36" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="160" y1="88" x2="240" y2="88" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="300" y1="52" x2="390" y2="52" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="420" y1="114" x2="510" y2="114" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          )}

          {roomStatus === 'running' && animationsEnabled && (
            <g transform={`translate(${jetX}, ${jetY}) rotate(-24)`}>
              <g className="lm-turbulence-float">
                {/* Flickering Supersonic Afterburner */}
                <path
                  d="M-76,6 Q-36,0 -16,0 L-16,7 Q-40,9 -76,6 Z"
                  fill="url(#jetFlameGrad)"
                  className="lm-flame-flicker"
                />
                {/* Mach Shock Cone */}
                <path
                  d="M48,-2 L18,-22 M48,-2 L16,18"
                  stroke="#bae6fd"
                  strokeOpacity="0.4"
                  strokeWidth="1.2"
                  fill="none"
                />
                {/* Yellow Tail Fin */}
                <polygon points="-20,0 -30,-16 -14,-12 -6,0" fill="#facc15" />
                {/* Lower wing */}
                <polygon points="-10,5 12,12 -4,7" fill="#eab308" />
                {/* Main silver-white fuselage */}
                <path
                  d="M-22,2 L26,-6 L48,-2 L24,5 L-18,7 Z"
                  fill="#f8fafc"
                />
                {/* Yellow nose & stripe */}
                <polygon points="24,-5 48,-2 26,3" fill="#facc15" />
                <polygon points="-16,2 20,-3 18,1 -18,5" fill="#1e293b" />
                {/* Cockpit */}
                <path d="M4,-5 Q14,-11 24,-4 L10,-2 Z" fill="#0ea5e9" />
              </g>
            </g>
          )}

          {roomStatus === 'crashed' && animationsEnabled && (
            <g transform={`translate(${jetX}, ${jetY})`}>
              <circle cx="0" cy="0" r="24" fill="none" stroke="#f97316" strokeWidth="3" className="lm-shockwave" />
              <circle cx="0" cy="0" r="14" fill="#fde047" opacity="0.7" className="lm-shockwave" />
            </g>
          )}
        </svg>

        <div className="relative z-10 mt-10 flex flex-col items-center text-center">
          {roomStatus === 'betting' ? (
            <>
              <span className="text-xs font-bold uppercase tracking-widest text-[#cbd5e1]">
                Boarding JetX
              </span>
              <span className="mt-1 font-mono text-4xl font-extrabold text-white tabular-nums sm:text-5xl">
                {countdown.toFixed(1)}s
              </span>
              <div className="mt-2 h-1.5 w-44 overflow-hidden rounded-full bg-black/45">
                <div
                  className="h-full bg-[#facc15] transition-all duration-150"
                  style={{ width: `${Math.min(100, (countdown / 10) * 100)}%` }}
                />
              </div>
            </>
          ) : roomStatus === 'crashed' ? (
            <div className="lm-modal-pop flex flex-col items-center">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#f87171]">
                JET EXPLODED
              </span>
              <span className="font-mono text-5xl font-extrabold text-[#ef4444] tabular-nums sm:text-6xl">
                {(lastCrashedPoint ?? multiplier).toFixed(2)}{' '}
                <span className="italic font-bold">x</span>
              </span>
            </div>
          ) : (
            <span className="font-mono text-5xl font-extrabold text-white tabular-nums sm:text-6xl drop-shadow-[0_4px_18px_rgba(0,0,0,0.65)]">
              {multiplier.toFixed(2)} <span className="italic font-bold">x</span>
            </span>
          )}
        </div>

        <div className="relative z-10 mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#2d3340]/90 px-4 py-1 text-xs font-bold text-white shadow">
          <span className="tabular-nums">{activeBetsCount} Bets</span>
          <span className="text-white/40">·</span>
          <span className="font-mono text-[#facc15] tabular-nums">
            {connectedPlayers} Live
          </span>
        </div>
      </div>
    </div>
  );
}

export function BCrashStage({
  roomStatus,
  multiplier,
  countdown,
  lastCrashedPoint,
  connectedPlayers,
  animationsEnabled = true,
}: StageProps) {
  const progress = Math.min(1, Math.log(Math.max(1, multiplier)) / Math.log(10));
  const tipX = 24 + (animationsEnabled ? progress * 250 : 90);
  const tipY = 165 - (animationsEnabled ? Math.pow(progress, 1.25) * 126 : 36);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#1f3482] p-3 ${
        roomStatus === 'crashed' && animationsEnabled ? 'lm-crash-shake' : ''
      }`}
      style={{
        background:
          'linear-gradient(180deg, #0b1644 0%, #112468 65%, #09133a 100%)',
      }}
    >
      <div className="relative h-56 w-full sm:h-64">
        <svg
          viewBox="0 0 360 190"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {/* Left & bottom blue guide lines with glowing yellow dots */}
          <line x1="16" y1="12" x2="16" y2="170" stroke="#223b99" strokeWidth="1.5" />
          <line x1="16" y1="170" x2="342" y2="170" stroke="#223b99" strokeWidth="1.5" />

          {[24, 52, 82, 112, 142, 168].map((y, idx) => (
            <circle
              key={`ly-${y}`}
              cx="16"
              cy={y}
              r="3"
              fill="#facc15"
              className={animationsEnabled && roomStatus === 'running' ? 'lm-spark-pulse' : ''}
              style={{ animationDelay: `${idx * 120}ms` }}
            />
          ))}
          {[42, 78, 126, 152, 200, 224, 272, 296].map((x, idx) => (
            <circle
              key={`bx-${x}`}
              cx={x}
              cy="170"
              r="3"
              fill="#facc15"
              className={animationsEnabled && roomStatus === 'running' ? 'lm-spark-pulse' : ''}
              style={{ animationDelay: `${idx * 90}ms` }}
            />
          ))}

          {roomStatus !== 'betting' && animationsEnabled && (
            <>
              <path
                d={`M 16 170 Q ${(16 + tipX) / 2 + 25} 162 ${tipX} ${tipY}`}
                fill="none"
                stroke={roomStatus === 'crashed' ? '#f87171' : '#facc15'}
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              {/* Tilted B! badge at tip */}
              <g transform={`translate(${Math.min(315, tipX + 8)}, ${Math.max(24, tipY - 12)}) rotate(-10)`}>
                <g className={roomStatus === 'running' ? 'lm-turbulence-float' : ''}>
                  <rect
                    x="-18"
                    y="-18"
                    width="36"
                    height="36"
                    rx="7"
                    fill="#17245e"
                    stroke="#3b5bdb"
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="9"
                    textAnchor="middle"
                    fill={roomStatus === 'crashed' ? '#f87171' : '#facc15'}
                    fontSize="24"
                    fontWeight="900"
                    fontFamily="sans-serif"
                  >
                    B!
                  </text>
                </g>
              </g>
              {roomStatus === 'crashed' && (
                <circle
                  cx={Math.min(315, tipX + 8)}
                  cy={Math.max(24, tipY - 12)}
                  r="22"
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="2.5"
                  className="lm-shockwave"
                />
              )}
            </>
          )}
        </svg>

        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
          {roomStatus === 'betting' ? (
            <>
              <span className="text-xs font-semibold text-[#b8c7ff]">Next Round Starts</span>
              <span className="mt-1 font-mono text-4xl font-extrabold text-white tabular-nums sm:text-5xl">
                {countdown.toFixed(1)}s
              </span>
              <div className="mt-2.5 h-1.5 w-40 overflow-hidden rounded-full bg-[#091233]">
                <div
                  className="h-full bg-[#facc15] transition-all duration-150"
                  style={{ width: `${Math.min(100, (countdown / 10) * 100)}%` }}
                />
              </div>
            </>
          ) : roomStatus === 'crashed' ? (
            <div className="lm-modal-pop flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#f87171]">
                Crashed Score
              </span>
              <span className="font-mono text-5xl font-extrabold text-[#f87171] tabular-nums sm:text-6xl">
                x{(lastCrashedPoint ?? multiplier).toFixed(2)}
              </span>
            </div>
          ) : (
            <>
              <span className="text-xs font-semibold text-[#cbd5ff]">Current Score</span>
              <span className="font-mono text-5xl font-extrabold text-white tabular-nums sm:text-6xl drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)]">
                x{multiplier.toFixed(2)}
              </span>
            </>
          )}
        </div>

        <div className="absolute bottom-2 right-2 z-10 rounded-full border border-[#2d47a6] bg-[#162769]/90 px-2.5 py-1 font-mono text-[11px] font-bold text-[#facc15]">
          {connectedPlayers} Live
        </div>
      </div>
    </div>
  );
}

const STARS = [
  [12, 18, 1.4],
  [28, 72, 1.1],
  [44, 34, 1.8],
  [65, 16, 1.2],
  [84, 52, 1.5],
  [110, 88, 1.3],
  [145, 22, 1.6],
  [172, 118, 1.2],
  [208, 38, 1.7],
  [234, 146, 1.1],
  [265, 28, 1.5],
  [298, 74, 1.4],
  [322, 124, 1.8],
  [345, 42, 1.2],
  [38, 144, 1.3],
  [130, 152, 1.5],
  [248, 92, 1.2],
  [310, 162, 1.4],
] as const;

export function CometCrashStage({
  roomStatus,
  multiplier,
  countdown,
  lastCrashedPoint,
  connectedPlayers,
  animationsEnabled = true,
}: StageProps) {
  const progress = Math.min(1, Math.log(Math.max(1, multiplier)) / Math.log(8));
  const rocketX = 110 + (animationsEnabled ? progress * 105 : 28);
  const rocketY = 122 - (animationsEnabled ? progress * 22 : 8);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#2e3a78] ${
        roomStatus === 'crashed' && animationsEnabled ? 'lm-crash-shake' : ''
      }`}
      style={{
        background:
          'linear-gradient(180deg, #0b0f26 0%, #191d46 55%, #11132e 100%)',
      }}
    >
      <div className="relative h-56 w-full sm:h-64">
        <svg
          viewBox="0 0 360 190"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="sunOrbGrad" cx="45%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="65%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" stopOpacity="0.2" />
            </radialGradient>
            <linearGradient id="cometFlame" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
              <stop offset="45%" stopColor="#f97316" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#fde047" />
            </linearGradient>
          </defs>

          {/* Drifting Starfield */}
          <g className={animationsEnabled && roomStatus === 'running' ? 'lm-cloud-drift' : ''}>
            {STARS.map(([x, y, r], i) => (
              <circle key={`s1-${i}`} cx={x} cy={y} r={r} fill="#e2e8f0" opacity="0.7" />
            ))}
            {STARS.map(([x, y, r], i) => (
              <circle key={`s2-${i}`} cx={x + 180} cy={y} r={r} fill="#c4b5fd" opacity="0.55" />
            ))}
          </g>

          {/* Cratered Moon */}
          <circle cx="98" cy="24" r="34" fill="#646a87" opacity="0.9" />
          <circle cx="88" cy="18" r="5" fill="#4b506b" />
          <circle cx="110" cy="28" r="7" fill="#4b506b" />
          <circle cx="96" cy="38" r="4" fill="#4b506b" />

          {/* Glowing Sun */}
          <circle cx="38" cy="56" r="24" fill="url(#sunOrbGrad)" />

          {/* Bottom-left icy planet */}
          <circle cx="18" cy="176" r="34" fill="#bae6fd" opacity="0.85" />
          <path d="M-10,165 Q20,152 38,180" fill="none" stroke="#38bdf8" strokeWidth="6" opacity="0.55" />

          {/* Comet Rocket */}
          {roomStatus !== 'betting' && animationsEnabled && (
            <g transform={`translate(${rocketX}, ${rocketY})`}>
              {roomStatus === 'running' && (
                <g className="lm-turbulence-float">
                  <path
                    d="M-98,0 Q-55,-18 -12,-10 L-12,10 Q-55,18 -98,0 Z"
                    fill="url(#cometFlame)"
                    className="lm-flame-flicker"
                  />
                  {/* Thruster nozzle */}
                  <rect x="-14" y="-12" width="12" height="24" rx="3" fill="#475569" />
                  {/* Upper & lower fins */}
                  <polygon points="-4,-14 14,-24 22,-12" fill="#e11d48" />
                  <polygon points="-4,14 14,24 22,12" fill="#be123c" />
                  {/* Body */}
                  <ellipse cx="22" cy="0" rx="28" ry="16" fill="#4c1d95" />
                  {/* Nose cone */}
                  <path d="M36,-14 Q62,0 36,14 Z" fill="#e11d48" />
                  {/* Cockpit window */}
                  <circle cx="24" cy="-3" r="6" fill="#38bdf8" stroke="#c4b5fd" strokeWidth="2" />
                </g>
              )}

              {roomStatus === 'crashed' && (
                <g>
                  <circle cx="15" cy="0" r="24" fill="none" stroke="#f97316" strokeWidth="3" className="lm-shockwave" />
                  <circle cx="15" cy="0" r="14" fill="#fde047" opacity="0.7" className="lm-shockwave" />
                </g>
              )}
            </g>
          )}
        </svg>

        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
          {roomStatus === 'betting' ? (
            <>
              <span className="text-xs font-bold uppercase tracking-widest text-[#a5b4fc]">
                Launching Comet
              </span>
              <span className="mt-1 font-mono text-4xl font-extrabold text-white tabular-nums sm:text-5xl">
                {countdown.toFixed(1)}s
              </span>
              <div className="mt-2.5 h-1.5 w-40 overflow-hidden rounded-full bg-[#0c1028]">
                <div
                  className="h-full bg-[#22c55e] transition-all duration-150"
                  style={{ width: `${Math.min(100, (countdown / 10) * 100)}%` }}
                />
              </div>
            </>
          ) : roomStatus === 'crashed' ? (
            <div className="lm-modal-pop flex flex-col items-center">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#f87171]">
                COMET SHATTERED
              </span>
              <span className="font-mono text-5xl font-extrabold text-[#ef4444] tabular-nums sm:text-6xl">
                {(lastCrashedPoint ?? multiplier).toFixed(2)}x
              </span>
            </div>
          ) : (
            <span className="font-mono text-5xl font-extrabold text-white tabular-nums sm:text-6xl drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              {multiplier.toFixed(2)}x
            </span>
          )}
        </div>

        <div className="absolute bottom-2.5 right-2.5 z-10 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 font-mono text-[11px] font-bold text-[#a5b4fc]">
          {connectedPlayers} Live
        </div>
      </div>
    </div>
  );
}
