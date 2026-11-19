import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, Smartphone, X } from 'lucide-react';
import { AiAnalyserSection } from './components/AiAnalyserSection';
import { AuthDemoModal } from './components/AuthDemoModal';
import { BottomTabBar } from './components/BottomTabBar';
import { CrashSimulatorPanel } from './components/CrashSimulatorPanel';
import { GameLoadingOverlay } from './components/crash/GameLoadingOverlay';
import { PlayModeGateModal } from './components/crash/PlayModeGateModal';
import { GamesHubView } from './components/GamesHubView';
import { LandingSplash } from './components/LandingSplash';
import { LiveScoreView } from './components/LiveScoreView';
import { MatchMarketsModal } from './components/MatchMarketsModal';
import { PredictorView } from './components/PredictorView';
import { ProfileView } from './components/ProfileView';
import { ReferralProgramCard } from './components/ReferralProgramCard';
import {
  CasinoAndPromotionsView,
  HistoryAndBetsView,
  SettingsAndSupportView,
  WalletActionView,
} from './components/SecondaryViews';
import { SportsFeedView } from './components/SportsFeedView';
import { SportsHeader } from './components/SportsHeader';
import {
  ApiError,
  clearPendingReferralCode,
  fetchOfficialLiveScores,
  fetchReferralSummary,
  fetchWallet,
  getStoredAuthToken,
  loadPendingReferralCode,
  resetDemoWallet,
  savePendingReferralCode,
  saveRegisteredClientDetails,
  setAccountCountry,
  setAccountMode as setAccountModeApi,
  submitDemoSlip,
  validateReferralCode,
  verifyPaystackDeposit,
  verifyPaystackWithdraw,
} from './lib/api';
import {
  formatMoney,
  loadStoredCountry,
  saveStoredCountry,
} from './lib/countries';
import {
  AccountMode,
  BottomNavTab,
  CountryOption,
  CrashGameId,
  MarketSelection,
  MatchItem,
  PlayedStats,
  PopularBetItem,
  ReferralSummary,
  SlipPick,
  TopCategoryTab,
  WalletTransaction,
} from './types';

const RECENT_GAMES_KEY = 'luckymate_recent_games';

