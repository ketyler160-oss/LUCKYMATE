import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  MapPin,
  RefreshCw,
  Search,
  Trophy,
  Users,
} from 'lucide-react';
import { fetchMatchSummaryDetails, fetchOfficialLiveScores } from '../lib/api';
import { formatActualLocalKickoff, formatKickoffCountdown } from '../lib/liveScoreMapper';
import {
  LiveScoreMatch,
  LiveScoreResponse,
  LiveScoreStatusState,
  LiveScoreTeam,
  MarketSelection,
  MatchItem,
  MatchSummaryDetailsResponse,
  SlipPick,
} from '../types';

interface LiveScoreViewProps {
  searchQuery?: string;
  compact?: boolean;
  defaultStatusFilter?: 'all' | LiveScoreStatusState;
  selectedPicks?: SlipPick[];
  onTogglePick?: (match: MatchItem, selection: MarketSelection) => void;
  onAnalyzeMatch?: (match: MatchItem) => void;
  onLiveCountUpdate?: (count: number) => void;
}

function toMatchItem(m: LiveScoreMatch): MatchItem {
  const homeOdds = m.odds?.home ?? 2.15;
  const drawOdds = m.odds?.draw ?? 3.35;
  const awayOdds = m.odds?.away ?? 3.25;

  return {
    id: `ls-${m.id}`,
    rawEventId: m.id,
    code: m.id.slice(-4),
    league:
      m.league.includes('Premier League')
        ? 'Premier League'
        : m.league.includes('LALIGA')
        ? 'La Liga'
        : m.league.includes('Champions League')
        ? 'Champions League'
        : m.league,
    leagueSlug: m.leagueSlug,
    country: m.league,
    kickoff: formatActualLocalKickoff(m.date, m.kickoffLabel),
    dateIso: m.date,
    minute: m.clock || m.statusText,
    statusText: m.statusText,
    state: m.state,
    venue: m.venue,
    homeTeamId: m.homeTeam.id,
    awayTeamId: m.awayTeam.id,
    scoreHome: m.homeTeam.score ?? undefined,
    scoreAway: m.awayTeam.score ?? undefined,
    isLiveDemo: m.state === 'in',
    isUpcoming: m.state === 'pre',
    marketsCount: m.odds ? 3 : 0,
    homeTeam: m.homeTeam.name,
    awayTeam: m.awayTeam.name,
    homeCode: m.homeTeam.abbreviation,
    awayCode: m.awayTeam.abbreviation,
    homeColors: [`#${m.homeTeam.color || '253141'}`, '#111827'],
    awayColors: [`#${m.awayTeam.color || '253141'}`, '#111827'],
    odds: {
      home: homeOdds,
      draw: drawOdds,
      away: awayOdds,
    },
    doubleChance: {
      homeOrDraw: Number(Math.max(1.05, homeOdds * 0.56).toFixed(2)),
      homeOrAway: Number(Math.max(1.05, 1.28).toFixed(2)),
      drawOrAway: Number(Math.max(1.05, awayOdds * 0.62).toFixed(2)),
    },
    overUnderLine: 2.5,
    overUnder25: {
      over: 1.88,
      under: 1.92,
    },
  };
}

function TeamCrest({ team }: { team: LiveScoreTeam }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!team.logo || imgFailed) {
    return (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#2c3a4f] bg-[#1d2838] font-mono text-[9px] font-extrabold text-[#e2e8f0]"
        aria-hidden="true"
      >
        {team.abbreviation.slice(0, 3)}
      </span>
    );
  }

  return (
    <img
      src={team.logo}
      alt={`${team.name} crest`}
      loading="lazy"
      onError={() => setImgFailed(true)}
      className="h-6 w-6 shrink-0 object-contain"
    />
  );
}

