import type { Dispatch, ReactNode, SetStateAction } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  Crown,
  Flame,
  Maximize2,
  Menu,
  Minimize2,
  Minus,
  Plus,
  RefreshCw,
  Rocket,
  Sparkles,
  Terminal,
  Waves,
  Zap,
} from 'lucide-react';
import { formatDirectLocalMoney, formatMoney, getCountryConfig } from '../../lib/countries';
import { AccountMode, CountryOption, CrashGameId, RoomBetPublic, RoomRoundPublic } from '../../types';
import { CrashDualBalanceBar, HeaderTopBalanceBadge } from './CrashDualBalanceBar';
import {
  getMultiplierPillBg,
  LiveBetsBoard,
  LiveCashoutNotice,
} from './LiveBetsBoard';
import { ThemedOtherStage } from './OtherCrashStages';

export type OtherCrashGameId =
  | 'swimminator'
  | 'punchinator'
  | 'crash-3dx'
  | 'crash-royale'
  | 'fortune-spins'
  | 'spaceman'
  | 'original';

export interface SlipDraftState {
  mode: 'bet' | 'auto';
  stakeAmount: string;
  autoCashoutEnabled: boolean;
  autoCashoutInput: string;
  autoPlayEnabled: boolean;
  queuedNextRound: boolean;
  submitting: boolean;
  message: { ok: boolean; text: string } | null;
}

interface RoomThemeConfig {
  title: string;
  pageBg: string;
  headerBg: string;
  cardBg: string;
  inputBg: string;
  accentHex: string;
  betBtnClass: string;
  cashoutBtnClass: string;
  cancelBtnClass: string;
  chipActiveClass: string;
  betLabel: string;
  cashoutLabel: string;
  queueLabel: string;
  autoTitle: string;
  presets: number[];
  targets: { label: string; value: number }[];
  icon: ReactNode;
}

