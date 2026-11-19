export type MarketSelection = '1' | 'X' | '2' | 'O' | 'U';

export type TopCategoryTab =
  | 'casino'
  | 'live-casino'
  | 'sports'
  | 'livescore'
  | 'in-play'
  | 'crash'
  | 'virtuals'
  | 'promos'
  | 'ai-insights';

export type BottomNavTab = 'home' | 'live' | 'games' | 'my-bets' | 'wallet' | 'profile' | 'invite';
export type SportsSubTab = 'highlights' | 'upcoming' | 'countries' | 'leagues';

export type CountryOption = 'Kenya' | 'Ghana' | "Côte d'Ivoire";

export type CrashGameId =
  | 'aviator'
  | 'comet-crash'
  | 'swimminator'
  | 'b-crash'
  | 'punchinator'
  | 'crash-3dx'
  | 'crash-royale'
  | 'fortune-spins'
  | 'jetx'
  | 'spaceman'
  | 'original';

export type GameCategoryFilter = 'All' | 'Aviator' | 'Crash' | 'Virtuals' | 'Casino' | 'Arcade';

export interface LiveScoreKeyEvent {
  minute: string;
  type: 'goal' | 'penalty' | 'own_goal' | 'yellow' | 'red';
  playerName: string;
  teamId: string;
  isScoring: boolean;
}

export interface MatchItem {
  id: string;
  rawEventId?: string;
  code: string;
  league: string;
  leagueSlug?: string;
  country: string;
  kickoff: string;
  dateIso?: string;
  minute?: string;
  statusText?: string;
  state?: LiveScoreStatusState;
  venue?: string;
  scoreHome?: number;
  scoreAway?: number;
  isLiveDemo?: boolean;
  isUpcoming?: boolean;
  isFeatured?: boolean;
  marketsCount: number;
  homeTeamId?: string;
  awayTeamId?: string;
  homeTeam: string;
  awayTeam: string;
  homeCode: string;
  awayCode: string;
  homeLogo?: string;
  awayLogo?: string;
  homeColors: [string, string];
  awayColors: [string, string];
  keyEvents?: LiveScoreKeyEvent[];
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  doubleChance: {
    homeOrDraw: number;
    homeOrAway: number;
    drawOrAway: number;
  };
  overUnderLine: number;
  overUnder25: {
    over: number;
    under: number;
  };
}

export type LiveScoreStatusState = 'pre' | 'in' | 'post';

export interface LiveScoreTeam {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  logo: string;
  score: number | null;
  winner: boolean;
  form: string;
  record: string;
  color: string;
}

export interface LiveScoreMatch {
  id: string;
  league: string;
  leagueSlug: string;
  date: string;
  kickoffLabel: string;
  state: LiveScoreStatusState;
  statusText: string;
  clock: string;
  completed: boolean;
  venue: string;
  homeTeam: LiveScoreTeam;
  awayTeam: LiveScoreTeam;
  keyEvents?: LiveScoreKeyEvent[];
  odds?: {
    home?: number;
    draw?: number;
    away?: number;
  };
}

export interface LiveScoreResponse {
  updatedAt: string;
  serverTimeIso?: string;
  day: 'yesterday' | 'today' | 'tomorrow';
  league: string;
  totalCount: number;
  liveCount: number;
  leagues: {
    slug: string;
    name: string;
    count: number;
  }[];
  matches: LiveScoreMatch[];
}

export interface WorldSoccerLeagueOption {
  slug: string;
  name: string;
}

export interface WorldSoccerClubOption {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  logo: string;
  color: string;
  leagueSlug: string;
  leagueName: string;
}

export interface WorldSoccerPlayer {
  id: string;
  name: string;
  shortName: string;
  jersey: string;
  position: string;
  positionAbbr: 'F' | 'M' | 'D' | 'G' | string;
  nationality: string;
  age: number | null;
  height: string;
  weight: string;
  teamId: string;
  teamName: string;
  teamAbbr: string;
  teamLogo: string;
  teamColor: string;
  leagueSlug: string;
  leagueName: string;
  stats: {
    appearances: number;
    goals: number;
    assists: number;
    shots: number;
    yellowCards: number;
    redCards: number;
    saves: number;
  };
}

