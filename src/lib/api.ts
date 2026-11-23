import {
  AccountMode,
  AuthResponse,
  CountryOption,
  CrashGameId,
  LiveScoreResponse,
  LobbyGameStatus,
  MatchAnalysisResult,
  MatchSummaryDetailsResponse,
  PaystackDepositInitResponse,
  PaystackMobileProvider,
  PaystackStatusResponse,
  PaystackVerifyResponse,
  PaystackWithdrawInitResponse,
  PaystackWithdrawVerifyResponse,
  PlayedStats,
  RecoverPasswordResponse,
  ReferralSummary,
  ReferralValidateResponse,
  RoomBetPublic,
  RoomRoundPublic,
  RoomStateSnapshot,
  RegisterDirectResponse,
  SlipPick,
  SmsStatusResponse,
  WalletState,
  WorldSoccerPlayersResponse,
} from '../types';

const SESSION_STORAGE_KEY = 'luckymate_demo_sid';
const AUTH_TOKEN_KEY = 'luckymate_auth_token';
const SAVED_CLIENT_KEY = 'luckymate_saved_client';
const SAVED_PROFILES_KEY = 'luckymate_saved_profiles';
const PENDING_REFERRAL_KEY = 'luckymate_pending_ref';

export function loadPendingReferralCode(): string | null {
  try {
    const raw = window.localStorage.getItem(PENDING_REFERRAL_KEY);
    if (!raw) return null;
    const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    return cleaned.length >= 4 ? cleaned : null;
  } catch {
    return null;
  }
}

export function savePendingReferralCode(code: string) {
  try {
    const cleaned = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length >= 4) {
      window.localStorage.setItem(PENDING_REFERRAL_KEY, cleaned);
    }
  } catch {
    // Ignore storage errors
  }
}

