import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ChevronDown,
  Clock,
  Cpu,
  Receipt,
  RefreshCw,
  Rocket,
  SlidersHorizontal,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { TOP_LEAGUES } from '../data/matches';
import { fetchOfficialLiveScores } from '../lib/api';
import { formatMoney, getCountryConfig } from '../lib/countries';
import {
  buildPopularBetsFromMatches,
  formatKickoffCountdown,
  mapLiveScoreToMatchItem,
} from '../lib/liveScoreMapper';
import { CountryOption, MarketSelection, MatchItem, PopularBetItem, SlipPick } from '../types';
import { HomepageMotionShowcase } from './HomepageMotionShowcase';
import { LiveScoreView } from './LiveScoreView';
import { WorldPlayersView } from './WorldPlayersView';

interface SportsFeedViewProps {
  balance: number;
  country?: CountryOption;
  searchQuery: string;
  liveOnly?: boolean;
  dataSaver?: boolean;
  selectedPicks: SlipPick[];
  onTogglePick: (match: MatchItem, selection: MarketSelection) => void;
  onAddPopularBet: (pop: PopularBetItem) => void;
  onLoadBookingCode: (code: string, availableMatches: MatchItem[]) => void;
  onRemovePick: (matchId: string) => void;
  onClearSlip: () => void;
  onSubmitDemoSlip: (stake: number) => Promise<{ ok: boolean; message: string }>;
  onOpenMarkets: (match: MatchItem) => void;
  onOpenWallet: () => void;
  onNavigateTab: (tab: 'crash' | 'ai-insights' | 'livescore') => void;
  onAnalyzeMatch?: (match: MatchItem) => void;
  onLiveCountUpdate?: (count: number) => void;
  isLoggedIn?: boolean;
}

type FeedSubTab =
  | 'highlights'
  | 'livescore'
  | 'players'
  | 'upcoming'
  | 'countries'
  | 'zoom'
  | 'jackpot';