function FormDots({ form }: { form: string }) {
  if (!form) return null;
  const items = form.slice(-5).split('');
  return (
    <span className="inline-flex items-center gap-0.5" title={`Recent form: ${form}`}>
      {items.map((char, idx) => {
        const upper = char.toUpperCase();
        const color =
          upper === 'W'
            ? 'bg-[#7bc114] text-[#0b1404]'
            : upper === 'D'
            ? 'bg-[#f5c417] text-[#111827]'
            : 'bg-[#e11d48] text-white';
        return (
          <span
            key={`${upper}-${idx}`}
            className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded text-[8px] font-black leading-none ${color}`}
          >
            {upper}
          </span>
        );
      })}
    </span>
  );
}

export function LiveScoreView({
  searchQuery = '',
  compact = false,
  defaultStatusFilter = 'all',
  selectedPicks = [],
  onTogglePick,
  onAnalyzeMatch,
  onLiveCountUpdate,
}: LiveScoreViewProps) {
  const [day, setDay] = useState<'yesterday' | 'today' | 'tomorrow'>('today');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | LiveScoreStatusState>(
    defaultStatusFilter
  );
  const [localQuery, setLocalQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [detailsById, setDetailsById] = useState<
    Record<string, { loading: boolean; data?: MatchSummaryDetailsResponse; error?: string }>
  >({});

  const [data, setData] = useState<LiveScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live 1-second real-time clock tick
  useEffect(() => {
    const clockTimer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(clockTimer);
  }, []);

  const loadScores = useCallback(
    async (isBackgroundRefresh = false) => {
      if (isBackgroundRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const res = await fetchOfficialLiveScores({
          league: selectedLeague,
          day,
        });
        setData(res);
        if (onLiveCountUpdate) {
          onLiveCountUpdate(res.liveCount);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load Official LiveScore feed.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [day, selectedLeague, onLiveCountUpdate]
  );

  const handleToggleExpand = useCallback(
    async (match: LiveScoreMatch) => {
      const next = expandedId === match.id ? null : match.id;
      setExpandedId(next);
      if (!next) return;
      if (detailsById[match.id]?.data || detailsById[match.id]?.loading) return;

      setDetailsById((prev) => ({
        ...prev,
        [match.id]: { loading: true },
      }));

      try {
        const summary = await fetchMatchSummaryDetails({
          eventId: match.id,
          leagueSlug: match.leagueSlug,
          homeTeamId: match.homeTeam.id,
          awayTeamId: match.awayTeam.id,
          homeTeamName: match.homeTeam.name,
          awayTeamName: match.awayTeam.name,
          homeLogo: match.homeTeam.logo,
          awayLogo: match.awayTeam.logo,
        });
        setDetailsById((prev) => ({
          ...prev,
          [match.id]: { loading: false, data: summary },
        }));
      } catch (err) {
        setDetailsById((prev) => ({
          ...prev,
          [match.id]: {
            loading: false,
            error: err instanceof Error ? err.message : 'Lineups unavailable.',
          },
        }));
      }
    },
    [expandedId, detailsById]
  );

  useEffect(() => {
    loadScores(false);
  }, [loadScores]);

  // Auto-refresh every 15s while viewing Official LiveScore for real-time match clocks
  useEffect(() => {
    const timer = window.setInterval(() => {
      loadScores(true);
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [loadScores]);

  const effectiveQuery = (searchQuery || localQuery).trim().toLowerCase();

  const filteredMatches = useMemo(() => {
    const raw = data?.matches ?? [];
    return raw.filter((m) => {
      if (statusFilter !== 'all' && m.state !== statusFilter) return false;
      if (effectiveQuery) {
        const hay = `${m.homeTeam.name} ${m.awayTeam.name} ${m.league} ${m.venue}`.toLowerCase();
        if (!hay.includes(effectiveQuery)) return false;
      }
      return true;
    });
  }, [data?.matches, statusFilter, effectiveQuery]);

  // Group matches by official competition/league preserving order
  const groupedLeagues = useMemo(() => {
    const groups: { league: string; slug: string; matches: LiveScoreMatch[] }[] = [];
    const byKey = new Map<string, { league: string; slug: string; matches: LiveScoreMatch[] }>();

    for (const m of filteredMatches) {
      const key = `${m.leagueSlug}:${m.league}`;
      let group = byKey.get(key);
      if (!group) {
        group = { league: m.league, slug: m.leagueSlug, matches: [] };
        byKey.set(key, group);
        groups.push(group);
      }
      group.matches.push(m);
    }
    return groups;
  }, [filteredMatches]);

  const counts = useMemo(() => {
    const all = data?.matches ?? [];
    return {
      all: all.length,
      in: all.filter((m) => m.state === 'in').length,
      pre: all.filter((m) => m.state === 'pre').length,
      post: all.filter((m) => m.state === 'post').length,
    };
  }, [data?.matches]);

  const updatedTimeLabel = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--';

  const actualClockLabel = new Date(nowMs).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const actualDateLabel = new Date(nowMs).toLocaleDateString([], {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <section
      aria-label="Official LiveScore"
      className={compact ? 'space-y-3 px-3 py-3' : 'mx-auto max-w-5xl space-y-4 px-3 py-4 sm:px-5'}
    >
      {/* Official LiveScore Header Banner */}
      <div className="rounded-xl border border-[#232f40] bg-[#161e28] p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e11d48]/15 text-[#fb7185] border border-[#e11d48]/30">
              <Activity className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-base sm:text-lg font-extrabold text-white">
                  Official LiveScore
                </h1>
                <span className="text-[11px] font-bold text-[#7bc114]">
                  Real Matches · Actual Time
                </span>
                {counts.in > 0 && (
                  <span className="rounded bg-[#e11d48] px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-white tabular-nums">
                    {counts.in} LIVE
                  </span>
                )}
              </div>
              <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#8e9bae] tabular-nums">
                <Clock className="h-3 w-3 text-[#7bc114]" aria-hidden="true" />
                <span className="font-mono font-bold text-[#e2e8f0]">
                  {actualDateLabel} · {actualClockLabel}
                </span>
                <span>· Synced {updatedTimeLabel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Day Selector */}
            <div className="inline-flex rounded-lg border border-[#263345] bg-[#101720] p-0.5">
              {(
                [
                  { id: 'yesterday', label: 'Yesterday' },
                  { id: 'today', label: 'Today' },
                  { id: 'tomorrow', label: 'Tomorrow' },
                ] as const
              ).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDay(d.id)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                    day === d.id
                      ? 'bg-[#7bc114] text-[#0b1404]'
                      : 'text-[#8e9bae] hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => loadScores(true)}
              disabled={refreshing || loading}
              aria-label="Refresh official live scores"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#2a384c] bg-[#1c2635] px-2.5 text-xs font-bold text-white hover:border-[#7bc114] disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-[#7bc114] ${refreshing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Status Filter Pills + Quick Local Filter */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#202b3b] pt-3">
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
            {(
              [
                { id: 'all', label: `All (${counts.all})` },
                { id: 'in', label: `Live Now (${counts.in})` },
                { id: 'pre', label: `Scheduled (${counts.pre})` },
                { id: 'post', label: `Full Time (${counts.post})` },
              ] as const
            ).map((f) => {
              const active = statusFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                    active
                      ? f.id === 'in'
                        ? 'bg-[#e11d48] text-white'
                        : 'bg-[#f5c417] text-[#111827]'
                      : 'bg-[#222d3d] text-[#cbd5e1] hover:bg-[#2b394d]'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {!searchQuery && (
            <div className="relative flex-1 min-w-[180px] max-w-[260px]">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7e8da1]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Filter teams or competitions..."
                className="h-8 w-full rounded-lg border border-[#263345] bg-[#101720] pl-8 pr-2.5 text-xs text-white placeholder:text-[#64748b] focus:border-[#7bc114] focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Official League Filter Pills */}
        {data && data.leagues.length > 0 && (
          <div className="no-scrollbar mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setSelectedLeague('all')}
              className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                selectedLeague === 'all'
                  ? 'bg-[#2b3a4f] text-[#7bc114] border border-[#7bc114]/40'
                  : 'bg-[#121923] text-[#8e9bae] border border-[#202b3b] hover:text-white'
              }`}
            >
              <Trophy className="h-3 w-3" aria-hidden="true" />
              <span>All Competitions</span>
            </button>
            {data.leagues.map((lg) => {
              const active = selectedLeague === lg.slug;
              return (
                <button
                  key={lg.slug}
                  type="button"
                  onClick={() => setSelectedLeague(lg.slug)}
                  className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#2b3a4f] text-[#7bc114] border border-[#7bc114]/40'
                      : 'bg-[#121923] text-[#8e9bae] border border-[#202b3b] hover:text-white'
                  }`}
                >
                  {lg.name} ({lg.count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && !data && (
        <div className="space-y-3">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="animate-pulse rounded-xl border border-[#212c3c] bg-[#161e28] p-4 space-y-2.5"
            >
              <div className="h-3 w-40 rounded bg-[#232f40]" />
              <div className="h-8 w-full rounded bg-[#1d2736]" />
              <div className="h-8 w-full rounded bg-[#1d2736]" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#7f1d1d] bg-[#2a1215] px-4 py-3 text-xs text-[#fecaca]"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#f87171]" aria-hidden="true" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => loadScores(false)}
            className="rounded-md bg-[#f87171] px-3 py-1 text-xs font-bold text-[#1f0909] cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && groupedLeagues.length === 0 && (
        <div className="rounded-xl border border-[#232e3f] bg-[#161e28] px-4 py-10 text-center space-y-2">
          <Calendar className="mx-auto h-8 w-8 text-[#64748b]" aria-hidden="true" />
          <p className="text-sm font-bold text-white">No matching real fixtures found</p>
          <p className="text-xs text-[#8e9bae]">
            Try switching to &ldquo;All&rdquo; status, selecting &ldquo;All Competitions&rdquo;, or changing the match day.
          </p>
          {(statusFilter !== 'all' || selectedLeague !== 'all' || localQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setSelectedLeague('all');
                setLocalQuery('');
              }}
              className="mt-2 rounded-lg bg-[#7bc114] px-4 py-1.5 text-xs font-extrabold text-[#0b1404] cursor-pointer"
            >
              Reset LiveScore Filters
            </button>
          )}
        </div>
      )}

      {/* Real Matches Grouped by Competition */}
      {groupedLeagues.map((group, idx) => (
        <div
          key={`${group.slug}-${group.league}`}
          style={{ animationDelay: `${Math.min(idx, 6) * 50}ms` }}
          className="lm-fade-up overflow-hidden rounded-xl border border-[#232e3f] bg-[#161e28]"
        >
          <div className="flex items-center justify-between border-b border-[#202b3b] bg-[#1b2431] px-3.5 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs" aria-hidden="true">
                ⚽
              </span>
              <h2 className="truncate text-xs font-extrabold uppercase tracking-wide text-[#e2e8f0]">
                {group.league}
              </h2>
            </div>
            <span className="font-mono text-[11px] font-bold text-[#8e9bae] shrink-0">
              {group.matches.length} {group.matches.length === 1 ? 'Match' : 'Matches'}
            </span>
          </div>

          <div className="divide-y divide-[#1f2937]">
            {group.matches.map((match) => {
              const isExpanded = expandedId === match.id;
              const slipItem = toMatchItem(match);
              const activePick = selectedPicks.find((p) => p.matchId === slipItem.id);

              return (
                <article
                  key={match.id}
                  className="px-3.5 py-3 transition-colors hover:bg-[#1a2432]"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] mb-2">
                    <div className="flex items-center gap-2">
                      {match.state === 'in' ? (
                        <span className="inline-flex items-center gap-1 rounded bg-[#e11d48] px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-white tabular-nums">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          {match.clock || match.statusText || 'LIVE'}
                        </span>
                      ) : match.state === 'post' ? (
                        <span className="rounded bg-[#253141] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#94a3b8]">
                          {match.statusText || 'FT'}
                        </span>
                      ) : (
                        <span className="rounded bg-[#1e2c3d] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#38bdf8] tabular-nums">
                          {formatActualLocalKickoff(match.date, match.kickoffLabel)}
                          {(() => {
                            const cd = formatKickoffCountdown(match.date, nowMs);
                            return cd ? ` · ${cd}` : '';
                          })()}
                        </span>
                      )}

                      {match.venue && (
                        <span className="hidden sm:inline-flex items-center gap-1 truncate text-[#7e8da1] max-w-[240px]">
                          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span className="truncate">{match.venue}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {onAnalyzeMatch && (
                        <button
                          type="button"
                          onClick={() => onAnalyzeMatch(slipItem)}
                          className="inline-flex items-center gap-1 rounded border border-[#2a384c] bg-[#141d29] px-2 py-0.5 text-[10px] font-bold text-[#f5c417] hover:border-[#f5c417] cursor-pointer"
                        >
                          <Cpu className="h-3 w-3" aria-hidden="true" />
                          <span>AI Insights</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggleExpand(match)}
                        aria-label="Toggle match players and details"
                        className="inline-flex h-6 items-center gap-1 rounded border border-[#243142] px-1.5 text-[10px] font-bold text-[#cbd5e1] hover:border-[#7bc114] hover:text-white cursor-pointer"
                      >
                        <Users className="h-3 w-3 text-[#7bc114]" aria-hidden="true" />
                        <span className="hidden sm:inline">Players</span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Teams + Live Scoreboard (+ Optional Real Moneyline Odds) */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      {/* Home Team */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <TeamCrest team={match.homeTeam} />
                          <span
                            className={`truncate text-sm font-bold ${
                              match.homeTeam.winner ? 'text-[#7bc114]' : 'text-white'
                            }`}
                          >
                            {match.homeTeam.name}
                          </span>
                          {match.homeTeam.record && (
                            <span className="hidden md:inline font-mono text-[10px] text-[#7e8da1]">
                              ({match.homeTeam.record})
                            </span>
                          )}
                        </div>
                        <span
                          className={`font-mono text-base font-black tabular-nums ${
                            match.state === 'in'
                              ? 'text-[#f5c417]'
                              : match.homeTeam.winner
                              ? 'text-[#7bc114]'
                              : 'text-white'
                          }`}
                        >
                          {match.homeTeam.score !== null ? match.homeTeam.score : '–'}
                        </span>
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <TeamCrest team={match.awayTeam} />
                          <span
                            className={`truncate text-sm font-bold ${
                              match.awayTeam.winner ? 'text-[#7bc114]' : 'text-[#e2e8f0]'
                            }`}
                          >
                            {match.awayTeam.name}
                          </span>
                          {match.awayTeam.record && (
                            <span className="hidden md:inline font-mono text-[10px] text-[#7e8da1]">
                              ({match.awayTeam.record})
                            </span>
                          )}
                        </div>
                        <span
                          className={`font-mono text-base font-black tabular-nums ${
                            match.state === 'in'
                              ? 'text-[#f5c417]'
                              : match.awayTeam.winner
                              ? 'text-[#7bc114]'
                              : 'text-[#e2e8f0]'
                          }`}
                        >
                          {match.awayTeam.score !== null ? match.awayTeam.score : '–'}
                        </span>
                      </div>
                    </div>

                    {/* Real Sportsbook Moneyline Odds (only shown if returned by ESPN feed) */}
                    {match.odds && onTogglePick && (
                      <div className="grid grid-cols-3 gap-1.5 shrink-0 w-[180px] sm:w-[200px]">
                        {(
                          [
                            { key: '1', label: '1', val: match.odds.home },
                            { key: 'X', label: 'X', val: match.odds.draw },
                            { key: '2', label: '2', val: match.odds.away },
                          ] as const
                        ).map((opt) => {
                          const isSelected = activePick?.selection === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              disabled={!opt.val || match.state === 'post'}
                              onClick={() => onTogglePick(slipItem, opt.key)}
                              className={`flex h-9 flex-col items-center justify-center rounded-lg px-1 font-mono text-[11px] font-bold tabular-nums transition-colors cursor-pointer disabled:opacity-45 ${
                                isSelected
                                  ? 'bg-[#7bc114] text-[#091203]'
                                  : 'bg-[#253141] text-[#f1f5f9] hover:bg-[#314054]'
                              }`}
                            >
                              <span className="text-[9px] opacity-70 leading-none">
                                {opt.label}
                              </span>
                              <span>{opt.val ? opt.val.toFixed(2) : '--'}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Goalscorers & Key Events strip */}
                  {match.keyEvents && match.keyEvents.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#cbd5e1]">
                      {match.keyEvents
                        .filter((ev) => ev.isScoring)
                        .slice(0, 6)
                        .map((ev, eIdx) => (
                          <span
                            key={`${match.id}-goal-${eIdx}`}
                            className="inline-flex items-center gap-1 font-medium text-[#98e02a]"
                          >
                            <span aria-hidden="true">⚽</span>
                            <span>{ev.playerName}</span>
                            <span className="font-mono text-[10px] text-[#8e9bae] tabular-nums">
                              {ev.minute}
                            </span>
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Expanded Match Details (Form, Venue, Real Lineups / Squads) */}
                  {isExpanded && (
                    <div className="mt-3 rounded-lg border border-[#243142] bg-[#111822] p-3 text-xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[#8e9bae]">
                          Status:{' '}
                          <strong className="text-white">{match.statusText}</strong>
                        </span>
                        {match.venue && (
                          <span className="inline-flex items-center gap-1 text-[#8e9bae]">
                            <MapPin className="h-3.5 w-3.5 text-[#7bc114]" aria-hidden="true" />
                            {match.venue}
                          </span>
                        )}
                      </div>

                      {(match.homeTeam.form || match.awayTeam.form) && (
                        <div className="grid gap-2 border-t border-[#1d2736] pt-2 sm:grid-cols-2">
                          <div className="flex items-center justify-between">
                            <span className="truncate text-[#cbd5e1] pr-2">
                              {match.homeTeam.shortName} Form
                            </span>
                            <FormDots form={match.homeTeam.form} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="truncate text-[#cbd5e1] pr-2">
                              {match.awayTeam.shortName} Form
                            </span>
                            <FormDots form={match.awayTeam.form} />
                          </div>
                        </div>
                      )}

                      {/* Official Match Players / Lineups */}
                      <div className="border-t border-[#1d2736] pt-2.5">
                        {detailsById[match.id]?.loading ? (
                          <p className="text-[11px] text-[#8e9bae]">Loading official players...</p>
                        ) : detailsById[match.id]?.error ? (
                          <p className="text-[11px] text-[#f87171]">
                            {detailsById[match.id]?.error}
                          </p>
                        ) : detailsById[match.id]?.data ? (
                          <div className="space-y-2.5">
                            <p className="text-[11px] font-bold text-[#f5c417]">
                              {detailsById[match.id].data!.sourceMode === 'match_lineups'
                                ? 'Official Matchday Lineups'
                                : 'Official Club Squad Players'}
                            </p>
                            {detailsById[match.id].data!.homeTeam.players.length === 0 &&
                            detailsById[match.id].data!.awayTeam.players.length === 0 ? (
                              <p className="text-[11px] text-[#8e9bae]">
                                Lineups will appear here once published for this fixture.
                              </p>
                            ) : (
                              <div className="grid gap-3 sm:grid-cols-2">
                                {[
                                  detailsById[match.id].data!.homeTeam,
                                  detailsById[match.id].data!.awayTeam,
                                ].map((team) => (
                                  <div key={team.name} className="space-y-1">
                                    <p className="text-[11px] font-bold text-white border-b border-[#1d2736] pb-1">
                                      {team.name}
                                    </p>
                                    <ul className="space-y-1 max-h-44 overflow-y-auto pr-1">
                                      {team.players.slice(0, 14).map((pl) => (
                                        <li
                                          key={`${team.name}-${pl.id}`}
                                          className="flex items-center justify-between gap-2 text-[11px]"
                                        >
                                          <span className="truncate text-[#e2e8f0]">
                                            <span className="font-mono text-[#7bc114] mr-1.5 tabular-nums">
                                              #{pl.jersey}
                                            </span>
                                            {pl.name}
                                          </span>
                                          <span className="shrink-0 font-mono text-[10px] text-[#8e9bae] tabular-nums">
                                            {pl.position}
                                            {pl.goals > 0 ? ` · ⚽${pl.goals}` : ''}
                                            {pl.assists > 0 ? ` · A${pl.assists}` : ''}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
