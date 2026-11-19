import { useMemo, useState } from 'react';
import { RoomBetPublic, RoomRoundPublic } from '../../types';

export interface LiveCashoutNotice {
  betId: string;
  username: string;
  slot: 1 | 2;
  multiplier: number;
  payout: number;
}

export type LiveBoardTheme =
  | 'aviator'
  | 'jetx'
  | 'b-crash'
  | 'comet-crash'
  | 'swimminator'
  | 'punchinator'
  | 'crash-3dx'
  | 'crash-royale'
  | 'fortune-spins'
  | 'spaceman'
  | 'original';

interface LiveBetsBoardProps {
  theme: LiveBoardTheme;
  roundNumber: number;
  roomStatus: 'betting' | 'running' | 'crashed';
  multiplier: number;
  connectedPlayers: number;
  activeBets: RoomBetPublic[];
  previousBets: RoomBetPublic[];
  previousCrashPoint: number | null;
  topWins: RoomBetPublic[];
  recentRounds: RoomRoundPublic[];
  liveCashouts: LiveCashoutNotice[];
}

const AVATAR_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export function formatKes(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getMultiplierBadgeClass(val: number): string {
  if (val >= 10) return 'text-[#e855c9]';
  if (val >= 2) return 'text-[#9d6bff]';
  return 'text-[#38bdf8]';
}

export function getMultiplierPillBg(val: number): string {
  if (val >= 10) return 'bg-[#3b1536] text-[#f472b6] border-[#6b215f]';
  if (val >= 2) return 'bg-[#261b47] text-[#b794f4] border-[#432c7a]';
  return 'bg-[#122a3a] text-[#38bdf8] border-[#1d455e]';
}

function getInitials(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9]/g, '');
  return (clean.slice(0, 2) || 'LM').toUpperCase();
}

