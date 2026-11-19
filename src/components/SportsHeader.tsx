import { useState } from 'react';
import {
  Activity,
  Gift,
  Layers,
  Menu,
  MoreVertical,
  Plane,
  Search,
  Trophy,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { formatMoney } from '../lib/countries';
import { AccountMode, CountryOption, CrashGameId, TopCategoryTab } from '../types';
import { NavigationDrawer } from './NavigationDrawer';

interface SportsHeaderProps {
  demoBalance: number;
  realBalance: number;
  accountMode: AccountMode;
  demoUser: string | null;
  country: CountryOption;
  activeCategory: TopCategoryTab;
  liveMatchesCount?: number;
  searchOpen: boolean;
  searchQuery: string;
  theme: 'dark' | 'light';
  dataSaver: boolean;
  onSelectCountry: (country: CountryOption) => void;
  onSelectCategory: (tab: TopCategoryTab) => void;
  onOpenCrashGame: (gameId: CrashGameId) => void;
  onOpenAviator: () => void;
  onSwitchAccountMode: (mode: AccountMode) => void;
  onToggleSearch: () => void;
  onSearchChange: (q: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenProfile: () => void;
  onOpenInvite: () => void;
  onOpenWallet: () => void;
  onOpenDownloadApp: () => void;
  onOpenSupport: () => void;
  onToggleTheme: () => void;
  onToggleDataSaver: () => void;
  onResetHome: () => void;
  onSecretLogoUnlock?: () => void;
}

export function SportsHeader({
  demoBalance,
  realBalance,
  accountMode,
  demoUser,
  country,
  activeCategory,
  liveMatchesCount = 0,
  searchOpen,
  searchQuery,
  theme,
  dataSaver,
  onSelectCategory,
  onOpenCrashGame,
  onOpenAviator,
  onSwitchAccountMode,
  onToggleSearch,
  onSearchChange,
  onOpenAuth,
  onOpenProfile,
  onOpenInvite,
  onOpenWallet,
  onOpenDownloadApp,
  onOpenSupport,
  onToggleTheme,
  onToggleDataSaver,
  onResetHome,
  onSecretLogoUnlock,
}: SportsHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [lastLogoTapMs, setLastLogoTapMs] = useState(0);

  const handleLogoClick = () => {
    const now = Date.now();
    const nextCount = now - lastLogoTapMs < 1800 ? logoTapCount + 1 : 1;
    setLastLogoTapMs(now);
    if (nextCount >= 5) {
      setLogoTapCount(0);
      onSecretLogoUnlock?.();
    } else {
      setLogoTapCount(nextCount);
    }
    onResetHome();
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#141c27] border-b border-[#202a38]">
        {/* Row 1: [≡] [LUCKYMATE] ... [Login/Register or Account] [🔍] */}
        <div className="mx-auto flex h-[48px] max-w-[1440px] items-center justify-between gap-2 px-2.5 sm:px-5">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setDrawerOpen((prev) => !prev)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#e2e8f0] hover:bg-[#1e2938] cursor-pointer"
            >
              {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={handleLogoClick}
              className="text-left cursor-pointer focus-visible:outline-none rounded shrink-0"
            >
              <span className="inline-flex items-center font-display text-[15px] sm:text-[17px] font-black uppercase tracking-[0.06em] leading-none whitespace-nowrap">
                <span className="text-[#f5c417]">LUCKY</span>
                <span className="text-white">MATE</span>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {demoUser ? (
              <button
                type="button"
                onClick={onOpenProfile}
                aria-label="Account"
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#222d3d] border border-[#324156] px-2.5 text-xs font-bold text-white hover:border-[#7bc114] cursor-pointer whitespace-nowrap shrink-0"
              >
                <User className="h-3.5 w-3.5 text-[#7bc114]" aria-hidden="true" />
                <span>Account</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="px-1.5 py-1 text-xs sm:text-sm font-bold text-[#7bc114] hover:text-[#98e02a] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="h-8 rounded-md bg-[#7bc114] px-3.5 text-xs sm:text-sm font-bold text-[#0b1404] shadow-sm hover:bg-[#8cd61e] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Register
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onToggleSearch}
              aria-label={searchOpen ? 'Close match search' : 'Search matches'}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#e2e8f0] hover:bg-[#1e2938] cursor-pointer shrink-0"
            >
              {searchOpen ? <X className="h-4.5 w-4.5" /> : <Search className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Row 2 (Compact strip right below Luckymate name): shown only after client logs in */}
        {demoUser && (
          <div className="border-t border-[#1b2432] bg-[#0e141d] px-2.5 py-1 sm:px-5">
            <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => onSwitchAccountMode('real')}
                  title="Switch to Real Balance"
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] sm:text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    accountMode === 'real'
                      ? 'bg-[#f5c417] text-[#111827]'
                      : 'border border-[#2b3749] bg-[#18212e] text-[#f5c417] hover:border-[#f5c417]/60'
                  }`}
                >
                  <span className="uppercase opacity-90">Real:</span>
                  <span className="font-mono font-extrabold tabular-nums">
                    {formatMoney(realBalance, country)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onSwitchAccountMode('demo')}
                  title="Switch to Demo Balance"
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] sm:text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    accountMode === 'demo'
                      ? 'bg-[#7bc114] text-[#0b1404]'
                      : 'border border-[#2b3749] bg-[#18212e] text-[#7bc114] hover:border-[#7bc114]/60'
                  }`}
                >
                  <span className="uppercase opacity-90">Demo:</span>
                  <span className="font-mono font-extrabold tabular-nums">
                    {formatMoney(demoBalance, country)}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onOpenInvite}
                  title="Share your invite link and earn $3 USD"
                  className="inline-flex items-center gap-1 rounded-md border border-[#2d5a3b] bg-[#102419] px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-[#98e02a] hover:border-[#7bc114] hover:text-white cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Gift className="h-3 w-3 text-[#7bc114]" aria-hidden="true" />
                  <span>Invite $3</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenWallet}
                  className="inline-flex items-center gap-1 rounded-md border border-[#2b3749] bg-[#18212e] px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-[#e2e8f0] hover:border-[#7bc114] hover:text-white cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Wallet className="h-3 w-3 text-[#f5c417]" aria-hidden="true" />
                  <span>Deposit</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Row 3: Compact Category Icon Strip */}
        <nav aria-label="Primary categories" className="border-t border-[#1e2735] bg-[#141c27]">
          <div className="mx-auto flex max-w-[1440px] items-stretch justify-between px-1 sm:px-4">
            <div className="no-scrollbar flex flex-1 items-stretch justify-between overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onSelectCategory('sports');
                }}
                className={`flex min-w-[60px] flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                  activeCategory === 'sports' || activeCategory === 'in-play'
                    ? 'text-white'
                    : 'text-[#8e9bae] hover:text-white'
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center text-sm">⚽</span>
                <span className="whitespace-nowrap">Soccer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onSelectCategory('livescore');
                }}
                className={`relative flex min-w-[68px] flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                  activeCategory === 'livescore' || activeCategory === 'in-play'
                    ? 'text-[#7bc114]'
                    : 'text-[#8e9bae] hover:text-white'
                }`}
              >
                {liveMatchesCount > 0 && (
                  <span className="absolute right-1.5 top-0.5 rounded bg-[#e11d48] px-1 py-[1px] font-mono text-[8px] font-extrabold leading-none text-white">
                    {liveMatchesCount} LIVE
                  </span>
                )}
                <Activity className="h-4.5 w-4.5 text-[#7bc114]" aria-hidden="true" />
                <span className="whitespace-nowrap">LiveScore</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onSelectCategory('virtuals');
                }}
                className={`relative flex min-w-[60px] flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                  activeCategory === 'virtuals' ? 'text-white' : 'text-[#8e9bae] hover:text-white'
                }`}
              >
                <span className="absolute right-1.5 top-0.5 rounded bg-[#e11d48] px-1 py-[1px] text-[8px] font-extrabold leading-none text-white">
                  New
                </span>
                <Trophy className="h-4.5 w-4.5" aria-hidden="true" />
                <span className="whitespace-nowrap">Virtuals</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onOpenAviator();
                }}
                className="flex min-w-[60px] flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-semibold text-[#8e9bae] hover:text-white cursor-pointer"
              >
                <span className="flex h-5 flex-col items-center justify-center leading-none">
                  <Plane className="h-3.5 w-3.5 text-[#ef4444]" aria-hidden="true" />
                </span>
                <span className="whitespace-nowrap">Aviator</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onSelectCategory('crash');
                }}
                className={`flex min-w-[72px] flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                  activeCategory === 'crash' ? 'text-[#7bc114]' : 'text-[#8e9bae] hover:text-white'
                }`}
              >
                <Layers className="h-4.5 w-4.5" aria-hidden="true" />
                <span className="whitespace-nowrap">Crash Games</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
              className="flex min-w-[52px] flex-col items-center justify-center gap-0.5 border-l border-[#232e3f] px-2 py-1.5 text-[11px] font-semibold text-[#8e9bae] hover:text-white cursor-pointer"
            >
              <MoreVertical className="h-4.5 w-4.5" aria-hidden="true" />
              <span>More</span>
            </button>
          </div>
        </nav>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-[#202b3b] bg-[#101720] px-3.5 py-2 sm:px-5">
            <div className="mx-auto flex max-w-[1440px] items-center gap-2">
              <Search className="h-4 w-4 text-[#8e9bae] shrink-0" aria-hidden="true" />
              <label htmlFor="match-search-input" className="sr-only">
                Search teams or leagues
              </label>
              <input
                id="match-search-input"
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search teams or leagues (e.g. Kenya, Brazil, Arsenal, Tanzania)..."
                className="min-h-[36px] w-full bg-transparent text-sm text-white placeholder:text-[#64748b] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="text-xs font-semibold text-[#8e9bae] hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <NavigationDrawer
        open={drawerOpen}
        country={country}
        theme={theme}
        dataSaver={dataSaver}
        onClose={() => setDrawerOpen(false)}
        onSelectCategory={onSelectCategory}
        onOpenCrashGame={onOpenCrashGame}
        onOpenAviator={onOpenAviator}
        onOpenDownloadApp={onOpenDownloadApp}
        onOpenSupport={onOpenSupport}
        onOpenWallet={onOpenWallet}
        onToggleTheme={onToggleTheme}
        onToggleDataSaver={onToggleDataSaver}
      />
    </>
  );
}