export interface WorldSoccerPlayersResponse {
  updatedAt: string;
  league: string;
  teamId: string;
  leagues: WorldSoccerLeagueOption[];
  teams: WorldSoccerClubOption[];
  totalPlayers: number;
  players: WorldSoccerPlayer[];
}

export interface MatchLineupPlayer {
  id: string;
  name: string;
  shortName: string;
  jersey: string;
  position: string;
  nationality?: string;
  starter: boolean;
  subbedIn: boolean;
  subbedOut: boolean;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  shots: number;
  appearances?: number;
}

export interface MatchSummaryEvent {
  minute: string;
  type: string;
  text: string;
  teamId: string;
  teamName: string;
  playerName: string;
  scoringPlay: boolean;
}

export interface MatchSummaryDetailsResponse {
  eventId: string;
  league: string;
  venue: string;
  sourceMode: 'match_lineups' | 'club_squads';
  homeTeam: {
    id: string;
    name: string;
    logo: string;
    players: MatchLineupPlayer[];
  };
  awayTeam: {
    id: string;
    name: string;
    logo: string;
    players: MatchLineupPlayer[];
  };
  keyEvents: MatchSummaryEvent[];
}

export interface PopularBetItem {
  id: string;
  matchId: string;
  matchLabel: string;
  market: string;
  pickLabel: string;
  selection: MarketSelection;
  odds: number;
  fractionalOdds: string;
}

export interface SlipPick {
  matchId: string;
  matchLabel: string;
  selection: MarketSelection;
  selectionLabel: string;
  odds: number;
}

export interface WalletTransaction {
  id: string;
  type:
    | 'deposit'
    | 'withdraw'
    | 'referral_bonus'
    | 'bet_won'
    | 'bet_lost'
    | 'bet_pending'
    | 'crash_cashout'
    | 'crash_stake';
  amount: number;
  stake?: number;
  odds?: number;
  status?: 'Won' | 'Lost' | 'Pending' | 'Completed';
  label: string;
  detail: string;
  createdAt: string;
}

export interface PlayedStats {
  totalWagered: number;
  totalWon: number;
  netPlayed: number;
  gamesPlayed: number;
}

export type AccountMode = 'demo' | 'real';

export interface ReferralItem {
  id: string;
  referredUsername: string;
  maskedPhone: string;
  joinedAt: string;
  status: 'pending_deposit' | 'awaiting_referrer_deposit' | 'rewarded';
  qualifyingDepositUsd?: number;
  rewardUsd: number;
  rewardBase: number;
  rewardedAt?: string;
}

export interface ReferralSummary {
  referralCode: string;
  referredByCode?: string | null;
  rewardUsd: number;
  minDepositUsd: number;
  hasQualifyingRealDeposit: boolean;
  totalInvited: number;
  qualifiedCount: number;
  awaitingClaimCount: number;
  pendingCount: number;
  totalEarnedBase: number;
  totalEarnedUsd: number;
  pendingBonusBase: number;
  pendingBonusUsd: number;
  referrals: ReferralItem[];
}

export interface ReferralValidateResponse {
  valid: boolean;
  code?: string;
  referrerUsername?: string;
  rewardUsd: number;
  minDepositUsd: number;
}

export interface WalletState {
  sessionId: string;
  username?: string;
  phone?: string;
  email?: string;
  emailVerified?: boolean;
  country?: CountryOption;
  currency?: 'KES' | 'GHS' | 'XOF';
  createdAt?: string;
  passwordHash?: string;
  isGuest?: boolean;
  referralCode?: string;
  referredByCode?: string | null;
  referralSummary?: ReferralSummary;
  balance: number;
  demoBalance: number;
  realBalance: number;
  accountMode: AccountMode;
  playedStats: PlayedStats;
  lastDepositAmount: number;
  lastDepositDate: string;
  history: WalletTransaction[];
}