function getAvatarBg(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function LiveBetsBoard({
  theme,
  roundNumber,
  roomStatus,
  multiplier,
  connectedPlayers,
  activeBets,
  previousBets,
  previousCrashPoint,
  topWins,
  recentRounds,
  liveCashouts,
}: LiveBetsBoardProps) {
  const [tab, setTab] = useState<'all' | 'previous' | 'top' | 'multipliers'>('all');

  const totalRoundBets = activeBets.length;
  const cashedOutCount = activeBets.filter((b) => b.status === 'cashed_out').length;
  const totalStakedCurrent = useMemo(
    () => activeBets.reduce((sum, b) => sum + b.amount, 0),
    [activeBets]
  );
  const totalWinCurrent = useMemo(
    () =>
      activeBets.reduce((sum, b) => (b.status === 'cashed_out' ? sum + b.payout : sum), 0),
    [activeBets]
  );

  const displayedBets = useMemo(() => {
    if (tab === 'previous') return previousBets;
    if (tab === 'top') return topWins;
    return activeBets;
  }, [tab, activeBets, previousBets, topWins]);

  const tabTotalWin = useMemo(() => {
    if (tab === 'previous') {
      return previousBets.reduce(
        (sum, b) => (b.status === 'cashed_out' ? sum + b.payout : sum),
        0
      );
    }
    if (tab === 'top') {
      return topWins.reduce((sum, b) => sum + b.payout, 0);
    }
    return totalWinCurrent;
  }, [tab, previousBets, topWins, totalWinCurrent]);

  const tabTotalStaked = useMemo(() => {
    if (tab === 'previous') return previousBets.reduce((sum, b) => sum + b.amount, 0);
    if (tab === 'top') return topWins.reduce((sum, b) => sum + b.amount, 0);
    return totalStakedCurrent;
  }, [tab, previousBets, topWins, totalStakedCurrent]);

  const themeStyles: Record<
    LiveBoardTheme,
    { card: string; bar: string; row: string; activeTab: string }
  > = {
    aviator: {
      card: 'rounded-2xl border border-[#2a2d37] bg-[#1a1c23] p-3',
      bar: 'grid grid-cols-3 rounded-full border border-[#282b36] bg-[#101216] p-1',
      row: 'bg-[#12141a]',
      activeTab: 'bg-[#2c2f3a] text-white shadow',
    },
    jetx: {
      card: 'rounded-2xl border border-[#2c303a] bg-[#1b1e25] p-3',
      bar: 'grid grid-cols-3 rounded-full border border-[#282b36] bg-[#101216] p-1',
      row: 'bg-[#12141a]',
      activeTab: 'bg-[#facc15] text-[#111318] shadow',
    },
    'b-crash': {
      card: 'rounded-2xl border border-[#243b8c] bg-[#13225c] p-3',
      bar: 'grid grid-cols-4 rounded-xl border border-[#29439e] bg-[#0b1540] p-1 gap-1',
      row: 'bg-[#0e1a4a]',
      activeTab: 'bg-[#fef3c7] text-[#0c163f] shadow',
    },
    'comet-crash': {
      card: 'rounded-2xl border border-[#2a366b] bg-[#161f42] p-3',
      bar: 'grid grid-cols-3 rounded-full border border-[#2c3870] bg-[#0f1633] p-1',
      row: 'bg-[#101736]',
      activeTab: 'bg-[#2a3770] text-white shadow',
    },
    swimminator: {
      card: 'rounded-2xl border border-[#155e75] bg-[#072636] p-3',
      bar: 'grid grid-cols-3 rounded-xl border border-[#164e63] bg-[#041a26] p-1',
      row: 'bg-[#083044]',
      activeTab: 'bg-[#06b6d4] text-[#04202e] font-bold shadow',
    },
    punchinator: {
      card: 'rounded-2xl border border-[#7f1d1d] bg-[#1f0a0e] p-3',
      bar: 'grid grid-cols-3 rounded-lg border border-[#7f1d1d] bg-[#140608] p-1',
      row: 'bg-[#2a0f14]',
      activeTab: 'bg-[#ef4444] text-white font-bold shadow',
    },
    'crash-3dx': {
      card: 'rounded-2xl border border-[#6d28d9]/60 bg-[#150b2e] p-3',
      bar: 'grid grid-cols-3 rounded-xl border border-[#5b21b6] bg-[#0c061f] p-1',
      row: 'bg-[#1d103d]',
      activeTab: 'bg-[#22d3ee] text-[#090d1f] font-bold shadow',
    },
    'crash-royale': {
      card: 'rounded-2xl border border-[#926c15] bg-[#1a1508] p-3',
      bar: 'grid grid-cols-3 rounded-xl border border-[#785912] bg-[#110d04] p-1',
      row: 'bg-[#241d0b]',
      activeTab: 'bg-[#facc15] text-[#1a1302] font-bold shadow',
    },
    'fortune-spins': {
      card: 'rounded-2xl border border-[#166534] bg-[#092416] p-3',
      bar: 'grid grid-cols-3 rounded-full border border-[#15803d]/60 bg-[#05180e] p-1',
      row: 'bg-[#0d311e]',
      activeTab: 'bg-[#34d399] text-[#052012] font-bold shadow',
    },
    spaceman: {
      card: 'rounded-2xl border border-[#4338ca]/70 bg-[#121033] p-3',
      bar: 'grid grid-cols-3 rounded-full border border-[#3730a3] bg-[#0b0a24] p-1',
      row: 'bg-[#1a1747]',
      activeTab: 'bg-[#818cf8] text-[#09081c] font-bold shadow',
    },
    original: {
      card: 'rounded-xl border border-[#14532d] bg-[#050d08] p-3',
      bar: 'grid grid-cols-3 rounded-lg border border-[#166534] bg-[#020704] p-1',
      row: 'bg-[#0a170e]',
      activeTab: 'bg-[#22c55e] text-[#021207] font-bold shadow',
    },
  };

  const currentTheme = themeStyles[theme];
  const cardClass = currentTheme.card;
  const tabBarClass = currentTheme.bar;
  const rowBaseClass = currentTheme.row;

  return (
    <div className={cardClass}>
      {theme === 'b-crash' && (
        <p className="mb-2 text-center text-[11px] font-semibold text-[#9fb2f0]">
          Game Statistics
        </p>
      )}

      <div className={tabBarClass}>
        {theme === 'b-crash' ? (
          <>
            <button
              type="button"
              onClick={() => setTab('all')}
              className={`rounded-lg py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                tab === 'all'
                  ? 'bg-[#fef3c7] text-[#0c163f] shadow'
                  : 'text-[#b7c5f4] hover:text-white'
              }`}
            >
              {totalRoundBets} Bets
            </button>
            <button
              type="button"
              onClick={() => setTab('multipliers')}
              className={`rounded-lg py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                tab === 'multipliers'
                  ? 'bg-[#fef3c7] text-[#0c163f] shadow'
                  : 'text-[#b7c5f4] hover:text-white'
              }`}
            >
              Multiplier
            </button>
            <button
              type="button"
              onClick={() => setTab('top')}
              className={`rounded-lg py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                tab === 'top'
                  ? 'bg-[#fef3c7] text-[#0c163f] shadow'
                  : 'text-[#b7c5f4] hover:text-white'
              }`}
            >
              Big Wins
            </button>
            <button
              type="button"
              onClick={() => setTab('previous')}
              className={`rounded-lg py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                tab === 'previous'
                  ? 'bg-[#fef3c7] text-[#0c163f] shadow'
                  : 'text-[#b7c5f4] hover:text-white'
              }`}
            >
              Last Round
            </button>
          </>
        ) : (
          (
            [
              { id: 'all', label: 'All Bets' },
              { id: 'previous', label: 'Previous' },
              { id: 'top', label: 'Top' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-full py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                tab === item.id
                  ? currentTheme.activeTab
                  : 'text-[#8e95a5] hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))
        )}
      </div>

      {/* Summary Row: Live Players, Cashed Out Ratio, Staked KES & Cashed Out KES */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-black/40 bg-[#dc2626] text-[10px] font-bold text-white">
                L
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-black/40 bg-[#d97706] text-[10px] font-bold text-white">
                M
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-black/40 bg-[#16a34a] text-[10px] font-bold text-white">
                P
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-[#e5e7eb] tabular-nums">
              {tab === 'previous'
                ? `${previousBets.filter((b) => b.status === 'cashed_out').length}/${
                    previousBets.length
                  } Cashed Out`
                : tab === 'top'
                ? `${topWins.length} Top Cashouts`
                : tab === 'multipliers'
                ? `${recentRounds.length} Rounds`
                : `${cashedOutCount}/${totalRoundBets} Cashed Out · ${connectedPlayers} Live`}
            </span>
          </div>
          <div className="mt-1.5 h-1 w-32 overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full rounded-full bg-[#28b809] transition-all duration-300"
              style={{
                width:
                  tab === 'all' && totalRoundBets > 0
                    ? `${Math.min(100, Math.max(8, (cashedOutCount / totalRoundBets) * 100))}%`
                    : '18%',
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="font-mono text-xs font-bold text-[#cbd5e1] tabular-nums">
              {formatKes(tabTotalStaked)}
            </p>
            <p className="text-[10px] text-[#9ca3af]">Staked KES</p>
          </div>
          <div>
            <p className="font-mono text-sm font-bold text-[#28c83c] tabular-nums">
              {formatKes(tabTotalWin)}
            </p>
            <p className="text-[10px] text-[#9ca3af]">Cashed Out KES</p>
          </div>
        </div>
      </div>

      {/* Live Cashouts Ticker Strip */}
      {tab === 'all' && liveCashouts.length > 0 && (
        <div className="no-scrollbar mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {liveCashouts.map((c) => (
            <div
              key={`live-cash-${c.betId}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#28b809]/40 bg-[#122416] px-2.5 py-1 text-[11px]"
            >
              <span className="font-semibold text-white">{c.username}</span>
              <span
                className={`font-mono font-bold tabular-nums ${getMultiplierBadgeClass(
                  c.multiplier
                )}`}
              >
                {c.multiplier.toFixed(2)}x
              </span>
              <span className="font-mono font-bold text-[#28c83c] tabular-nums">
                +{formatKes(c.payout)} KES
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'multipliers' ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {recentRounds.length === 0 ? (
            <p className="w-full py-6 text-center text-xs text-[#8b95b5]">
              No completed rounds yet.
            </p>
          ) : (
            recentRounds.map((r) => {
              const cp = r.crashPoint ?? 1.0;
              return (
                <span
                  key={r.roundId}
                  className={`rounded-full border px-2.5 py-1 font-mono text-xs font-bold tabular-nums ${getMultiplierPillBg(
                    cp
                  )}`}
                >
                  #{r.roundNumber} · {cp.toFixed(2)}x
                </span>
              );
            })
          )}
        </div>
      ) : (
        <>
          {tab === 'previous' && previousCrashPoint !== null && (
            <div
              className={`mt-2.5 flex items-center justify-between rounded-xl px-3 py-1.5 text-xs ${rowBaseClass}`}
            >
              <span className="text-[#9ca3af]">Previous Round Result</span>
              <span
                className={`font-mono font-bold tabular-nums ${getMultiplierBadgeClass(
                  previousCrashPoint
                )}`}
              >
                {previousCrashPoint.toFixed(2)}x
              </span>
            </div>
          )}

          {/* Column Headers */}
          <div className="mt-2.5 grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)_minmax(0,0.7fr)_minmax(0,1fr)] items-center gap-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8e95a5]">
            <span>Player</span>
            <span className="text-right">Bet KES</span>
            <span className="text-center">Odds</span>
            <span className="text-right">Cash Out KES</span>
          </div>

          <div className="max-h-64 space-y-1.5 overflow-y-auto pr-0.5">
            {displayedBets.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#6b7280]">
                {tab === 'previous'
                  ? 'No bets recorded in the previous round yet.'
                  : tab === 'top'
                  ? 'No winning cashouts recorded yet in this room.'
                  : `No active bets in Round #${roundNumber}. Place a bet above!`}
              </p>
            ) : (
              displayedBets.map((bet) => {
                const isWon = bet.status === 'cashed_out';
                const isFlyingBet = bet.status === 'active' && roomStatus === 'running';
                const liveValue = bet.amount * multiplier;
                return (
                  <div
                    key={`${tab}-${bet.betId}`}
                    className={`grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)_minmax(0,0.7fr)_minmax(0,1fr)] items-center gap-2 rounded-xl px-2.5 py-2 text-xs ${
                      isWon
                        ? 'border border-[#28b809]/40 bg-[#122416]'
                        : rowBaseClass
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: getAvatarBg(bet.username) }}
                      >
                        {getInitials(bet.username)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{bet.username}</p>
                        <p className="font-mono text-[10px] text-[#8e95a5]">
                          Slip {bet.slot}
                          {bet.autoCashout ? ` · Auto ${bet.autoCashout.toFixed(2)}x` : ''}
                        </p>
                      </div>
                    </div>

                    <span className="text-right font-mono text-[11px] font-semibold text-[#cbd5e1] tabular-nums">
                      {formatKes(bet.amount)}
                    </span>

                    <div className="flex justify-center">
                      {isWon && bet.cashoutMultiplier !== null ? (
                        <span
                          className={`rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums ${getMultiplierPillBg(
                            bet.cashoutMultiplier
                          )}`}
                        >
                          {bet.cashoutMultiplier.toFixed(2)}x
                        </span>
                      ) : isFlyingBet ? (
                        <span className="rounded-full border border-[#38bdf8]/35 bg-[#0f2430] px-2 py-0.5 font-mono text-[11px] font-bold text-[#38bdf8] tabular-nums">
                          {multiplier.toFixed(2)}x
                        </span>
                      ) : bet.status === 'lost' ? (
                        <span className="font-mono text-[11px] text-[#f87171]">—</span>
                      ) : (
                        <span className="font-mono text-[11px] text-[#6b7280]">Ready</span>
                      )}
                    </div>

                    <span
                      className={`text-right font-mono text-[11px] font-bold tabular-nums ${
                        isWon
                          ? 'text-[#28c83c]'
                          : isFlyingBet
                          ? 'text-[#f4d344]'
                          : bet.status === 'lost'
                          ? 'text-[#f87171]'
                          : 'text-[#9ca3af]'
                      }`}
                    >
                      {isWon
                        ? `+${formatKes(bet.payout)}`
                        : isFlyingBet
                        ? formatKes(liveValue)
                        : bet.status === 'lost'
                        ? '0.00'
                        : 'Pending'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
