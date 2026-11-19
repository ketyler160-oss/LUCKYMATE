import { useState } from 'react';
import {
  Banknote,
  Check,
  Copy,
  Fan,
  HelpCircle,
  History,
  Home,
  Music,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  Star,
  UserCircle2,
  Volume2,
  X,
} from 'lucide-react';
import { getCountryConfig } from '../../lib/countries';
import { AccountMode, CountryOption, WalletTransaction } from '../../types';
import { formatKes } from './LiveBetsBoard';

export type AvatarId =
  | 'bills'
  | 'plane'
  | 'crown'
  | 'rocket'
  | 'star'
  | 'bolt'
  | 'emerald'
  | 'diamond';

interface AvatarOption {
  id: AvatarId;
  label: string;
  bg: string;
  fg: string;
  symbol: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'bills', label: 'Cash Crest', bg: '#334155', fg: '#e2e8f0', symbol: '$' },
  { id: 'plane', label: 'Aviator Red', bg: '#b91c1c', fg: '#ffffff', symbol: '✈' },
  { id: 'crown', label: 'Royal Gold', bg: '#b45309', fg: '#fef08a', symbol: '♛' },
  { id: 'rocket', label: 'Comet Blue', bg: '#1d4ed8', fg: '#ffffff', symbol: '🚀' },
  { id: 'star', label: 'Lucky Star', bg: '#047857', fg: '#a7f3d0', symbol: '★' },
  { id: 'bolt', label: 'Neon Surge', bg: '#6d28d9', fg: '#f0abfc', symbol: '⚡' },
  { id: 'emerald', label: 'Emerald Spin', bg: '#15803d', fg: '#dcfce7', symbol: '❖' },
  { id: 'diamond', label: 'VIP Diamond', bg: '#0f766e', fg: '#99f6e4', symbol: '◆' },
];

export function CrashAvatarBadge({
  avatarId,
  size = 'md',
}: {
  avatarId: AvatarId;
  size?: 'sm' | 'md' | 'lg';
}) {
  const opt = AVATAR_OPTIONS.find((a) => a.id === avatarId) ?? AVATAR_OPTIONS[0];
  const sizeCls =
    size === 'lg'
      ? 'h-12 w-12 text-lg'
      : size === 'sm'
      ? 'h-7 w-7 text-xs'
      : 'h-10 w-10 text-base';

  if (opt.id === 'bills') {
    return (
      <span
        className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/25 font-black shadow-inner ${sizeCls}`}
        style={{
          background:
            'radial-gradient(circle at 30% 30%, #cbd5e1 0%, #64748b 45%, #1e293b 100%)',
          color: '#0f172a',
        }}
      >
        <span className="font-mono font-black tracking-tighter">$100</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-white/25 font-bold shadow-inner ${sizeCls}`}
      style={{ backgroundColor: opt.bg, color: opt.fg }}
    >
      {opt.symbol}
    </span>
  );
}

export type ActiveMenuModal =
  | null
  | 'avatar'
  | 'free-bets'
  | 'history'
  | 'limits'
  | 'how-to-play'
  | 'rules'
  | 'fairness';

interface CrashHamburgerMenuProps {
  open: boolean;
  onClose: () => void;
  displayName: string;
  gameTitle: string;
  roundNumber: number;
  roundId: string;
  avatarId: AvatarId;
  onChangeAvatar: (id: AvatarId) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
  animationEnabled: boolean;
  onToggleAnimation: () => void;
  walletHistory: WalletTransaction[];
  clientSeed: string;
  onUpdateClientSeed: (seed: string) => void;
  onApplyFreeBet: (amount: number) => void;
  onGoHome: () => void;
  accountMode?: AccountMode;
  country?: CountryOption;
}