export function clearPendingReferralCode() {
  try {
    window.localStorage.removeItem(PENDING_REFERRAL_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function buildReferralShareUrl(referralCode: string): string {
  const code = referralCode.trim().toUpperCase();
  if (typeof window === 'undefined') {
    return `https://luckymate.app/?ref=${encodeURIComponent(code)}`;
  }
  const url = new URL(window.location.origin + '/');
  url.searchParams.set('ref', code);
  return url.toString();
}

export interface SavedClientDetails {
  phone: string;
  email?: string;
  emailVerified?: boolean;
  country: CountryOption;
  username?: string;
  registeredAt?: string;
  passwordHash?: string;
  passwordRecovery?: string;
}

export function loadSavedClientDetails(): SavedClientDetails | null {
  try {
    const raw = window.localStorage.getItem(SAVED_CLIENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedClientDetails>;
    if (!parsed || typeof parsed.phone !== 'string' || !parsed.phone.trim()) return null;
    const country: CountryOption =
      parsed.country === 'Ghana' || parsed.country === "Côte d'Ivoire" ? parsed.country : 'Kenya';
    return {
      phone: parsed.phone.trim(),
      email: typeof parsed.email === 'string' ? parsed.email.trim().toLowerCase() : undefined,
      emailVerified: parsed.emailVerified !== false,
      country,
      username: typeof parsed.username === 'string' ? parsed.username : undefined,
      registeredAt: typeof parsed.registeredAt === 'string' ? parsed.registeredAt : undefined,
      passwordHash: typeof parsed.passwordHash === 'string' ? parsed.passwordHash : undefined,
      passwordRecovery:
        typeof parsed.passwordRecovery === 'string' ? parsed.passwordRecovery : undefined,
    };
  } catch {
    return null;
  }
}

export function loadAllSavedClientProfiles(): SavedClientDetails[] {
  const list: SavedClientDetails[] = [];
  const single = loadSavedClientDetails();
  if (single) list.push(single);
  try {
    const raw = window.localStorage.getItem(SAVED_PROFILES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (!item || typeof item.phone !== 'string' || !item.phone.trim()) continue;
          const tail = item.phone.replace(/\D/g, '').slice(-9);
          if (!list.some((x) => x.phone.replace(/\D/g, '').slice(-9) === tail)) {
            list.push({
              phone: item.phone.trim(),
              email: typeof item.email === 'string' ? item.email.trim().toLowerCase() : undefined,
              emailVerified: item.emailVerified !== false,
              country:
                item.country === 'Ghana' || item.country === "Côte d'Ivoire"
                  ? item.country
                  : 'Kenya',
              username: typeof item.username === 'string' ? item.username : undefined,
              registeredAt: typeof item.registeredAt === 'string' ? item.registeredAt : undefined,
              passwordHash: typeof item.passwordHash === 'string' ? item.passwordHash : undefined,
              passwordRecovery:
                typeof item.passwordRecovery === 'string' ? item.passwordRecovery : undefined,
            });
          }
        }
      }
    }
  } catch {
    // Ignore storage errors
  }
  return list;
}

export function saveRegisteredClientDetails(details: Partial<SavedClientDetails>): SavedClientDetails | null {
  const existing = loadSavedClientDetails();
  const phone = (details.phone ?? existing?.phone ?? '').trim();
  if (!phone) return existing;
  const tail = phone.replace(/\D/g, '').slice(-9);
  const allExisting = loadAllSavedClientProfiles();
  const matchedPrev = allExisting.find(
    (p) => p.phone.replace(/\D/g, '').slice(-9) === tail
  );
  const next: SavedClientDetails = {
    phone,
    email: details.email ?? matchedPrev?.email,
    emailVerified: details.emailVerified ?? matchedPrev?.emailVerified ?? true,
    country: details.country ?? matchedPrev?.country ?? 'Kenya',
    username: details.username ?? matchedPrev?.username,
    registeredAt: details.registeredAt ?? matchedPrev?.registeredAt ?? new Date().toISOString(),
    passwordHash: details.passwordHash ?? matchedPrev?.passwordHash,
    passwordRecovery: details.passwordRecovery ?? matchedPrev?.passwordRecovery,
  };
  const updatedList = [
    next,
    ...allExisting.filter((p) => p.phone.replace(/\D/g, '').slice(-9) !== tail),
  ].slice(0, 10);
  try {
    window.localStorage.setItem(SAVED_CLIENT_KEY, JSON.stringify(next));
    window.localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(updatedList));
  } catch {
    // Ignore storage quota errors
  }
  return next;
}

function getStoredSessionId(): string {
  try {
    return window.localStorage.getItem(SESSION_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function storeSessionId(sessionId?: string) {
  if (!sessionId) return;
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  } catch {
    // Ignore storage quota errors
  }
}

export function getStoredAuthToken(): string {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function storeAuthToken(token: string | null) {
  try {
    if (token) {
      window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
    // Ignore storage quota errors
  }
}

export class ApiError extends Error {
  status: number;
  requiresRegistration?: boolean;
  requiresEmailVerification?: boolean;
  pendingEmail?: string;
  pendingPhone?: string;
  accountNotFound?: boolean;
  wrongPassword?: boolean;
  constructor(
    message: string,
    status: number,
    opts?: {
      requiresRegistration?: boolean;
      requiresEmailVerification?: boolean;
      pendingEmail?: string;
      pendingPhone?: string;
      accountNotFound?: boolean;
      wrongPassword?: boolean;
    }
  ) {
    super(message);
    this.status = status;
    this.requiresRegistration = opts?.requiresRegistration;
    this.requiresEmailVerification = opts?.requiresEmailVerification;
    this.pendingEmail = opts?.pendingEmail;
    this.pendingPhone = opts?.pendingPhone;
    this.accountNotFound = opts?.accountNotFound;
    this.wrongPassword = opts?.wrongPassword;
  }
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const sid = getStoredSessionId();
  const token = getStoredAuthToken();
  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type') && options?.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (sid) {
    headers.set('x-demo-session', sid);
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (data && typeof data.sessionId === 'string') {
    storeSessionId(data.sessionId);
  }

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed (${response.status})`;
    throw new ApiError(message, response.status, {
      requiresRegistration: Boolean(data?.requiresRegistration),
      requiresEmailVerification: Boolean(data?.requiresEmailVerification),
      pendingEmail: typeof data?.email === 'string' ? data.email : undefined,
      pendingPhone: typeof data?.phone === 'string' ? data.phone : undefined,
      accountNotFound: Boolean(data?.accountNotFound),
      wrongPassword: Boolean(data?.wrongPassword),
    });
  }

  return data as T;
}

export async function registerAccount(payload: {
  phone: string;
  email?: string;
  password: string;
  confirmPassword: string;
  country: CountryOption;
  acceptedTerms: boolean;
  referralCode?: string;
}): Promise<RegisterDirectResponse> {
  const savedProfile = loadSavedClientDetails();
  const savedProfiles = loadAllSavedClientProfiles();
  const res = await apiFetch<RegisterDirectResponse>('/api/register', {
    method: 'POST',
    body: JSON.stringify({ ...payload, savedProfile, savedProfiles }),
  });
  if (res.success && (res.phone || payload.phone)) {
    saveRegisteredClientDetails({
      phone: res.phone || payload.phone.trim(),
      email: res.email || payload.email?.trim().toLowerCase() || undefined,
      emailVerified: true,
      country: res.country || payload.country,
      username: res.username,
      registeredAt: res.createdAt || new Date().toISOString(),
      passwordHash: res.passwordHash,
      passwordRecovery: res.passwordRecovery,
    });
    clearPendingReferralCode();
  }
  return res;
}

export function validateReferralCode(code: string): Promise<ReferralValidateResponse> {
  return apiFetch<ReferralValidateResponse>(
    `/api/referral/validate/${encodeURIComponent(code.trim().toUpperCase())}`
  );
}

export function fetchReferralSummary(): Promise<ReferralSummary> {
  return apiFetch<ReferralSummary>('/api/referral/summary');
}

export async function recoverAccountPassword(payload: {
  phone: string;
  country: CountryOption;
}): Promise<RecoverPasswordResponse> {
  const savedProfile = loadSavedClientDetails();
  const savedProfiles = loadAllSavedClientProfiles();
  const res = await apiFetch<RecoverPasswordResponse>('/api/recover-password', {
    method: 'POST',
    body: JSON.stringify({ ...payload, savedProfile, savedProfiles }),
  });
  if (res.success && (res.phone || payload.phone)) {
    saveRegisteredClientDetails({
      phone: res.phone || payload.phone.trim(),
      country: res.country || payload.country,
      passwordHash: res.passwordHash,
      passwordRecovery: res.passwordRecovery,
    });
  }
  return res;
}

export async function resetAccountPassword(payload: {
  phone: string;
  country: CountryOption;
  newPassword: string;
  confirmPassword: string;
}): Promise<{
  success: boolean;
  phone?: string;
  country?: CountryOption;
  passwordHash?: string;
  passwordRecovery?: string;
  message: string;
}> {
  const savedProfile = loadSavedClientDetails();
  const savedProfiles = loadAllSavedClientProfiles();
  const res = await apiFetch<{
    success: boolean;
    phone?: string;
    country?: CountryOption;
    passwordHash?: string;
    passwordRecovery?: string;
    message: string;
  }>('/api/reset-password', {
    method: 'POST',
    body: JSON.stringify({ ...payload, savedProfile, savedProfiles }),
  });
  if (res.success && (res.phone || payload.phone)) {
    saveRegisteredClientDetails({
      phone: res.phone || payload.phone.trim(),
      country: res.country || payload.country,
      passwordHash: res.passwordHash,
      passwordRecovery: res.passwordRecovery,
    });
  }
  return res;
}

export function fetchSmsStatus(): Promise<SmsStatusResponse> {
  return apiFetch<SmsStatusResponse>('/api/sms/status');
}

export async function loginUser(
  identifier: string,
  password: string,
  country?: CountryOption
): Promise<AuthResponse> {
  const savedProfile = loadSavedClientDetails();
  const savedProfiles = loadAllSavedClientProfiles();
  const data = await apiFetch<AuthResponse>('/api/login', {
    method: 'POST',
    body: JSON.stringify({
      username: identifier,
      phone: identifier,
      password,
      country,
      savedProfile,
      savedProfiles,
    }),
  });
  storeAuthToken(data.token);
  if (!data.guest) {
    saveRegisteredClientDetails({
      phone: data.phone || identifier,
      email: data.email,
      emailVerified: data.emailVerified !== false,
      country: data.country || country,
      username: data.username,
      registeredAt: data.createdAt,
      passwordHash: data.passwordHash,
      passwordRecovery: data.passwordRecovery,
    });
  }
  return data;
}

export async function guestLogin(): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/api/guest', {
    method: 'POST',
  });
  storeAuthToken(data.token);
  return data;
}

export async function logoutUser(): Promise<void> {
  try {
    await apiFetch<{ success: boolean }>('/api/logout', { method: 'POST' });
  } catch {
    // Ignore logout transport errors when clearing local session
  } finally {
    storeAuthToken(null);
  }
}

export function fetchWallet(): Promise<WalletState> {
  return apiFetch<WalletState>('/api/wallet');
}

export function setAccountCountry(country: CountryOption): Promise<{
  success: boolean;
  country: CountryOption;
  currency: 'KES' | 'GHS' | 'XOF';
}> {
  return apiFetch('/api/account/country', {
    method: 'POST',
    body: JSON.stringify({ country }),
  });
}

export function setAccountMode(mode: AccountMode): Promise<{
  success: boolean;
  username?: string;
  isGuest?: boolean;
  balance: number;
  demoBalance: number;
  realBalance: number;
  accountMode: AccountMode;
  playedStats: PlayedStats;
  lastDepositAmount: number;
  lastDepositDate: string;
  history: WalletState['history'];
}> {
  return apiFetch('/api/account/mode', {
    method: 'POST',
    body: JSON.stringify({ mode }),
  });
}

export function submitDemoDeposit(
  amountUsd: number,
  phone: string,
  walletMode?: AccountMode,
  country?: CountryOption
): Promise<{
  success: boolean;
  message: string;
  depositUsd?: number;
  depositLocal?: number;
  currency?: 'KES' | 'GHS' | 'XOF';
  balance: number;
  demoBalance: number;
  realBalance: number;
  accountMode: AccountMode;
  playedStats: PlayedStats;
  lastDepositAmount: number;
  lastDepositDate: string;
  history: WalletState['history'];
}> {
  return apiFetch('/api/demo-deposit', {
    method: 'POST',
    body: JSON.stringify({ amountUsd, phone, walletMode, country }),
  });
}

export function submitDemoWithdraw(
  amountUsd: number,
  phone: string,
  walletMode?: AccountMode,
  country?: CountryOption
): Promise<{
  success: boolean;
  message: string;
  withdrawUsd?: number;
  feeUsd?: number;
  feeLocal?: number;
  netUsd?: number;
  netLocal?: number;
  currency?: 'KES' | 'GHS' | 'XOF';
  balance: number;
  demoBalance: number;
  realBalance: number;
  accountMode: AccountMode;
  playedStats: PlayedStats;
  lastDepositAmount: number;
  lastDepositDate: string;
  history: WalletState['history'];
}> {
  return apiFetch('/api/demo-withdraw', {
    method: 'POST',
    body: JSON.stringify({ amountUsd, phone, walletMode, country }),
  });
}

export function fetchPaystackStatus(): Promise<PaystackStatusResponse> {
  return apiFetch<PaystackStatusResponse>('/api/payments/paystack/status');
}

export function initiatePaystackDeposit(payload: {
  amountUsd: number;
  phone?: string;
  provider?: PaystackMobileProvider;
  country?: CountryOption;
}): Promise<PaystackDepositInitResponse> {
  return apiFetch<PaystackDepositInitResponse>('/api/payments/paystack/deposit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function initializePaystackCheckout(payload: {
  amountUsd: number;
  phone?: string;
  country?: CountryOption;
}): Promise<PaystackDepositInitResponse> {
  return apiFetch<PaystackDepositInitResponse>('/api/payments/paystack/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function verifyPaystackDeposit(reference: string): Promise<PaystackVerifyResponse> {
  return apiFetch<PaystackVerifyResponse>(
    `/api/payments/paystack/verify/${encodeURIComponent(reference)}`
  );
}

export function submitPaystackOtp(
  reference: string,
  otp: string
): Promise<PaystackVerifyResponse> {
  return apiFetch<PaystackVerifyResponse>('/api/payments/paystack/submit-otp', {
    method: 'POST',
    body: JSON.stringify({ reference, otp }),
  });
}

export function initiatePaystackWithdraw(payload: {
  amountUsd: number;
  phone?: string;
  provider?: PaystackMobileProvider;
  country?: CountryOption;
}): Promise<PaystackWithdrawInitResponse> {
  return apiFetch<PaystackWithdrawInitResponse>('/api/payments/paystack/withdraw', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function initializePaystackWithdrawCheckout(payload: {
  amountUsd: number;
  phone?: string;
  country?: CountryOption;
}): Promise<PaystackWithdrawInitResponse> {
  return apiFetch<PaystackWithdrawInitResponse>('/api/payments/paystack/withdraw-checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function verifyPaystackWithdraw(
  reference: string
): Promise<PaystackWithdrawVerifyResponse> {
  return apiFetch<PaystackWithdrawVerifyResponse>(
    `/api/payments/paystack/withdraw/verify/${encodeURIComponent(reference)}`
  );
}

export function submitPaystackWithdrawOtp(
  reference: string,
  otp: string
): Promise<PaystackWithdrawVerifyResponse> {
  return apiFetch<PaystackWithdrawVerifyResponse>('/api/payments/paystack/withdraw/submit-otp', {
    method: 'POST',
    body: JSON.stringify({ reference, otp }),
  });
}

export function submitDemoSlip(
  stake: number,
  picks: SlipPick[],
  walletMode?: AccountMode,
  country?: CountryOption
): Promise<{
  success: boolean;
  message: string;
  balance: number;
  demoBalance: number;
  realBalance: number;
  accountMode: AccountMode;
  country?: CountryOption;
  playedStats: PlayedStats;
  lastDepositAmount: number;
  lastDepositDate: string;
  history: WalletState['history'];
  potentialReturn: number;
}> {
  return apiFetch('/api/demo-slip', {
    method: 'POST',
    body: JSON.stringify({ stake, picks, walletMode, country }),
  });
}

export function fetchCrashLobby(): Promise<LobbyGameStatus[]> {
  return apiFetch<LobbyGameStatus[]>('/api/games/lobby');
}

export function fetchCrashRoomState(game: CrashGameId): Promise<RoomStateSnapshot> {
  return apiFetch<RoomStateSnapshot>(`/api/state/${game}`);
}

export function placeCrashRoomBet(
  game: CrashGameId,
  slot: 1 | 2,
  amount: number,
  autoCashout: number | null,
  walletMode?: AccountMode,
  country?: CountryOption
): Promise<{
  success: boolean;
  message: string;
  roundId: string;
  bet: RoomBetPublic;
  balance: number;
  demoBalance: number;
  realBalance: number;
  accountMode: AccountMode;
  country?: CountryOption;
  playedStats: PlayedStats;
  lastDepositAmount: number;
  lastDepositDate: string;
  history: WalletState['history'];
}> {
  return apiFetch('/api/bet', {
    method: 'POST',
    body: JSON.stringify({ game, slot, amount, autoCashout, walletMode, country }),
  });
}

export function cancelCrashRoomBet(
  game: CrashGameId,
  slot: 1 | 2
): Promise<{
  success: boolean;
  slot: 1 | 2;
  balance: number;
  demoBalance: number;
  realBalance: number;
  accountMode: AccountMode;
  playedStats: PlayedStats;
  lastDepositAmount: number;
  lastDepositDate: string;
  history: WalletState['history'];
}> {
  return apiFetch('/api/bet/cancel', {
    method: 'POST',
    body: JSON.stringify({ game, slot }),
  });
}

export function cashoutCrashRoom(
  game: CrashGameId,
  slot: 1 | 2
): Promise<{
  success: boolean;
  slot: 1 | 2;
  multiplier: number;
  payout: number;
  bet: RoomBetPublic;
  balance: number;
  demoBalance: number;
  realBalance: number;
  accountMode: AccountMode;
  playedStats: PlayedStats;
  lastDepositAmount: number;
  lastDepositDate: string;
  history: WalletState['history'];
}> {
  return apiFetch('/api/cashout', {
    method: 'POST',
    body: JSON.stringify({ game, slot }),
  });
}

export function fetchCrashRounds(game: CrashGameId): Promise<RoomRoundPublic[]> {
  return apiFetch<RoomRoundPublic[]>(`/api/rounds/${game}`);
}

export function resetDemoWallet(): Promise<{
  success: boolean;
  balance: number;
  demoBalance: number;
  realBalance: number;
  accountMode: AccountMode;
  playedStats: PlayedStats;
  lastDepositAmount: number;
  lastDepositDate: string;
  history: WalletState['history'];
  message: string;
}> {
  return apiFetch('/api/wallet/reset', {
    method: 'POST',
  });
}

export function analyzeMatchWithAI(payload: {
  homeTeam: string;
  awayTeam: string;
  league: string;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
}): Promise<MatchAnalysisResult> {
  return apiFetch<MatchAnalysisResult>('/api/analyze-match', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchOfficialLiveScores(params?: {
  league?: string;
  day?: 'yesterday' | 'today' | 'tomorrow';
}): Promise<LiveScoreResponse> {
  const qs = new URLSearchParams();
  if (params?.league) qs.set('league', params.league);
  if (params?.day) qs.set('day', params.day);
  const query = qs.toString();
  return apiFetch<LiveScoreResponse>(`/api/livescore${query ? `?${query}` : ''}`);
}

export function fetchWorldSoccerPlayers(params?: {
  league?: string;
  teamId?: string;
  position?: 'ALL' | 'F' | 'M' | 'D' | 'G';
  q?: string;
}): Promise<WorldSoccerPlayersResponse> {
  const qs = new URLSearchParams();
  if (params?.league) qs.set('league', params.league);
  if (params?.teamId) qs.set('teamId', params.teamId);
  if (params?.position && params.position !== 'ALL') qs.set('position', params.position);
  if (params?.q?.trim()) qs.set('q', params.q.trim());
  const query = qs.toString();
  return apiFetch<WorldSoccerPlayersResponse>(`/api/soccer/players${query ? `?${query}` : ''}`);
}

export function fetchMatchSummaryDetails(params: {
  eventId: string;
  leagueSlug?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  homeLogo?: string;
  awayLogo?: string;
}): Promise<MatchSummaryDetailsResponse> {
  const qs = new URLSearchParams();
  if (params.leagueSlug) qs.set('league', params.leagueSlug);
  if (params.homeTeamId) qs.set('homeTeamId', params.homeTeamId);
  if (params.awayTeamId) qs.set('awayTeamId', params.awayTeamId);
  if (params.homeTeamName) qs.set('homeTeamName', params.homeTeamName);
  if (params.awayTeamName) qs.set('awayTeamName', params.awayTeamName);
  if (params.homeLogo) qs.set('homeLogo', params.homeLogo);
  if (params.awayLogo) qs.set('awayLogo', params.awayLogo);
  const query = qs.toString();
  return apiFetch<MatchSummaryDetailsResponse>(
    `/api/soccer/match/${encodeURIComponent(params.eventId)}${query ? `?${query}` : ''}`
  );
}


