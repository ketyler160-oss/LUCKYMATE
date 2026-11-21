import { PredictorAllResponse } from '../types';

const PREDICTOR_TOKEN_KEY = 'luckymate_predictor_token';
const PREDICTOR_SERVER_URL_KEY = 'luckymate_predictor_server_url';

export function normalizeServerBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function getStoredPredictorServerUrl(): string {
  try {
    return window.localStorage.getItem(PREDICTOR_SERVER_URL_KEY) || '';
  } catch {
    return '';
  }
}

export function storePredictorServerUrl(url: string) {
  try {
    const normalized = normalizeServerBaseUrl(url);
    if (normalized) {
      window.localStorage.setItem(PREDICTOR_SERVER_URL_KEY, normalized);
    } else {
      window.localStorage.removeItem(PREDICTOR_SERVER_URL_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function getStoredPredictorToken(): string {
  try {
    return window.sessionStorage.getItem(PREDICTOR_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function storePredictorToken(token: string | null) {
  try {
    if (token) {
      window.sessionStorage.setItem(PREDICTOR_TOKEN_KEY, token);
    } else {
      window.sessionStorage.removeItem(PREDICTOR_TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

function buildApiUrl(path: string, baseUrl?: string): string {
  const effectiveBase = normalizeServerBaseUrl(baseUrl ?? getStoredPredictorServerUrl());
  return effectiveBase ? `${effectiveBase}${path}` : path;
}

async function predictorFetch<T>(path: string, init: RequestInit = {}, baseUrl?: string): Promise<T> {
  const res = await fetch(buildApiUrl(path, baseUrl), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }
  if (!res.ok) {
    const msg =
      (data as { message?: string; error?: string } | null)?.message ||
      (data as { message?: string; error?: string } | null)?.error ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export async function unlockPredictor(
  accessCode: string,
  serverBaseUrl?: string
): Promise<{
  success: boolean;
  predictorToken: string;
  expiresInSeconds: number;
}> {
  const res = await predictorFetch<{
    success: boolean;
    predictorToken: string;
    expiresInSeconds: number;
  }>(
    '/api/predictor/unlock',
    {
      method: 'POST',
      body: JSON.stringify({ accessCode }),
    },
    serverBaseUrl
  );
  storePredictorToken(res.predictorToken);
  return res;
}

export function fetchPredictorAll(
  predictorToken?: string,
  serverBaseUrl?: string
): Promise<PredictorAllResponse> {
  const token = predictorToken ?? getStoredPredictorToken();
  return predictorFetch<PredictorAllResponse>(
    '/api/predictor/all',
    {
      headers: token ? { 'x-predictor-token': token } : undefined,
    },
    serverBaseUrl
  );
}

export async function verifyPredictorChangeCode(
  code: string,
  serverBaseUrl?: string
): Promise<{
  success: boolean;
  message: string;
}> {
  return predictorFetch<{
    success: boolean;
    message: string;
  }>(
    '/api/predictor/verify-change-code',
    {
      method: 'POST',
      body: JSON.stringify({ code }),
    },
    serverBaseUrl
  );
}

export async function changePredictorPassword(
  currentCode: string,
  newPassword: string,
  predictorToken?: string,
  serverBaseUrl?: string
): Promise<{
  success: boolean;
  predictorToken: string;
  expiresInSeconds: number;
  message: string;
}> {
  const token = predictorToken ?? getStoredPredictorToken();
  const res = await predictorFetch<{
    success: boolean;
    predictorToken: string;
    expiresInSeconds: number;
    message: string;
  }>(
    '/api/predictor/change-password',
    {
      method: 'POST',
      headers: token ? { 'x-predictor-token': token } : undefined,
      body: JSON.stringify({ currentCode, newPassword }),
    },
    serverBaseUrl
  );
  if (res.predictorToken) {
    storePredictorToken(res.predictorToken);
  }
  return res;
}