const THEME_CONFIGS: Record<OtherCrashGameId, RoomThemeConfig> = {
  swimminator: {
    title: 'Swimminator',
    pageBg: 'bg-[#031926] text-white',
    headerBg: 'border-b border-[#0e7490]/60 bg-[#05293b]',
    cardBg: 'rounded-2xl border border-[#155e75] bg-[#072636]',
    inputBg: 'border border-[#164e63] bg-[#041a26]',
    accentHex: '#22d3ee',
    betBtnClass: 'bg-gradient-to-br from-[#06b6d4] to-[#0284c7] text-[#031824] hover:brightness-110',
    cashoutBtnClass: 'bg-gradient-to-br from-[#34d399] to-[#10b981] text-[#022c22] hover:brightness-110',
    cancelBtnClass: 'bg-[#e11d48] text-white hover:bg-[#f43f5e]',
    chipActiveClass: 'border-[#22d3ee] bg-[#0e7490]/50 text-[#cffafe]',
    betLabel: 'DIVE',
    cashoutLabel: 'SURFACE',
    queueLabel: 'NEXT DIVE',
    autoTitle: 'Depth Lock',
    presets: [50, 200, 1000],
    targets: [
      { label: 'Shallow 1.5x', value: 1.5 },
      { label: 'Reef 2.5x', value: 2.5 },
      { label: 'Trench 5x', value: 5.0 },
    ],
    icon: <Waves className="h-4 w-4 text-[#22d3ee]" aria-hidden="true" />,
  },
  punchinator: {
    title: 'Punchinator',
    pageBg: 'bg-[#120406] text-white',
    headerBg: 'border-b border-[#7f1d1d]/70 bg-[#1e070b]',
    cardBg: 'rounded-xl border border-[#7f1d1d] bg-[#1f0a0e]',
    inputBg: 'border border-[#7f1d1d]/80 bg-[#140608]',
    accentHex: '#ef4444',
    betBtnClass: 'bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white hover:brightness-110',
    cashoutBtnClass: 'bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-[#1c0d02] hover:brightness-110',
    cancelBtnClass: 'bg-[#3f3f46] text-white hover:bg-[#52525b]',
    chipActiveClass: 'border-[#ef4444] bg-[#7f1d1d]/60 text-white',
    betLabel: 'STRIKE',
    cashoutLabel: 'COLLECT KO',
    queueLabel: 'NEXT BOUT',
    autoTitle: 'Combo Lock',
    presets: [50, 250, 1000],
    targets: [
      { label: 'Jab 1.4x', value: 1.4 },
      { label: 'Hook 2.5x', value: 2.5 },
      { label: 'Upper 5x', value: 5.0 },
      { label: 'KO 10x', value: 10.0 },
    ],
    icon: <Flame className="h-4 w-4 text-[#ef4444]" aria-hidden="true" />,
  },
  'crash-3dx': {
    title: 'Crash 3DX',
    pageBg: 'bg-[#090418] text-white',
    headerBg: 'border-b border-[#5b21b6]/70 bg-[#12072e]',
    cardBg: 'rounded-2xl border border-[#6d28d9]/70 bg-[#150b2e]',
    inputBg: 'border border-[#5b21b6] bg-[#0c061f]',
    accentHex: '#22d3ee',
    betBtnClass: 'bg-gradient-to-r from-[#22d3ee] to-[#a855f7] text-[#090418] hover:brightness-110',
    cashoutBtnClass: 'bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-[#042410] hover:brightness-110',
    cancelBtnClass: 'bg-[#e11d48] text-white hover:bg-[#f43f5e]',
    chipActiveClass: 'border-[#22d3ee] bg-[#4c1d95]/70 text-[#cffafe]',
    betLabel: 'LAUNCH 3DX',
    cashoutLabel: 'EJECT',
    queueLabel: 'QUEUE WARP',
    autoTitle: 'Auto Eject',
    presets: [100, 500, 2500],
    targets: [
      { label: '1.25x', value: 1.25 },
      { label: '2.00x', value: 2.0 },
      { label: '3.50x', value: 3.5 },
      { label: '10.0x', value: 10.0 },
    ],
    icon: <Zap className="h-4 w-4 text-[#22d3ee]" aria-hidden="true" />,
  },
  'crash-royale': {
    title: 'Crash Royale',
    pageBg: 'bg-[#0c0902] text-white',
    headerBg: 'border-b border-[#926c15]/70 bg-[#181204]',
    cardBg: 'rounded-2xl border border-[#926c15] bg-[#1a1508]',
    inputBg: 'border border-[#785912] bg-[#110d04]',
    accentHex: '#facc15',
    betBtnClass: 'bg-gradient-to-br from-[#fde047] via-[#facc15] to-[#ca8a04] text-[#1a1302] hover:brightness-105',
    cashoutBtnClass: 'bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-white hover:brightness-110',
    cancelBtnClass: 'bg-[#b91c1c] text-white hover:bg-[#dc2626]',
    chipActiveClass: 'border-[#facc15] bg-[#785912]/50 text-[#fef08a]',
    betLabel: 'STAKE GOLD',
    cashoutLabel: 'CLAIM CROWN',
    queueLabel: 'RESERVE VIP',
    autoTitle: 'Royal Target',
    presets: [100, 500, 2500, 10000],
    targets: [
      { label: 'Silver 2x', value: 2.0 },
      { label: 'Gold 5x', value: 5.0 },
      { label: 'Diamond 15x', value: 15.0 },
    ],
    icon: <Crown className="h-4 w-4 text-[#facc15]" aria-hidden="true" />,
  },
  'fortune-spins': {
    title: 'Fortune Spins',
    pageBg: 'bg-[#04140c] text-white',
    headerBg: 'border-b border-[#166534] bg-[#072114]',
    cardBg: 'rounded-2xl border border-[#166534] bg-[#092416]',
    inputBg: 'border border-[#15803d]/60 bg-[#05180e]',
    accentHex: '#34d399',
    betBtnClass: 'bg-gradient-to-r from-[#34d399] to-[#10b981] text-[#032012] hover:brightness-110',
    cashoutBtnClass: 'bg-gradient-to-r from-[#fde047] to-[#eab308] text-[#1f1702] hover:brightness-110',
    cancelBtnClass: 'bg-[#dc2626] text-white hover:bg-[#ef4444]',
    chipActiveClass: 'border-[#34d399] bg-[#166534]/60 text-[#d1fae5]',
    betLabel: 'SPIN BET',
    cashoutLabel: 'COLLECT WIN',
    queueLabel: 'NEXT SPIN',
    autoTitle: 'Wheel Sector',
    presets: [25, 100, 500],
    targets: [
      { label: 'Emerald 1.5x', value: 1.5 },
      { label: 'Ruby 3x', value: 3.0 },
      { label: 'Sapphire 6x', value: 6.0 },
    ],
    icon: <Sparkles className="h-4 w-4 text-[#34d399]" aria-hidden="true" />,
  },
  spaceman: {
    title: 'Spaceman',
    pageBg: 'bg-[#08071a] text-white',
    headerBg: 'border-b border-[#4338ca]/70 bg-[#100e2e]',
    cardBg: 'rounded-2xl border border-[#4338ca]/70 bg-[#121033]',
    inputBg: 'border border-[#3730a3] bg-[#0b0a24]',
    accentHex: '#818cf8',
    betBtnClass: 'bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white hover:brightness-110',
    cashoutBtnClass: 'bg-gradient-to-r from-[#22d3ee] to-[#0ea5e9] text-[#051c29] hover:brightness-110',
    cancelBtnClass: 'bg-[#e11d48] text-white hover:bg-[#f43f5e]',
    chipActiveClass: 'border-[#818cf8] bg-[#3730a3]/70 text-white',
    betLabel: 'LAUNCH EVA',
    cashoutLabel: 'PARACHUTE',
    queueLabel: 'QUEUE EVA',
    autoTitle: 'Safety Guard',
    presets: [100, 500, 2000],
    targets: [
      { label: 'Safe 1.35x', value: 1.35 },
      { label: 'Orbit 2.5x', value: 2.5 },
      { label: 'Moon 5x', value: 5.0 },
    ],
    icon: <Rocket className="h-4 w-4 text-[#818cf8]" aria-hidden="true" />,
  },
  original: {
    title: 'Original Crash',
    pageBg: 'bg-[#020804] text-white',
    headerBg: 'border-b border-[#166534] bg-[#041108]',
    cardBg: 'rounded-xl border border-[#14532d] bg-[#050d08]',
    inputBg: 'border border-[#166534] bg-[#020704]',
    accentHex: '#22c55e',
    betBtnClass: 'bg-[#22c55e] text-[#021207] hover:bg-[#4ade80]',
    cashoutBtnClass: 'bg-[#facc15] text-[#171202] hover:bg-[#fde047]',
    cancelBtnClass: 'bg-[#ef4444] text-white hover:bg-[#f87171]',
    chipActiveClass: 'border-[#22c55e] bg-[#14532d] text-[#86efac]',
    betLabel: 'ARM SURGE',
    cashoutLabel: 'DISCHARGE',
    queueLabel: 'QUEUE SURGE',
    autoTitle: 'Threshold',
    presets: [50, 200, 1000],
    targets: [
      { label: '1.2x', value: 1.2 },
      { label: '2.0x', value: 2.0 },
      { label: '4.0x', value: 4.0 },
      { label: '8.0x', value: 8.0 },
    ],
    icon: <Terminal className="h-4 w-4 text-[#22c55e]" aria-hidden="true" />,
  },
};

