import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search, Shield, Users } from 'lucide-react';
import { fetchWorldSoccerPlayers } from '../lib/api';
import {
  WorldSoccerClubOption,
  WorldSoccerPlayer,
  WorldSoccerPlayersResponse,
} from '../types';

interface WorldPlayersViewProps {
  globalSearchQuery?: string;
  compact?: boolean;
}

const POSITION_FILTERS = [
  { id: 'ALL', label: 'All Positions' },
  { id: 'F', label: 'Forwards' },
  { id: 'M', label: 'Midfielders' },
  { id: 'D', label: 'Defenders' },
  { id: 'G', label: 'Goalkeepers' },
] as const;

function ClubBadge({
  logo,
  abbr,
  color,
}: {
  logo: string;
  abbr: string;
  color: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!logo || failed) {
    return (
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#2d3d52] font-mono text-[10px] font-black text-white"
        style={{ backgroundColor: `#${color || '1f2b3a'}` }}
        aria-hidden="true"
      >
        {abbr.slice(0, 3)}
      </span>
    );
  }

  return (
    <img
      src={logo}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-7 w-7 shrink-0 object-contain"
    />
  );
}

export function WorldPlayersView({
  globalSearchQuery = '',
  compact = false,
}: WorldPlayersViewProps) {
  const [league, setLeague] = useState<string>('all');
  const [teamId, setTeamId] = useState<string>('');
  const [position, setPosition] = useState<'ALL' | 'F' | 'M' | 'D' | 'G'>('ALL');
  const [localQuery, setLocalQuery] = useState('');

  const [data, setData] = useState<WorldSoccerPlayersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveQuery = (globalSearchQuery || localQuery).trim();

  const loadPlayers = useCallback(
    async (background = false) => {
      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const res = await fetchWorldSoccerPlayers({
          league,
          teamId: teamId || undefined,
          position,
          q: effectiveQuery || undefined,
        });
        setData(res);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to load world soccer players.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [league, teamId, position, effectiveQuery]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadPlayers(false);
    }, effectiveQuery ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [loadPlayers, effectiveQuery]);

  const teamsForDropdown: WorldSoccerClubOption[] = useMemo(() => {
    const list = data?.teams ?? [];
    if (league === 'all') return list;
    return list.filter((t) => t.leagueSlug === league);
  }, [data?.teams, league]);

  const players: WorldSoccerPlayer[] = data?.players ?? [];

  return (
    <section
      aria-label="World Soccer Players"
      className={compact ? 'space-y-3 px-3 py-3' : 'mx-auto max-w-5xl space-y-4 px-3 py-4 sm:px-5'}
    >
      <div className="rounded-xl border border-[#232f40] bg-[#161e28] p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#7bc114]/30 bg-[#7bc114]/15 text-[#7bc114]">
              <Users className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-base sm:text-lg font-extrabold text-white">
                World Soccer Players
              </h2>
              <p className="text-[11px] text-[#8e9bae]">
                Official club squads, real players, nationalities &amp; 2026 season stats
                {data ? ` · ${data.totalPlayers} Players` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadPlayers(true)}
            disabled={loading || refreshing}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#2a384c] bg-[#1c2635] px-3 text-xs font-bold text-white hover:border-[#7bc114] disabled:opacity-60 cursor-pointer whitespace-nowrap"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-[#7bc114] ${refreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>Refresh Squads</span>
          </button>
        </div>

        {/* League Selector Tabs */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-t border-[#202b3b] pt-3">
          {(
            data?.leagues ?? [
              { slug: 'all', name: 'All World Leagues' },
              { slug: 'eng.1', name: 'Premier League' },
              { slug: 'esp.1', name: 'LaLiga' },
              { slug: 'ita.1', name: 'Serie A' },
              { slug: 'ger.1', name: 'Bundesliga' },
              { slug: 'fra.1', name: 'Ligue 1' },
              { slug: 'usa.1', name: 'MLS' },
            ]
          ).map((lg) => {
            const active = league === lg.slug;
            return (
              <button
                key={lg.slug}
                type="button"
                onClick={() => {
                  setLeague(lg.slug);
                  setTeamId('');
                }}
                className={`min-h-[34px] whitespace-nowrap rounded-lg px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#7bc114] text-[#0b1404]'
                    : 'bg-[#1e2937] text-[#cbd5e1] hover:bg-[#273547] hover:text-white'
                }`}
              >
                {lg.name}
              </button>
            );
          })}
        </div>

        {/* Club Dropdown + Position Tabs + Player Search */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[210px_1fr] lg:grid-cols-[210px_1fr_230px]">
          <div>
            <label htmlFor="world-players-club" className="sr-only">
              Select club
            </label>
            <select
              id="world-players-club"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="min-h-[40px] w-full rounded-lg border border-[#263345] bg-[#101720] px-2.5 text-xs font-semibold text-white focus:border-[#7bc114] focus:outline-none"
            >
              <option value="">All Featured Clubs ({teamsForDropdown.length})</option>
              {teamsForDropdown.map((club) => (
                <option key={`${club.leagueSlug}-${club.id}`} value={club.id}>
                  {club.name} ({club.leagueName})
                </option>
              ))}
            </select>
          </div>

          <div className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-lg border border-[#263345] bg-[#101720] p-1">
            {POSITION_FILTERS.map((pos) => {
              const active = position === pos.id;
              return (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => setPosition(pos.id)}
                  className={`min-h-[32px] whitespace-nowrap rounded-md px-2.5 text-[11px] font-bold transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#f5c417] text-[#111827]'
                      : 'text-[#9aa7b8] hover:text-white'
                  }`}
                >
                  {pos.label}
                </button>
              );
            })}
          </div>

          {!globalSearchQuery && (
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7e8da1]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search player, club or country..."
                className="min-h-[40px] w-full rounded-lg border border-[#263345] bg-[#101720] pl-8 pr-3 text-xs text-white placeholder:text-[#64748b] focus:border-[#7bc114] focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {loading && players.length === 0 && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="animate-pulse rounded-xl border border-[#212c3c] bg-[#161e28] p-3.5 space-y-2"
            >
              <div className="h-4 w-40 rounded bg-[#232f40]" />
              <div className="h-3 w-52 rounded bg-[#1d2736]" />
              <div className="h-6 w-full rounded bg-[#1d2736]" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#7f1d1d] bg-[#2a1215] px-4 py-3 text-xs text-[#fecaca]"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => loadPlayers(false)}
            className="rounded-md bg-[#f87171] px-3 py-1 font-bold text-[#1f0909] cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && players.length === 0 && (
        <div className="rounded-xl border border-[#232e3f] bg-[#161e28] px-4 py-10 text-center space-y-2">
          <Shield className="mx-auto h-8 w-8 text-[#64748b]" aria-hidden="true" />
          <p className="text-sm font-bold text-white">No players matched that filter</p>
          <p className="text-xs text-[#8e9bae]">
            Try clearing the search query or switching back to All Positions.
          </p>
          <button
            type="button"
            onClick={() => {
              setPosition('ALL');
              setTeamId('');
              setLocalQuery('');
            }}
            className="mt-2 min-h-[38px] rounded-lg bg-[#7bc114] px-4 py-1.5 text-xs font-extrabold text-[#0b1404] cursor-pointer"
          >
            Show Top World Players
          </button>
        </div>
      )}

      {players.length > 0 && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {players.map((p) => (
            <article
              key={`${p.teamId}-${p.id}`}
              className="rounded-xl border border-[#232e3f] bg-[#161e28] p-3.5 transition-colors hover:border-[#364963]"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 font-mono text-sm font-black text-white tabular-nums"
                    style={{ backgroundColor: `#${p.teamColor || '253141'}` }}
                  >
                    #{p.jersey}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-extrabold text-white leading-tight">
                      {p.name}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-[#cbd5e1]">
                      {p.nationality} · {p.position}
                      {p.age ? ` · ${p.age} yrs` : ''}
                    </p>
                  </div>
                </div>

                <ClubBadge logo={p.teamLogo} abbr={p.teamAbbr} color={p.teamColor} />
              </div>

              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#1e2736] pt-2.5 text-[11px]">
                <span className="truncate font-semibold text-[#9aa7b8]">
                  {p.teamName} · {p.leagueName}
                </span>

                <div className="flex items-center gap-3 font-mono font-bold tabular-nums text-[#e2e8f0]">
                  <span>
                    <span className="text-[#8e9bae] font-normal">Apps </span>
                    {p.stats.appearances}
                  </span>
                  {p.positionAbbr === 'G' ? (
                    <span>
                      <span className="text-[#8e9bae] font-normal">Saves </span>
                      <span className="text-[#7bc114]">{p.stats.saves}</span>
                    </span>
                  ) : (
                    <>
                      <span>
                        <span className="text-[#8e9bae] font-normal">G </span>
                        <span className="text-[#7bc114]">{p.stats.goals}</span>
                      </span>
                      <span>
                        <span className="text-[#8e9bae] font-normal">A </span>
                        <span className="text-[#f5c417]">{p.stats.assists}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
