import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  Copy,
  Maximize2,
  Menu,
  Minimize2,
  Minus,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Rocket,
  X,
} from 'lucide-react';
import { CRASH_GAMES } from '../data/matches';
import {
  cancelCrashRoomBet,
  cashoutCrashRoom,
  fetchCrashRoomState,
  placeCrashRoomBet,
} from '../lib/api';
import { playCrashSfx, setCrashMusicEnabled } from '../lib/crashAudio';
import { formatMoney, getCountryConfig } from '../lib/countries';
import {
  AccountMode,
  CountryOption,
  CrashGameId,
  PlayedStats,
  RoomBetPublic,
  RoomRoundPublic,
  WalletTransaction,
} from '../types';
import { CrashDualBalanceBar, HeaderTopBalanceBadge } from './crash/CrashDualBalanceBar';
import { AvatarId, CrashHamburgerMenu } from './crash/CrashHamburgerMenu';
import { BCrashStage, CometCrashStage, JetXStage } from './crash/CrashStageArt';
import {
  formatKes,
  getMultiplierBadgeClass,
  getMultiplierPillBg,
  LiveBetsBoard,
  LiveCashoutNotice,
} from './crash/LiveBetsBoard';
import {
  isOtherCrashGameId,
  OtherCrashRoomView,
  SlipDraftState,
} from './crash/OtherCrashRoomView';

export interface CrashWalletSyncPayload {
  balance: number;
  demoBalance: number;
  realBalance: number;
  accountMode: AccountMode;
  history: WalletTransaction[];
  lastDepositAmount: number;
  lastDepositDate: string;
  playedStats?: PlayedStats;
}

interface CrashSimulatorPanelProps {
  balance: number;
  demoBalance: number;
  realBalance: number;
  accountMode: AccountMode;
  country?: CountryOption;
  playedStats: PlayedStats;
  walletHistory: WalletTransaction[];
  username: string | null;
  selectedGameId: CrashGameId;
  onSelectGame: (gameId: CrashGameId) => void;
  onSelectAccountMode: (mode: AccountMode) => void;
  onBackToLobby: () => void;
  onOpenWallet: () => void;
  onWalletUpdated: (payload: CrashWalletSyncPayload) => void;
  onRefreshWallet: () => Promise<void>;
}

// SlipDraftState imported from ./crash/OtherCrashRoomView

const AVIATOR_PRESETS = [100, 200, 500, 10000] as const;
const JETX_PRESETS = [20, 50, 100] as const;
const BCRASH_PRESETS = [10, 50, 100] as const;

function createDefaultSlipDraft(stake = '10.00', autoTarget = '2.00'): SlipDraftState {
  return {
    mode: 'bet',
    stakeAmount: stake,
    autoCashoutEnabled: false,
    autoCashoutInput: autoTarget,
    autoPlayEnabled: false,
    queuedNextRound: false,
    submitting: false,
    message: null,
  };
}