export interface AuthResponse {
  token: string;
  username: string;
  phone?: string;
  email?: string;
  emailVerified?: boolean;
  country?: CountryOption;
  currency?: 'KES' | 'GHS' | 'XOF';
  createdAt?: string;
  passwordHash?: string;
  passwordRecovery?: string;
  referralCode?: string;
  referredByCode?: string | null;
  referralSummary?: ReferralSummary;
  balance: number;
  demoBalance: number;
  realBalance: number;
  accountMode: AccountMode;
  playedStats: PlayedStats;
  lastDepositAmount: number;
  lastDepositDate: string;
  history: WalletTransaction[];
  admin?: boolean;
  guest?: boolean;
  message?: string;
}

export interface RegisterDirectResponse {
  success: boolean;
  requiresEmailVerification?: boolean;
  requiresLogin: boolean;
  activated?: boolean;
  username?: string;
  phone?: string;
  email?: string;
  country: CountryOption;
  createdAt?: string;
  passwordHash?: string;
  passwordRecovery?: string;
  referralCode?: string;
  referredByCode?: string | null;
  referrerUsername?: string | null;
  smsSent: boolean;
  smsMessageId?: string;
  emailSent?: boolean;
  emailProviderLabel?: string;
  providerLabel: string;
  message: string;
}

export interface RecoverPasswordResponse {
  success: boolean;
  phone?: string;
  country?: CountryOption;
  previousPassword: string;
  passwordHash?: string;
  passwordRecovery?: string;
  message: string;
}

export interface VerifyEmailOtpResponse {
  success: boolean;
  activated: boolean;
  emailVerified: boolean;
  username?: string;
  phone?: string;
  email?: string;
  country: CountryOption;
  createdAt?: string;
  passwordHash?: string;
  message: string;
}

export interface ResendEmailOtpResponse {
  success: boolean;
  alreadyVerified?: boolean;
  email?: string;
  emailSent: boolean;
  emailProviderLabel?: string;
  message: string;
}

export interface SmsStatusResponse {
  configured: boolean;
  providerLabel: string;
  channel?: string;
  missingTwilioVars?: string[];
}

export type PaystackMobileProvider =
  | 'mpesa'
  | 'mtn'
  | 'vod'
  | 'atl'
  | 'orange'
  | 'moov'
  | 'wave'
  | 'checkout';

export interface PaystackStatusResponse {
  configured: boolean;
  publicKey: string;
  mode?: 'live' | 'test' | 'unconfigured';
}

export interface PaystackDepositInitResponse {
  success: boolean;
  reference: string;
  status: 'pay_offline' | 'pending' | 'send_otp' | 'open_url' | 'success';
  stkPrompt?: string;
  displayText?: string;
  authorizationUrl?: string;
  accessCode?: string;
  phone: string;
  maskedPhone: string;
  provider: PaystackMobileProvider;
  depositUsd: number;
  depositLocal: number;
  currency: 'KES' | 'GHS' | 'XOF';
  message: string;
  unlockedReferralBonusUsd?: number;
  referralSummary?: ReferralSummary;
  balance?: number;
  demoBalance?: number;
  realBalance?: number;
  accountMode?: AccountMode;
  playedStats?: PlayedStats;
  lastDepositAmount?: number;
  lastDepositDate?: string;
  history?: WalletTransaction[];
}

export interface PaystackVerifyResponse {
  success: boolean;
  reference: string;
  status: 'pending' | 'success' | 'failed';
  credited: boolean;
  unlockedReferralBonusUsd?: number;
  referralSummary?: ReferralSummary;
  message: string;
  balance: number;
  demoBalance: number;
  realBalance: number;
  accountMode: AccountMode;
  playedStats: PlayedStats;
  lastDepositAmount: number;
  lastDepositDate: string;
  history: WalletTransaction[];
}

