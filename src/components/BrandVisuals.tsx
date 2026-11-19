import { CountryOption } from '../types';

export function LuckymateCrest({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="lmGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path
        d="M14 23 L10 10 L22 17 L32 6 L42 17 L54 10 L50 23 Z"
        fill="url(#lmGold)"
        stroke="#fef9c3"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="9" r="2.3" fill="#fef08a" />
      <circle cx="32" cy="5.5" r="2.6" fill="#fef08a" />
      <circle cx="54" cy="9" r="2.3" fill="#fef08a" />
      <circle cx="32" cy="40" r="18" fill="#f8fafc" stroke="url(#lmGold)" strokeWidth="2.5" />
      <polygon points="32,31 39,36 36,44 28,44 25,36" fill="#0f172a" />
      <path
        d="M32 22 L32 31 M47 35 L39 36 M42 54 L36 44 M22 54 L28 44 M17 35 L25 36"
        stroke="#0f172a"
        strokeWidth="2"
      />
      <path d="M24 23 L32 27 L40 23 L37 20 L27 20 Z" fill="#0f172a" />
      <path d="M16 42 L20 38 L18 48 Z" fill="#0f172a" />
      <path d="M48 42 L44 38 L46 48 Z" fill="#0f172a" />
    </svg>
  );
}

export function CountryFlag({
  country,
  className = 'h-4 w-6 rounded-sm',
}: {
  country: CountryOption;
  className?: string;
}) {
  if (country === 'Kenya') {
    return (
      <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
        <rect width="24" height="4.5" y="0" fill="#111827" />
        <rect width="24" height="1" y="4.5" fill="#ffffff" />
        <rect width="24" height="5" y="5.5" fill="#b91c1c" />
        <rect width="24" height="1" y="10.5" fill="#ffffff" />
        <rect width="24" height="4.5" y="11.5" fill="#15803d" />
        <ellipse cx="12" cy="8" rx="2.4" ry="4" fill="#991b1b" stroke="#ffffff" strokeWidth="0.6" />
      </svg>
    );
  }
  if (country === 'Ghana') {
    return (
      <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
        <rect width="24" height="5.33" y="0" fill="#dc2626" />
        <rect width="24" height="5.34" y="5.33" fill="#facc15" />
        <rect width="24" height="5.33" y="10.67" fill="#16a34a" />
        <polygon points="12,5.8 12.7,7.6 14.6,7.6 13.1,8.7 13.6,10.5 12,9.4 10.4,10.5 10.9,8.7 9.4,7.6 11.3,7.6" fill="#111827" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
      <rect width="8" height="16" x="0" fill="#f97316" />
      <rect width="8" height="16" x="8" fill="#ffffff" />
      <rect width="8" height="16" x="16" fill="#16a34a" />
    </svg>
  );
}

export function TeamCrest({
  code,
  colors,
  className = 'h-11 w-11',
}: {
  code: string;
  colors: [string, string];
  className?: string;
}) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`crest-${code}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      <path
        d="M8 9 C8 9 16 6 24 6 C32 6 40 9 40 9 L40 24 C40 34 24 43 24 43 C24 43 8 34 8 24 Z"
        fill={`url(#crest-${code})`}
        stroke="#e2e8f0"
        strokeWidth="2"
      />
      <path
        d="M11 12 L24 9.5 L37 12 L37 24 C37 31.5 24 39 24 39 C24 39 11 31.5 11 24 Z"
        fill="#0b1324"
        fillOpacity="0.62"
      />
      <text
        x="24"
        y="27"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="10"
        fontWeight="800"
        fontFamily="Outfit, sans-serif"
      >
        {code}
      </text>
    </svg>
  );
}

export function AiRobotMascot({ className = 'h-32 w-28' }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 160" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="roboBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="60%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <radialGradient id="roboGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="70" cy="70" r="58" fill="url(#roboGlow)" />
      <rect x="65" y="10" width="10" height="14" rx="4" fill="#94a3b8" />
      <circle cx="70" cy="8" r="5" fill="#38bdf8" />
      <rect x="34" y="24" width="72" height="54" rx="22" fill="url(#roboBody)" stroke="#e2e8f0" strokeWidth="2" />
      <rect x="44" y="34" width="52" height="32" rx="12" fill="#090f24" stroke="#38bdf8" strokeWidth="1.5" />
      <circle cx="58" cy="50" r="6" fill="#38bdf8" />
      <circle cx="82" cy="50" r="6" fill="#38bdf8" />
      <circle cx="59" cy="48" r="2" fill="#ffffff" />
      <circle cx="83" cy="48" r="2" fill="#ffffff" />
      <path d="M62 59 Q70 64 78 59" stroke="#22f06a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="42" y="84" width="56" height="52" rx="18" fill="url(#roboBody)" />
      <circle cx="70" cy="108" r="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
      <circle cx="70" cy="108" r="5" fill="#38bdf8" />
      <path d="M98 92 L122 72" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" />
      <circle cx="124" cy="70" r="6" fill="#f8fafc" />
      <path d="M42 94 L24 114" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" />
      <circle cx="23" cy="116" r="6" fill="#f8fafc" />
    </svg>
  );
}

export function LightningCrashArtwork() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#2b1b0a] via-[#1c1008] to-[#0c1220]">
      <div
        aria-hidden="true"
        className="absolute h-24 w-24 rounded-full bg-[#facc15]/25 blur-xl"
      />
      <svg viewBox="0 0 80 80" className="relative h-16 w-16 drop-shadow-[0_0_14px_rgba(250,204,21,0.85)]" aria-hidden="true">
        <defs>
          <linearGradient id="boltGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
        <polygon
          points="45,8 19,44 38,44 33,72 61,35 42,35"
          fill="url(#boltGrad)"
          stroke="#fef08a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