export function isOtherCrashGameId(id: CrashGameId): id is OtherCrashGameId {
  return (
    id === 'swimminator' ||
    id === 'punchinator' ||
    id === 'crash-3dx' ||
    id === 'crash-royale' ||
    id === 'fortune-spins' ||
    id === 'spaceman' ||
    id === 'original'
  );
}

interface OtherCrashRoomViewProps {
  gameId: OtherCrashGameId;
  country?: CountryOption;
  demoBalance: number;
  realBalance: number;
  accountMode: AccountMode;
  isLoggedIn?: boolean;
  roundNumber: number;
  roomStatus: 'betting' | 'running' | 'crashed';
  multiplier: number;
  countdown: number;
  lastCrashedPoint: number | null;
  connectedPlayers: number;
  wsConnected: boolean;
  isFullscreen: boolean;
  menuOpen: boolean;
  animationsEnabled: boolean;
  historyExpanded: boolean;
  activeBets: RoomBetPublic[];
  previousBets: RoomBetPublic[];
  previousCrashPoint: number | null;
  topWins: RoomBetPublic[];
  recentRounds: RoomRoundPublic[];
  liveCashouts: LiveCashoutNotice[];
  slip1Draft: SlipDraftState;
  slip2Draft: SlipDraftState;
  mySlip1Bet: RoomBetPublic | null;
  mySlip2Bet: RoomBetPublic | null;
  setSlip1Draft: Dispatch<SetStateAction<SlipDraftState>>;
  setSlip2Draft: Dispatch<SetStateAction<SlipDraftState>>;
  onBackToLobby: () => void;
  onSelectAccountMode: (mode: AccountMode) => void;
  onOpenWallet: () => void;
  onToggleFullscreen: () => void;
  onToggleMenu: () => void;
  onToggleHistory: () => void;
  onAdjustStake: (slot: 1 | 2, delta: number) => void;
  onScaleStake: (slot: 1 | 2, factor: number) => void;
  onTriggerSlipAction: (slot: 1 | 2) => void;
  renderRoomSwitcherPopover: () => ReactNode;
}