function loadRecentGames(): CrashGameId[] {
  try {
    const raw = window.localStorage.getItem(RECENT_GAMES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [topCategory, setTopCategory] = useState<TopCategoryTab>('sports');
  const [bottomTab, setBottomTab] = useState<BottomNavTab>('home');
  const [country, setCountry] = useState<CountryOption>(() => loadStoredCountry());

  const [demoUser, setDemoUser] = useState<string | null>(null);
  const [registeredPhone, setRegisteredPhone] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralSummary, setReferralSummary] = useState<ReferralSummary | null>(null);
  const [pendingReferralCode, setPendingReferralCode] = useState<string | null>(() =>
    loadPendingReferralCode()
  );
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [openedByReferralLink, setOpenedByReferralLink] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);
  const [authPromptNotice, setAuthPromptNotice] = useState<string | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [balance, setBalance] = useState(500);
  const [demoBalance, setDemoBalance] = useState(500);
  const [realBalance, setRealBalance] = useState(0);
  const [accountMode, setAccountMode] = useState<AccountMode>('demo');
  const [playedStats, setPlayedStats] = useState<PlayedStats>({
    totalWagered: 0,
    totalWon: 0,
    netPlayed: 0,
    gamesPlayed: 0,
  });
  const [lastDepositAmount, setLastDepositAmount] = useState(0);
  const [lastDepositDate, setLastDepositDate] = useState('No real deposit yet');
  const [history, setHistory] = useState<WalletTransaction[]>([]);

  const [activeCrashGameId, setActiveCrashGameId] = useState<CrashGameId | null>(null);
  const [loadingCrashGameId, setLoadingCrashGameId] = useState<CrashGameId | null>(null);
  const [playModeGateGameId, setPlayModeGateGameId] = useState<CrashGameId | null>(null);
  const [pendingCrashGameId, setPendingCrashGameId] = useState<CrashGameId | null>(null);
  const [recentlyPlayedIds, setRecentlyPlayedIds] = useState<CrashGameId[]>(() => loadRecentGames());

  const [selectedPicks, setSelectedPicks] = useState<SlipPick[]>([]);
  const [marketsMatch, setMarketsMatch] = useState<MatchItem | null>(null);
  const [aiSelectedMatch, setAiSelectedMatch] = useState<MatchItem | null>(null);
  const [liveMatchesCount, setLiveMatchesCount] = useState<number>(0);
  const [predictorOpen, setPredictorOpen] = useState<boolean>(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      return path === '/predictor' || hash === '#/predictor' || params.has('predictor');
    } catch {
      return false;
    }
  });
  const [walletSubTab, setWalletSubTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [walletReturnNotice, setWalletReturnNotice] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const [mobileSlipStake, setMobileSlipStake] = useState('100');
  const [mobileSlipMsg, setMobileSlipMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [showSplash, setShowSplash] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return window.localStorage.getItem('luckymate_theme') === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });
  const [dataSaver, setDataSaver] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem('luckymate_data_saver') === 'true';
    } catch {
      return false;
    }
  });
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<{
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string }>;
  } | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('lm-light');
    } else {
      root.classList.add('dark');
      root.classList.remove('lm-light');
    }
    try {
      window.localStorage.setItem('luckymate_theme', theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (dataSaver) {
      root.classList.add('lm-data-saver');
    } else {
      root.classList.remove('lm-data-saver');
    }
    try {
      window.localStorage.setItem('luckymate_data_saver', String(dataSaver));
    } catch {
      // Ignore storage errors
    }
  }, [dataSaver]);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(
        e as unknown as {
          prompt: () => Promise<void>;
          userChoice: Promise<{ outcome: string }>;
        }
      );
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const countryRef = useRef<CountryOption>(country);
  countryRef.current = country;

  const handleSelectCountry = useCallback((nextCountry: CountryOption) => {
    setCountry(nextCountry);
    saveStoredCountry(nextCountry);
    setAccountCountry(nextCountry).catch(() => {});
  }, []);

  const hydrateWalletFields = useCallback(
    (data: {
      username?: string;
      phone?: string;
      email?: string;
      emailVerified?: boolean;
      balance: number;
      demoBalance?: number;
      realBalance?: number;
      accountMode?: AccountMode;
      country?: CountryOption;
      createdAt?: string;
      passwordHash?: string;
      isGuest?: boolean;
      referralCode?: string;
      referralSummary?: ReferralSummary;
      playedStats?: PlayedStats;
      lastDepositAmount: number;
      lastDepositDate: string;
      history: WalletTransaction[];
    }) => {
      const signedIn = data.isGuest === false;
      if (signedIn && data.username) {
        setDemoUser(data.username);
        setRegisteredPhone(typeof data.phone === 'string' && data.phone ? data.phone : null);
        setRegisteredEmail(typeof data.email === 'string' && data.email ? data.email : null);
        setMemberSince(typeof data.createdAt === 'string' && data.createdAt ? data.createdAt : null);
        if (typeof data.referralCode === 'string' && data.referralCode) {
          setReferralCode(data.referralCode);
        }
        if (data.referralSummary) {
          setReferralSummary(data.referralSummary);
        }
        if (data.phone) {
          saveRegisteredClientDetails({
            phone: data.phone,
            email: data.email,
            emailVerified: data.emailVerified !== false,
            country: data.country ?? countryRef.current,
            username: data.username,
            registeredAt: data.createdAt,
            passwordHash: data.passwordHash,
          });
        }
      } else if (data.isGuest === true) {
        setDemoUser(null);
        setRegisteredPhone(null);
        setRegisteredEmail(null);
        setMemberSince(null);
        setReferralCode(null);
        setReferralSummary(null);
      } else {
        if (typeof data.phone === 'string' && data.phone) {
          setRegisteredPhone(data.phone);
        }
        if (typeof data.email === 'string' && data.email) {
          setRegisteredEmail(data.email);
        }
        if (typeof data.createdAt === 'string' && data.createdAt) {
          setMemberSince(data.createdAt);
        }
        if (typeof data.referralCode === 'string' && data.referralCode) {
          setReferralCode(data.referralCode);
        }
        if (data.referralSummary) {
          setReferralSummary(data.referralSummary);
        }
      }
      setBalance(data.balance);
      if (typeof data.demoBalance === 'number') setDemoBalance(data.demoBalance);
      if (typeof data.realBalance === 'number') setRealBalance(data.realBalance);
      if (data.accountMode === 'demo' || data.accountMode === 'real') {
        setAccountMode(data.accountMode);
      }
      if (data.country && signedIn) {
        setCountry(data.country);
        saveStoredCountry(data.country);
      }
      if (data.playedStats) setPlayedStats(data.playedStats);
      setLastDepositAmount(data.lastDepositAmount);
      setLastDepositDate(data.lastDepositDate);
      setHistory(data.history);
    },
    []
  );

  const refreshWallet = useCallback(async () => {
    const data = await fetchWallet();
    hydrateWalletFields(data);
    if (data.username && !data.isGuest) {
      setDemoUser(data.username);
    } else if (data.username && data.isGuest) {
      setDemoUser(null);
    }
  }, [hydrateWalletFields]);

  useEffect(() => {
    let active = true;
    fetchWallet()
      .then(async (data) => {
        if (!active) return;
        hydrateWalletFields(data);
        if (data.username && !data.isGuest) {
          setDemoUser(data.username);
        }

        try {
          const url = new URL(window.location.href);
          const ref = (url.searchParams.get('reference') || url.searchParams.get('trxref') || '').trim();
          if (ref && ref.startsWith('LM-WD-')) {
            setBottomTab('wallet');
            setWalletSubTab('withdraw');
            const verifyRes = await verifyPaystackWithdraw(ref);
            if (!active) return;
            hydrateWalletFields(verifyRes);
            if (verifyRes.status === 'success' && verifyRes.settled) {
              setWalletReturnNotice({
                ok: true,
                text: verifyRes.message,
              });
            } else if (verifyRes.status === 'failed') {
              setWalletReturnNotice({
                ok: false,
                text: verifyRes.message,
              });
            }
            url.searchParams.delete('reference');
            url.searchParams.delete('trxref');
            window.history.replaceState(null, '', url.pathname + url.search + url.hash);
          } else if (ref && ref.startsWith('LM-PS-')) {
            setBottomTab('wallet');
            setWalletSubTab('deposit');
            const verifyRes = await verifyPaystackDeposit(ref);
            if (!active) return;
            hydrateWalletFields(verifyRes);
            if (verifyRes.status === 'success' && verifyRes.credited) {
              setWalletReturnNotice({
                ok: true,
                text: verifyRes.message,
              });
            } else if (verifyRes.status === 'failed') {
              setWalletReturnNotice({
                ok: false,
                text: verifyRes.message,
              });
            }
            url.searchParams.delete('reference');
            url.searchParams.delete('trxref');
            window.history.replaceState(null, '', url.pathname + url.search + url.hash);
          }
        } catch {
          // Ignore automatic verification errors on URL check
        }
      })
      .catch((err) => {
        console.error('Failed to load wallet:', err);
      });
    return () => {
      active = false;
    };
  }, [hydrateWalletFields]);

  useEffect(() => {
    let active = true;
    try {
      const url = new URL(window.location.href);
      const urlRef = (url.searchParams.get('ref') || url.searchParams.get('invite') || '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      const effectiveRef = urlRef || loadPendingReferralCode() || '';

      if (urlRef) {
        savePendingReferralCode(urlRef);
        setPendingReferralCode(urlRef);
        setOpenedByReferralLink(true);
        url.searchParams.delete('ref');
        url.searchParams.delete('invite');
        window.history.replaceState(null, '', url.pathname + url.search + url.hash);
      }

      if (effectiveRef) {
        validateReferralCode(effectiveRef)
          .then((res) => {
            if (!active) return;
            if (res.valid && res.code) {
              setPendingReferralCode(res.code);
              setReferrerName(res.referrerUsername || null);
            } else if (!urlRef) {
              clearPendingReferralCode();
              setPendingReferralCode(null);
              setReferrerName(null);
            }
          })
          .catch(() => {
            // Keep code silently if validation temporarily fails
          });
      }
    } catch {
      // Ignore URL parse issues
    }
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!showSplash && openedByReferralLink && !demoUser) {
      setOpenedByReferralLink(false);
      setAuthPromptNotice(
        referrerName
          ? `You were invited by ${referrerName}! Register now and deposit $6.00 USD to unlock their $3.00 USD reward.`
          : 'You opened a Luckymate friend invite link! Register now to get your own invite link too.'
      );
      setAuthModalMode('register');
    }
  }, [showSplash, openedByReferralLink, demoUser, referrerName]);

  useEffect(() => {
    if (authModalMode === 'register' && referrerName && pendingReferralCode) {
      setAuthPromptNotice(
        `You were invited by ${referrerName}! Register now and deposit $6.00 USD to unlock their $3.00 USD reward.`
      );
    }
  }, [authModalMode, referrerName, pendingReferralCode]);

  const refreshReferrals = useCallback(async () => {
    try {
      const [summary] = await Promise.all([fetchReferralSummary(), refreshWallet()]);
      setReferralSummary(summary);
      if (summary.referralCode) {
        setReferralCode(summary.referralCode);
      }
    } catch {
      // Ignore refresh error when signed out
    }
  }, [refreshWallet]);

  useEffect(() => {
    if (bottomTab === 'invite' && demoUser && !demoUser.startsWith('Guest-')) {
      refreshReferrals().catch(() => {});
    }
  }, [bottomTab, demoUser, refreshReferrals]);

  useEffect(() => {
    let active = true;
    const syncLiveCount = () => {
      fetchOfficialLiveScores({ league: 'all', day: 'today' })
        .then((res) => {
          if (active) setLiveMatchesCount(res.liveCount);
        })
        .catch(() => {
          // Silently keep current count on background poll failure
        });
    };
    syncLiveCount();
    const timer = window.setInterval(syncLiveCount, 60_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.altKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setPredictorOpen((prev) => !prev);
      }
    };
    const onHashOrPop = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/predictor' || hash === '#/predictor') {
        setPredictorOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('hashchange', onHashOrPop);
    window.addEventListener('popstate', onHashOrPop);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('hashchange', onHashOrPop);
      window.removeEventListener('popstate', onHashOrPop);
    };
  }, []);

  const enterCrashGame = useCallback((gameId: CrashGameId) => {
    setActiveCrashGameId(gameId);
    setTopCategory('crash');
    setBottomTab('games');
    setLoadingCrashGameId(gameId);
    setRecentlyPlayedIds((prev) => {
      const next = [gameId, ...prev.filter((id) => id !== gameId)].slice(0, 6);
      try {
        window.localStorage.setItem(RECENT_GAMES_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const handleFinishCrashLoad = useCallback((finishedGameId: CrashGameId) => {
    setLoadingCrashGameId(null);
    setActiveCrashGameId(finishedGameId);
    setTopCategory('crash');
    setBottomTab('games');
  }, []);

  const handleSignOutReset = useCallback(() => {
    setDemoUser(null);
    setRegisteredPhone(null);
    setRegisteredEmail(null);
    setMemberSince(null);
    setReferralCode(null);
    setReferralSummary(null);
    setRealBalance(0);
    setDemoBalance(500);
    setBalance(500);
    setAccountMode('demo');
    setLastDepositAmount(0);
    setLastDepositDate('No real deposit yet');
    setHistory([]);
    setPlayedStats({ totalWagered: 0, totalWon: 0, netPlayed: 0, gamesPlayed: 0 });
    setPendingCrashGameId(null);
    setActiveCrashGameId(null);
    refreshWallet().catch(() => {});
  }, [refreshWallet]);

  const promptAuthForRealAccount = useCallback(
    (reasonNotice?: string, preferredMode: 'login' | 'register' = 'login') => {
      setAuthPromptNotice(
        reasonNotice ||
          `Log in or register on Luckymate to unlock your Real Account (starts at ${formatMoney(0, countryRef.current)} until $6 USD deposit).`
      );
      setAuthModalMode(preferredMode);
    },
    []
  );

  const handleSwitchAccountMode = useCallback(
    async (nextMode: AccountMode): Promise<boolean> => {
      if (nextMode === 'real' && !demoUser) {
        promptAuthForRealAccount(
          `Log in or register to unlock your Real Account (starts at ${formatMoney(0, countryRef.current)} until $6 USD deposit).`
        );
        return false;
      }
      try {
        const res = await setAccountModeApi(nextMode);
        hydrateWalletFields(res);
        return true;
      } catch (err) {
        if (nextMode === 'real') {
          const isAuthRequired =
            err instanceof ApiError ? Boolean(err.requiresRegistration || err.status === 401) : !demoUser;
          if (isAuthRequired) {
            setDemoUser(null);
            promptAuthForRealAccount();
          }
        }
        return false;
      }
    },
    [demoUser, hydrateWalletFields, promptAuthForRealAccount]
  );

  const handleRequestOpenCrashGame = (gameId: CrashGameId) => {
    setPlayModeGateGameId(gameId);
  };

  const handleChooseDemoGate = async (gameId: CrashGameId) => {
    setPlayModeGateGameId(null);
    setAccountMode('demo');
    setBalance(demoBalance);
    enterCrashGame(gameId);
    setAccountModeApi('demo')
      .then((res) => {
        hydrateWalletFields(res);
      })
      .catch(() => {});
  };

  const handleChooseRealGate = async (gameId: CrashGameId) => {
    setPlayModeGateGameId(null);
    if (!demoUser) {
      if (getStoredAuthToken()) {
        try {
          const res = await setAccountModeApi('real');
          if (!res.isGuest) {
            hydrateWalletFields(res);
            setAccountMode('real');
            enterCrashGame(gameId);
            return;
          }
        } catch {
          // Fall through to login prompt when stored token is no longer valid
        }
      }
      setPendingCrashGameId(gameId);
      promptAuthForRealAccount(
        'Log in or register your Luckymate account to play Crash Games with a Real Account.'
      );
      return;
    }
    setAccountMode('real');
    setBalance(realBalance);
    enterCrashGame(gameId);
    setAccountModeApi('real')
      .then((res) => {
        hydrateWalletFields(res);
      })
      .catch(() => {});
  };

  const handleTogglePick = (match: MatchItem, selection: MarketSelection) => {
    const oddsMap: Record<MarketSelection, number> = {
      '1': match.odds.home,
      X: match.odds.draw,
      '2': match.odds.away,
      O: match.overUnder25.over,
      U: match.overUnder25.under,
    };
    const labelMap: Record<MarketSelection, string> = {
      '1': match.homeTeam,
      X: 'Draw',
      '2': match.awayTeam,
      O: `Over ${match.overUnderLine}`,
      U: `Under ${match.overUnderLine}`,
    };

    setSelectedPicks((prev) => {
      const existing = prev.find((p) => p.matchId === match.id);
      if (existing && existing.selection === selection) {
        return prev.filter((p) => p.matchId !== match.id);
      }
      const nextPick: SlipPick = {
        matchId: match.id,
        matchLabel: `${match.homeTeam} vs ${match.awayTeam}`,
        selection,
        selectionLabel: labelMap[selection],
        odds: oddsMap[selection],
      };
      if (existing) {
        return prev.map((p) => (p.matchId === match.id ? nextPick : p));
      }
      return [...prev, nextPick];
    });
  };

  const handleAddPopularBet = (pop: PopularBetItem) => {
    setSelectedPicks((prev) => {
      const nextPick: SlipPick = {
        matchId: pop.matchId,
        matchLabel: pop.matchLabel,
        selection: pop.selection,
        selectionLabel: pop.pickLabel,
        odds: pop.odds,
      };
      const existing = prev.find((p) => p.matchId === pop.matchId);
      if (existing) {
        return prev.map((p) => (p.matchId === pop.matchId ? nextPick : p));
      }
      return [...prev, nextPick];
    });
  };

  const handleLoadBookingCode = (_code: string, availableMatches: MatchItem[] = []) => {
    const pool = availableMatches.filter((m) => m.state !== 'post');
    if (pool.length === 0) return;
    const picks: SlipPick[] = pool.slice(0, 2).map((m) => ({
      matchId: m.id,
      matchLabel: `${m.homeTeam} vs ${m.awayTeam}`,
      selection: '1',
      selectionLabel: m.homeTeam,
      odds: m.odds.home,
    }));
    setSelectedPicks(picks);
  };

  const handleSubmitDemoSlip = async (stake: number) => {
    try {
      const res = await submitDemoSlip(stake, selectedPicks, accountMode);
      hydrateWalletFields(res);
      setSelectedPicks([]);
      return { ok: true, message: res.message };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : 'Unable to place bet.',
      };
    }
  };

  const handleResetDemo = async () => {
    const res = await resetDemoWallet();
    hydrateWalletFields(res);
  };

  const handleSelectCategory = (tab: TopCategoryTab) => {
    setTopCategory(tab);
    if (tab === 'crash') {
      setBottomTab('games');
      setActiveCrashGameId(null);
    } else if (tab === 'livescore') {
      setBottomTab('live');
    } else {
      setBottomTab('home');
    }
  };

  const handleSelectBottomTab = (tab: BottomNavTab) => {
    setBottomTab(tab);
    if (tab === 'home') setTopCategory('sports');
    if (tab === 'live') setTopCategory('livescore');
    if (tab === 'games') {
      setTopCategory('crash');
      setActiveCrashGameId(null);
    }
  };

  const handleAnalyzeRealMatch = (match: MatchItem) => {
    setAiSelectedMatch(match);
    setBottomTab('home');
    setTopCategory('ai-insights');
  };

  const combinedOdds = selectedPicks.reduce((acc, p) => acc * p.odds, 1);
  const isCrashRoomOpen =
    (bottomTab === 'games' || (bottomTab === 'home' && topCategory === 'crash')) &&
    activeCrashGameId !== null;

  return (
    <div
      className={
        isCrashRoomOpen
          ? 'min-h-screen bg-[#0c0d11] text-white'
          : 'lm-surface-shell min-h-screen bg-[#121821] pb-[82px] lg:pb-8 text-[#f1f5f9]'
      }
    >
      {showSplash && (
        <LandingSplash
          country={country}
          durationMs={6000}
          onComplete={() => setShowSplash(false)}
        />
      )}

      {!isCrashRoomOpen && (
        <SportsHeader
          demoBalance={demoBalance}
          realBalance={realBalance}
          accountMode={accountMode}
          demoUser={demoUser}
          country={country}
          activeCategory={topCategory}
          liveMatchesCount={liveMatchesCount}
          searchOpen={searchOpen}
          searchQuery={searchQuery}
          theme={theme}
          dataSaver={dataSaver}
          onSelectCountry={handleSelectCountry}
          onSelectCategory={handleSelectCategory}
          onOpenCrashGame={handleRequestOpenCrashGame}
          onOpenAviator={() => handleRequestOpenCrashGame('aviator')}
          onSwitchAccountMode={(mode) => {
            handleSwitchAccountMode(mode).catch(() => {});
          }}
          onToggleSearch={() => {
            setSearchOpen((prev) => !prev);
            if (searchOpen) setSearchQuery('');
          }}
          onSearchChange={setSearchQuery}
          onOpenAuth={(mode) => {
            setAuthPromptNotice(null);
            setAuthModalMode(mode);
          }}
          onOpenProfile={() => setBottomTab('profile')}
          onOpenInvite={() => setBottomTab('invite')}
          onOpenWallet={() => setBottomTab('wallet')}
          onOpenDownloadApp={() => setDownloadModalOpen(true)}
          onOpenSupport={() => setSupportModalOpen(true)}
          onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          onToggleDataSaver={() => setDataSaver((prev) => !prev)}
          onResetHome={() => {
            setBottomTab('home');
            setTopCategory('sports');
            setActiveCrashGameId(null);
          }}
          onSecretLogoUnlock={() => setPredictorOpen(true)}
        />
      )}

      <main>
        {bottomTab === 'home' && (topCategory === 'sports' || topCategory === 'in-play') && (
          <SportsFeedView
            balance={balance}
            country={country}
            searchQuery={searchQuery}
            liveOnly={topCategory === 'in-play'}
            dataSaver={dataSaver}
            selectedPicks={selectedPicks}
            onTogglePick={handleTogglePick}
            onAddPopularBet={handleAddPopularBet}
            onLoadBookingCode={handleLoadBookingCode}
            onRemovePick={(matchId) =>
              setSelectedPicks((prev) => prev.filter((p) => p.matchId !== matchId))
            }
            onClearSlip={() => setSelectedPicks([])}
            onSubmitDemoSlip={handleSubmitDemoSlip}
            onOpenMarkets={(m) => setMarketsMatch(m)}
            onOpenWallet={() => setBottomTab('wallet')}
            onNavigateTab={(tab) => handleSelectCategory(tab)}
            onAnalyzeMatch={handleAnalyzeRealMatch}
            onLiveCountUpdate={setLiveMatchesCount}
            isLoggedIn={Boolean(demoUser)}
          />
        )}

        {(bottomTab === 'games' || (bottomTab === 'home' && topCategory === 'crash')) &&
          (activeCrashGameId ? (
            <CrashSimulatorPanel
              balance={balance}
              demoBalance={demoBalance}
              realBalance={realBalance}
              accountMode={accountMode}
              country={country}
              playedStats={playedStats}
              walletHistory={history}
              username={demoUser}
              selectedGameId={activeCrashGameId}
              onSelectGame={handleRequestOpenCrashGame}
              onSelectAccountMode={(mode) => {
                handleSwitchAccountMode(mode).catch(() => {});
              }}
              onBackToLobby={() => setActiveCrashGameId(null)}
              onOpenWallet={() => {
                setActiveCrashGameId(null);
                setBottomTab('wallet');
              }}
              onWalletUpdated={hydrateWalletFields}
              onRefreshWallet={refreshWallet}
            />
          ) : (
            <GamesHubView
              history={history}
              recentlyPlayedIds={recentlyPlayedIds}
              country={country}
              onSelectGame={handleRequestOpenCrashGame}
              onOpenMyBets={() => setBottomTab('my-bets')}
            />
          ))}

        {bottomTab === 'home' &&
          (topCategory === 'casino' ||
            topCategory === 'live-casino' ||
            topCategory === 'virtuals' ||
            topCategory === 'promos') && (
            <div className="mx-auto max-w-6xl px-3 py-4 sm:px-5">
              <CasinoAndPromotionsView
                mode={topCategory === 'promos' ? 'promotions' : 'casino'}
                country={country}
                onNavigate={(sec) => {
                  if (sec === 'crash') {
                    setTopCategory('crash');
                    setBottomTab('games');
                    setActiveCrashGameId(null);
                  }
                  if (sec === 'deposit') setBottomTab('wallet');
                  if (sec === 'ai-insights') setTopCategory('ai-insights');
                  if (sec === 'referrals') {
                    if (demoUser) {
                      setBottomTab('invite');
                    } else {
                      setAuthPromptNotice(
                        'Register or log in to get your personal invite link and earn $3.00 USD when a friend deposits $6.00 USD.'
                      );
                      setAuthModalMode('register');
                    }
                  }
                }}
              />
            </div>
          )}

        {bottomTab === 'home' && topCategory === 'ai-insights' && (
          <div className="mx-auto max-w-6xl px-3 py-4 sm:px-5">
            <AiAnalyserSection selectedMatch={aiSelectedMatch} />
          </div>
        )}

        {(bottomTab === 'live' || (bottomTab === 'home' && topCategory === 'livescore')) && (
          <LiveScoreView
            searchQuery={searchQuery}
            selectedPicks={selectedPicks}
            onTogglePick={handleTogglePick}
            onAnalyzeMatch={handleAnalyzeRealMatch}
            onLiveCountUpdate={setLiveMatchesCount}
          />
        )}

        {bottomTab === 'my-bets' && (
          <div className="mx-auto max-w-4xl space-y-4 px-3 py-4 sm:px-5">
            {selectedPicks.length > 0 && (
              <div className="lm-card rounded-xl p-4">
                <div className="flex items-center justify-between border-b border-[#154542] pb-2.5">
                  <h2 className="font-display text-base font-bold text-white">
                    Active Demo Slip ({selectedPicks.length})
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSelectedPicks([])}
                    className="text-xs font-semibold text-[#8bb0ab] hover:text-white cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {selectedPicks.map((p) => (
                    <div
                      key={p.matchId}
                      className="flex items-center justify-between rounded-lg bg-[#071e1e] px-3 py-2 text-xs"
                    >
                      <span>
                        {p.matchLabel} · <strong>{p.selection}</strong>
                      </span>
                      <span className="font-mono font-bold text-[#2cd4a3] tabular-nums">
                        {p.odds.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={100000}
                    value={mobileSlipStake}
                    onChange={(e) => setMobileSlipStake(e.target.value)}
                    className="min-h-[42px] w-32 rounded-lg border border-[#19534e] bg-[#071e1e] px-3 py-2 font-mono text-sm text-white tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await handleSubmitDemoSlip(Number(mobileSlipStake) || 0);
                      setMobileSlipMsg({ ok: res.ok, text: res.message });
                    }}
                    className="min-h-[42px] flex-1 rounded-lg bg-[#f6d663] px-4 py-2 text-sm font-extrabold text-[#111c17] cursor-pointer"
                  >
                    Place Demo Bet ({combinedOdds.toFixed(2)})
                  </button>
                </div>
                {mobileSlipMsg && (
                  <p
                    className={`mt-2 text-xs ${
                      mobileSlipMsg.ok ? 'text-[#2cd4a3]' : 'text-[#f87171]'
                    }`}
                  >
                    {mobileSlipMsg.text}
                  </p>
                )}
              </div>
            )}

            <HistoryAndBetsView
              history={history}
              title="My Bets & Real Games"
              country={country}
              onBrowseSports={() => {
                setBottomTab('home');
                setTopCategory('sports');
              }}
              onOpenCrashGames={() => {
                setBottomTab('games');
                setTopCategory('crash');
                setActiveCrashGameId(null);
              }}
            />
          </div>
        )}

        {bottomTab === 'wallet' && (
          <div className="mx-auto max-w-md space-y-4 px-3 py-6 sm:px-5">
            <div className="grid grid-cols-2 gap-1 rounded-lg border border-[#154542] bg-[#051818] p-1">
              <button
                type="button"
                onClick={() => setWalletSubTab('deposit')}
                className={`min-h-[38px] rounded-md px-4 py-1.5 text-xs font-bold cursor-pointer ${
                  walletSubTab === 'deposit'
                    ? 'bg-[#2cd4a3] text-[#051818]'
                    : 'text-[#8bb0ab] hover:text-white'
                }`}
              >
                Deposit
              </button>
              <button
                type="button"
                onClick={() => setWalletSubTab('withdraw')}
                className={`min-h-[38px] rounded-md px-4 py-1.5 text-xs font-bold cursor-pointer ${
                  walletSubTab === 'withdraw'
                    ? 'bg-[#f6d663] text-[#111c17]'
                    : 'text-[#8bb0ab] hover:text-white'
                }`}
              >
                Withdraw
              </button>
            </div>

            <WalletActionView
              mode={walletSubTab}
              accountMode={accountMode}
              country={country}
              registeredPhone={registeredPhone}
              demoBalance={demoBalance}
              realBalance={realBalance}
              isRegistered={Boolean(demoUser)}
              lastDepositAmount={lastDepositAmount}
              lastDepositDate={lastDepositDate}
              externalNotice={walletReturnNotice}
              onWalletSync={hydrateWalletFields}
              onOpenRegister={() => {
                promptAuthForRealAccount(
                  'Log in or register your Luckymate account to deposit into or withdraw from your Real Account.'
                );
              }}
            />
          </div>
        )}

        {bottomTab === 'invite' && (
          <div className="mx-auto max-w-4xl space-y-4 px-3 py-4 sm:px-5">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setBottomTab('home')}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#243d56] bg-[#0a1524] px-3 py-1.5 text-xs font-bold text-[#cbd5e1] hover:border-[#7bc114] hover:text-white cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back
              </button>
            </div>

            {demoUser && (referralCode || referralSummary?.referralCode) ? (
              <ReferralProgramCard
                referralCode={referralCode || referralSummary?.referralCode || ''}
                summary={referralSummary}
                country={country}
                onRefresh={refreshReferrals}
                onOpenDeposit={() => setBottomTab('wallet')}
              />
            ) : (
              <div className="lm-card rounded-2xl p-6 text-center space-y-3">
                <h2 className="font-display text-lg font-extrabold text-white">
                  Invite Friends &amp; Earn $3.00 USD
                </h2>
                <p className="mx-auto max-w-md text-xs leading-relaxed text-[#9fb3c8]">
                  Log in or register on Luckymate to get your personal invite link.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthPromptNotice(null);
                      setAuthModalMode('register');
                    }}
                    className="min-h-[40px] rounded-lg bg-[#7bc114] px-4 py-2 text-xs font-extrabold text-[#0b1404] hover:bg-[#8cd61e] cursor-pointer"
                  >
                    Register
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthPromptNotice(null);
                      setAuthModalMode('login');
                    }}
                    className="min-h-[40px] rounded-lg bg-[#f5c417] px-4 py-2 text-xs font-extrabold text-[#111827] hover:bg-[#fae07d] cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {bottomTab === 'profile' && (
          <ProfileView
            demoUser={demoUser}
            registeredPhone={registeredPhone}
            registeredEmail={registeredEmail}
            memberSince={memberSince}
            country={country}
            realBalance={realBalance}
            demoBalance={demoBalance}
            lastDepositAmount={lastDepositAmount}
            lastDepositDate={lastDepositDate}
            referralCode={referralCode}
            referralSummary={referralSummary}
            pendingReferralCode={pendingReferralCode}
            referrerName={referrerName}
            onSelectCountry={handleSelectCountry}
            onOpenWallet={() => setBottomTab('wallet')}
            onRegistered={(reg) => {
              if (reg.referralCode) {
                setReferralCode(reg.referralCode);
              }
              setPendingReferralCode(null);
              setReferrerName(null);
              if (reg.activated) {
                saveRegisteredClientDetails({
                  phone: reg.phone,
                  email: reg.email,
                  emailVerified: true,
                  country: reg.country,
                  username: reg.username,
                  registeredAt: reg.createdAt,
                  passwordHash: reg.passwordHash,
                });
              }
            }}
            onAuthComplete={(auth) => {
              setAuthPromptNotice(null);
              if (auth) {
                if (!auth.guest) {
                  setDemoUser(auth.username);
                  if (auth.phone) setRegisteredPhone(auth.phone);
                  if (auth.email) setRegisteredEmail(auth.email);
                  if (auth.createdAt) setMemberSince(auth.createdAt);
                  if (auth.referralCode) setReferralCode(auth.referralCode);
                  if (auth.referralSummary) setReferralSummary(auth.referralSummary);
                  if (auth.country) {
                    setCountry(auth.country);
                    saveStoredCountry(auth.country);
                  }
                  saveRegisteredClientDetails({
                    phone: auth.phone,
                    email: auth.email,
                    emailVerified: auth.emailVerified !== false,
                    country: auth.country ?? country,
                    username: auth.username,
                    registeredAt: auth.createdAt,
                    passwordHash: auth.passwordHash,
                  });
                } else {
                  setDemoUser(null);
                  setRegisteredPhone(null);
                  setRegisteredEmail(null);
                  setMemberSince(null);
                  setReferralCode(null);
                  setReferralSummary(null);
                }
                hydrateWalletFields({ ...auth, isGuest: Boolean(auth.guest) });
              } else {
                handleSignOutReset();
              }
            }}
            onRefreshReferrals={refreshReferrals}
            onResetDemo={handleResetDemo}
          />
        )}
      </main>

      {!isCrashRoomOpen && (
        <BottomTabBar
          activeTab={bottomTab}
          slipCount={selectedPicks.length}
          liveCount={liveMatchesCount}
          onSelectTab={handleSelectBottomTab}
        />
      )}

      {marketsMatch && (
        <MatchMarketsModal
          match={marketsMatch}
          activePick={selectedPicks.find((p) => p.matchId === marketsMatch.id)}
          onTogglePick={handleTogglePick}
          onClose={() => setMarketsMatch(null)}
        />
      )}

      {playModeGateGameId && (
        <PlayModeGateModal
          gameId={playModeGateGameId}
          country={country}
          demoBalance={demoBalance}
          realBalance={realBalance}
          isRegistered={Boolean(demoUser)}
          onChooseDemo={(id) => {
            handleChooseDemoGate(id).catch(() => {});
          }}
          onChooseReal={(id) => {
            handleChooseRealGate(id).catch(() => {});
          }}
          onGoToDeposit={() => {
            setPlayModeGateGameId(null);
            setActiveCrashGameId(null);
            setBottomTab('wallet');
          }}
          onClose={() => setPlayModeGateGameId(null)}
        />
      )}

      {authModalMode && (
        <AuthDemoModal
          initialMode={authModalMode}
          country={country}
          currentUser={demoUser}
          promptNotice={authPromptNotice}
          initialReferralCode={pendingReferralCode}
          referrerName={referrerName}
          onSelectCountry={handleSelectCountry}
          onRegistered={(reg) => {
            if (reg.referralCode) {
              setReferralCode(reg.referralCode);
            }
            setPendingReferralCode(null);
            setReferrerName(null);
            if (reg.activated) {
              saveRegisteredClientDetails({
                phone: reg.phone,
                email: reg.email,
                emailVerified: true,
                country: reg.country,
                username: reg.username,
                registeredAt: reg.createdAt,
                passwordHash: reg.passwordHash,
              });
            }
          }}
          onAuthComplete={(auth) => {
            setAuthPromptNotice(null);
            if (auth) {
              if (!auth.guest) {
                setDemoUser(auth.username);
                if (auth.phone) setRegisteredPhone(auth.phone);
                if (auth.email) setRegisteredEmail(auth.email);
                if (auth.createdAt) setMemberSince(auth.createdAt);
                if (auth.referralCode) setReferralCode(auth.referralCode);
                if (auth.referralSummary) setReferralSummary(auth.referralSummary);
                if (auth.country) {
                  setCountry(auth.country);
                  saveStoredCountry(auth.country);
                }
                saveRegisteredClientDetails({
                  phone: auth.phone,
                  email: auth.email,
                  emailVerified: auth.emailVerified !== false,
                  country: auth.country ?? country,
                  username: auth.username,
                  registeredAt: auth.createdAt,
                  passwordHash: auth.passwordHash,
                });
              } else {
                setDemoUser(null);
                setRegisteredPhone(null);
                setRegisteredEmail(null);
                setMemberSince(null);
                setReferralCode(null);
                setReferralSummary(null);
              }
              hydrateWalletFields({ ...auth, isGuest: Boolean(auth.guest) });
              if (!auth.guest && pendingCrashGameId) {
                const targetGame = pendingCrashGameId;
                setPendingCrashGameId(null);
                setAccountMode('real');
                setBalance(auth.realBalance);
                enterCrashGame(targetGame);
                setAccountModeApi('real')
                  .then((res) => {
                    hydrateWalletFields(res);
                  })
                  .catch(() => {});
              }
            } else {
              handleSignOutReset();
            }
          }}
          onClose={() => {
            setAuthModalMode(null);
            setAuthPromptNotice(null);
            setPendingCrashGameId(null);
          }}
        />
      )}

      {loadingCrashGameId && (
        <GameLoadingOverlay
          gameId={loadingCrashGameId}
          accountMode={accountMode}
          onComplete={handleFinishCrashLoad}
        />
      )}

      {downloadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Download Luckymate App"
        >
          <div className="lm-modal-pop w-full max-w-md rounded-2xl border border-[#263344] bg-[#161f2b] p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#223042] pb-3">
              <div className="flex items-center gap-2.5">
                <div>
                  <div className="inline-flex items-center font-display text-base font-black uppercase tracking-[0.06em] leading-none">
                    <span className="text-[#f5c417]">LUCKY</span>
                    <span className="text-white">MATE</span>
                  </div>
                  <h3 className="mt-1 font-display text-sm font-bold text-white">
                    Install Luckymate App
                  </h3>
                  <p className="text-[11px] text-[#94a3b8]">Fast access on Android &amp; Desktop</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDownloadModalOpen(false)}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-[#1f2c3d] hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-[#cbd5e1]">
              <div className="rounded-xl border border-[#253345] bg-[#101823] p-3.5 space-y-1.5">
                <p className="flex items-center gap-1.5 font-bold text-[#7bc114]">
                  <Smartphone className="h-4 w-4" aria-hidden="true" />
                  <span>Android Chrome</span>
                </p>
                <p>
                  Tap the browser menu (<strong>⋮</strong>) at the top-right and select{' '}
                  <strong>Add to Home screen</strong> or <strong>Install app</strong> to launch
                  Luckymate with its branded icon.
                </p>
              </div>
              <div className="rounded-xl border border-[#253345] bg-[#101823] p-3.5 space-y-1.5">
                <p className="font-bold text-[#f5c417]">iPhone / iPad Safari</p>
                <p>
                  Tap the <strong>Share</strong> icon and choose{' '}
                  <strong>Add to Home Screen</strong>.
                </p>
              </div>
            </div>

            {installPromptEvent && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await installPromptEvent.prompt();
                    await installPromptEvent.userChoice;
                  } finally {
                    setInstallPromptEvent(null);
                    setDownloadModalOpen(false);
                  }
                }}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#7bc114] px-4 py-2 text-sm font-extrabold text-[#0b1404] hover:bg-[#8cd61e] cursor-pointer"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Install App Now
              </button>
            )}

            <button
              type="button"
              onClick={() => setDownloadModalOpen(false)}
              className="min-h-[40px] w-full rounded-xl border border-[#2a384b] bg-[#101823] px-4 py-2 text-xs font-bold text-[#e2e8f0] hover:text-white cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {supportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Support and Account Rules"
        >
          <div className="relative w-full max-w-lg">
            <button
              type="button"
              onClick={() => setSupportModalOpen(false)}
              aria-label="Close support dialog"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-[#1f2c3d] hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <SettingsAndSupportView
              mode="support"
              country={country}
              onSelectCountry={handleSelectCountry}
              onResetDemo={handleResetDemo}
            />
          </div>
        </div>
      )}

      {predictorOpen && (
        <PredictorView
          initialGameId={activeCrashGameId ?? 'aviator'}
          onClose={() => {
            setPredictorOpen(false);
            try {
              const url = new URL(window.location.href);
              if (url.pathname.toLowerCase() === '/predictor') {
                url.pathname = '/';
              }
              if (url.hash.toLowerCase() === '#/predictor') {
                url.hash = '';
              }
              if (url.searchParams.has('predictor')) {
                url.searchParams.delete('predictor');
              }
              window.history.replaceState(null, '', url.pathname + url.search + url.hash);
            } catch {
              // Ignore history errors
            }
          }}
        />
      )}
    </div>
  );
}
