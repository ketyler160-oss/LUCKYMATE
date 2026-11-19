import { OtherCrashGameId } from './OtherCrashRoomView';

interface OtherStageProps {
  gameId: OtherCrashGameId;
  roomStatus: 'betting' | 'running' | 'crashed';
  multiplier: number;
  countdown: number;
  lastCrashedPoint: number | null;
  activeBetsCount: number;
  connectedPlayers: number;
  animationsEnabled?: boolean;
}

export function ThemedOtherStage(props: OtherStageProps) {
  switch (props.gameId) {
    case 'swimminator':
      return <SwimminatorStage {...props} />;
    case 'punchinator':
      return <PunchinatorStage {...props} />;
    case 'crash-3dx':
      return <Crash3DXStage {...props} />;
    case 'crash-royale':
      return <CrashRoyaleStage {...props} />;
    case 'fortune-spins':
      return <FortuneSpinsStage {...props} />;
    case 'spaceman':
      return <SpacemanStage {...props} />;
    case 'original':
      return <OriginalTerminalStage {...props} />;
  }
}

function SwimminatorStage({
  roomStatus,
  multiplier,
  countdown,
  lastCrashedPoint,
  activeBetsCount,
  connectedPlayers,
  animationsEnabled = true,
}: OtherStageProps) {
  const progress = Math.min(1, Math.log(Math.max(1, multiplier)) / Math.log(12));
  const diverX = 52 + (animationsEnabled ? progress * 245 : 70);
  const diverY = 148 - (animationsEnabled ? Math.sin(progress * Math.PI * 1.4) * 28 + progress * 68 : 28);
  const depthMeters = Math.round(12 + (multiplier - 1) * 86);
  const pressureAtm = (1 + depthMeters / 10).toFixed(1);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#0e7490] shadow-xl ${
        roomStatus === 'crashed' && animationsEnabled ? 'lm-crash-shake' : ''
      }`}
      style={{
        background:
          'linear-gradient(180deg, #064e63 0%, #053348 48%, #021824 100%)',
      }}
    >
      <div className="relative h-60 w-full sm:h-68">
        <svg viewBox="0 0 360 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="oceanRays" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="swimWaveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#083344" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Caustic Sunlight Beams */}
          <polygon points="35,0 80,0 130,200 5,200" fill="url(#oceanRays)" />
          <polygon points="145,0 198,0 250,200 110,200" fill="url(#oceanRays)" />
          <polygon points="255,0 302,0 350,200 220,200" fill="url(#oceanRays)" />

          {/* Rolling Surface Swell */}
          {animationsEnabled && (
            <g className="lm-wave-scroll" opacity="0.35">
              <path
                d="M0,18 Q30,10 60,18 T120,18 T180,18 T240,18 T300,18 T360,18 T420,18"
                fill="none"
                stroke="#67e8f9"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Depth Sonar Arcs */}
          <circle cx="180" cy="200" r="85" fill="none" stroke="#155e75" strokeDasharray="4 6" />
          <circle cx="180" cy="200" r="145" fill="none" stroke="#155e75" strokeDasharray="4 6" />

          {/* Rising Bubbles */}
          {[
            [42, 165, 3],
            [86, 128, 4.5],
            [140, 152, 2.8],
            [212, 134, 5],
            [268, 96, 3.5],
            [316, 146, 4],
          ].map(([bx, by, br], idx) => (
            <circle
              key={idx}
              cx={bx}
              cy={roomStatus === 'running' && animationsEnabled ? ((by - Math.round(multiplier * 24 + idx * 17)) % 180 + 180) % 180 : by}
              r={br}
              fill="none"
              stroke="#a5f3fc"
              strokeOpacity="0.55"
              strokeWidth="1.2"
            />
          ))}

          {/* Ocean Surface Wave + Diver Trajectory */}
          {roomStatus !== 'betting' && animationsEnabled && (
            <>
              <path
                d={`M 16 175 Q 95 162 170 120 T ${diverX} ${diverY} L ${diverX} 185 L 16 185 Z`}
                fill="url(#swimWaveFill)"
              />
              <path
                d={`M 16 175 Q 95 162 170 120 T ${diverX} ${diverY}`}
                fill="none"
                stroke={roomStatus === 'crashed' ? '#fb7185' : '#22d3ee'}
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              {roomStatus === 'running' && (
                <g transform={`translate(${diverX}, ${diverY}) rotate(-22)`}>
                  <g className="lm-turbulence-float">
                    <path d="M-40,0 Q-28,-3 -22,0 L-22,2 Q-28,4 -40,0 Z" fill="#a5f3fc" className="lm-flame-flicker" opacity="0.8" />
                    <ellipse cx="0" cy="0" rx="18" ry="8" fill="#06b6d4" stroke="#cffafe" strokeWidth="1.5" />
                    <polygon points="-24,-6 -14,0 -24,6" fill="#22d3ee" />
                    <circle cx="8" cy="-1" r="3.5" fill="#ecfeff" />
                  </g>
                </g>
              )}
              {roomStatus === 'crashed' && (
                <circle cx={diverX} cy={diverY} r="20" fill="none" stroke="#fb7185" strokeWidth="2.5" className="lm-shockwave" />
              )}
            </>
          )}
        </svg>

        {/* Sonar HUD Top Bar */}
        <div className="relative z-10 flex items-center justify-between px-3.5 pt-2.5 font-mono text-[11px]">
          <div className="rounded-lg border border-[#22d3ee]/30 bg-[#032433]/80 px-2.5 py-1 text-[#67e8f9]">
            SONAR DEPTH: <span className="font-bold text-white">{depthMeters}m</span>
          </div>
          <div className="rounded-lg border border-[#22d3ee]/30 bg-[#032433]/80 px-2.5 py-1 text-[#a5f3fc]">
            {pressureAtm} ATM · <span className="font-bold text-white">{connectedPlayers} DIVERS</span>
          </div>
        </div>

        {/* Center Multiplier */}
        <div className="relative z-10 flex h-44 flex-col items-center justify-center text-center">
          {roomStatus === 'betting' ? (
            <>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#67e8f9]">
                PRESSURIZING DIVE TANK
              </span>
              <span className="mt-1 font-mono text-4xl font-extrabold text-white tabular-nums sm:text-5xl">
                {countdown.toFixed(1)}s
              </span>
              <div className="mt-2.5 h-2 w-44 overflow-hidden rounded-full bg-[#021d2b]">
                <div
                  className="h-full bg-[#22d3ee] transition-all duration-150"
                  style={{ width: `${Math.min(100, (countdown / 10) * 100)}%` }}
                />
              </div>
            </>
          ) : roomStatus === 'crashed' ? (
            <div className="lm-modal-pop flex flex-col items-center">
              <span className="rounded-full border border-[#fb7185]/40 bg-[#4c0519]/75 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-widest text-[#fda4af]">
                OXYGEN DEPLETED
              </span>
              <span className="mt-1 font-mono text-5xl font-black text-[#fb7185] tabular-nums sm:text-6xl">
                {(lastCrashedPoint ?? multiplier).toFixed(2)}x
              </span>
            </div>
          ) : (
            <>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a5f3fc]">
                CURRENT SURGE
              </span>
              <span className="font-mono text-5xl font-black text-white tabular-nums sm:text-6xl drop-shadow-[0_4px_20px_rgba(34,211,238,0.45)]">
                {multiplier.toFixed(2)}x
              </span>
            </>
          )}
        </div>

        <div className="absolute bottom-2.5 left-3.5 z-10 font-mono text-[11px] font-bold text-[#67e8f9]">
          {activeBetsCount} Active Dives
        </div>
      </div>
    </div>
  );
}

function PunchinatorStage({
  roomStatus,
  multiplier,
  countdown,
  lastCrashedPoint,
  activeBetsCount,
  connectedPlayers,
  animationsEnabled = true,
}: OtherStageProps) {
  const powerPct = Math.min(100, Math.round(Math.log(Math.max(1, multiplier)) / Math.log(10) * 100));
  const impactKg = Math.round(420 + (multiplier - 1) * 950);
  const swingAngle = roomStatus === 'running' && animationsEnabled ? Math.sin(multiplier * 7) * 14 : 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#991b1b] shadow-xl ${
        roomStatus === 'crashed' && animationsEnabled ? 'lm-crash-shake' : ''
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 18%, rgba(220,38,38,0.34) 0%, #24070b 52%, #0e0406 100%)',
      }}
    >
      <div className="relative h-60 w-full sm:h-68">
        <svg viewBox="0 0 360 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {/* Boxing Ring Spotlights */}
          <polygon points="70,0 135,0 185,200 15,200" fill="#ef4444" fillOpacity="0.09" />
          <polygon points="225,0 290,0 345,200 175,200" fill="#f59e0b" fillOpacity="0.08" />

          {/* Ring Ropes */}
          <line x1="0" y1="154" x2="360" y2="154" stroke="#dc2626" strokeOpacity="0.45" strokeWidth="2.5" />
          <line x1="0" y1="170" x2="360" y2="170" stroke="#f8fafc" strokeOpacity="0.2" strokeWidth="2" />
          <line x1="0" y1="186" x2="360" y2="186" stroke="#dc2626" strokeOpacity="0.45" strokeWidth="2.5" />

          {/* Heavy Punching Bag Swinging on Impact */}
          <g transform={`translate(295, 20) rotate(${swingAngle})`}>
            <line x1="0" y1="-20" x2="0" y2="18" stroke="#9ca3af" strokeWidth="2" />
            <rect x="-18" y="18" width="36" height="92" rx="14" fill="#991b1b" stroke="#f87171" strokeWidth="2" />
            <rect x="-18" y="34" width="36" height="14" fill="#18181b" />
          </g>

          {/* Animated Red Boxing Glove Driving Impact */}
          {roomStatus === 'running' && animationsEnabled && (
            <g transform={`translate(${185 + Math.abs(Math.sin(multiplier * 5)) * 75}, 88) rotate(-8)`}>
              <rect x="-32" y="-14" width="18" height="28" rx="4" fill="#f8fafc" />
              <path
                d="M-16,-20 C10,-26 30,-14 30,0 C30,16 12,24 -16,18 Z"
                fill="#ef4444"
                stroke="#fecaca"
                strokeWidth="2"
              />
            </g>
          )}

          {roomStatus === 'crashed' && animationsEnabled && (
            <circle cx="270" cy="88" r="24" fill="none" stroke="#fde047" strokeWidth="3" className="lm-shockwave" />
          )}
        </svg>

        {/* Top Fight HUD */}
        <div className="relative z-10 flex items-center justify-between px-3.5 pt-2.5 text-[11px] font-bold">
          <span className="rounded-md border border-[#ef4444]/40 bg-[#450a0a]/85 px-2.5 py-1 font-mono text-[#fca5a5]">
            FORCE: <span className="text-white">{impactKg.toLocaleString('en-US')} PSI</span>
          </span>
          <span className="rounded-md border border-[#f59e0b]/40 bg-[#271005]/85 px-2.5 py-1 font-mono text-[#fcd34d]">
            {connectedPlayers} RINGSIDE
          </span>
        </div>

        {/* Center Knockout Multiplier */}
        <div className="relative z-10 flex h-40 flex-col items-center justify-center text-center">
          {roomStatus === 'betting' ? (
            <>
              <span className="text-xs font-black uppercase tracking-[0.22em] text-[#fca5a5]">
                BELL RINGS IN
              </span>
              <span className="mt-1 font-mono text-4xl font-black text-white tabular-nums sm:text-5xl">
                {countdown.toFixed(1)}s
              </span>
            </>
          ) : roomStatus === 'crashed' ? (
            <div className="lm-modal-pop flex flex-col items-center">
              <span className="rounded-md bg-[#ef4444] px-3 py-0.5 text-xs font-black uppercase tracking-widest text-white">
                KNOCKOUT!
              </span>
              <span className="mt-1 font-mono text-5xl font-black text-[#f87171] tabular-nums sm:text-6xl">
                {(lastCrashedPoint ?? multiplier).toFixed(2)}x
              </span>
            </div>
          ) : (
            <>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#fcd34d]">
                COMBO MULTIPLIER
              </span>
              <span className="font-mono text-5xl font-black text-white tabular-nums sm:text-6xl drop-shadow-[0_4px_18px_rgba(239,68,68,0.65)]">
                {multiplier.toFixed(2)}x
              </span>
            </>
          )}
        </div>

        {/* Impact Power Meter Bar */}
        <div className="relative z-10 mx-4">
          <div className="mb-1 flex items-center justify-between font-mono text-[10px] font-bold text-[#fca5a5]">
            <span>K.O. POWER METER ({activeBetsCount} FIGHTERS)</span>
            <span>{powerPct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full border border-[#7f1d1d] bg-[#170507]">
            <div
              className="h-full transition-all duration-150"
              style={{
                width: `${roomStatus === 'betting' ? (countdown / 10) * 100 : powerPct}%`,
                background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Crash3DXStage({
  roomStatus,
  multiplier,
  countdown,
  lastCrashedPoint,
  activeBetsCount,
  connectedPlayers,
  animationsEnabled = true,
}: OtherStageProps) {
  const progress = Math.min(1, Math.log(Math.max(1, multiplier)) / Math.log(10));
  const craftX = 68 + progress * 218;
  const craftY = 152 - progress * 92;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#7c3aed]/70 shadow-xl ${
        roomStatus === 'crashed' && animationsEnabled ? 'lm-crash-shake' : ''
      }`}
      style={{
        background:
          'linear-gradient(180deg, #0d0526 0%, #1d0c4a 55%, #0a041c 100%)',
      }}
    >
      <div className="relative h-60 w-full sm:h-68">
        <svg viewBox="0 0 360 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {/* 3D Perspective Grid */}
          {[115, 132, 150, 170, 192].map((y, i) => (
            <line key={i} x1="0" y1={y} x2="360" y2={y} stroke="#7c3aed" strokeOpacity="0.35" strokeWidth="1" />
          ))}
          {[-120, -40, 40, 120, 180, 240, 320, 400, 480].map((bx, i) => (
            <line key={i} x1="180" y1="95" x2={bx} y2="200" stroke="#22d3ee" strokeOpacity="0.22" strokeWidth="1" />
          ))}

          {/* Rotating HUD Reticle */}
          <g className={animationsEnabled && roomStatus === 'running' ? 'lm-wheel-spin' : ''}>
            <circle cx="180" cy="96" r="56" fill="none" stroke="#22d3ee" strokeOpacity="0.28" strokeDasharray="8 6" />
            <circle cx="180" cy="96" r="40" fill="none" stroke="#c084fc" strokeOpacity="0.34" strokeDasharray="3 5" />
          </g>

          {roomStatus !== 'betting' && animationsEnabled && (
            <>
              <polyline
                points={`30,175 110,148 ${craftX},${craftY}`}
                fill="none"
                stroke={roomStatus === 'crashed' ? '#fb7185' : '#22d3ee'}
                strokeWidth="3"
              />
              {roomStatus === 'running' && (
                <g transform={`translate(${craftX}, ${craftY}) rotate(-26)`}>
                  <g className="lm-turbulence-float">
                    <polygon points="-16,8 20,0 -16,-8 -8,0" fill="#22d3ee" stroke="#f0abfc" strokeWidth="1.5" />
                    <polygon points="-32,0 -10,-5 -10,5" fill="#e879f9" className="lm-flame-flicker" />
                  </g>
                </g>
              )}
              {roomStatus === 'crashed' && (
                <circle cx={craftX} cy={craftY} r="22" fill="none" stroke="#fb7185" strokeWidth="2.8" className="lm-shockwave" />
              )}
            </>
          )}
        </svg>

        <div className="relative z-10 flex items-center justify-between px-3.5 pt-2.5 font-mono text-[11px]">
          <span className="rounded border border-[#22d3ee]/40 bg-[#0b0621]/85 px-2 py-0.5 text-[#22d3ee]">
            VECTOR 3DX · {activeBetsCount} UNITS
          </span>
          <span className="rounded border border-[#c084fc]/40 bg-[#0b0621]/85 px-2 py-0.5 text-[#e879f9]">
            {connectedPlayers} ONLINE
          </span>
        </div>

        <div className="relative z-10 flex h-44 flex-col items-center justify-center text-center">
          {roomStatus === 'betting' ? (
            <>
              <span className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#22d3ee]">
                WARP CALIBRATION
              </span>
              <span className="mt-1 font-mono text-4xl font-black text-white tabular-nums sm:text-5xl">
                {countdown.toFixed(1)}s
              </span>
            </>
          ) : roomStatus === 'crashed' ? (
            <div className="lm-modal-pop flex flex-col items-center">
              <span className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#fb7185]">
                SIGNAL LOST
              </span>
              <span className="mt-1 font-mono text-5xl font-black text-[#fb7185] tabular-nums sm:text-6xl">
                {(lastCrashedPoint ?? multiplier).toFixed(2)}x
              </span>
            </div>
          ) : (
            <span className="font-mono text-5xl font-black text-white tabular-nums sm:text-6xl drop-shadow-[0_0_22px_rgba(34,211,238,0.65)]">
              {multiplier.toFixed(2)}x
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function CrashRoyaleStage({
  roomStatus,
  multiplier,
  countdown,
  lastCrashedPoint,
  activeBetsCount,
  connectedPlayers,
  animationsEnabled = true,
}: OtherStageProps) {
  const tierName =
    multiplier >= 10
      ? 'DIAMOND SOVEREIGN'
      : multiplier >= 4
      ? 'GOLD VAULT'
      : multiplier >= 2
      ? 'SILVER CREST'
      : 'BRONZE TIER';
  const vaultFill = Math.min(100, Math.round((Math.log(Math.max(1, multiplier)) / Math.log(15)) * 100));

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#b48318] shadow-xl ${
        roomStatus === 'crashed' && animationsEnabled ? 'lm-crash-shake' : ''
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 42%, rgba(250,204,21,0.24) 0%, #1c1505 55%, #0c0902 100%)',
      }}
    >
      <div className="relative h-60 w-full sm:h-68">
        <svg viewBox="0 0 360 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <g className={animationsEnabled && roomStatus === 'running' ? 'lm-wheel-spin' : ''}>
            <circle cx="180" cy="96" r="78" fill="none" stroke="#eab308" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="10 6" />
            <circle cx="180" cy="96" r="58" fill="none" stroke="#fde047" strokeOpacity="0.35" strokeDasharray="6 6" />
          </g>
          {/* Royal Crown Silhouette */}
          <g transform="translate(180, 34)" className={animationsEnabled ? 'lm-float-gentle' : ''}>
            <path
              d="M-24,14 L-28,-8 L-10,4 L0,-14 L10,4 L28,-8 L24,14 Z"
              fill={roomStatus === 'crashed' ? '#ef4444' : '#facc15'}
              fillOpacity="0.32"
              stroke={roomStatus === 'crashed' ? '#fca5a5' : '#fde047'}
              strokeWidth="1.6"
            />
          </g>
          {roomStatus === 'crashed' && animationsEnabled && (
            <circle cx="180" cy="96" r="32" fill="none" stroke="#f87171" strokeWidth="2.8" className="lm-shockwave" />
          )}
        </svg>

        <div className="relative z-10 flex items-center justify-between px-3.5 pt-2.5 font-mono text-[11px]">
          <span className="rounded-md border border-[#facc15]/40 bg-[#1f1806]/90 px-2.5 py-0.5 font-bold text-[#fde047]">
            {tierName}
          </span>
          <span className="rounded-md border border-[#facc15]/30 bg-[#1f1806]/90 px-2.5 py-0.5 text-[#fef08a]">
            {connectedPlayers} VIPs · {activeBetsCount} STAKES
          </span>
        </div>

        <div className="relative z-10 flex h-40 flex-col items-center justify-center text-center">
          {roomStatus === 'betting' ? (
            <>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#fde047]">
                UNLOCKING ROYAL VAULT
              </span>
              <span className="mt-1 font-mono text-4xl font-black text-white tabular-nums sm:text-5xl">
                {countdown.toFixed(1)}s
              </span>
            </>
          ) : roomStatus === 'crashed' ? (
            <div className="lm-modal-pop flex flex-col items-center">
              <span className="text-xs font-black uppercase tracking-[0.24em] text-[#f87171]">
                VAULT LOCKED
              </span>
              <span className="mt-1 font-mono text-5xl font-black text-[#f87171] tabular-nums sm:text-6xl">
                {(lastCrashedPoint ?? multiplier).toFixed(2)}x
              </span>
            </div>
          ) : (
            <span className="font-mono text-5xl font-black text-[#fef08a] tabular-nums sm:text-6xl drop-shadow-[0_4px_24px_rgba(250,204,21,0.5)]">
              {multiplier.toFixed(2)}x
            </span>
          )}
        </div>

        {/* Tiered Vault Progress Bar */}
        <div className="relative z-10 mx-4">
          <div className="mb-1 flex justify-between font-mono text-[10px] font-bold text-[#fde047]">
            <span>BRONZE 1x</span>
            <span>SILVER 2x</span>
            <span>GOLD 4x</span>
            <span>DIAMOND 10x+</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full border border-[#785912] bg-[#140f03]">
            <div
              className="h-full bg-gradient-to-r from-[#b45309] via-[#facc15] to-[#fef08a] transition-all duration-150"
              style={{
                width: `${roomStatus === 'betting' ? (countdown / 10) * 100 : vaultFill}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FortuneSpinsStage({
  roomStatus,
  multiplier,
  countdown,
  lastCrashedPoint,
  activeBetsCount,
  connectedPlayers,
  animationsEnabled = true,
}: OtherStageProps) {
  const wheelAngle = roomStatus === 'running' && animationsEnabled ? ((multiplier - 1) * 260) % 360 : 0;
  const segments = [
    '#10b981',
    '#f59e0b',
    '#059669',
    '#eab308',
    '#047857',
    '#f97316',
    '#10b981',
    '#facc15',
  ];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#15803d] shadow-xl ${
        roomStatus === 'crashed' && animationsEnabled ? 'lm-crash-shake' : ''
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 45%, rgba(16,185,129,0.28) 0%, #072817 55%, #04150c 100%)',
      }}
    >
      <div className="relative h-60 w-full sm:h-68">
        <svg viewBox="0 0 360 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {/* Top Pointer Clapper */}
          <polygon points="180,26 172,10 188,10" fill="#fde047" stroke="#064e3b" strokeWidth="1.5" />

          {/* Spinning Carnival Wheel */}
          <g transform={`translate(180, 102) rotate(${wheelAngle})`}>
            <circle cx="0" cy="0" r="76" fill="#064e3b" stroke="#fde047" strokeWidth="3" />
            {segments.map((color, idx) => {
              const a0 = (idx * 45 * Math.PI) / 180;
              const a1 = ((idx + 1) * 45 * Math.PI) / 180;
              const x0 = Math.cos(a0) * 72;
              const y0 = Math.sin(a0) * 72;
              const x1 = Math.cos(a1) * 72;
              const y1 = Math.sin(a1) * 72;
              return (
                <path
                  key={idx}
                  d={`M 0 0 L ${x0} ${y0} A 72 72 0 0 1 ${x1} ${y1} Z`}
                  fill={color}
                  fillOpacity="0.3"
                  stroke="#34d399"
                  strokeOpacity="0.55"
                  strokeWidth="1"
                />
              );
            })}
            <circle cx="0" cy="0" r="46" fill="#04190e" stroke="#fde047" strokeWidth="2" />
          </g>
          {roomStatus === 'crashed' && animationsEnabled && (
            <circle cx="180" cy="102" r="36" fill="none" stroke="#fb7185" strokeWidth="3" className="lm-shockwave" />
          )}
        </svg>

        <div className="relative z-10 flex items-center justify-between px-3.5 pt-2.5 font-mono text-[11px]">
          <span className="rounded-full border border-[#34d399]/40 bg-[#052314]/90 px-2.5 py-0.5 text-[#6ee7b7]">
            WHEEL: {activeBetsCount} SPINS
          </span>
          <span className="rounded-full border border-[#fde047]/35 bg-[#052314]/90 px-2.5 py-0.5 text-[#fde047]">
            {connectedPlayers} LIVE
          </span>
        </div>

        <div className="relative z-10 flex h-44 flex-col items-center justify-center text-center">
          {roomStatus === 'betting' ? (
            <>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6ee7b7]">
                SPIN STARTS IN
              </span>
              <span className="font-mono text-3xl font-black text-white tabular-nums sm:text-4xl">
                {countdown.toFixed(1)}s
              </span>
            </>
          ) : roomStatus === 'crashed' ? (
            <div className="lm-modal-pop flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#fb7185]">
                STOPPED
              </span>
              <span className="font-mono text-3xl font-black text-[#fb7185] tabular-nums sm:text-4xl">
                {(lastCrashedPoint ?? multiplier).toFixed(2)}x
              </span>
            </div>
          ) : (
            <span className="font-mono text-3xl font-black text-[#fde047] tabular-nums sm:text-4xl">
              {multiplier.toFixed(2)}x
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SpacemanStage({
  roomStatus,
  multiplier,
  countdown,
  lastCrashedPoint,
  activeBetsCount,
  connectedPlayers,
  animationsEnabled = true,
}: OtherStageProps) {
  const progress = Math.min(1, Math.log(Math.max(1, multiplier)) / Math.log(10));
  const astroX = 80 + progress * 195;
  const astroY = 140 - progress * 72;
  const altitudeKm = Math.round(120 + (multiplier - 1) * 1450);
  const velocityKms = (1.2 + (multiplier - 1) * 2.4).toFixed(2);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#4f46e5]/70 shadow-xl ${
        roomStatus === 'crashed' && animationsEnabled ? 'lm-crash-shake' : ''
      }`}
      style={{
        background:
          'radial-gradient(circle at 70% 25%, rgba(129,140,248,0.28) 0%, #14113a 52%, #08071b 100%)',
      }}
    >
      <div className="relative h-60 w-full sm:h-68">
        <svg viewBox="0 0 360 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {/* Drifting Orbital Stars */}
          <g className={animationsEnabled && roomStatus === 'running' ? 'lm-cloud-drift' : ''} opacity="0.65">
            <circle cx="35" cy="36" r="1.4" fill="#e0e7ff" />
            <circle cx="118" cy="64" r="1.2" fill="#38bdf8" />
            <circle cx="215" cy="28" r="1.6" fill="#fde047" />
            <circle cx="320" cy="142" r="1.3" fill="#e0e7ff" />
            <circle cx="430" cy="52" r="1.5" fill="#38bdf8" />
          </g>

          {/* Orbital Rings */}
          <ellipse cx="180" cy="115" rx="145" ry="42" fill="none" stroke="#6366f1" strokeOpacity="0.25" transform="rotate(-14 180 115)" />
          <ellipse cx="180" cy="115" rx="112" ry="30" fill="none" stroke="#38bdf8" strokeOpacity="0.2" transform="rotate(11 180 115)" />

          {/* Floating Planet */}
          <circle cx="308" cy="48" r="24" fill="#4338ca" opacity="0.85" />
          <ellipse cx="308" cy="48" rx="38" ry="8" fill="none" stroke="#a5b4fc" strokeWidth="2" transform="rotate(-18 308 48)" />

          {/* Astronaut EVA + Flickering Jetpack Plume */}
          {roomStatus !== 'betting' && animationsEnabled && (
            <g transform={`translate(${astroX}, ${astroY}) rotate(-12)`}>
              {roomStatus === 'running' && (
                <g className="lm-turbulence-float">
                  <path
                    d="M-40,4 Q-22,0 -10,-2 L-10,8 Q-22,8 -40,4 Z"
                    fill="#38bdf8"
                    className="lm-flame-flicker"
                  />
                  <rect x="-12" y="-10" width="8" height="18" rx="3" fill="#94a3b8" />
                  <rect x="-5" y="-12" width="14" height="22" rx="6" fill="#f8fafc" />
                  <circle cx="2" cy="-16" r="9" fill="#e2e8f0" />
                  <circle cx="5" cy="-16" r="6" fill="#1e1b4b" />
                </g>
              )}
              {roomStatus === 'crashed' && (
                <circle cx="0" cy="-6" r="22" fill="none" stroke="#fb7185" strokeWidth="2.8" className="lm-shockwave" />
              )}
            </g>
          )}
        </svg>

        <div className="relative z-10 flex items-center justify-between px-3.5 pt-2.5 font-mono text-[11px]">
          <span className="rounded-full border border-[#818cf8]/40 bg-[#0d0b29]/85 px-2.5 py-0.5 text-[#c7d2fe]">
            ALT: {altitudeKm.toLocaleString('en-US')} km · {velocityKms} km/s
          </span>
          <span className="rounded-full border border-[#38bdf8]/40 bg-[#0d0b29]/85 px-2.5 py-0.5 text-[#7dd3fc]">
            {connectedPlayers} CREW · {activeBetsCount} EVAs
          </span>
        </div>

        <div className="relative z-10 flex h-44 flex-col items-center justify-center text-center">
          {roomStatus === 'betting' ? (
            <>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#a5b4fc]">
                EVA LAUNCH COUNTDOWN
              </span>
              <span className="mt-1 font-mono text-4xl font-black text-white tabular-nums sm:text-5xl">
                {countdown.toFixed(1)}s
              </span>
            </>
          ) : roomStatus === 'crashed' ? (
            <div className="lm-modal-pop flex flex-col items-center">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-[#fb7185]">
                OXYGEN LOST
              </span>
              <span className="mt-1 font-mono text-5xl font-black text-[#fb7185] tabular-nums sm:text-6xl">
                {(lastCrashedPoint ?? multiplier).toFixed(2)}x
              </span>
            </div>
          ) : (
            <span className="font-mono text-5xl font-black text-white tabular-nums sm:text-6xl drop-shadow-[0_4px_20px_rgba(99,102,241,0.6)]">
              {multiplier.toFixed(2)}x
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function OriginalTerminalStage({
  roomStatus,
  multiplier,
  countdown,
  lastCrashedPoint,
  activeBetsCount,
  connectedPlayers,
  animationsEnabled = true,
}: OtherStageProps) {
  const voltageKv = (1.2 + (multiplier - 1) * 4.8).toFixed(2);
  const progress = Math.min(1, Math.log(Math.max(1, multiplier)) / Math.log(10));
  const points: string[] = [];
  const stepCount = 24;
  for (let i = 0; i <= stepCount; i += 1) {
    const x = 14 + (i / stepCount) * 332 * (roomStatus === 'betting' ? 0.25 : Math.max(0.25, progress));
    const jitter = i === 0 ? 0 : Math.sin(i * 2.1 + multiplier * 6) * (6 + progress * 14);
    const y = 172 - (i / stepCount) * (roomStatus === 'betting' ? 12 : 120 * progress) + jitter;
    points.push(`${x.toFixed(1)},${Math.max(20, Math.min(182, y)).toFixed(1)}`);
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-[#16a34a]/70 shadow-xl ${
        roomStatus === 'crashed' && animationsEnabled ? 'lm-crash-shake' : ''
      }`}
      style={{
        background: 'linear-gradient(180deg, #020804 0%, #05160b 65%, #020804 100%)',
      }}
    >
      <div className="relative h-60 w-full sm:h-68">
        <svg viewBox="0 0 360 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {/* Oscilloscope Grid */}
          {[40, 80, 120, 160].map((y) => (
            <line key={`hy-${y}`} x1="0" y1={y} x2="360" y2={y} stroke="#14532d" strokeWidth="1" strokeDasharray="3 4" />
          ))}
          {[60, 120, 180, 240, 300].map((x) => (
            <line key={`vx-${x}`} x1={x} y1="0" x2={x} y2="200" stroke="#14532d" strokeWidth="1" strokeDasharray="3 4" />
          ))}

          {roomStatus !== 'betting' && animationsEnabled && (
            <>
              <polyline
                points={points.join(' ')}
                fill="none"
                stroke={roomStatus === 'crashed' ? '#ef4444' : '#22c55e'}
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
              {roomStatus === 'crashed' && (
                <circle cx="180" cy="100" r="28" fill="none" stroke="#ef4444" strokeWidth="2.8" className="lm-shockwave" />
              )}
            </>
          )}
        </svg>

        <div className="relative z-10 flex items-center justify-between px-3.5 pt-2.5 font-mono text-[11px]">
          <span className="border border-[#166534] bg-[#031208]/90 px-2 py-0.5 text-[#4ade80]">
            TERMINAL SURGE · {voltageKv} kV
          </span>
          <span className="border border-[#166534] bg-[#031208]/90 px-2 py-0.5 text-[#86efac]">
            {connectedPlayers} NODES · {activeBetsCount} ARMED
          </span>
        </div>

        <div className="relative z-10 flex h-44 flex-col items-center justify-center text-center">
          {roomStatus === 'betting' ? (
            <>
              <span className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-[#4ade80]">
                CHARGING CAPACITOR
              </span>
              <span className="mt-1 font-mono text-4xl font-black text-white tabular-nums sm:text-5xl">
                {countdown.toFixed(1)}s
              </span>
            </>
          ) : roomStatus === 'crashed' ? (
            <div className="lm-modal-pop flex flex-col items-center">
              <span className="border border-[#ef4444]/60 bg-[#450a0a]/80 px-2.5 py-0.5 font-mono text-xs font-black uppercase tracking-widest text-[#fca5a5]">
                SURGE OVERLOAD!
              </span>
              <span className="mt-1 font-mono text-5xl font-black text-[#ef4444] tabular-nums sm:text-6xl">
                {(lastCrashedPoint ?? multiplier).toFixed(2)}x
              </span>
            </div>
          ) : (
            <span className="font-mono text-5xl font-black text-[#4ade80] tabular-nums sm:text-6xl drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]">
              {multiplier.toFixed(2)}x
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