export function OtherCrashRoomView({
  gameId,
  country = 'Kenya',
  demoBalance,
  realBalance,
  accountMode,
  isLoggedIn = false,
  roundNumber,
  roomStatus,
  multiplier,
  countdown,
  lastCrashedPoint,
  connectedPlayers,
  wsConnected,
  isFullscreen,
  animationsEnabled,
  historyExpanded,
  activeBets,
  previousBets,
  previousCrashPoint,
  topWins,
  recentRounds,
  liveCashouts,
  slip1Draft,
  slip2Draft,
  mySlip1Bet,
  mySlip2Bet,
  setSlip1Draft,
  setSlip2Draft,
  onBackToLobby,
  onSelectAccountMode,
  onOpenWallet,
  onToggleFullscreen,
  onToggleMenu,
  onToggleHistory,
  onAdjustStake,
  onScaleStake,
  onTriggerSlipAction,
  renderRoomSwitcherPopover,
}: OtherCrashRoomViewProps) {
  const cfg = THEME_CONFIGS[gameId];
  const countryCfg = getCountryConfig(country);

  const renderSlip = (slot: 1 | 2) => {
    const draft = slot === 1 ? slip1Draft : slip2Draft;
    const setDraft = slot === 1 ? setSlip1Draft : setSlip2Draft;
    const bet = slot === 1 ? mySlip1Bet : mySlip2Bet;
    const isActiveBet = bet?.status === 'active';
    const isBetting = roomStatus === 'betting';
    const isFlying = roomStatus === 'running';
    const stakeNum = Number(draft.stakeAmount) || 0;
    const inputsDisabled = isActiveBet || draft.queuedNextRound || draft.submitting;

    return (
      <div className={`${cfg.cardBg} p-3.5 shadow-lg`}>
        {/* Top Interactive Strategy / Target Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={inputsDisabled}
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  autoCashoutEnabled: !d.autoCashoutEnabled,
                  mode: !d.autoCashoutEnabled ? 'auto' : 'bet',
                }))
              }
              className={`rounded-lg border px-2 py-1 text-[11px] font-bold cursor-pointer disabled:opacity-50 ${
                draft.autoCashoutEnabled
                  ? cfg.chipActiveClass
                  : 'border-white/15 bg-black/25 text-[#9ca3af]'
              }`}
            >
              {cfg.autoTitle}: {draft.autoCashoutEnabled ? 'ON' : 'OFF'}
            </button>

            <div className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 ${cfg.inputBg}`}>
              <input
                type="number"
                step="0.1"
                min={1.01}
                max={100}
                aria-label={`${cfg.title} slip ${slot} auto cashout target`}
                disabled={inputsDisabled}
                value={draft.autoCashoutInput}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    autoCashoutInput: e.target.value,
                    autoCashoutEnabled: true,
                    mode: 'auto',
                  }))
                }
                className="w-12 bg-transparent text-right font-mono text-xs font-bold text-white focus:outline-none disabled:opacity-50"
              />
              <span className="font-mono text-xs font-bold" style={{ color: cfg.accentHex }}>
                x
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setDraft((d) => ({ ...d, autoPlayEnabled: !d.autoPlayEnabled }))
            }
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
              draft.autoPlayEnabled
                ? cfg.chipActiveClass
                : 'border-white/15 bg-black/25 text-[#9ca3af] hover:text-white'
            }`}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${draft.autoPlayEnabled ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>Auto Loop</span>
          </button>
        </div>

        {/* One-tap Game-specific Target Presets */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {cfg.targets.map((target) => {
            const active =
              draft.autoCashoutEnabled &&
              Math.abs(Number(draft.autoCashoutInput) - target.value) < 0.01;
            return (
              <button
                key={target.label}
                type="button"
                disabled={inputsDisabled}
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    autoCashoutEnabled: true,
                    mode: 'auto',
                    autoCashoutInput: target.value.toFixed(2),
                  }))
                }
                className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-40 ${
                  active
                    ? cfg.chipActiveClass
                    : 'border-white/10 bg-black/30 text-[#cbd5e1] hover:text-white'
                }`}
              >
                {target.label}
              </button>
            );
          })}
        </div>

        {/* Stake Control + Primary Action */}
        <div className="mt-2.5 grid grid-cols-[1fr_minmax(125px,44%)] gap-2.5 items-stretch">
          <div className="space-y-2">
            <div className={`flex h-10 items-center justify-between rounded-xl px-1.5 ${cfg.inputBg}`}>
              <button
                type="button"
                aria-label={`Decrease ${cfg.title} slip ${slot} stake`}
                disabled={inputsDisabled}
                onClick={() => onAdjustStake(slot, -countryCfg.betStep)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer disabled:opacity-40"
              >
                <Minus className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <input
                type="number"
                min={countryCfg.minBetLocal}
                max={countryCfg.maxBetLocal}
                aria-label={`${cfg.title} slip ${slot} stake`}
                disabled={inputsDisabled}
                value={draft.stakeAmount}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, stakeAmount: e.target.value }))
                }
                className="w-20 bg-transparent text-center font-mono text-sm font-bold text-white tabular-nums focus:outline-none disabled:opacity-60"
              />
              <button
                type="button"
                aria-label={`Increase ${cfg.title} slip ${slot} stake`}
                disabled={inputsDisabled}
                onClick={() => onAdjustStake(slot, countryCfg.betStep)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                disabled={inputsDisabled}
                onClick={() => onScaleStake(slot, 0.5)}
                className={`rounded-md px-2 py-1 font-mono text-[10px] font-bold text-[#cbd5e1] hover:text-white cursor-pointer disabled:opacity-40 ${cfg.inputBg}`}
              >
                ½
              </button>
              <button
                type="button"
                disabled={inputsDisabled}
                onClick={() => onScaleStake(slot, 2)}
                className={`rounded-md px-2 py-1 font-mono text-[10px] font-bold text-[#cbd5e1] hover:text-white cursor-pointer disabled:opacity-40 ${cfg.inputBg}`}
              >
                2×
              </button>
              {countryCfg.otherCrashPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={inputsDisabled}
                  onClick={() =>
                    setDraft((d) => ({ ...d, stakeAmount: preset.toFixed(2) }))
                  }
                  className={`flex-1 rounded-md px-1.5 py-1 font-mono text-[10px] font-bold text-[#cbd5e1] hover:text-white cursor-pointer disabled:opacity-40 ${cfg.inputBg}`}
                >
                  {preset >= 1000 ? `${preset / 1000}K` : preset}
                </button>
              ))}
            </div>
          </div>

          {isFlying && isActiveBet ? (
            <button
              type="button"
              disabled={draft.submitting}
              onClick={() => onTriggerSlipAction(slot)}
              className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 font-extrabold shadow-lg transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-70 ${cfg.cashoutBtnClass}`}
            >
              <span className="text-xs uppercase tracking-wider">{cfg.cashoutLabel}</span>
              <span className="mt-0.5 font-mono text-sm font-black tabular-nums">
                {formatMoney(bet.amount * multiplier, country)}
              </span>
            </button>
          ) : (isBetting && isActiveBet) || draft.queuedNextRound ? (
            <button
              type="button"
              disabled={draft.submitting}
              onClick={() => onTriggerSlipAction(slot)}
              className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 font-extrabold shadow-lg transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-70 ${cfg.cancelBtnClass}`}
            >
              <span className="text-sm uppercase tracking-wide">CANCEL</span>
              <span className="mt-0.5 font-mono text-[11px] opacity-90">
                {draft.queuedNextRound
                  ? 'Queued'
                  : bet
                  ? formatMoney(bet.amount, country)
                  : formatDirectLocalMoney(stakeNum, country)}
              </span>
            </button>
          ) : (
            <button
              type="button"
              disabled={draft.submitting}
              onClick={() => onTriggerSlipAction(slot)}
              className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 font-extrabold shadow-lg transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-70 ${cfg.betBtnClass}`}
            >
              <span className="text-sm uppercase tracking-wider">
                {draft.submitting ? 'PLACING...' : isFlying ? cfg.queueLabel : cfg.betLabel}
              </span>
              <span className="mt-0.5 font-mono text-xs font-bold tabular-nums opacity-95">
                {formatDirectLocalMoney(stakeNum, country)}
              </span>
            </button>
          )}
        </div>

        {draft.message && (
          <p
            className={`mt-2 text-center text-[11px] font-semibold ${
              draft.message.ok ? 'text-[#34d399]' : 'text-[#fb7185]'
            }`}
          >
            {draft.message.text}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${cfg.pageBg}`}>
      <header className={`sticky top-0 z-30 flex h-12 items-center justify-between gap-2 px-3.5 ${cfg.headerBg}`}>
        <button
          type="button"
          onClick={onBackToLobby}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:opacity-80 cursor-pointer shrink-0"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Go Back</span>
        </button>

        <HeaderTopBalanceBadge
          demoBalance={demoBalance}
          realBalance={realBalance}
          accountMode={accountMode}
          country={country}
          isLoggedIn={isLoggedIn}
          onOpenWallet={onOpenWallet}
        />

        <div className="flex items-center gap-2 text-xs shrink-0">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              wsConnected ? 'bg-[#22c55e]' : 'bg-[#ef4444]'
            }`}
          />
          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#cbd5e1] hover:text-white cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      <div className="relative mx-auto max-w-2xl space-y-2.5 px-2.5 py-2.5 pb-8 lg:max-w-5xl">
        {/* Room Bar + Wallet + Room Switcher */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            {cfg.icon}
            <div>
              <h1 className="text-base font-black leading-none tracking-tight">{cfg.title}</h1>
              <p className="mt-0.5 font-mono text-[10px] text-[#94a3b8]">Round #{roundNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CrashDualBalanceBar
              demoBalance={demoBalance}
              realBalance={realBalance}
              accountMode={accountMode}
              country={country}
              isLoggedIn={isLoggedIn}
              onSelectMode={onSelectAccountMode}
              onOpenWallet={onOpenWallet}
            />

            <button
              type="button"
              aria-label="Open room switcher"
              onClick={onToggleMenu}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-white cursor-pointer ${cfg.inputBg}`}
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {renderRoomSwitcherPopover()}

        {/* Recent Multiplier History Strip */}
        <div className="flex items-center gap-1.5 px-1">
          <div className="no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto">
            {recentRounds.length === 0 ? (
              <span className="text-xs text-[#94a3b8]">Loading round history...</span>
            ) : (
              recentRounds.slice(0, 12).map((r) => {
                const cp = r.crashPoint ?? 1.0;
                return (
                  <span
                    key={r.roundId}
                    className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums ${getMultiplierPillBg(
                      cp
                    )}`}
                  >
                    {cp.toFixed(2)}x
                  </span>
                );
              })
            )}
          </div>
          <button
            type="button"
            aria-label="Toggle full multiplier history"
            onClick={onToggleHistory}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#cbd5e1] cursor-pointer ${cfg.inputBg}`}
          >
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {historyExpanded && recentRounds.length > 0 && (
          <div className={`${cfg.cardBg} flex flex-wrap gap-1.5 p-2.5`}>
            {recentRounds.map((r) => {
              const cp = r.crashPoint ?? 1.0;
              return (
                <span
                  key={r.roundId}
                  className={`rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums ${getMultiplierPillBg(
                    cp
                  )}`}
                >
                  #{r.roundNumber} · {cp.toFixed(2)}x
                </span>
              );
            })}
          </div>
        )}

        {/* Bespoke Animated Stage */}
        <ThemedOtherStage
          gameId={gameId}
          roomStatus={roomStatus}
          multiplier={multiplier}
          countdown={countdown}
          lastCrashedPoint={lastCrashedPoint}
          activeBetsCount={activeBets.length}
          connectedPlayers={connectedPlayers}
          animationsEnabled={animationsEnabled}
        />

        {/* Dual Unique Betslips */}
        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
          {renderSlip(1)}
          {renderSlip(2)}
        </div>

        {/* Live Players / Cashout Odds & Payout Board */}
        <LiveBetsBoard
          theme={gameId}
          country={country}
          roundNumber={roundNumber}
          roomStatus={roomStatus}
          multiplier={multiplier}
          connectedPlayers={connectedPlayers}
          activeBets={activeBets}
          previousBets={previousBets}
          previousCrashPoint={previousCrashPoint}
          topWins={topWins}
          recentRounds={recentRounds}
          liveCashouts={liveCashouts}
        />
      </div>
    </div>
  );
}