export function SportsFeedView({
  balance,
  country = 'Kenya',
  searchQuery,
  liveOnly = false,
  dataSaver = false,
  selectedPicks,
  onTogglePick,
  onAddPopularBet,
  onLoadBookingCode,
  onRemovePick,
  onClearSlip,
  onSubmitDemoSlip,
  onOpenMarkets,
  onOpenWallet,
  onNavigateTab,
  onAnalyzeMatch,
  onLiveCountUpdate,
  isLoggedIn = false,
}: SportsFeedViewProps) {
  const [subTab, setSubTab] = useState<FeedSubTab>('highlights');
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [marketMode, setMarketMode] = useState<'1x2' | 'ou'>('1x2');
  const [dayFilter, setDayFilter] = useState<'today' | 'tomorrow' | 'yesterday'>('today');
  const [betslipCollapsed, setBetslipCollapsed] = useState(false);
  const [bookingInputOpen, setBookingInputOpen] = useState(false);
  const [bookingCode, setBookingCode] = useState('LM2026');

  const [realMatches, setRealMatches] = useState<MatchItem[]>([]);
  const [availableLeagues, setAvailableLeagues] = useState<
    { slug: string; name: string; count: number }[]
  >([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [refreshingMatches, setRefreshingMatches] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);

  const [stakeInput, setStakeInput] = useState('100');
  const [placing, setPlacing] = useState(false);
  const [slipMsg, setSlipMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const matchesListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const loadRealMatches = useCallback(
    async (background = false) => {
      if (background) {
        setRefreshingMatches(true);
      } else {
        setLoadingMatches(true);
      }
      setMatchesError(null);

      try {
        const res = await fetchOfficialLiveScores({
          league: leagueFilter,
          day: dayFilter,
        });
        const mapped = res.matches.map(mapLiveScoreToMatchItem);
        setRealMatches(mapped);
        if (leagueFilter === 'all' || res.leagues.length > 0) {
          setAvailableLeagues(res.leagues);
        }
        onLiveCountUpdate?.(res.liveCount);
      } catch (err) {
        setMatchesError(
          err instanceof Error ? err.message : 'Unable to fetch official soccer fixtures.'
        );
      } finally {
        setLoadingMatches(false);
        setRefreshingMatches(false);
      }
    },
    [leagueFilter, dayFilter, onLiveCountUpdate]
  );

  useEffect(() => {
    loadRealMatches(false);
  }, [loadRealMatches]);

  // Keep live soccer scores updated automatically every 15s for real-time clocks
  useEffect(() => {
    const timer = window.setInterval(() => {
      loadRealMatches(true);
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [loadRealMatches]);

  const query = searchQuery.trim().toLowerCase();

  const filteredMatches = useMemo(() => {
    const base = realMatches.filter((m) => {
      if (liveOnly && m.state !== 'in') return false;
      if (subTab === 'upcoming' && m.state !== 'pre') return false;
      if (query) {
        const hay = `${m.homeTeam} ${m.awayTeam} ${m.league} ${m.country}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });

    // For Highlights on Today, keep live & scheduled matches first (still show finished if few)
    if (subTab === 'highlights' && dayFilter === 'today') {
      const active = base.filter((m) => m.state !== 'post');
      if (active.length > 0) {
        const finished = base.filter((m) => m.state === 'post');
        return [...active, ...finished];
      }
    }

    return base;
  }, [realMatches, liveOnly, subTab, query, dayFilter]);

  const popularBets = useMemo(
    () => buildPopularBetsFromMatches(realMatches),
    [realMatches]
  );

  const combinedOdds = selectedPicks.reduce((acc, p) => acc * p.odds, 1);
  const numericStake = Number(stakeInput) || 0;

  const handlePlaceBet = async () => {
    setPlacing(true);
    setSlipMsg(null);
    try {
      const res = await onSubmitDemoSlip(numericStake);
      setSlipMsg({ ok: res.ok, text: res.message });
    } finally {
      setPlacing(false);
    }
  };

  const cycleDayFilter = () => {
    setDayFilter((prev) =>
      prev === 'today' ? 'tomorrow' : prev === 'tomorrow' ? 'yesterday' : 'today'
    );
  };

  const dayLabel =
    dayFilter === 'today' ? 'Today' : dayFilter === 'tomorrow' ? 'Tomorrow' : 'Yesterday';

  return (
    <div className="mx-auto max-w-[1440px] lg:grid lg:grid-cols-[235px_1fr_300px] lg:gap-4 lg:px-5 lg:py-3">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:block space-y-4">
        <div className="overflow-hidden rounded-lg border border-[#232e3f] bg-[#161e28]">
          <div className="border-b border-[#232e3f] px-3.5 py-2.5 text-xs font-bold text-white">
            Top Leagues
          </div>
          <ul className="divide-y divide-[#1e2735]">
            {TOP_LEAGUES.map((lg) => {
              const active = leagueFilter === lg.filter;
              return (
                <li key={lg.name}>
                  <button
                    type="button"
                    onClick={() => setLeagueFilter(lg.filter)}
                    className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#212c3b] text-[#7bc114]'
                        : 'text-[#cbd5e1] hover:bg-[#1c2634] hover:text-white'
                    }`}
                  >
                    <span className="w-5 text-center font-mono text-[10px] font-extrabold text-[#7bc114]" aria-hidden="true">
                      {lg.flag}
                    </span>
                    <span className="truncate">{lg.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#232e3f] bg-[#161e28]">
          <div className="border-b border-[#232e3f] px-3.5 py-2 text-xs font-bold text-white">
            Quick Access
          </div>
          <div className="divide-y divide-[#1e2735]">
            <button
              type="button"
              onClick={() => setSubTab('livescore')}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-[#cbd5e1] hover:bg-[#1c2634] hover:text-white cursor-pointer"
            >
              <Activity className="h-4 w-4 text-[#e11d48]" aria-hidden="true" />
              <span>Official LiveScore</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab('players')}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-[#cbd5e1] hover:bg-[#1c2634] hover:text-white cursor-pointer"
            >
              <Users className="h-4 w-4 text-[#38bdf8]" aria-hidden="true" />
              <span>World Soccer Players</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('crash')}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-[#cbd5e1] hover:bg-[#1c2634] hover:text-white cursor-pointer"
            >
              <Rocket className="h-4 w-4 text-[#7bc114]" aria-hidden="true" />
              <span>Aviator &amp; Crash Games</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('ai-insights')}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-[#cbd5e1] hover:bg-[#1c2634] hover:text-white cursor-pointer"
            >
              <Cpu className="h-4 w-4 text-[#f5c417]" aria-hidden="true" />
              <span>AI Match Insights</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Feed */}
      <div className="min-w-0">
        {/* Sub-Tabs Bar: Highlights | LiveScore | World Players | Upcoming | Countries | Zoom Soccer | Jackpot */}
        <nav
          aria-label="Feed sections"
          className="no-scrollbar flex items-center gap-5 overflow-x-auto bg-[#18212d] px-4 py-3 text-sm"
        >
          {(
            [
              { id: 'highlights', label: 'Highlights' },
              { id: 'livescore', label: 'LiveScore' },
              { id: 'players', label: 'World Players' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'countries', label: 'Leagues' },
              { id: 'zoom', label: 'Zoom Soccer' },
              { id: 'jackpot', label: 'Jackpot' },
            ] as const
          ).map((tab) => {
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id)}
                className={`whitespace-nowrap font-bold transition-colors cursor-pointer ${
                  active
                    ? tab.id === 'livescore' || tab.id === 'players'
                      ? 'text-[#7bc114]'
                      : 'text-white'
                    : 'text-[#8e9bae] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {subTab === 'livescore' ? (
          <LiveScoreView
            compact
            searchQuery={searchQuery}
            selectedPicks={selectedPicks}
            onTogglePick={onTogglePick}
            onAnalyzeMatch={onAnalyzeMatch}
            onLiveCountUpdate={onLiveCountUpdate}
          />
        ) : subTab === 'players' ? (
          <WorldPlayersView compact globalSearchQuery={searchQuery} />
        ) : (
          <>
            <HomepageMotionShowcase
              dataSaver={dataSaver}
              onNavigateTab={onNavigateTab}
              onOpenWallet={onOpenWallet}
              onOpenLivescore={() => setSubTab('livescore')}
              onFocusMatches={() =>
                matchesListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            />

            {/* Filter Chips Row: [Filters ⌄] [Today ⌄] [Highlights ⌄] [1×2 ⌄] [↻] */}
            <div
              ref={matchesListRef}
              className="no-scrollbar flex items-center gap-2 overflow-x-auto bg-[#121821] px-3 py-2.5"
            >
              <button
                type="button"
                onClick={() => {
                  setLeagueFilter('all');
                  setDayFilter('today');
                  setSubTab('highlights');
                  setMarketMode('1x2');
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#242f3e] px-3 text-xs font-semibold text-[#e2e8f0] hover:bg-[#2d3a4c] whitespace-nowrap cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#9aa7b8]" aria-hidden="true" />
                <span>Filters</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#9aa7b8]" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={cycleDayFilter}
                className="inline-flex h-8 items-center gap-1 rounded-full bg-[#242f3e] px-3 text-xs font-semibold text-[#e2e8f0] hover:bg-[#2d3a4c] whitespace-nowrap cursor-pointer"
              >
                <span>{dayLabel}</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#9aa7b8]" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setSubTab((prev) => (prev === 'highlights' ? 'upcoming' : 'highlights'))
                }
                className="inline-flex h-8 items-center gap-1 rounded-full bg-[#242f3e] px-3 text-xs font-semibold text-[#e2e8f0] hover:bg-[#2d3a4c] whitespace-nowrap cursor-pointer"
              >
                <span>{subTab === 'upcoming' ? 'Upcoming' : 'Highlights'}</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#9aa7b8]" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => setMarketMode((prev) => (prev === '1x2' ? 'ou' : '1x2'))}
                className="inline-flex h-8 items-center gap-1 rounded-full bg-[#242f3e] px-3 text-xs font-semibold text-[#e2e8f0] hover:bg-[#2d3a4c] whitespace-nowrap cursor-pointer"
              >
                <span>{marketMode === '1x2' ? '1×2' : 'O/U 2.5'}</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#9aa7b8]" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => loadRealMatches(true)}
                disabled={refreshingMatches || loadingMatches}
                aria-label="Refresh real soccer fixtures"
                className="inline-flex h-8 items-center gap-1 rounded-full bg-[#242f3e] px-2.5 text-xs font-semibold text-[#7bc114] hover:bg-[#2d3a4c] whitespace-nowrap cursor-pointer disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${refreshingMatches ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                <span>Live Feed</span>
              </button>
            </div>

            {/* Competition / Country Pills when Countries tab is active or when a league is filtered */}
            {(subTab === 'countries' || leagueFilter !== 'all') && (
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto px-3 pb-2.5">
                <button
                  type="button"
                  onClick={() => setLeagueFilter('all')}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold cursor-pointer ${
                    leagueFilter === 'all'
                      ? 'bg-[#7bc114] text-[#0b1404]'
                      : 'bg-[#1c2635] text-[#cbd5e1] hover:text-white'
                  }`}
                >
                  All Competitions
                </button>
                {TOP_LEAGUES.filter((l) => l.filter !== 'all').map((lg) => {
                  const liveMeta = availableLeagues.find((a) => a.slug === lg.filter);
                  return (
                    <button
                      key={lg.filter}
                      type="button"
                      onClick={() => setLeagueFilter(lg.filter)}
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold cursor-pointer ${
                        leagueFilter === lg.filter
                          ? 'bg-[#7bc114] text-[#0b1404]'
                          : 'bg-[#1c2635] text-[#cbd5e1] hover:text-white'
                      }`}
                    >
                      {lg.flag} {lg.name}
                      {liveMeta ? ` (${liveMeta.count})` : ''}
                    </button>
                  );
                })}
              </div>
            )}


            {/* Column Header: Actual Time Clock + Teams | 1 | X | 2 */}
            <div className="grid grid-cols-[1fr_186px] items-center px-3.5 pt-2 pb-1 text-xs font-medium text-[#8e9bae] sm:grid-cols-[1fr_216px]">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span>
                  Official Soccer ({filteredMatches.length}{' '}
                  {filteredMatches.length === 1 ? 'Match' : 'Matches'})
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#7bc114] tabular-nums">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {new Date(nowMs).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                  })}
                </span>
              </div>
              <div className="grid grid-cols-3 text-center">
                <span>{marketMode === '1x2' ? '1' : 'Line'}</span>
                <span>{marketMode === '1x2' ? 'X' : 'Over'}</span>
                <span>{marketMode === '1x2' ? '2' : 'Under'}</span>
              </div>
            </div>

            {/* Loading / Error / Real Match List */}
            {loadingMatches && realMatches.length === 0 ? (
              <div className="space-y-2.5 px-3.5 py-3">
                {[1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className="animate-pulse rounded-lg border border-[#1f2937] bg-[#161e28] p-3.5 space-y-2"
                  >
                    <div className="h-3 w-36 rounded bg-[#232f40]" />
                    <div className="h-7 w-full rounded bg-[#1d2736]" />
                    <div className="h-7 w-full rounded bg-[#1d2736]" />
                  </div>
                ))}
              </div>
            ) : matchesError && realMatches.length === 0 ? (
              <div className="mx-3.5 my-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#7f1d1d] bg-[#2a1215] px-4 py-3 text-xs text-[#fecaca]">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-[#f87171]" aria-hidden="true" />
                  <span>{matchesError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => loadRealMatches(false)}
                  className="rounded bg-[#f87171] px-3 py-1 font-bold text-[#1f0909] cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#1e2734]">
                {filteredMatches.length === 0 ? (
                  <div className="px-4 py-10 text-center space-y-2">
                    <p className="text-xs text-[#8e9bae]">
                      No real matches found for this filter on {dayLabel}.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setLeagueFilter('all');
                        setDayFilter('today');
                        setSubTab('highlights');
                      }}
                      className="rounded-lg bg-[#7bc114] px-3.5 py-1.5 text-xs font-extrabold text-[#0b1404] cursor-pointer"
                    >
                      Show All Today&apos;s Games
                    </button>
                  </div>
                ) : (
                  filteredMatches.map((match) => {
                    const activePick = selectedPicks.find((p) => p.matchId === match.id);
                    const isFinished = match.state === 'post';
                    const isLive = match.state === 'in';

                    return (
                      <article
                        key={match.id}
                        className="px-3.5 py-3 transition-colors hover:bg-[#161f2b]"
                      >
                        {/* Top metadata row: Soccer icon / crest + official competition + kickoff / status */}
                        <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] text-[#9aa7b8]">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className="text-xs leading-none text-white" aria-hidden="true">
                              ⚽
                            </span>
                            <span className="truncate">{match.league}</span>
                            {isLive && (
                              <span className="inline-flex items-center gap-1 rounded bg-[#e11d48] px-1.5 py-0.5 font-mono text-[9px] font-extrabold text-white">
                                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                LIVE {match.minute}
                              </span>
                            )}
                            {isFinished && (
                              <span className="rounded bg-[#253141] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#cbd5e1]">
                                {match.statusText || 'FT'}
                              </span>
                            )}
                          </div>
                          <span className="shrink-0 font-mono text-[11px] tabular-nums">
                            {match.kickoff}
                            {!isLive && !isFinished && match.dateIso
                              ? (() => {
                                  const cd = formatKickoffCountdown(match.dateIso, nowMs);
                                  return cd ? ` · ${cd}` : '';
                                })()
                              : ''}
                          </span>
                        </div>

                        {/* Teams + Live/FT Scores + 3 Pill Odds Buttons */}
                        <div className="grid grid-cols-[1fr_186px] items-center gap-2 sm:grid-cols-[1fr_216px]">
                          <div className="min-w-0 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-1.5">
                                {match.homeLogo && (
                                  <img
                                    src={match.homeLogo}
                                    alt=""
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                    className="h-4 w-4 shrink-0 object-contain"
                                  />
                                )}
                                <p className="truncate text-[14px] font-semibold text-[#f1f5f9] leading-snug">
                                  {match.homeTeam}
                                </p>
                              </div>
                              {(isLive || isFinished) && (
                                <span
                                  className={`font-mono text-xs font-extrabold tabular-nums ${
                                    isLive ? 'text-[#f5c417]' : 'text-white'
                                  }`}
                                >
                                  {match.scoreHome ?? 0}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-1.5">
                                {match.awayLogo && (
                                  <img
                                    src={match.awayLogo}
                                    alt=""
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                    className="h-4 w-4 shrink-0 object-contain"
                                  />
                                )}
                                <p className="truncate text-[14px] font-semibold text-[#e2e8f0] leading-snug">
                                  {match.awayTeam}
                                </p>
                              </div>
                              {(isLive || isFinished) && (
                                <span
                                  className={`font-mono text-xs font-extrabold tabular-nums ${
                                    isLive ? 'text-[#f5c417]' : 'text-[#e2e8f0]'
                                  }`}
                                >
                                  {match.scoreAway ?? 0}
                                </span>
                              )}
                            </div>
                          </div>

                          {marketMode === '1x2' ? (
                            <div className="grid grid-cols-3 gap-1.5">
                              {(
                                [
                                  { key: '1', odds: match.odds.home },
                                  { key: 'X', odds: match.odds.draw },
                                  { key: '2', odds: match.odds.away },
                                ] as const
                              ).map((opt) => {
                                const isSelected = activePick?.selection === opt.key;
                                return (
                                  <button
                                    key={opt.key}
                                    type="button"
                                    disabled={isFinished}
                                    onClick={() => {
                                      setSlipMsg(null);
                                      onTogglePick(match, opt.key);
                                    }}
                                    aria-pressed={isSelected}
                                    className={`flex h-9 items-center justify-center rounded-full px-1 font-mono text-[12px] font-bold tabular-nums transition-all active:scale-95 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                                      isSelected
                                        ? 'bg-[#7bc114] text-[#091203] shadow-[0_0_12px_rgba(123,193,20,0.4)]'
                                        : 'bg-[#253141] text-[#f1f5f9] hover:bg-[#314054]'
                                    }`}
                                  >
                                    {opt.odds.toFixed(2)}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-1.5">
                              <span className="flex h-9 items-center justify-center font-mono text-xs font-bold text-[#9aa7b8]">
                                {match.overUnderLine}
                              </span>
                              <button
                                type="button"
                                disabled={isFinished}
                                onClick={() => {
                                  setSlipMsg(null);
                                  onTogglePick(match, 'O');
                                }}
                                className={`flex h-9 items-center justify-center rounded-full px-1 font-mono text-[12px] font-bold tabular-nums cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                                  activePick?.selection === 'O'
                                    ? 'bg-[#7bc114] text-[#091203]'
                                    : 'bg-[#253141] text-[#f1f5f9] hover:bg-[#314054]'
                                }`}
                              >
                                {match.overUnder25.over.toFixed(2)}
                              </button>
                              <button
                                type="button"
                                disabled={isFinished}
                                onClick={() => {
                                  setSlipMsg(null);
                                  onTogglePick(match, 'U');
                                }}
                                className={`flex h-9 items-center justify-center rounded-full px-1 font-mono text-[12px] font-bold tabular-nums cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                                  activePick?.selection === 'U'
                                    ? 'bg-[#7bc114] text-[#091203]'
                                    : 'bg-[#253141] text-[#f1f5f9] hover:bg-[#314054]'
                                }`}
                              >
                                {match.overUnder25.under.toFixed(2)}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Goalscorers + Bottom-right +XX Markets / Players link */}
                        {match.keyEvents && match.keyEvents.some((e) => e.isScoring) && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#98e02a]">
                            {match.keyEvents
                              .filter((e) => e.isScoring)
                              .slice(0, 4)
                              .map((e, idx) => (
                                <span key={`${match.id}-sc-${idx}`} className="inline-flex items-center gap-1">
                                  <span aria-hidden="true">⚽</span>
                                  <span>{e.playerName}</span>
                                  <span className="font-mono text-[10px] text-[#8e9bae] tabular-nums">
                                    {e.minute}
                                  </span>
                                </span>
                              ))}
                          </div>
                        )}
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenMarkets(match)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#cbd5e1] hover:text-white cursor-pointer"
                          >
                            <Users className="h-3 w-3 text-[#38bdf8]" aria-hidden="true" />
                            <span>Players &amp; Lineups</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenMarkets(match)}
                            className="text-[12px] font-bold text-[#7bc114] hover:underline cursor-pointer"
                          >
                            +{match.marketsCount} Markets
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Desktop Right Sidebar (Betslip & Real Popular Bets) */}
      <aside className="hidden lg:block space-y-4">
        <div className="overflow-hidden rounded-lg border border-[#232e3f] bg-[#161e28]">
          <button
            type="button"
            onClick={() => setBetslipCollapsed((prev) => !prev)}
            className="flex w-full items-center justify-between bg-[#f5c417] px-3.5 py-2.5 text-xs font-extrabold tracking-wide text-[#111827] cursor-pointer"
          >
            <span>BETSLIP {selectedPicks.length > 0 ? `(${selectedPicks.length})` : ''}</span>
            <span>{betslipCollapsed ? '+' : '−'}</span>
          </button>

          {!betslipCollapsed && (
            <div className="p-4">
              {selectedPicks.length === 0 ? (
                <div className="py-4 text-center">
                  <Receipt className="mx-auto h-9 w-9 text-[#8e9bae]" aria-hidden="true" />
                  <p className="mt-2 text-xs text-[#8e9bae]">No selections in the betslip</p>
                  <button
                    type="button"
                    onClick={() => setBookingInputOpen((prev) => !prev)}
                    className="mt-3 min-h-[36px] rounded-md bg-[#7bc114] px-4 py-1.5 text-xs font-bold text-[#0b1404] hover:bg-[#8cd61e] cursor-pointer"
                  >
                    Enter Booking Code
                  </button>

                  {bookingInputOpen && (
                    <div className="mt-3 flex gap-1.5">
                      <input
                        type="text"
                        value={bookingCode}
                        onChange={(e) => setBookingCode(e.target.value)}
                        placeholder="e.g. LM2026"
                        className="min-h-[34px] w-full rounded border border-[#2d3a4d] bg-[#101720] px-2.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          onLoadBookingCode(bookingCode, realMatches);
                          setBookingInputOpen(false);
                        }}
                        className="min-h-[34px] rounded bg-[#7bc114] px-3 text-xs font-bold text-[#0b1404] cursor-pointer"
                      >
                        Load
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-[#8e9bae]">
                    {isLoggedIn ? (
                      <span>Balance: {formatMoney(balance, country)}</span>
                    ) : (
                      <span>Log in to view balance</span>
                    )}
                    <button
                      type="button"
                      onClick={onClearSlip}
                      className="font-semibold text-[#f5c417] hover:underline cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="space-y-2">
                    {selectedPicks.map((p) => (
                      <div
                        key={p.matchId}
                        className="flex items-center justify-between gap-2 rounded border border-[#253141] bg-[#101720] px-2.5 py-2 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{p.matchLabel}</p>
                          <p className="text-[11px] text-[#8e9bae]">
                            {p.selectionLabel} ({p.selection})
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-[#7bc114] tabular-nums">
                            {p.odds.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemovePick(p.matchId)}
                            aria-label={`Remove ${p.matchLabel}`}
                            className="text-[#8e9bae] hover:text-white cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#232e3f] pt-3 space-y-2 text-xs">
                    <div className="flex justify-between text-[#8e9bae]">
                      <span>Combined Odds</span>
                      <span className="font-mono font-bold text-white tabular-nums">
                        {combinedOdds.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <label htmlFor="desktop-slip-stake" className="block text-[#8e9bae] mb-1">
                        Stake ({getCountryConfig(country).currency} base)
                      </label>
                      <input
                        id="desktop-slip-stake"
                        type="number"
                        min={1}
                        max={100000}
                        value={stakeInput}
                        onChange={(e) => setStakeInput(e.target.value)}
                        className="min-h-[38px] w-full rounded border border-[#2d3a4d] bg-[#101720] px-3 py-1.5 font-mono text-sm text-white tabular-nums focus:border-[#7bc114] focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-between text-[#8e9bae]">
                      <span>Est. Return</span>
                      <span className="font-mono font-bold text-[#7bc114] tabular-nums">
                        {formatMoney(numericStake * combinedOdds, country)}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={placing}
                      onClick={handlePlaceBet}
                      className="min-h-[40px] w-full rounded bg-[#7bc114] px-4 py-2 text-xs font-extrabold text-[#0b1404] cursor-pointer hover:bg-[#8cd61e] disabled:opacity-60"
                    >
                      {placing ? 'Placing...' : 'Place Bet'}
                    </button>
                  </div>
                </div>
              )}

              {slipMsg && (
                <p
                  role="status"
                  className={`mt-2.5 text-xs font-medium ${
                    slipMsg.ok ? 'text-[#7bc114]' : 'text-[#f87171]'
                  }`}
                >
                  {slipMsg.text}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="font-display text-sm font-bold text-white">Popular bets</h3>
            <button
              type="button"
              onClick={onOpenWallet}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7bc114] hover:underline cursor-pointer"
            >
              <Wallet className="h-3 w-3" aria-hidden="true" />
              Wallet
            </button>
          </div>

          {popularBets.length === 0 ? (
            <div className="rounded-lg border border-[#232e3f] bg-[#161e28] p-3 text-xs text-[#8e9bae]">
              Loading live popular fixtures...
            </div>
          ) : (
            popularBets.map((pop) => (
              <button
                key={pop.id}
                type="button"
                onClick={() => onAddPopularBet(pop)}
                className="flex w-full items-end justify-between rounded-lg border border-[#232e3f] bg-[#161e28] p-3 text-left transition-colors hover:border-[#7bc114] cursor-pointer"
              >
                <div className="min-w-0 pr-2">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-white truncate">
                    <span className="text-[#7bc114]" aria-hidden="true">
                      ⚽
                    </span>
                    <span className="truncate">{pop.matchLabel}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-[#8e9bae]">{pop.market}</p>
                  <p className="text-xs font-bold text-[#7bc114]">{pop.pickLabel}</p>
                </div>
                <span className="font-mono text-xs font-bold text-[#7bc114] tabular-nums shrink-0">
                  {pop.odds.toFixed(2)}
                </span>
              </button>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
