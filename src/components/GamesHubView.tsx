import { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  Clock,
  Flame,
  Gamepad2,
  Plane,
  Rocket,
  Search,
  Sparkles,
  Spade,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { CRASH_GAMES } from '../data/matches';
import { fetchCrashLobby } from '../lib/api';
import { formatMoney } from '../lib/countries';
import {
  CountryOption,
  CrashGameConfig,
  CrashGameId,
  GameCategoryFilter,
  LobbyGameStatus,
  WalletTransaction,
} from '../types';
import { GameProfileCardArt } from './crash/GameProfileCardArt';

interface GamesHubViewProps {
  history: WalletTransaction[];
  recentlyPlayedIds: CrashGameId[];
  country?: CountryOption;
  onSelectGame: (gameId: CrashGameId) => void;
  onOpenMyBets: () => void;
}

const CATEGORY_TABS: {
  id: GameCategoryFilter;
  label: string;
  icon: typeof Gamepad2;
}[] = [
  { id: 'All', label: 'All Games', icon: Gamepad2 },
  { id: 'Virtuals', label: 'Virtuals', icon: Trophy },
  { id: 'Aviator', label: 'Aviator', icon: Plane },
  { id: 'Crash', label: 'Crash', icon: Rocket },
  { id: 'Casino', label: 'Casino', icon: Spade },
  { id: 'Arcade', label: 'Arcade', icon: Zap },
];

export function GamesHubView({
  history,
  recentlyPlayedIds,
  country = 'Kenya',
  onSelectGame,
  onOpenMyBets,
}: GamesHubViewProps) {
  const [category, setCategory] = useState<GameCategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllGrid, setShowAllGrid] = useState(false);
  const [lobbyStatus, setLobbyStatus] = useState<Record<string, LobbyGameStatus>>({});

  useEffect(() => {
    let active = true;
    const loadLobby = async () => {
      try {
        const items = await fetchCrashLobby();
        if (!active) return;
        const map: Record<string, LobbyGameStatus> = {};
        for (const item of items) {
          map[item.id] = item;
        }
        setLobbyStatus(map);
      } catch {
        // Silent retry on next poll
      }
    };
    loadLobby();
    const timer = window.setInterval(loadLobby, 2000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const filteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CRASH_GAMES.filter((g) => {
      const catMatch = category === 'All' || g.category === category;
      const qMatch =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.subtitle.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q);
      return catMatch && qMatch;
    });
  }, [category, searchQuery]);

  const justLandedGames = useMemo(() => {
    if (showAllGrid || category !== 'All' || searchQuery.trim()) {
      return filteredGames;
    }
    return filteredGames.filter((g) => g.isJustLanded).slice(0, 9);
  }, [filteredGames, showAllGrid, category, searchQuery]);

  const popularGames = useMemo(() => CRASH_GAMES.filter((g) => g.isPopular), []);

  const recentlyPlayedGames = useMemo(() => {
    return recentlyPlayedIds
      .map((id) => CRASH_GAMES.find((g) => g.id === id))
      .filter((g): g is CrashGameConfig => Boolean(g));
  }, [recentlyPlayedIds]);

  const recentCrashHistory = useMemo(() => {
    return history
      .filter((h) => h.type === 'crash_stake' || h.type === 'crash_cashout')
      .slice(0, 6);
  }, [history]);

  const renderGameCard = (game: CrashGameConfig, index = 0) => {
    const live = lobbyStatus[game.id];
    const playersOnline = live?.connectedPlayers ?? 0;

    return (
      <button
        key={game.id}
        type="button"
        aria-label={`Play ${game.title}`}
        onClick={() => onSelectGame(game.id)}
        style={{
          borderColor: game.accentHex,
          boxShadow: `0 10px 26px -6px ${game.accentHex}88, inset 0 0 0 1px rgba(255,255,255,0.18)`,
          animationDelay: `${Math.min(index, 10) * 45}ms`,
        }}
        className="lm-fade-up group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border-2 bg-[#0b1018] transition-all duration-200 hover:-translate-y-1.5 hover:brightness-110 active:scale-[0.97] cursor-pointer"
      >
        <div className="h-full w-full transition-transform duration-300 group-hover:scale-[1.06]">
          <GameProfileCardArt game={game} />
        </div>

        {/* Top-right Game Tag Badge (NO odds shown until clicked) */}
        {game.badge && (
          <span
            style={{
              backgroundColor: game.accentHex,
              boxShadow: `0 2px 10px ${game.accentHex}`,
            }}
            className="pointer-events-none absolute right-2 top-2 z-20 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#090d14]"
          >
            {game.badge}
          </span>
        )}

        {/* Bottom Play & Live Players Strip */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-1 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-2 pb-2 pt-6 text-[10px] text-white">
          <span className="inline-flex items-center gap-1 font-mono font-bold tabular-nums text-white">
            <Users className="h-3 w-3 shrink-0" style={{ color: game.accentHex }} aria-hidden="true" />
            {playersOnline}
          </span>
          <span
            style={{
              background: `linear-gradient(135deg, ${game.accentHex} 0%, #fde047 100%)`,
            }}
            className="rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#090d14] shadow-md transition-transform group-hover:scale-105"
          >
            Play
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-3 py-4 sm:px-5">
      {/* Top Category Icon Strip (matching mobile photo) */}
      <div className="rounded-2xl border border-[#154542] bg-[#0b2c2a] p-3">
        <div className="no-scrollbar flex items-center justify-between gap-2 overflow-x-auto pb-1">
          {CATEGORY_TABS.map((cat) => {
            const Icon = cat.icon;
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex min-w-[64px] flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#134843] text-[#f6d663]'
                    : 'text-[#cbe2df] hover:bg-[#0e3936] hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="whitespace-nowrap">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-[#19534e] bg-[#071e1e] px-3 py-2">
          <Search className="h-4 w-4 text-[#8bb0ab] shrink-0" aria-hidden="true" />
          <label htmlFor="games-hub-search" className="sr-only">
            Search crash and arcade games
          </label>
          <input
            id="games-hub-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games (Aviator, Comet Crash, B! Crash, JetX)..."
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-[#6d9490] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-[#8bb0ab] hover:text-white cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Recently Played Section */}
      {recentlyPlayedGames.length > 0 && !searchQuery.trim() && category === 'All' && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 font-display text-base font-bold text-white sm:text-lg">
              <Clock className="h-4 w-4 text-[#2cd4a3]" aria-hidden="true" />
              Recently Played
            </h2>
            <span className="text-xs text-[#8bb0ab]">{recentlyPlayedGames.length} games</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
            {recentlyPlayedGames.slice(0, 6).map(renderGameCard)}
          </div>
        </section>
      )}

      {/* Just Landed / Filtered Grid (exact 3-col mobile layout matching photo) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold text-white">
            <Sparkles className="h-4 w-4 text-[#f6d663]" aria-hidden="true" />
            {category === 'All' && !searchQuery.trim()
              ? showAllGrid
                ? 'All Crash & Arcade Games'
                : 'Just Landed'
              : `${category} Games (${filteredGames.length})`}
          </h2>
          <button
            type="button"
            onClick={() => setShowAllGrid((prev) => !prev)}
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#cbe2df] hover:text-[#f6d663] cursor-pointer"
          >
            {showAllGrid ? 'Show Less' : 'All Games'}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {justLandedGames.length === 0 ? (
          <div className="lm-card rounded-xl p-8 text-center text-xs text-[#8bb0ab]">
            No games matched &quot;{searchQuery}&quot;. Try clearing your search or selecting All
            Games.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {justLandedGames.map(renderGameCard)}
          </div>
        )}
      </section>

      {/* Popular Games Section */}
      {!searchQuery.trim() && category === 'All' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 font-display text-base font-bold text-white sm:text-lg">
              <Flame className="h-4 w-4 text-[#f6d663]" aria-hidden="true" />
              Popular Games
            </h2>
            <span className="text-xs text-[#8bb0ab]">Live Dual Betslip Rooms</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
            {popularGames.map(renderGameCard)}
          </div>
        </section>
      )}

      {/* Played Game History Snippet */}
      <section className="lm-card rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between border-b border-[#154542] pb-3">
          <div>
            <h2 className="font-display text-base font-bold text-white">Recent Game History</h2>
            <p className="text-xs text-[#8bb0ab]">Your latest crash bets &amp; cashouts</p>
          </div>
          <button
            type="button"
            onClick={onOpenMyBets}
            className="text-xs font-bold text-[#2cd4a3] hover:underline cursor-pointer"
          >
            Full Ledger &rarr;
          </button>
        </div>

        {recentCrashHistory.length === 0 ? (
          <p className="py-5 text-center text-xs text-[#8bb0ab]">
            Tap any game card above to join a live room and place bets across Slip 1 and Slip 2.
          </p>
        ) : (
          <ul className="divide-y divide-[#123d3a]">
            {recentCrashHistory.map((item) => {
              const positive = item.amount >= 0;
              return (
                <li key={item.id} className="flex items-center justify-between gap-3 py-2.5 text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{item.label}</p>
                    <p className="text-[#8bb0ab] truncate">{item.detail}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`font-mono font-bold tabular-nums ${
                        positive ? 'text-[#2cd4a3]' : 'text-[#f87171]'
                      }`}
                    >
                      {positive ? '+' : '-'} {formatMoney(Math.abs(item.amount), country)}
                    </p>
                    <p className="text-[10px] text-[#8bb0ab]">{item.status}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