export function CrashSimulatorPanel({
  balance: _balance,
  demoBalance,
  realBalance,
  accountMode,
  country = 'Kenya',
  playedStats: _playedStats,
  walletHistory,
  username,
  selectedGameId,
  onSelectGame: _onSelectGame,
  onSelectAccountMode,
  onBackToLobby,
  onOpenWallet,
  onWalletUpdated,
  onRefreshWallet,
}: CrashSimulatorPanelProps) {
  const isLoggedIn = Boolean(username);
  const [roundId, setRoundId] = useState('');
  const [roundNumber, setRoundNumber] = useState(1);
  const [roomStatus, setRoomStatus] = useState<'betting' | 'running' | 'crashed'>('betting');
  const [multiplier, setMultiplier] = useState(1.0);
  const [countdown, setCountdown] = useState(10.0);
  const [lastCrashedPoint, setLastCrashedPoint] = useState<number | null>(null);
  const [connectedPlayers, setConnectedPlayers] = useState(1);
  const [wsConnected, setWsConnected] = useState(false);

  const [activeBets, setActiveBets] = useState<RoomBetPublic[]>([]);
  const [previousBets, setPreviousBets] = useState<RoomBetPublic[]>([]);
  const [previousCrashPoint, setPreviousCrashPoint] = useState<number | null>(null);
  const [topWins, setTopWins] = useState<RoomBetPublic[]>([]);
  const [recentRounds, setRecentRounds] = useState<RoomRoundPublic[]>([]);
  const [liveCashouts, setLiveCashouts] = useState<LiveCashoutNotice[]>([]);

  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel2Collapsed, setPanel2Collapsed] = useState(false);
  const [cometShowSecondSlip, setCometShowSecondSlip] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedRoundId, setCopiedRoundId] = useState(false);
  const [clockLabel, setClockLabel] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  );

  const [avatarId, setAvatarId] = useState<AvatarId>(() => {
    try {
      const saved = window.localStorage.getItem('luckymate_avatar');
      return (saved as AvatarId) || 'bills';
    } catch {
      return 'bills';
    }
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem('luckymate_sound');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [musicEnabled, setMusicEnabled] = useState<boolean>(false);
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem('luckymate_anim');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [clientSeed, setClientSeed] = useState<string>(() => {
    try {
      return window.localStorage.getItem('luckymate_client_seed') || 'lm254-lucky-seed-9f4a';
    } catch {
      return 'lm254-lucky-seed-9f4a';
    }
  });

  const [slip1Draft, setSlip1Draft] = useState<SlipDraftState>(() =>
    createDefaultSlipDraft('10.00', '2.00')
  );
  const [slip2Draft, setSlip2Draft] = useState<SlipDraftState>(() =>
    createDefaultSlipDraft('10.00', '3.00')
  );
  const [mySlip1Bet, setMySlip1Bet] = useState<RoomBetPublic | null>(null);
  const [mySlip2Bet, setMySlip2Bet] = useState<RoomBetPublic | null>(null);

  const mySlip1Ref = useRef<RoomBetPublic | null>(null);
  const mySlip2Ref = useRef<RoomBetPublic | null>(null);
  const slip1DraftRef = useRef<SlipDraftState>(slip1Draft);
  const slip2DraftRef = useRef<SlipDraftState>(slip2Draft);
  const selectedGameRef = useRef<CrashGameId>(selectedGameId);
  const soundEnabledRef = useRef<boolean>(soundEnabled);
  const accountModeRef = useRef<AccountMode>(accountMode);
  const countryRef = useRef<CountryOption>(country);
  const onRefreshWalletRef = useRef(onRefreshWallet);

  mySlip1Ref.current = mySlip1Bet;
  mySlip2Ref.current = mySlip2Bet;
  slip1DraftRef.current = slip1Draft;
  slip2DraftRef.current = slip2Draft;
  selectedGameRef.current = selectedGameId;
  soundEnabledRef.current = soundEnabled;
  accountModeRef.current = accountMode;
  countryRef.current = country;
  onRefreshWalletRef.current = onRefreshWallet;

  useEffect(() => {
    setCrashMusicEnabled(musicEnabled);
    return () => {
      setCrashMusicEnabled(false);
    };
  }, [musicEnabled]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClockLabel(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  };

  const hydrateRoom = useCallback(async (game: CrashGameId) => {
    try {
      const snap = await fetchCrashRoomState(game);
      setRoundId(snap.roundId);
      setRoundNumber(snap.roundNumber);
      setRoomStatus(snap.status);
      setMultiplier(snap.multiplier);
      setCountdown(snap.countdown);
      setLastCrashedPoint(snap.crashPoint);
      setConnectedPlayers(snap.connectedPlayers);
      setActiveBets(snap.activeBets ?? []);
      setLiveCashouts(
        (snap.activeBets ?? [])
          .filter((b) => b.status === 'cashed_out' && b.cashoutMultiplier !== null)
          .map((b) => ({
            betId: b.betId,
            username: b.username,
            slot: b.slot,
            multiplier: b.cashoutMultiplier ?? 1,
            payout: b.payout,
          }))
      );
      setPreviousBets(snap.previousBets ?? []);
      setPreviousCrashPoint(snap.previousCrashPoint ?? null);
      setTopWins(snap.topWins ?? []);
      setRecentRounds(snap.recentRounds ?? []);
      setMySlip1Bet(snap.myActiveBets?.slip1 ?? null);
      setMySlip2Bet(snap.myActiveBets?.slip2 ?? null);
    } catch (err) {
      console.error('Failed to sync crash room state:', err);
    }
  }, []);

  const submitSlotBet = useCallback(
    async (slot: 1 | 2, customDraft?: SlipDraftState) => {
      const draft = customDraft ?? (slot === 1 ? slip1DraftRef.current : slip2DraftRef.current);
      const setDraft = slot === 1 ? setSlip1Draft : setSlip2Draft;
      const setBet = slot === 1 ? setMySlip1Bet : setMySlip2Bet;
      const game = selectedGameRef.current;

      const parsedAmount = Number(draft.stakeAmount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        setDraft((d) => ({
          ...d,
          queuedNextRound: false,
          message: { ok: false, text: 'Enter a valid bet amount.' },
        }));
        return;
      }

      let parsedAuto: number | null = null;
      if (draft.mode === 'auto' || draft.autoCashoutEnabled) {
        parsedAuto = Number(draft.autoCashoutInput);
        if (!Number.isFinite(parsedAuto) || parsedAuto < 1.01 || parsedAuto > 100) {
          setDraft((d) => ({
            ...d,
            queuedNextRound: false,
            message: { ok: false, text: 'Auto cashout must be 1.01x – 100.00x.' },
          }));
          return;
        }
      }

      setDraft((d) => ({ ...d, submitting: true, queuedNextRound: false, message: null }));
      try {
        const res = await placeCrashRoomBet(
          game,
          slot,
          parsedAmount,
          parsedAuto,
          accountModeRef.current
        );
        playCrashSfx('bet', soundEnabledRef.current);
        setBet(res.bet);
        onWalletUpdated({
          balance: res.balance,
          demoBalance: res.demoBalance,
          realBalance: res.realBalance,
          accountMode: res.accountMode,
          history: res.history,
          lastDepositAmount: res.lastDepositAmount,
          lastDepositDate: res.lastDepositDate,
          playedStats: res.playedStats,
        });
        setDraft((d) => ({
          ...d,
          submitting: false,
          queuedNextRound: false,
          message: null,
        }));
      } catch (err) {
        setDraft((d) => ({
          ...d,
          submitting: false,
          queuedNextRound: false,
          autoPlayEnabled: false,
          message: {
            ok: false,
            text: err instanceof Error ? err.message : 'Unable to place bet.',
          },
        }));
      }
    },
    [onWalletUpdated]
  );

  const submitSlotBetRef = useRef(submitSlotBet);
  submitSlotBetRef.current = submitSlotBet;

  useEffect(() => {
    let closedByUser = false;
    let ws: WebSocket | null = null;
    let reconnectTimer: number | null = null;

    setMySlip1Bet(null);
    setMySlip2Bet(null);
    setHistoryExpanded(false);
    setMenuOpen(false);
    setSlip1Draft((d) => ({ ...d, queuedNextRound: false, autoPlayEnabled: false, message: null }));
    setSlip2Draft((d) => ({ ...d, queuedNextRound: false, autoPlayEnabled: false, message: null }));
    hydrateRoom(selectedGameId);

    const connect = () => {
      if (closedByUser) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${protocol}//${window.location.host}/ws/crash/${selectedGameId}`;
      ws = new WebSocket(url);

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.game !== selectedGameId) return;

          if (msg.type === 'init') {
            if (msg.roundId) setRoundId(msg.roundId);
            setRoundNumber(msg.roundNumber);
            setRoomStatus(msg.status);
            setMultiplier(msg.multiplier);
            setCountdown(msg.countdown);
            setLastCrashedPoint(msg.crashPoint);
            setConnectedPlayers(msg.connectedPlayers);
            if (Array.isArray(msg.activeBets)) {
              setActiveBets(msg.activeBets);
              setLiveCashouts(
                msg.activeBets
                  .filter(
                    (b: RoomBetPublic) =>
                      b.status === 'cashed_out' && b.cashoutMultiplier !== null
                  )
                  .map((b: RoomBetPublic) => ({
                    betId: b.betId,
                    username: b.username,
                    slot: b.slot,
                    multiplier: b.cashoutMultiplier ?? 1,
                    payout: b.payout,
                  }))
              );
            }
            if (Array.isArray(msg.previousBets)) setPreviousBets(msg.previousBets);
            if (msg.previousCrashPoint !== undefined) {
              setPreviousCrashPoint(msg.previousCrashPoint);
            }
            if (Array.isArray(msg.topWins)) setTopWins(msg.topWins);
            if (Array.isArray(msg.recentRounds)) setRecentRounds(msg.recentRounds);
          } else if (msg.type === 'presence') {
            setConnectedPlayers(msg.connectedPlayers);
          } else if (msg.type === 'state') {
            setRoomStatus(msg.status);
            setCountdown(msg.countdown);
            setConnectedPlayers(msg.connectedPlayers);
          } else if (msg.type === 'started') {
            setRoomStatus('running');
            setMultiplier(1.0);
            setCountdown(0);
            setLastCrashedPoint(null);
            setConnectedPlayers(msg.connectedPlayers);
            playCrashSfx('launch', soundEnabledRef.current);
          } else if (msg.type === 'tick') {
            setRoomStatus('running');
            setMultiplier(msg.multiplier);
            setConnectedPlayers(msg.connectedPlayers);
          } else if (msg.type === 'bet') {
            const incoming: RoomBetPublic = {
              betId: msg.betId,
              slot: msg.slot === 2 ? 2 : 1,
              username: msg.username,
              amount: msg.amount,
              autoCashout: msg.autoCashout ?? null,
              status: msg.status ?? 'active',
              payout: msg.payout ?? 0,
              cashoutMultiplier: msg.cashoutMultiplier ?? null,
            };
            setActiveBets((prev) =>
              prev.some((b) => b.betId === incoming.betId) ? prev : [incoming, ...prev]
            );
          } else if (msg.type === 'bet_cancelled') {
            setActiveBets((prev) => prev.filter((b) => b.betId !== msg.betId));
            if (mySlip1Ref.current && mySlip1Ref.current.betId === msg.betId) {
              setMySlip1Bet(null);
            }
            if (mySlip2Ref.current && mySlip2Ref.current.betId === msg.betId) {
              setMySlip2Bet(null);
            }
          } else if (msg.type === 'cashout') {
            setActiveBets((prev) =>
              prev.map((b) =>
                b.betId === msg.betId
                  ? {
                      ...b,
                      status: 'cashed_out',
                      payout: msg.payout,
                      cashoutMultiplier: msg.multiplier,
                    }
                  : b
              )
            );
            setLiveCashouts((prev) => {
              if (prev.some((c) => c.betId === msg.betId)) return prev;
              return [
                {
                  betId: msg.betId,
                  username: String(msg.username || 'Player'),
                  slot: msg.slot === 2 ? 2 : 1,
                  multiplier: Number(msg.multiplier) || 1,
                  payout: Number(msg.payout) || 0,
                },
                ...prev.slice(0, 9),
              ];
            });
            if (mySlip1Ref.current && mySlip1Ref.current.betId === msg.betId) {
              setMySlip1Bet((prev) =>
                prev
                  ? {
                      ...prev,
                      status: 'cashed_out',
                      payout: msg.payout,
                      cashoutMultiplier: msg.multiplier,
                    }
                  : prev
              );
              setSlip1Draft((d) => ({
                ...d,
                message: {
                  ok: true,
                  text: `Won ${formatMoney(Number(msg.payout), countryRef.current)} @ ${Number(
                    msg.multiplier
                  ).toFixed(2)}x`,
                },
              }));
              playCrashSfx('cashout', soundEnabledRef.current);
              onRefreshWalletRef.current().catch(() => {});
            }
            if (mySlip2Ref.current && mySlip2Ref.current.betId === msg.betId) {
              setMySlip2Bet((prev) =>
                prev
                  ? {
                      ...prev,
                      status: 'cashed_out',
                      payout: msg.payout,
                      cashoutMultiplier: msg.multiplier,
                    }
                  : prev
              );
              setSlip2Draft((d) => ({
                ...d,
                message: {
                  ok: true,
                  text: `Won ${formatMoney(Number(msg.payout), countryRef.current)} @ ${Number(
                    msg.multiplier
                  ).toFixed(2)}x`,
                },
              }));
              playCrashSfx('cashout', soundEnabledRef.current);
              onRefreshWalletRef.current().catch(() => {});
            }
          } else if (msg.type === 'crashed') {
            setRoomStatus('crashed');
            setMultiplier(msg.multiplier);
            setLastCrashedPoint(msg.multiplier);
            playCrashSfx('crash', soundEnabledRef.current);
            if (Array.isArray(msg.recentRounds)) setRecentRounds(msg.recentRounds);
            if (Array.isArray(msg.previousBets)) setPreviousBets(msg.previousBets);
            if (msg.previousCrashPoint !== undefined) {
              setPreviousCrashPoint(msg.previousCrashPoint);
            }
            if (Array.isArray(msg.topWins)) setTopWins(msg.topWins);
            setActiveBets((prev) =>
              prev.map((b) => (b.status === 'active' ? { ...b, status: 'lost' } : b))
            );
            if (mySlip1Ref.current && mySlip1Ref.current.status === 'active') {
              setMySlip1Bet((prev) => (prev ? { ...prev, status: 'lost' } : prev));
              onRefreshWalletRef.current().catch(() => {});
            }
            if (mySlip2Ref.current && mySlip2Ref.current.status === 'active') {
              setMySlip2Bet((prev) => (prev ? { ...prev, status: 'lost' } : prev));
              onRefreshWalletRef.current().catch(() => {});
            }
          } else if (msg.type === 'new_round') {
            if (msg.roundId) setRoundId(msg.roundId);
            setRoundNumber(msg.roundNumber);
            setRoomStatus('betting');
            setMultiplier(1.0);
            setCountdown(msg.countdown);
            setLastCrashedPoint(null);
            setConnectedPlayers(msg.connectedPlayers);
            setActiveBets([]);
            setLiveCashouts([]);
            setMySlip1Bet(null);
            setMySlip2Bet(null);
            setSlip1Draft((d) => ({ ...d, message: null }));
            setSlip2Draft((d) => ({ ...d, message: null }));
            if (Array.isArray(msg.recentRounds)) setRecentRounds(msg.recentRounds);
            if (Array.isArray(msg.previousBets)) setPreviousBets(msg.previousBets);
            if (msg.previousCrashPoint !== undefined) {
              setPreviousCrashPoint(msg.previousCrashPoint);
            }
            if (Array.isArray(msg.topWins)) setTopWins(msg.topWins);

            if (slip1DraftRef.current.queuedNextRound || slip1DraftRef.current.autoPlayEnabled) {
              submitSlotBetRef.current(1, slip1DraftRef.current).catch(() => {});
            }
            if (slip2DraftRef.current.queuedNextRound || slip2DraftRef.current.autoPlayEnabled) {
              submitSlotBetRef.current(2, slip2DraftRef.current).catch(() => {});
            }
          }
        } catch {
          // Ignore malformed WS message
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        if (!closedByUser) {
          reconnectTimer = window.setTimeout(connect, 1500);
        }
      };
    };

    connect();

    return () => {
      closedByUser = true;
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [selectedGameId, hydrateRoom]);

  const activeGame = CRASH_GAMES.find((g) => g.id === selectedGameId) ?? CRASH_GAMES[0];

  const handleCancelSlotBet = async (slot: 1 | 2) => {
    const setDraft = slot === 1 ? setSlip1Draft : setSlip2Draft;
    const setBet = slot === 1 ? setMySlip1Bet : setMySlip2Bet;
    setDraft((d) => ({ ...d, submitting: true, message: null }));
    try {
      const res = await cancelCrashRoomBet(selectedGameId, slot);
      setBet(null);
      onWalletUpdated({
        balance: res.balance,
        demoBalance: res.demoBalance,
        realBalance: res.realBalance,
        accountMode: res.accountMode,
        history: res.history,
        lastDepositAmount: res.lastDepositAmount,
        lastDepositDate: res.lastDepositDate,
        playedStats: res.playedStats,
      });
      setDraft((d) => ({ ...d, submitting: false, message: null }));
    } catch (err) {
      setDraft((d) => ({
        ...d,
        submitting: false,
        message: {
          ok: false,
          text: err instanceof Error ? err.message : 'Unable to cancel bet.',
        },
      }));
    }
  };

  const handleManualCashout = async (slot: 1 | 2) => {
    const setDraft = slot === 1 ? setSlip1Draft : setSlip2Draft;
    const setBet = slot === 1 ? setMySlip1Bet : setMySlip2Bet;
    setDraft((d) => ({ ...d, submitting: true, message: null }));
    try {
      const res = await cashoutCrashRoom(selectedGameId, slot);
      setBet(res.bet);
      onWalletUpdated({
        balance: res.balance,
        demoBalance: res.demoBalance,
        realBalance: res.realBalance,
        accountMode: res.accountMode,
        history: res.history,
        lastDepositAmount: res.lastDepositAmount,
        lastDepositDate: res.lastDepositDate,
        playedStats: res.playedStats,
      });
      setDraft((d) => ({
        ...d,
        submitting: false,
        message: {
          ok: true,
          text: `Won ${formatKes(res.payout)} KES @ ${res.multiplier.toFixed(2)}x`,
        },
      }));
    } catch (err) {
      setDraft((d) => ({
        ...d,
        submitting: false,
        message: {
          ok: false,
          text: err instanceof Error ? err.message : 'Cashout failed.',
        },
      }));
    }
  };

  const adjustStake = (slot: 1 | 2, delta: number) => {
    const setDraft = slot === 1 ? setSlip1Draft : setSlip2Draft;
    setDraft((d) => {
      const cur = Number(d.stakeAmount) || 0;
      const next = Math.min(100000, Math.max(10, Number((cur + delta).toFixed(2))));
      return { ...d, stakeAmount: next.toFixed(2) };
    });
  };

  const scaleStake = (slot: 1 | 2, factor: number) => {
    const setDraft = slot === 1 ? setSlip1Draft : setSlip2Draft;
    setDraft((d) => {
      const cur = Number(d.stakeAmount) || 100;
      const next = Math.min(100000, Math.max(10, Number((cur * factor).toFixed(2))));
      return { ...d, stakeAmount: next.toFixed(2) };
    });
  };

  const triggerSlipAction = (slot: 1 | 2) => {
    const bet = slot === 1 ? mySlip1Bet : mySlip2Bet;
    const setDraft = slot === 1 ? setSlip1Draft : setSlip2Draft;
    const isActiveBet = bet?.status === 'active';
    const isBettingPhase = roomStatus === 'betting';
    const isFlying = roomStatus === 'running';

    if (isFlying && isActiveBet) {
      handleManualCashout(slot);
      return;
    }
    if (isBettingPhase && isActiveBet) {
      handleCancelSlotBet(slot);
      return;
    }
    if (isBettingPhase && !isActiveBet) {
      submitSlotBet(slot);
      return;
    }
    setDraft((d) => ({
      ...d,
      queuedNextRound: !d.queuedNextRound,
      message: null,
    }));
  };

  const currencyCode = getCountryConfig(country).currency;
  const activeModeBalance = accountMode === 'real' ? realBalance : demoBalance;

  const renderRoomSwitcherPopover = () => (
    <CrashHamburgerMenu
      open={menuOpen}
      onClose={() => setMenuOpen(false)}
      displayName={username || (accountMode === 'real' ? 'Luckymate Player' : 'Demo Player')}
      gameTitle={activeGame.title}
      roundNumber={roundNumber}
      roundId={roundId}
      avatarId={avatarId}
      onChangeAvatar={(id) => {
        setAvatarId(id);
        try {
          window.localStorage.setItem('luckymate_avatar', id);
        } catch {
          // Ignore storage error
        }
      }}
      soundEnabled={soundEnabled}
      onToggleSound={() =>
        setSoundEnabled((prev) => {
          const next = !prev;
          try {
            window.localStorage.setItem('luckymate_sound', String(next));
          } catch {
            // Ignore
          }
          return next;
        })
      }
      musicEnabled={musicEnabled}
      onToggleMusic={() => setMusicEnabled((prev) => !prev)}
      animationEnabled={animationsEnabled}
      onToggleAnimation={() =>
        setAnimationsEnabled((prev) => {
          const next = !prev;
          try {
            window.localStorage.setItem('luckymate_anim', String(next));
          } catch {
            // Ignore
          }
          return next;
        })
      }
      walletHistory={walletHistory}
      clientSeed={clientSeed}
      onUpdateClientSeed={(seed) => {
        setClientSeed(seed);
        try {
          window.localStorage.setItem('luckymate_client_seed', seed);
        } catch {
          // Ignore
        }
      }}
      onApplyFreeBet={(amt) => {
        setSlip1Draft((d) => ({
          ...d,
          stakeAmount: amt.toFixed(2),
          message: { ok: true, text: `${currencyCode} ${amt.toFixed(2)} applied to Slip 1` },
        }));
      }}
      onGoHome={onBackToLobby}
      accountMode={accountMode}
      country={country}
    />
  );

  // =========================================================================
  // PHOTO 1: JETX THEME
  // =========================================================================
  if (selectedGameId === 'jetx') {
    const renderJetXSlip = (slot: 1 | 2) => {
      const draft = slot === 1 ? slip1Draft : slip2Draft;
      const setDraft = slot === 1 ? setSlip1Draft : setSlip2Draft;
      const bet = slot === 1 ? mySlip1Bet : mySlip2Bet;
      const isActiveBet = bet?.status === 'active';
      const isBetting = roomStatus === 'betting';
      const isFlying = roomStatus === 'running';
      const stakeNum = Number(draft.stakeAmount) || 0;
      const inputsDisabled = isActiveBet || draft.queuedNextRound || draft.submitting;

      return (
        <div className="rounded-2xl border border-[#2d313c] bg-[#1e2129] p-3.5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={draft.autoCashoutEnabled}
                disabled={inputsDisabled}
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    autoCashoutEnabled: !d.autoCashoutEnabled,
                    mode: !d.autoCashoutEnabled ? 'auto' : 'bet',
                  }))
                }
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
                  draft.autoCashoutEnabled ? 'bg-[#facc15]' : 'bg-[#3b404e]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    draft.autoCashoutEnabled ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span className="text-xs font-medium text-[#cbd5e1]">Auto cashout</span>
              {draft.autoCashoutEnabled && (
                <div className="inline-flex items-center gap-1 rounded-lg border border-[#3a3f4d] bg-[#13151b] px-2 py-0.5">
                  <input
                    type="number"
                    step="0.1"
                    min={1.01}
                    max={100}
                    disabled={inputsDisabled}
                    value={draft.autoCashoutInput}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, autoCashoutInput: e.target.value }))
                    }
                    className="w-12 bg-transparent text-right font-mono text-xs font-bold text-[#facc15] focus:outline-none"
                  />
                  <span className="font-mono text-xs text-[#9ca3af]">x</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setDraft((d) => ({ ...d, autoPlayEnabled: !d.autoPlayEnabled }))
              }
              className={`inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                draft.autoPlayEnabled ? 'text-[#facc15]' : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              <span>Auto play</span>
              <RefreshCw
                className={`h-4 w-4 ${draft.autoPlayEnabled ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-[1fr_minmax(130px,46%)] gap-2.5 items-stretch">
            <div className="space-y-2">
              <div className="flex h-10 items-center justify-between rounded-xl border border-[#343946] bg-[#13161d] px-2">
                <button
                  type="button"
                  aria-label={`Decrease JetX bet ${slot}`}
                  disabled={inputsDisabled}
                  onClick={() => adjustStake(slot, -5)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[#cbd5e1] hover:bg-white/10 hover:text-white cursor-pointer disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={100000}
                  disabled={inputsDisabled}
                  value={draft.stakeAmount}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, stakeAmount: e.target.value }))
                  }
                  className="w-20 bg-transparent text-center font-mono text-sm font-bold text-white tabular-nums focus:outline-none disabled:opacity-60"
                />
                <button
                  type="button"
                  aria-label={`Increase JetX bet ${slot}`}
                  disabled={inputsDisabled}
                  onClick={() => adjustStake(slot, 5)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[#cbd5e1] hover:bg-white/10 hover:text-white cursor-pointer disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {JETX_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={inputsDisabled}
                    onClick={() =>
                      setDraft((d) => ({ ...d, stakeAmount: preset.toFixed(2) }))
                    }
                    className="rounded-lg border border-[#303542] bg-[#14171f] py-1.5 font-mono text-[11px] font-semibold text-[#cbd5e1] hover:text-white cursor-pointer disabled:opacity-40"
                  >
                    {preset}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={inputsDisabled}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      stakeAmount: Math.max(10, Math.min(100000, Math.floor(activeModeBalance))).toFixed(2),
                    }))
                  }
                  className="rounded-lg border border-[#303542] bg-[#14171f] py-1.5 text-[11px] font-semibold text-[#cbd5e1] hover:text-white cursor-pointer disabled:opacity-40"
                >
                  Max
                </button>
              </div>
            </div>

            {isFlying && isActiveBet ? (
              <button
                type="button"
                disabled={draft.submitting}
                onClick={() => triggerSlipAction(slot)}
                className="flex flex-col items-center justify-center rounded-2xl bg-[#22c55e] px-3 py-2 text-[#06200d] shadow-lg hover:bg-[#4ade80] cursor-pointer disabled:opacity-70"
              >
                <span className="font-mono text-base font-extrabold tabular-nums">
                  KES {formatKes(bet.amount * multiplier)}
                </span>
                <span className="text-xs font-bold">Cash Out</span>
              </button>
            ) : (isBetting && isActiveBet) || draft.queuedNextRound ? (
              <button
                type="button"
                disabled={draft.submitting}
                onClick={() => triggerSlipAction(slot)}
                className="flex flex-col items-center justify-center rounded-2xl bg-[#dc2626] px-3 py-2 text-white shadow-lg hover:bg-[#ef4444] cursor-pointer disabled:opacity-70"
              >
                <span className="text-base font-bold">Cancel</span>
                <span className="text-[11px] text-white/90">
                  {draft.queuedNextRound ? 'Queued' : `KES ${formatKes(bet?.amount ?? stakeNum)}`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled={draft.submitting}
                onClick={() => triggerSlipAction(slot)}
                className="flex flex-col items-center justify-center rounded-2xl bg-[#f5d018] px-3 py-2 text-[#18181b] shadow-lg hover:bg-[#fde047] cursor-pointer disabled:opacity-70"
              >
                <span className="font-mono text-base font-extrabold tabular-nums">
                  {draft.submitting ? 'Placing...' : `KES ${formatKes(stakeNum)}`}
                </span>
                <span className="text-xs font-bold">Bet</span>
              </button>
            )}
          </div>

          {draft.message && (
            <p
              className={`mt-2 text-center text-[11px] font-semibold ${
                draft.message.ok ? 'text-[#28d13b]' : 'text-[#f87171]'
              }`}
            >
              {draft.message.text}
            </p>
          )}
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-[#12151c] text-white">
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-2 border-b border-[#252a36] bg-[#161b26] px-3.5">
          <button
            type="button"
            onClick={onBackToLobby}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-[#facc15] cursor-pointer shrink-0"
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

          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e2e8f0] hover:text-white cursor-pointer shrink-0"
          >
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}</span>
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </header>

        <div className="relative mx-auto max-w-2xl space-y-2.5 px-2.5 py-2.5 pb-8 lg:max-w-5xl">
          {/* JetX Logo + KES Pill + Circular Menu */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-baseline italic tracking-tight">
              <span className="text-2xl font-black text-white">Jet</span>
              <span className="text-2xl font-black text-[#facc15]">X</span>
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
                aria-label="Open game menu"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[#343b4c] bg-[#222733] text-white cursor-pointer"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
                <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-[#ef4444]" />
              </button>
            </div>
          </div>

          {renderRoomSwitcherPopover()}

          {/* Rounded Pill Multiplier Strip */}
          <div className="flex items-center gap-1.5 px-1">
            <div className="no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto">
              {recentRounds.length === 0 ? (
                <span className="text-xs text-[#64748b]">Waiting for rounds...</span>
              ) : (
                recentRounds.slice(0, 10).map((r) => {
                  const cp = r.crashPoint ?? 1.0;
                  return (
                    <span
                      key={r.roundId}
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold tabular-nums ${
                        cp >= 10
                          ? 'border-[#7c5816] bg-[#2b2416] text-[#facc15]'
                          : cp >= 2
                          ? 'border-[#165e3a] bg-[#132920] text-[#22c55e]'
                          : 'border-[#2f3646] bg-[#202633] text-[#e2e8f0]'
                      }`}
                    >
                      {cp.toFixed(2)}x
                    </span>
                  );
                })
              )}
            </div>
            <button
              type="button"
              aria-label="Expand multiplier history"
              onClick={() => setHistoryExpanded((prev) => !prev)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#2f3646] bg-[#202633] text-[#cbd5e1] cursor-pointer"
            >
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          {historyExpanded && recentRounds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-[#2f3646] bg-[#1b202b] p-2.5">
              {recentRounds.map((r) => {
                const cp = r.crashPoint ?? 1.0;
                return (
                  <span
                    key={r.roundId}
                    className={`rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums ${getMultiplierPillBg(
                      cp
                    )}`}
                  >
                    {cp.toFixed(2)}x
                  </span>
                );
              })}
            </div>
          )}

          <JetXStage
            roomStatus={roomStatus}
            multiplier={multiplier}
            countdown={countdown}
            lastCrashedPoint={lastCrashedPoint}
            activeBetsCount={activeBets.length}
            connectedPlayers={connectedPlayers}
            animationsEnabled={animationsEnabled}
          />

          {/* Gold-accented Live Room Banner */}
          <div className="flex items-center justify-center gap-2 rounded-full border border-[#614e1a] bg-[#2e2612] px-3 py-1.5 text-xs font-semibold text-[#facc15]">
            <span className="rounded-full bg-[#e11d48] px-2 py-0.5 text-[10px] font-extrabold text-white">
              Live
            </span>
            <span>
              {wsConnected ? 'Real-Time Dual Bets Panel Active' : 'Connecting Room...'} · Round #
              {roundNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
            {renderJetXSlip(1)}
            {renderJetXSlip(2)}
          </div>

          <LiveBetsBoard
            theme="jetx"
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

  // =========================================================================
  // PHOTO 2: B! CRASH THEME
  // =========================================================================
  if (selectedGameId === 'b-crash') {
    const renderBCrashSlip = (slot: 1 | 2) => {
      const draft = slot === 1 ? slip1Draft : slip2Draft;
      const setDraft = slot === 1 ? setSlip1Draft : setSlip2Draft;
      const bet = slot === 1 ? mySlip1Bet : mySlip2Bet;
      const isActiveBet = bet?.status === 'active';
      const isBetting = roomStatus === 'betting';
      const isFlying = roomStatus === 'running';
      const inputsDisabled = isActiveBet || draft.queuedNextRound || draft.submitting;

      return (
        <div className="rounded-2xl border border-[#2a44a6] bg-[#162769] p-3.5 shadow-lg">
          {/* Top Row: Auto Cashout x2 | ON/OFF | OFF AUTO */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#253d96] pb-2.5">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-[11px] font-semibold text-[#9fb2f0]">Auto Cashout</p>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-sm font-bold text-[#7c92df]">x</span>
                  <input
                    type="number"
                    step="0.1"
                    min={1.01}
                    max={100}
                    disabled={!draft.autoCashoutEnabled || inputsDisabled}
                    value={draft.autoCashoutInput}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, autoCashoutInput: e.target.value }))
                    }
                    className="w-12 bg-transparent font-mono text-sm font-bold text-white focus:outline-none disabled:opacity-45"
                  />
                </div>
              </div>

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
                className="flex flex-col items-center rounded-lg border border-[#314cb8] bg-[#112059] px-2.5 py-1 text-[10px] font-bold cursor-pointer disabled:opacity-50"
              >
                <span
                  className={draft.autoCashoutEnabled ? 'text-[#facc15]' : 'text-[#7c92df]'}
                >
                  ON
                </span>
                <span
                  className={!draft.autoCashoutEnabled ? 'text-white' : 'text-[#5b71c4]'}
                >
                  OFF
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                setDraft((d) => ({ ...d, autoPlayEnabled: !d.autoPlayEnabled }))
              }
              className="inline-flex items-center gap-2 rounded-full border border-[#2c47ad] bg-[#0e1a4a] px-3 py-1 text-[11px] font-bold cursor-pointer"
            >
              <span className={!draft.autoPlayEnabled ? 'text-white' : 'text-[#6c82d4]'}>
                OFF
              </span>
              <span className={draft.autoPlayEnabled ? 'text-[#facc15]' : 'text-[#6c82d4]'}>
                AUTO
              </span>
            </button>
          </div>

          {/* Bottom Row: Stake (KES) Stepper | Quick Stake 10 50 100 | Yellow PLAY */}
          <div className="mt-3 grid grid-cols-[1fr_auto_84px] items-center gap-2.5">
            <div>
              <p className="mb-1 text-[11px] font-semibold text-[#cbd5ff]">Stake (KES)</p>
              <div className="flex h-10 items-center justify-between rounded-xl border border-[#2d48b0] bg-[#0f1c4f] px-1.5">
                <button
                  type="button"
                  aria-label={`Decrease B! Crash stake ${slot}`}
                  disabled={inputsDisabled}
                  onClick={() => adjustStake(slot, -10)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a2e7d] text-white hover:bg-[#243ea1] cursor-pointer disabled:opacity-40"
                >
                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={100000}
                  disabled={inputsDisabled}
                  value={draft.stakeAmount}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, stakeAmount: e.target.value }))
                  }
                  className="w-16 bg-transparent text-center font-mono text-sm font-bold text-white tabular-nums focus:outline-none disabled:opacity-60"
                />
                <button
                  type="button"
                  aria-label={`Increase B! Crash stake ${slot}`}
                  disabled={inputsDisabled}
                  onClick={() => adjustStake(slot, 10)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a2e7d] text-white hover:bg-[#243ea1] cursor-pointer disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div>
              <p className="mb-1 text-[11px] font-semibold text-[#cbd5ff]">Quick Stake</p>
              <div className="flex h-10 items-center divide-x divide-[#2c47ad] rounded-xl border border-[#2d48b0] bg-[#13225e]">
                {BCRASH_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={inputsDisabled}
                    onClick={() =>
                      setDraft((d) => ({ ...d, stakeAmount: preset.toFixed(2) }))
                    }
                    className="px-2.5 py-2 font-mono text-xs font-bold text-white hover:text-[#facc15] cursor-pointer disabled:opacity-40"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {isFlying && isActiveBet ? (
              <button
                type="button"
                disabled={draft.submitting}
                onClick={() => triggerSlipAction(slot)}
                className="flex h-16 flex-col items-center justify-center rounded-xl bg-[#22c55e] px-2 text-center text-[#05200c] shadow-lg hover:bg-[#4ade80] cursor-pointer disabled:opacity-70"
              >
                <span className="text-xs font-black uppercase">CASH OUT</span>
                <span className="font-mono text-[11px] font-extrabold tabular-nums">
                  {formatKes(bet.amount * multiplier)}
                </span>
              </button>
            ) : (isBetting && isActiveBet) || draft.queuedNextRound ? (
              <button
                type="button"
                disabled={draft.submitting}
                onClick={() => triggerSlipAction(slot)}
                className="flex h-16 flex-col items-center justify-center rounded-xl bg-[#dc2626] px-2 text-center text-white shadow-lg hover:bg-[#ef4444] cursor-pointer disabled:opacity-70"
              >
                <span className="text-xs font-black uppercase">CANCEL</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={draft.submitting}
                onClick={() => triggerSlipAction(slot)}
                className="flex h-16 flex-col items-center justify-center rounded-xl bg-[#facc15] px-2 text-center text-[#0b1644] shadow-lg hover:bg-[#fde047] cursor-pointer disabled:opacity-70"
              >
                <span className="text-sm font-black uppercase">
                  {draft.submitting ? '...' : 'PLAY'}
                </span>
              </button>
            )}
          </div>

          {draft.message && (
            <p
              className={`mt-2 text-center text-[11px] font-semibold ${
                draft.message.ok ? 'text-[#28d13b]' : 'text-[#f87171]'
              }`}
            >
              {draft.message.text}
            </p>
          )}
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-[#0a1338] text-white">
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-2 border-b border-[#1c2e75] bg-[#101c4d] px-3.5">
          <button
            type="button"
            onClick={onBackToLobby}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-[#facc15] cursor-pointer shrink-0"
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

          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#cbd5ff] hover:text-white cursor-pointer shrink-0"
          >
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}</span>
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="relative mx-auto max-w-2xl space-y-2.5 px-2.5 py-2.5 pb-8 lg:max-w-5xl">
          {/* B! Emblem + Balance Box + Royal Blue Grid Menu */}
          <div className="flex items-center justify-between px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#13225e] text-sm font-black italic text-[#facc15]">
              B!
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
                aria-label="Open game menu"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2442b8] text-white shadow cursor-pointer"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {renderRoomSwitcherPopover()}

          <BCrashStage
            roomStatus={roomStatus}
            multiplier={multiplier}
            countdown={countdown}
            lastCrashedPoint={lastCrashedPoint}
            activeBetsCount={activeBets.length}
            connectedPlayers={connectedPlayers}
            animationsEnabled={animationsEnabled}
          />

          <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
            {renderBCrashSlip(1)}
            {renderBCrashSlip(2)}
          </div>

          <LiveBetsBoard
            theme="b-crash"
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

  // =========================================================================
  // PHOTO 3: COMET CRASH THEME
  // =========================================================================
  if (selectedGameId === 'comet-crash') {
    const renderCometSlip = (slot: 1 | 2) => {
      const draft = slot === 1 ? slip1Draft : slip2Draft;
      const setDraft = slot === 1 ? setSlip1Draft : setSlip2Draft;
      const bet = slot === 1 ? mySlip1Bet : mySlip2Bet;
      const isActiveBet = bet?.status === 'active';
      const isBetting = roomStatus === 'betting';
      const isFlying = roomStatus === 'running';
      const inputsDisabled = isActiveBet || draft.queuedNextRound || draft.submitting;
      const autoVal = Math.min(20, Math.max(1.1, Number(draft.autoCashoutInput) || 3));

      return (
        <div className="rounded-2xl border border-[#29376b] bg-[#182246] p-3.5 shadow-lg space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#94a3b8]">
              <span>{slot === 1 ? 'Bet Amount:' : 'Second Slip Bet Amount:'}</span>
              {slot === 1 && (
                <button
                  type="button"
                  onClick={() => setCometShowSecondSlip((prev) => !prev)}
                  className="text-[11px] font-bold text-[#38bdf8] hover:underline cursor-pointer"
                >
                  {cometShowSecondSlip ? 'Hide 2nd Slip' : '+ Dual Betslip'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#2b3a73] bg-[#0f1530] px-3 py-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fde047] to-[#ca8a04] text-[10px] font-black text-[#422006]">
                  K
                </span>
                <span className="text-xs font-bold text-[#cbd5e1]">KES</span>
                <input
                  type="number"
                  min={1}
                  max={100000}
                  disabled={inputsDisabled}
                  value={draft.stakeAmount}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, stakeAmount: e.target.value }))
                  }
                  className="w-full bg-transparent font-mono text-sm font-bold text-white tabular-nums focus:outline-none disabled:opacity-60"
                />
              </div>

              <button
                type="button"
                disabled={inputsDisabled}
                onClick={() => scaleStake(slot, 0.5)}
                className="h-10 rounded-xl border border-[#324382] bg-[#243161] px-3.5 font-mono text-xs font-bold text-white hover:bg-[#2f407d] cursor-pointer disabled:opacity-40"
              >
                1/2
              </button>
              <button
                type="button"
                disabled={inputsDisabled}
                onClick={() => scaleStake(slot, 2)}
                className="h-10 rounded-xl border border-[#324382] bg-[#243161] px-3.5 font-mono text-xs font-bold text-white hover:bg-[#2f407d] cursor-pointer disabled:opacity-40"
              >
                2x
              </button>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#94a3b8]">
              <span>Auto CashOut</span>
              <label className="inline-flex items-center gap-1.5 text-[11px] text-[#cbd5e1] cursor-pointer">
                <input
                  type="checkbox"
                  disabled={inputsDisabled}
                  checked={draft.autoCashoutEnabled}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      autoCashoutEnabled: e.target.checked,
                      mode: e.target.checked ? 'auto' : 'bet',
                    }))
                  }
                  className="h-3.5 w-3.5 accent-[#22c55e]"
                />
                <span>Enable</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex w-28 items-center rounded-xl border border-[#2b3a73] bg-[#0f1530] px-3 py-2">
                <input
                  type="number"
                  step="0.1"
                  min={1.01}
                  max={100}
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
                  className="w-full bg-transparent text-center font-mono text-sm font-bold text-white tabular-nums focus:outline-none disabled:opacity-60"
                />
                <span className="font-mono text-xs font-bold text-[#94a3b8]">x</span>
              </div>

              <input
                type="range"
                min={1.1}
                max={20}
                step={0.1}
                disabled={inputsDisabled}
                value={autoVal}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    autoCashoutInput: Number(e.target.value).toFixed(2),
                    autoCashoutEnabled: true,
                    mode: 'auto',
                  }))
                }
                className="h-2 flex-1 cursor-pointer accent-[#22c55e]"
              />
            </div>
          </div>

          {isFlying && isActiveBet ? (
            <button
              type="button"
              disabled={draft.submitting}
              onClick={() => triggerSlipAction(slot)}
              className="w-full rounded-xl bg-[#f59e0b] py-3 text-sm font-extrabold text-[#111827] shadow-lg hover:bg-[#fbbf24] cursor-pointer disabled:opacity-70"
            >
              Cash Out · KES {formatKes(bet.amount * multiplier)}
            </button>
          ) : (isBetting && isActiveBet) || draft.queuedNextRound ? (
            <button
              type="button"
              disabled={draft.submitting}
              onClick={() => triggerSlipAction(slot)}
              className="w-full rounded-xl bg-[#dc2626] py-3 text-sm font-extrabold text-white shadow-lg hover:bg-[#ef4444] cursor-pointer disabled:opacity-70"
            >
              Cancel {draft.queuedNextRound ? '(Queued Next Round)' : ''}
            </button>
          ) : (
            <button
              type="button"
              disabled={draft.submitting}
              onClick={() => triggerSlipAction(slot)}
              className="w-full rounded-xl bg-[#1db954] py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(29,185,84,0.35)] hover:bg-[#22d35e] cursor-pointer disabled:opacity-70"
            >
              {draft.submitting ? 'Placing Bet...' : 'Bet'}
            </button>
          )}

          {draft.message && (
            <p
              className={`text-center text-[11px] font-semibold ${
                draft.message.ok ? 'text-[#28d13b]' : 'text-[#f87171]'
              }`}
            >
              {draft.message.text}
            </p>
          )}
        </div>
      );
    };

    const myTotalStaked =
      (mySlip1Bet?.status === 'active' ? mySlip1Bet.amount : 0) +
      (mySlip2Bet?.status === 'active' ? mySlip2Bet.amount : 0);

    return (
      <div className="min-h-screen bg-[#0c1124] text-white">
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-2 border-b border-[#202a52] bg-[#121936] px-3.5">
          <button
            type="button"
            onClick={onBackToLobby}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-[#38bdf8] cursor-pointer shrink-0"
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

          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#cbd5ff] hover:text-white cursor-pointer shrink-0"
          >
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}</span>
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="relative mx-auto max-w-2xl space-y-2.5 px-2.5 py-2.5 pb-8 lg:max-w-5xl">
          {/* Purple Multiplier Strip + Hamburger Menu */}
          <div className="flex items-center gap-2 rounded-xl border border-[#273263] bg-[#161e3d] p-2">
            <div className="no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto">
              {recentRounds.length === 0 ? (
                <span className="px-2 text-xs text-[#94a3b8]">Waiting for rounds...</span>
              ) : (
                recentRounds.slice(0, 8).map((r) => {
                  const cp = r.crashPoint ?? 1.0;
                  return (
                    <span
                      key={r.roundId}
                      className="shrink-0 rounded-lg border border-[#3a447a] bg-[#242c57] px-2.5 py-1 font-mono text-xs font-bold text-[#cbd5ff] tabular-nums"
                    >
                      {cp.toFixed(2)}x
                    </span>
                  );
                })
              )}
            </div>
            <button
              type="button"
              aria-label="Open game menu"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#3a447a] bg-[#242c57] text-white cursor-pointer"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {renderRoomSwitcherPopover()}

          {/* Sub-row Username, Dual Balances & Live Clock */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#94a3b8]">
            <span className="font-semibold text-[#cbd5e1]">{username || 'Player'}</span>
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
              <span className="font-mono tabular-nums">{clockLabel}</span>
            </div>
          </div>

          <CometCrashStage
            roomStatus={roomStatus}
            multiplier={multiplier}
            countdown={countdown}
            lastCrashedPoint={lastCrashedPoint}
            activeBetsCount={activeBets.length}
            connectedPlayers={connectedPlayers}
            animationsEnabled={animationsEnabled}
          />

          {renderCometSlip(1)}
          {cometShowSecondSlip && renderCometSlip(2)}

          {/* COMET CRASH Footer Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#24305e] bg-[#131a38] px-3 py-2 text-[11px]">
            <div className="leading-tight">
              <p className="font-black tracking-wide text-[#818cf8]">COMET</p>
              <p className="font-black tracking-wide text-[#e2e8f0]">CRASH</p>
            </div>

            <div className="text-[#94a3b8]">
              <div className="flex items-center gap-1">
                <span>Round #{roundNumber}</span>
                <button
                  type="button"
                  aria-label="Copy round id"
                  onClick={() => {
                    navigator.clipboard?.writeText(roundId || String(roundNumber)).catch(() => {});
                    setCopiedRoundId(true);
                    window.setTimeout(() => setCopiedRoundId(false), 1200);
                  }}
                  className="text-[#cbd5e1] hover:text-white cursor-pointer"
                >
                  <Copy className="h-3 w-3" aria-hidden="true" />
                </button>
                {copiedRoundId && <span className="text-[#22c55e]">Copied</span>}
              </div>
              <p className="font-mono text-[10px]">Stake Limits: KES 10 - 100,000</p>
            </div>

            <div className="text-right font-mono tabular-nums">
              <p className="text-[#94a3b8]">
                Total Bet: <span className="font-bold text-white">KES {formatKes(myTotalStaked)}</span>
              </p>
              {isLoggedIn ? (
                <p className="text-[#94a3b8]">
                  {accountMode === 'real' ? 'Real Balance:' : 'Demo Balance:'}{' '}
                  <span className="font-bold text-[#28c83c]">
                    {formatMoney(activeModeBalance, country)}
                  </span>
                </p>
              ) : (
                <p className="text-[#94a3b8]">Log in to view balance</p>
              )}
            </div>
          </div>

          <LiveBetsBoard
            theme="comet-crash"
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

  // =========================================================================
  // 7 UNIQUE CRASH ROOMS (Swimminator, Punchinator, Crash 3DX, Royale, Spins, Spaceman, Original)
  // =========================================================================
  if (isOtherCrashGameId(selectedGameId)) {
    return (
      <OtherCrashRoomView
        gameId={selectedGameId}
        country={country}
        demoBalance={demoBalance}
        realBalance={realBalance}
        accountMode={accountMode}
        isLoggedIn={isLoggedIn}
        roundNumber={roundNumber}
        roomStatus={roomStatus}
        multiplier={multiplier}
        countdown={countdown}
        lastCrashedPoint={lastCrashedPoint}
        connectedPlayers={connectedPlayers}
        wsConnected={wsConnected}
        isFullscreen={isFullscreen}
        menuOpen={menuOpen}
        animationsEnabled={animationsEnabled}
        historyExpanded={historyExpanded}
        activeBets={activeBets}
        previousBets={previousBets}
        previousCrashPoint={previousCrashPoint}
        topWins={topWins}
        recentRounds={recentRounds}
        liveCashouts={liveCashouts}
        slip1Draft={slip1Draft}
        slip2Draft={slip2Draft}
        mySlip1Bet={mySlip1Bet}
        mySlip2Bet={mySlip2Bet}
        setSlip1Draft={setSlip1Draft}
        setSlip2Draft={setSlip2Draft}
        onBackToLobby={onBackToLobby}
        onSelectAccountMode={onSelectAccountMode}
        onOpenWallet={onOpenWallet}
        onToggleFullscreen={toggleFullscreen}
        onToggleMenu={() => setMenuOpen((prev) => !prev)}
        onToggleHistory={() => setHistoryExpanded((prev) => !prev)}
        onAdjustStake={adjustStake}
        onScaleStake={scaleStake}
        onTriggerSlipAction={triggerSlipAction}
        renderRoomSwitcherPopover={renderRoomSwitcherPopover}
      />
    );
  }

  // =========================================================================
  // DEFAULT / AVIATOR THEME (no FUN MODE, live players / odds / cashout money)
  // =========================================================================
  const progressRatio = Math.min(1, Math.log(Math.max(1, multiplier)) / Math.log(8));
  const curveEndX = 24 + progressRatio * 336;
  const curveEndY = 166 - Math.pow(progressRatio, 1.32) * 124;

  const renderAviatorSlip = (slot: 1 | 2) => {
    const draft = slot === 1 ? slip1Draft : slip2Draft;
    const setDraft = slot === 1 ? setSlip1Draft : setSlip2Draft;
    const bet = slot === 1 ? mySlip1Bet : mySlip2Bet;
    const isActiveBet = bet?.status === 'active';
    const isBettingPhase = roomStatus === 'betting';
    const isFlying = roomStatus === 'running';
    const stakeNum = Number(draft.stakeAmount) || 0;
    const inputsDisabled = isActiveBet || draft.queuedNextRound || draft.submitting;
    const isCollapsed = slot === 2 && panel2Collapsed;

    return (
      <div className="rounded-2xl border border-[#2a2d37] bg-[#1a1c23] p-3 shadow-lg">
        <div className="relative flex items-center justify-center">
          <div className="inline-flex rounded-full border border-[#2c2f3a] bg-[#101216] p-0.5">
            <button
              type="button"
              disabled={isActiveBet}
              onClick={() =>
                setDraft((d) => ({ ...d, mode: 'bet', autoCashoutEnabled: false }))
              }
              className={`min-w-[84px] rounded-full px-4 py-1 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-70 ${
                draft.mode === 'bet'
                  ? 'bg-[#2c2f3a] text-white shadow'
                  : 'text-[#8e95a5] hover:text-white'
              }`}
            >
              Bet
            </button>
            <button
              type="button"
              disabled={isActiveBet}
              onClick={() =>
                setDraft((d) => ({ ...d, mode: 'auto', autoCashoutEnabled: true }))
              }
              className={`min-w-[84px] rounded-full px-4 py-1 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-70 ${
                draft.mode === 'auto'
                  ? 'bg-[#2c2f3a] text-white shadow'
                  : 'text-[#8e95a5] hover:text-white'
              }`}
            >
              Auto
            </button>
          </div>

          {slot === 2 && (
            <button
              type="button"
              aria-label={panel2Collapsed ? 'Expand second bet panel' : 'Collapse second bet panel'}
              onClick={() => setPanel2Collapsed((prev) => !prev)}
              className="absolute right-0 flex h-7 w-7 items-center justify-center rounded-lg border border-[#323642] bg-[#22252e] text-[#9ca3af] hover:text-white cursor-pointer"
            >
              {panel2Collapsed ? (
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Minus className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {!isCollapsed && (
          <>
            <div className="mt-3 grid grid-cols-[1fr_minmax(130px,45%)] gap-2.5 items-stretch">
              <div className="space-y-2">
                <div className="flex h-10 items-center justify-between rounded-full border border-[#2c303a] bg-[#0e1014] px-1.5">
                  <button
                    type="button"
                    aria-label={`Decrease betslip ${slot} stake`}
                    disabled={inputsDisabled}
                    onClick={() => adjustStake(slot, -10)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#3a3e4a] text-[#cbd5e1] hover:border-white hover:text-white cursor-pointer disabled:opacity-40"
                  >
                    <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={100000}
                    step="1"
                    aria-label={`Betslip ${slot} stake amount`}
                    disabled={inputsDisabled}
                    value={draft.stakeAmount}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, stakeAmount: e.target.value }))
                    }
                    className="w-20 bg-transparent text-center font-mono text-sm font-bold text-white tabular-nums focus:outline-none disabled:opacity-60"
                  />
                  <button
                    type="button"
                    aria-label={`Increase betslip ${slot} stake`}
                    disabled={inputsDisabled}
                    onClick={() => adjustStake(slot, 10)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#3a3e4a] text-[#cbd5e1] hover:border-white hover:text-white cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {AVIATOR_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={inputsDisabled}
                      onClick={() =>
                        setDraft((d) => ({ ...d, stakeAmount: preset.toFixed(2) }))
                      }
                      className="rounded-full border border-[#272a34] bg-[#12141a] py-1 font-mono text-xs font-semibold text-[#9ca3af] transition-colors hover:border-[#4b5563] hover:text-white cursor-pointer disabled:opacity-40 tabular-nums"
                    >
                      {preset.toLocaleString('en-US')}
                    </button>
                  ))}
                </div>
              </div>

              {isFlying && isActiveBet ? (
                <button
                  type="button"
                  disabled={draft.submitting}
                  onClick={() => triggerSlipAction(slot)}
                  className="flex flex-col items-center justify-center rounded-2xl border border-[#fbbf24]/50 bg-[#e28706] px-3 py-2 text-white shadow-[0_6px_20px_rgba(226,135,6,0.35)] transition-transform active:scale-[0.98] hover:bg-[#f59e0b] cursor-pointer disabled:opacity-70"
                >
                  <span className="text-base font-bold leading-tight">Cash Out</span>
                  <span className="mt-0.5 font-mono text-sm font-bold tabular-nums">
                    {formatKes(bet.amount * multiplier)} KES
                  </span>
                </button>
              ) : (isBettingPhase && isActiveBet) || draft.queuedNextRound ? (
                <button
                  type="button"
                  disabled={draft.submitting}
                  onClick={() => triggerSlipAction(slot)}
                  className="flex flex-col items-center justify-center rounded-2xl border border-[#f87171]/40 bg-[#d92626] px-3 py-2 text-white shadow-[0_6px_20px_rgba(217,38,38,0.35)] transition-transform active:scale-[0.98] hover:bg-[#ef4444] cursor-pointer disabled:opacity-70"
                >
                  <span className="text-base font-bold leading-tight">Cancel</span>
                  <span className="mt-0.5 text-[11px] font-medium text-white/90">
                    {draft.queuedNextRound
                      ? 'Waiting for next round'
                      : `${formatKes(bet?.amount ?? stakeNum)} KES`}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={draft.submitting}
                  onClick={() => triggerSlipAction(slot)}
                  className="flex flex-col items-center justify-center rounded-2xl border border-[#5ee838]/40 bg-[#28b809] px-3 py-2 text-white shadow-[0_6px_20px_rgba(40,184,9,0.35)] transition-transform active:scale-[0.98] hover:bg-[#2fd10e] cursor-pointer disabled:opacity-70"
                >
                  <span className="text-lg font-semibold leading-tight">
                    {draft.submitting ? 'Placing...' : 'Bet'}
                  </span>
                  <span className="mt-0.5 font-mono text-sm font-semibold tabular-nums">
                    {formatKes(stakeNum)} <span className="text-xs font-medium">KES</span>
                  </span>
                </button>
              )}
            </div>

            {draft.mode === 'auto' && (
              <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-[#2b2e3a] bg-[#12141a] px-3 py-2">
                <label className="flex items-center gap-2 text-xs font-medium text-[#cbd5e1] cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={inputsDisabled}
                    checked={draft.autoCashoutEnabled}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, autoCashoutEnabled: e.target.checked }))
                    }
                    className="h-3.5 w-3.5 accent-[#28b809]"
                  />
                  <span>Auto Cash Out</span>
                </label>
                <div className="flex items-center gap-1.5 rounded-full border border-[#2c303a] bg-[#0e1014] px-2.5 py-1">
                  <input
                    type="number"
                    step="0.1"
                    min={1.01}
                    max={100}
                    aria-label={`Betslip ${slot} auto cashout target`}
                    disabled={!draft.autoCashoutEnabled || inputsDisabled}
                    value={draft.autoCashoutInput}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, autoCashoutInput: e.target.value }))
                    }
                    className="w-14 bg-transparent text-right font-mono text-xs font-bold text-white tabular-nums focus:outline-none disabled:opacity-40"
                  />
                  <span className="font-mono text-xs font-bold text-[#f4d344]">x</span>
                </div>
              </div>
            )}

            {draft.message && (
              <p
                className={`mt-2 text-center text-[11px] font-semibold ${
                  draft.message.ok ? 'text-[#28d13b]' : 'text-[#f87171]'
                }`}
              >
                {draft.message.text}
              </p>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0c0d11] text-white">
      <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-2 border-b border-[#253145] bg-[#172130] px-3.5">
        <button
          type="button"
          onClick={onBackToLobby}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#79bd32] cursor-pointer shrink-0"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
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

        <div className="flex items-center gap-1.5 text-xs text-[#9baabc] shrink-0">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              wsConnected ? 'bg-[#28b809]' : 'bg-[#f87171]'
            }`}
          />
          <span className="font-semibold text-white">{activeGame.title}</span>
        </div>
      </header>

      <div className="relative mx-auto max-w-2xl space-y-2.5 px-2.5 py-2.5 pb-6 lg:max-w-5xl">
        <div className="flex items-center justify-between px-1 py-1">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-lg border border-[#262933] bg-[#16181f] px-2.5 py-1 text-xs font-semibold text-[#cbd5e1] hover:text-white cursor-pointer"
          >
            <Rocket className="h-3.5 w-3.5 text-[#e11d48]" aria-hidden="true" />
            <span>{activeGame.title}</span>
            <ChevronDown className="h-3 w-3 text-[#9ca3af]" aria-hidden="true" />
          </button>

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
              aria-label="Open game menu"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9ca3af] hover:bg-[#1a1c24] hover:text-white cursor-pointer"
            >
              {menuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {renderRoomSwitcherPopover()}

        <div className="flex items-center gap-2 px-1">
          <div className="no-scrollbar flex flex-1 items-center gap-3 overflow-x-auto py-0.5">
            {recentRounds.length === 0 ? (
              <span className="font-mono text-xs text-[#6b7280]">Waiting for rounds...</span>
            ) : (
              recentRounds.slice(0, 14).map((r) => {
                const cp = r.crashPoint ?? 1.0;
                return (
                  <span
                    key={r.roundId}
                    className={`shrink-0 font-mono text-xs font-bold tabular-nums ${getMultiplierBadgeClass(
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
            onClick={() => setHistoryExpanded((prev) => !prev)}
            className="flex h-6 w-8 shrink-0 items-center justify-center rounded-full border border-[#2c303a] bg-[#1a1d24] text-[#9ca3af] hover:text-white cursor-pointer"
          >
            <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {historyExpanded && recentRounds.length > 0 && (
          <div className="rounded-xl border border-[#2a2d37] bg-[#161820] p-2.5">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-[#9ca3af]">
              <span className="font-semibold text-white">Round History</span>
              <span>Last {recentRounds.length} rounds</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentRounds.map((r) => {
                const cp = r.crashPoint ?? 1.0;
                return (
                  <span
                    key={r.roundId}
                    className={`rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums ${getMultiplierPillBg(
                      cp
                    )}`}
                  >
                    {cp.toFixed(2)}x
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div
          className={`overflow-hidden rounded-2xl border border-[#262933] bg-[#07090d] shadow-xl ${
            roomStatus === 'crashed' && animationsEnabled ? 'lm-crash-shake' : ''
          }`}
        >
          <div
            className="relative h-56 w-full overflow-hidden sm:h-64"
            style={{
              background:
                'radial-gradient(circle at 52% 48%, rgba(28, 128, 168, 0.34) 0%, rgba(12, 32, 46, 0.5) 45%, #050608 100%)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'repeating-conic-gradient(from 0deg at 0% 100%, rgba(255,255,255,0.16) 0deg 4deg, transparent 4deg 14deg)',
              }}
            />

            <svg
              viewBox="0 0 400 185"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              role="img"
              aria-label={`Live ${activeGame.title} multiplier ${multiplier.toFixed(2)}x`}
            >
              <defs>
                <linearGradient id="aviatorAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={roomStatus === 'crashed' ? '#ef4444' : '#e11d48'}
                    stopOpacity="0.38"
                  />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="aviatorExhaustGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
                  <stop offset="65%" stopColor="#fbbf24" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Drifting High-Altitude Cloud Parallax */}
              {animationsEnabled && (
                <g className={roomStatus === 'running' ? 'lm-cloud-drift' : ''} opacity="0.22">
                  <ellipse cx="90" cy="44" rx="34" ry="8" fill="#cbd5e1" />
                  <ellipse cx="230" cy="70" rx="44" ry="10" fill="#94a3b8" />
                  <ellipse cx="380" cy="36" rx="38" ry="9" fill="#cbd5e1" />
                  <ellipse cx="520" cy="64" rx="42" ry="9" fill="#94a3b8" />
                </g>
              )}

              {roomStatus !== 'betting' && animationsEnabled && (
                <>
                  <path
                    d={`M 16 172 Q ${(16 + curveEndX) / 2} 172 ${curveEndX} ${curveEndY} L ${curveEndX} 172 Z`}
                    fill="url(#aviatorAreaGrad)"
                  />
                  <path
                    d={`M 16 172 Q ${(16 + curveEndX) / 2} 172 ${curveEndX} ${curveEndY}`}
                    fill="none"
                    stroke={roomStatus === 'crashed' ? '#f87171' : '#ff2e55'}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                  />
                  {roomStatus === 'running' && (
                    <g transform={`translate(${curveEndX}, ${curveEndY}) rotate(-18)`}>
                      <g className="lm-turbulence-float">
                        {/* Engine Exhaust Plume */}
                        <path
                          d="M-38,1 Q-22,-2 -13,0 L-13,4 Q-22,6 -38,1 Z"
                          fill="url(#aviatorExhaustGrad)"
                          className="lm-flame-flicker"
                        />
                        {/* Fuselage & Wings */}
                        <path
                          d="M-15,3 L9,-3 L18,0 L9,4 L-5,7 L-8,12 L-12,12 L-10,4 L-16,5 Z"
                          fill="#ff2e55"
                          stroke="#fecdd3"
                          strokeWidth="0.6"
                        />
                        <path d="M-2,-1 L5,-10 L8,-10 L4,-1 Z" fill="#fb7185" />
                        <circle cx="6" cy="0.5" r="2.2" fill="#fde047" />
                        {/* Spinning Propeller Disc */}
                        <ellipse
                          cx="18.5"
                          cy="0.5"
                          rx="1.6"
                          ry="8.5"
                          fill="#ffffff"
                          className="lm-propeller-spin"
                        />
                      </g>
                    </g>
                  )}

                  {roomStatus === 'crashed' && (
                    <g transform={`translate(${curveEndX}, ${curveEndY})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r="20"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2.5"
                        className="lm-shockwave"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="11"
                        fill="#fde047"
                        opacity="0.7"
                        className="lm-shockwave"
                      />
                    </g>
                  )}
                </>
              )}
            </svg>

            <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
              {roomStatus === 'betting' ? (
                <div className="flex flex-col items-center gap-2.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#cbd5e1]">
                    Waiting for next round
                  </p>
                  <p className="font-mono text-3xl font-extrabold text-white tabular-nums sm:text-4xl">
                    {countdown.toFixed(1)}s
                  </p>
                  <div className="h-1.5 w-44 overflow-hidden rounded-full bg-[#1f2937]">
                    <div
                      className="h-full bg-[#e11d48] transition-all duration-150"
                      style={{ width: `${Math.min(100, (countdown / 10) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : roomStatus === 'crashed' ? (
                <div className="lm-modal-pop flex flex-col items-center">
                  <span className="text-sm font-extrabold uppercase tracking-widest text-[#f87171]">
                    FLEW AWAY!
                  </span>
                  <span className="mt-0.5 font-mono text-5xl font-extrabold text-[#ef4444] tabular-nums sm:text-6xl drop-shadow-[0_4px_16px_rgba(239,68,68,0.45)]">
                    {(lastCrashedPoint ?? multiplier).toFixed(2)}x
                  </span>
                </div>
              ) : (
                <span className="font-mono text-5xl font-extrabold text-white tabular-nums sm:text-6xl drop-shadow-[0_4px_20px_rgba(0,0,0,0.75)]">
                  {multiplier.toFixed(2)}x
                </span>
              )}
            </div>

            <div className="absolute bottom-2.5 right-2.5 z-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/65 px-2.5 py-1 backdrop-blur-sm">
              <div className="flex -space-x-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#0f172a] bg-[#ef4444] text-[9px] font-bold text-white">
                  A
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#0f172a] bg-[#f59e0b] text-[9px] font-bold text-[#111827]">
                  K
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#0f172a] bg-[#3b82f6] text-[9px] font-bold text-white">
                  M
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-white tabular-nums">
                {connectedPlayers}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
          {renderAviatorSlip(1)}
          {renderAviatorSlip(2)}
        </div>

        <LiveBetsBoard
          theme="aviator"
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