export function CrashHamburgerMenu({
  open,
  onClose,
  displayName,
  gameTitle,
  roundNumber,
  roundId,
  avatarId,
  onChangeAvatar,
  soundEnabled,
  onToggleSound,
  musicEnabled,
  onToggleMusic,
  animationEnabled,
  onToggleAnimation,
  walletHistory,
  clientSeed,
  onUpdateClientSeed,
  onApplyFreeBet,
  onGoHome,
  accountMode = 'demo',
  country = 'Kenya',
}: CrashHamburgerMenuProps) {
  const currency = getCountryConfig(country).currency;
  const [activeModal, setActiveModal] = useState<ActiveMenuModal>(null);
  const [seedDraft, setSeedDraft] = useState(clientSeed);
  const [freeBetClaimed, setFreeBetClaimed] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);

  const crashHistory = walletHistory.filter(
    (tx) => tx.type === 'crash_stake' || tx.type === 'crash_cashout' || tx.detail.includes('Slip')
  );

  const openSubModal = (modal: ActiveMenuModal) => {
    setSeedDraft(clientSeed);
    setActiveModal(modal);
    onClose();
  };

  return (
    <>
      {open && (
        <>
          {/* Click-outside backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Exact Screenshot Dropdown Menu Card */}
          <div
            role="dialog"
            aria-label="Game Settings Menu"
            className="absolute right-2 top-11 z-50 w-[min(94vw,360px)] overflow-hidden rounded-2xl border border-[#323642] bg-[#1e2128] text-white shadow-[0_20px_50px_rgba(0,0,0,0.75)]"
          >
            {/* Top Profile Row */}
            <div className="flex items-center justify-between gap-3 bg-[#242830] px-4 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <CrashAvatarBadge avatarId={avatarId} size="lg" />
                <span className="truncate text-sm font-bold text-white">{displayName}</span>
              </div>

              <button
                type="button"
                onClick={() => openSubModal('avatar')}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#434856] bg-[#1b1e25] px-3 py-1.5 text-left text-[11px] font-medium leading-tight text-[#9ca3af] hover:border-white/50 hover:text-white cursor-pointer"
              >
                <UserCircle2 className="h-5 w-5 text-[#6b7280]" aria-hidden="true" />
                <span>
                  Change
                  <br />
                  Avatar
                </span>
              </button>
            </div>

            {/* Toggle Switches: Sound, Music, Animation */}
            <div className="divide-y divide-[#2b2f3a]">
              <button
                type="button"
                role="switch"
                aria-checked={soundEnabled}
                onClick={onToggleSound}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03] cursor-pointer"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-[#e5e7eb]">
                  <Volume2 className="h-4 w-4 text-[#9ca3af]" aria-hidden="true" />
                  <span>Sound</span>
                </span>
                <span
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    soundEnabled ? 'bg-[#28b809]' : 'bg-[#363a45]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-[#e5e7eb] shadow transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </span>
              </button>

              <button
                type="button"
                role="switch"
                aria-checked={musicEnabled}
                onClick={onToggleMusic}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03] cursor-pointer"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-[#e5e7eb]">
                  <Music className="h-4 w-4 text-[#9ca3af]" aria-hidden="true" />
                  <span>Music</span>
                </span>
                <span
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    musicEnabled ? 'bg-[#28b809]' : 'bg-[#363a45]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-[#e5e7eb] shadow transition-transform ${
                      musicEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </span>
              </button>

              <button
                type="button"
                role="switch"
                aria-checked={animationEnabled}
                onClick={onToggleAnimation}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03] cursor-pointer"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-[#e5e7eb]">
                  <Fan className="h-4 w-4 text-[#9ca3af]" aria-hidden="true" />
                  <span>Animation</span>
                </span>
                <span
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    animationEnabled ? 'bg-[#28b809]' : 'bg-[#363a45]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-[#e5e7eb] shadow transition-transform ${
                      animationEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </span>
              </button>
            </div>

            {/* Spacer Band matching reference photo */}
            <div className="h-2.5 bg-[#15171c]" />

            {/* Action Rows */}
            <div className="divide-y divide-[#2b2f3a]">
              <button
                type="button"
                onClick={() => openSubModal('free-bets')}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#e5e7eb] hover:bg-white/[0.04] cursor-pointer"
              >
                <Star className="h-4 w-4 text-[#9ca3af]" aria-hidden="true" />
                <span>Free Bets</span>
              </button>

              <button
                type="button"
                onClick={() => openSubModal('history')}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#e5e7eb] hover:bg-white/[0.04] cursor-pointer"
              >
                <History className="h-4 w-4 text-[#9ca3af]" aria-hidden="true" />
                <span>My Bet History</span>
              </button>

              <button
                type="button"
                onClick={() => openSubModal('limits')}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#e5e7eb] hover:bg-white/[0.04] cursor-pointer"
              >
                <Banknote className="h-4 w-4 text-[#9ca3af]" aria-hidden="true" />
                <span>Game Limits</span>
              </button>

              <button
                type="button"
                onClick={() => openSubModal('how-to-play')}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#e5e7eb] hover:bg-white/[0.04] cursor-pointer"
              >
                <HelpCircle className="h-4 w-4 text-[#9ca3af]" aria-hidden="true" />
                <span>How To Play</span>
              </button>

              <button
                type="button"
                onClick={() => openSubModal('rules')}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#e5e7eb] hover:bg-white/[0.04] cursor-pointer"
              >
                <ScrollText className="h-4 w-4 text-[#9ca3af]" aria-hidden="true" />
                <span>Game Rules</span>
              </button>

              <button
                type="button"
                onClick={() => openSubModal('fairness')}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#e5e7eb] hover:bg-white/[0.04] cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4 text-[#9ca3af]" aria-hidden="true" />
                <span>Provably Fair Settings</span>
              </button>
            </div>

            {/* Bottom Home Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onGoHome();
              }}
              className="flex w-full items-center justify-center gap-2 border-t border-[#2b2f3a] bg-[#181a20] py-3.5 text-sm font-semibold text-[#9ca3af] hover:bg-[#1d2028] hover:text-white cursor-pointer"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span>Home</span>
            </button>
          </div>
        </>
      )}

      {/* Functional Modals triggered by menu rows */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-[#323642] bg-[#1a1d24] text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#2c303a] bg-[#222630] px-4 py-3">
              <h2 className="text-sm font-extrabold tracking-wide text-white">
                {activeModal === 'avatar' && 'Choose Avatar'}
                {activeModal === 'free-bets' && 'Free Bets'}
                {activeModal === 'history' && 'My Bet History'}
                {activeModal === 'limits' && 'Game Limits'}
                {activeModal === 'how-to-play' && `How To Play · ${gameTitle}`}
                {activeModal === 'rules' && 'Game Rules'}
                {activeModal === 'fairness' && 'Provably Fair Settings'}
              </h2>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setActiveModal(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9ca3af] hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-4 text-xs text-[#d1d5db]">
              {activeModal === 'avatar' && (
                <div className="grid grid-cols-4 gap-3">
                  {AVATAR_OPTIONS.map((opt) => {
                    const selected = opt.id === avatarId;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onChangeAvatar(opt.id);
                          setActiveModal(null);
                        }}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 cursor-pointer ${
                          selected
                            ? 'border-[#28b809] bg-[#132916]'
                            : 'border-[#2e323d] bg-[#14171d] hover:border-white/40'
                        }`}
                      >
                        <CrashAvatarBadge avatarId={opt.id} size="lg" />
                        <span className="text-[10px] font-semibold text-white">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {activeModal === 'free-bets' && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-[#28b809]/40 bg-[#122416] p-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#4ade80]">
                          {accountMode === 'real'
                            ? 'QUICK STAKE PRESET'
                            : 'DEMO PRACTICE PRESET'}
                        </p>
                        <p className="mt-0.5 text-lg font-black text-white">
                          {currency} 100.00
                        </p>
                        <p className="text-[11px] text-[#9ca3af]">
                          Pre-fill Slip 1 in {gameTitle} with a {currency} 100 stake.
                        </p>
                      </div>
                      <Star className="h-7 w-7 text-[#facc15]" aria-hidden="true" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onApplyFreeBet(100);
                        setFreeBetClaimed(true);
                        setActiveModal(null);
                      }}
                      className="mt-3 w-full rounded-xl bg-[#28b809] py-2 text-xs font-bold text-white hover:bg-[#2fd10e] cursor-pointer"
                    >
                      {freeBetClaimed
                        ? `Apply ${currency} 100 Stake Again`
                        : 'Use in Betslip 1'}
                    </button>
                  </div>
                </div>
              )}

              {activeModal === 'history' && (
                <div className="space-y-2">
                  {crashHistory.length === 0 ? (
                    <p className="py-6 text-center text-[#9ca3af]">
                      No crash bets placed in this session yet. Place a bet to track your history!
                    </p>
                  ) : (
                    crashHistory.slice(0, 25).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-[#2c303a] bg-[#13151b] px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-bold text-white">{tx.label}</p>
                          <p className="truncate text-[11px] text-[#9ca3af]">{tx.detail}</p>
                        </div>
                        <div className="shrink-0 text-right font-mono">
                          <p
                            className={`font-bold ${
                              tx.status === 'Won'
                                ? 'text-[#28c83c]'
                                : tx.status === 'Lost'
                                ? 'text-[#f87171]'
                                : 'text-[#facc15]'
                            }`}
                          >
                            {tx.amount >= 0 ? `+${formatKes(tx.amount)}` : formatKes(tx.amount)}{' '}
                            {currency}
                          </p>
                          <p className="text-[10px] text-[#9ca3af]">{tx.status}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeModal === 'limits' && (
                <div className="divide-y divide-[#2b2f3a] rounded-xl border border-[#2c303a] bg-[#13151b]">
                  <div className="flex justify-between px-3.5 py-2.5">
                    <span className="text-[#9ca3af]">Minimum Bet</span>
                    <span className="font-mono font-bold text-white">{currency} 10.00</span>
                  </div>
                  <div className="flex justify-between px-3.5 py-2.5">
                    <span className="text-[#9ca3af]">Maximum Bet (per Slip)</span>
                    <span className="font-mono font-bold text-white">{currency} 100,000.00</span>
                  </div>
                  <div className="flex justify-between px-3.5 py-2.5">
                    <span className="text-[#9ca3af]">Auto Cashout Range</span>
                    <span className="font-mono font-bold text-[#facc15]">1.01x – 100.00x</span>
                  </div>
                  <div className="flex justify-between px-3.5 py-2.5">
                    <span className="text-[#9ca3af]">Max Win Per Bet</span>
                    <span className="font-mono font-bold text-[#28c83c]">{currency} 1,000,000.00</span>
                  </div>
                </div>
              )}

              {activeModal === 'how-to-play' && (
                <ol className="space-y-2.5 text-xs leading-relaxed">
                  <li className="rounded-xl border border-[#2c303a] bg-[#13151b] p-3">
                    <span className="font-bold text-white">1. Place Your Stake:</span> Choose your{' '}
                    {currency} stake in Slip 1 and/or Slip 2 during the countdown (or queue for the
                    next round).
                  </li>
                  <li className="rounded-xl border border-[#2c303a] bg-[#13151b] p-3">
                    <span className="font-bold text-white">2. Watch {gameTitle} Climb:</span> The
                    live multiplier increases from 1.00x upward until the round ends.
                  </li>
                  <li className="rounded-xl border border-[#2c303a] bg-[#13151b] p-3">
                    <span className="font-bold text-white">3. Cash Out Before Crash:</span> Hit
                    Cash Out manually or enable Auto Cashout to lock in your winnings automatically.
                  </li>
                </ol>
              )}

              {activeModal === 'rules' && (
                <ul className="space-y-2 text-xs leading-relaxed text-[#cbd5e1]">
                  <li className="rounded-xl border border-[#2c303a] bg-[#13151b] p-3">
                    • Players may run up to two independent bets per round using Dual Betslips.
                  </li>
                  <li className="rounded-xl border border-[#2c303a] bg-[#13151b] p-3">
                    • Bets cancelled before round takeoff are immediately refunded to your{' '}
                    {accountMode === 'real' ? 'Real' : 'Demo'} {currency} wallet.
                  </li>
                  <li className="rounded-xl border border-[#2c303a] bg-[#13151b] p-3">
                    • Auto Cashout triggers automatically on the server even if your connection drops
                    mid-round.
                  </li>
                </ul>
              )}

              {activeModal === 'fairness' && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-[#2c303a] bg-[#13151b] p-3">
                    <p className="text-[11px] font-bold uppercase text-[#9ca3af]">
                      Current Room Reference
                    </p>
                    <p className="mt-1 font-mono text-xs text-white">
                      {gameTitle} · Round #{roundNumber}
                    </p>
                    {roundId && (
                      <p className="mt-1 truncate font-mono text-[11px] text-[#6b7280]">
                        ID: {roundId}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-[#2c303a] bg-[#13151b] p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Your Client Seed</span>
                      <button
                        type="button"
                        onClick={() => {
                          const randomHex = Array.from({ length: 16 }, () =>
                            Math.floor(Math.random() * 16).toString(16)
                          ).join('');
                          setSeedDraft(randomHex);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#38bdf8] hover:underline cursor-pointer"
                      >
                        <RefreshCw className="h-3 w-3" aria-hidden="true" />
                        Randomize
                      </button>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={seedDraft}
                        onChange={(e) => setSeedDraft(e.target.value)}
                        className="flex-1 rounded-lg border border-[#363b47] bg-[#0c0e13] px-2.5 py-1.5 font-mono text-xs text-white focus:border-[#28b809] focus:outline-none"
                      />
                      <button
                        type="button"
                        aria-label="Copy client seed"
                        onClick={() => {
                          navigator.clipboard?.writeText(seedDraft).catch(() => {});
                          setCopiedSeed(true);
                          window.setTimeout(() => setCopiedSeed(false), 1200);
                        }}
                        className="rounded-lg border border-[#363b47] bg-[#1d2029] p-1.5 text-[#cbd5e1] hover:text-white cursor-pointer"
                      >
                        {copiedSeed ? (
                          <Check className="h-4 w-4 text-[#28c83c]" aria-hidden="true" />
                        ) : (
                          <Copy className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const clean = seedDraft.trim() || clientSeed;
                        onUpdateClientSeed(clean);
                        setActiveModal(null);
                      }}
                      className="mt-3 w-full rounded-xl bg-[#28b809] py-2 text-xs font-bold text-white hover:bg-[#2fd10e] cursor-pointer"
                    >
                      Save Client Seed
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
