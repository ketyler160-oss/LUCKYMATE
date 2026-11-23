import { CountryOption } from '../types';

export interface CountryConfig {
  code: CountryOption;
  label: string;
  shortCode: 'KE' | 'GH' | 'CI';
  dialCode: string;
  currency: 'KES' | 'GHS' | 'XOF';
  usdRate: number;
  domainSuffix: '.ke' | '.gh' | '.ci';
  phonePlaceholder: string;
  payMethod: string;
  quickDepositPresets: number[];
  defaultSportsStake: number;
  defaultCrashStake: number;
  minBetLocal: number;
  maxBetLocal: number;
  betStep: number;
  quickSportsStakes: number[];
  aviatorPresets: number[];
  jetxPresets: number[];
  bcrashPresets: number[];
  otherCrashPresets: number[];
}

export const BASE_KES_PER_USD = 130;
export const MIN_DEPOSIT_USD = 6;
export const MIN_WITHDRAW_USD = 60;
export const WITHDRAW_FEE_USD = 12;
export const REFERRAL_REWARD_USD = 3;
export const REFERRAL_MIN_DEPOSIT_USD = 6;
export const DEPOSIT_USD_PRESETS = [6, 10, 25, 50, 100] as const;
export const WITHDRAW_USD_PRESETS = [60, 100, 200, 500] as const;

export const WITHDRAW_FEE_TIERS = [
  { range: '$60 – $150', feeLabel: '$12.00' },
  { range: '$151 – $500', feeLabel: '25%' },
  { range: '$501 – $1,000', feeLabel: '$45.00' },
  { range: '$1,001 – $5,000', feeLabel: '$69.00' },
  { range: '$5,001 – $10,000', feeLabel: '$89.00' },
  { range: '$10,001+', feeLabel: '$250.00' },
] as const;

export function calculateWithdrawFeeUsd(withdrawUsd: number): number {
  const amt = Number(withdrawUsd);
  if (!Number.isFinite(amt) || amt <= 0) return 0;
  if (amt <= 150) return 12;
  if (amt <= 500) return Number((amt * 0.25).toFixed(2));
  if (amt <= 1000) return 45;
  if (amt <= 5000) return 69;
  if (amt <= 10000) return 89;
  return 250;
}

export const COUNTRY_ORDER: CountryOption[] = ['Kenya', 'Ghana', "Côte d'Ivoire"];

export const COUNTRIES: Record<CountryOption, CountryConfig> = {
  Kenya: {
    code: 'Kenya',
    label: 'Kenya',
    shortCode: 'KE',
    dialCode: '+254',
    currency: 'KES',
    usdRate: 130,
    domainSuffix: '.ke',
    phonePlaceholder: 'e.g. 0712 234567',
    payMethod: 'M-PESA',
    quickDepositPresets: [780, 1300, 3250, 6500],
    defaultSportsStake: 100,
    defaultCrashStake: 10,
    minBetLocal: 1,
    maxBetLocal: 100000,
    betStep: 10,
    quickSportsStakes: [50, 100, 500, 1000],
    aviatorPresets: [100, 200, 500, 10000],
    jetxPresets: [20, 50, 100],
    bcrashPresets: [10, 50, 100],
    otherCrashPresets: [50, 200, 1000],
  },
  Ghana: {
    code: 'Ghana',
    label: 'Ghana',
    shortCode: 'GH',
    dialCode: '+233',
    currency: 'GHS',
    usdRate: 16,
    domainSuffix: '.gh',
    phonePlaceholder: 'e.g. 024 123 4567',
    payMethod: 'MTN MoMo / Telecel',
    quickDepositPresets: [96, 160, 400, 800],
    defaultSportsStake: 10,
    defaultCrashStake: 5,
    minBetLocal: 1,
    maxBetLocal: 15000,
    betStep: 1,
    quickSportsStakes: [5, 10, 50, 100],
    aviatorPresets: [5, 10, 50, 500],
    jetxPresets: [2, 5, 20],
    bcrashPresets: [1, 5, 20],
    otherCrashPresets: [5, 20, 100],
  },
  "Côte d'Ivoire": {
    code: "Côte d'Ivoire",
    label: "Côte d'Ivoire",
    shortCode: 'CI',
    dialCode: '+225',
    currency: 'XOF',
    usdRate: 600,
    domainSuffix: '.ci',
    phonePlaceholder: 'e.g. 07 01 23 45 67',
    payMethod: 'Orange / MTN Money',
    quickDepositPresets: [3600, 6000, 15000, 30000],
    defaultSportsStake: 500,
    defaultCrashStake: 100,
    minBetLocal: 50,
    maxBetLocal: 500000,
    betStep: 100,
    quickSportsStakes: [250, 500, 2500, 5000],
    aviatorPresets: [500, 1000, 2500, 50000],
    jetxPresets: [100, 250, 500],
    bcrashPresets: [100, 500, 1000],
    otherCrashPresets: [250, 1000, 5000],
  },
};

export const COUNTRY_STORAGE_KEY = 'luckymate_country';

export function loadStoredCountry(): CountryOption {
  try {
    const raw = window.localStorage.getItem(COUNTRY_STORAGE_KEY);
    if (raw === 'Kenya' || raw === 'Ghana' || raw === "Côte d'Ivoire") {
      return raw;
    }
  } catch {
    // Ignore storage read errors
  }
  return 'Kenya';
}

export function saveStoredCountry(country: CountryOption) {
  try {
    window.localStorage.setItem(COUNTRY_STORAGE_KEY, country);
  } catch {
    // Ignore storage write errors
  }
}

export function getCountryConfig(country: CountryOption): CountryConfig {
  return COUNTRIES[country] ?? COUNTRIES.Kenya;
}

export function convertBaseToLocal(baseKesAmount: number, country: CountryOption): number {
  const { usdRate } = getCountryConfig(country);
  return Number(((baseKesAmount / BASE_KES_PER_USD) * usdRate).toFixed(2));
}

export function convertLocalToBase(localAmount: number, country: CountryOption): number {
  const { usdRate } = getCountryConfig(country);
  return Number(((localAmount / usdRate) * BASE_KES_PER_USD).toFixed(2));
}

export function convertBaseToUsd(baseKesAmount: number): number {
  return Number((baseKesAmount / BASE_KES_PER_USD).toFixed(2));
}

export function convertUsdToLocal(usdAmount: number, country: CountryOption): number {
  const { usdRate } = getCountryConfig(country);
  return Number((usdAmount * usdRate).toFixed(2));
}

export function formatLocalNumber(baseKesAmount: number, country: CountryOption): string {
  const converted = convertBaseToLocal(baseKesAmount, country);
  return converted.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatMoney(baseKesAmount: number, country: CountryOption): string {
  const { currency } = getCountryConfig(country);
  return `${currency} ${formatLocalNumber(baseKesAmount, country)}`;
}

export function formatDirectLocalMoney(localAmount: number, country: CountryOption): string {
  const { currency } = getCountryConfig(country);
  return `${currency} ${localAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatUsd(usdAmount: number): string {
  return `$${usdAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USD`;
}