export interface PaystackWithdrawInitResponse {
  success: boolean;
  reference: string;
  status: 'pay_offline' | 'pending' | 'send_otp' | 'open_url' | 'success';
  stkPrompt?: string;
  displayText?: string;
  authorizationUrl?: string;
  accessCode?: string;
  phone: string;
  maskedPhone: string;
  provider: PaystackMobileProvider;
  withdrawUsd: number;
  feeUsd: number;
  feeLocal: number;
  currency: 'KES' | 'GHS' | 'XOF';
  message: string;
  balance?: number;
  demoBalance?: number;
  realBalance?: number;
  accountMode?: AccountMode;
  playedStats?: PlayedStats;
  lastDepositAmount?: number;
  lastDepositDate?: string;
  history?: WalletTransaction[];
}

export interface PaystackWithdrawVerifyResponse {
  success: boolean;
  reference: string;
  status: 'pending' | 'success' | 'failed';
  settled: boolean;
  withdrawUsd?: number;
  feeUsd?: number;
  message: string;
  balance: number;
  demoBalance: number;
  realBalance: number;
  accountMode: AccountMode;
  playedStats: PlayedStats;
  lastDepositAmount: number;
  lastDepositDate: string;
  history: WalletTransaction[];
}

export interface MatchAnalysisResult {
  homeTeam: string;
  awayTeam: string;
  league: string;
  headlineCall: string;
  confidencePercent: number;
  formSummary: string;
  probabilities: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  keyFactors: string[];
  confidenceLevel: 'High' | 'Moderate' | 'Low';
  riskNote: string;
}

export interface CrashGameConfig {
  id: CrashGameId;
  title: string;
  subtitle: string;
  description: string;
  category: Exclude<GameCategoryFilter, 'All'>;
  cardBg: string;
  accentHex: string;
  badge?: string;
  isJustLanded?: boolean;
  isPopular?: boolean;
  imageUrl?: string;
  isLightning?: boolean;
  glyph:
    | 'plane'
    | 'comet'
    | 'wave'
    | 'burst'
    | 'glove'
    | 'rocket'
    | 'crown'
    | 'wheel'
    | 'jet'
    | 'astro'
    | 'bolt';
}

export interface LobbyGameStatus {
  id: CrashGameId;
  name: string;
  roundNumber: number;
  status: 'betting' | 'running' | 'crashed';
  multiplier: number;
  countdown: number;
  connectedPlayers: number;
  activeBetsCount: number;
  lastCrashPoint: number | null;
}

export interface RoomBetPublic {
  betId: string;
  slot: 1 | 2;
  username: string;
  amount: number;
  autoCashout: number | null;
  status: 'active' | 'cashed_out' | 'lost';
  payout: number;
  cashoutMultiplier: number | null;
}

export interface RoomRoundPublic {
  roundId: string;
  game: CrashGameId;
  gameTitle: string;
  roundNumber: number;
  status: 'betting' | 'running' | 'crashed';
  seedHash: string;
  seed: string | null;
  hmacHex: string | null;
  crashPoint: number | null;
  startedAt: string | null;
  endedAt: string | null;
}

export interface RoomStateSnapshot {
  sessionId?: string;
  game: CrashGameId;
  gameTitle: string;
  roundId: string;
  roundNumber: number;
  status: 'betting' | 'running' | 'crashed';
  multiplier: number;
  countdown: number;
  seedHash: string;
  revealedSeed: string | null;
  crashPoint: number | null;
  connectedPlayers: number;
  activeBets: RoomBetPublic[];
  previousBets: RoomBetPublic[];
  previousCrashPoint: number | null;
  topWins: RoomBetPublic[];
  recentRounds: RoomRoundPublic[];
  myActiveBets?: {
    slip1: RoomBetPublic | null;
    slip2: RoomBetPublic | null;
  };
}

export interface PredictorGameSnapshot {
  game: CrashGameId;
  gameTitle: string;
  roundNumber: number;
  status: 'betting' | 'running' | 'crashed';
  liveMultiplier: number;
  countdownSeconds: number;
  currentRoundCrashPoint: number;
  targetRoundNumber: number;
  predictedNextOdd: number;
  followingRoundNumber: number;
  followingPredictedOdd: number;
  recentCrashPoints: {
    roundNumber: number;
    crashPoint: number;
    endedAt: string | null;
  }[];
}

export interface PredictorAllResponse {
  updatedAt: string;
  games: PredictorGameSnapshot[];
}


