import { Coins, Plus, Wallet } from 'lucide-react';
import { formatMoney } from '../../lib/countries';
import { AccountMode, CountryOption } from '../../types';

interface CrashDualBalanceBarProps {
  demoBalance: number;
  realBalance: number;
  accountMode: AccountMode;
  country?: CountryOption;
  isLoggedIn?: boolean;
  onSelectMode: (mode: AccountMode) => void;
  onOpenWallet: () => void;
}

export function HeaderTopBalanceBadge({
  demoBalance,
  realBalance,
  accountMode,
  country = 'Kenya',
  isLoggedIn = false,
  onOpenWallet,
}: {
  demoBalance: number;
  realBalance: number;
  accountMode: AccountMode;
  country?: CountryOption;
  isLoggedIn?: boolean;
  onOpenWallet: () => void;
}) {
  if (!isLoggedIn) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-[#2cd4a3]/35 bg-[#09181b] py-1 px-2.5 text-[10px] sm:text-xs font-extrabold text-[#a7f3d0] whitespace-nowrap">
        <span className="h-1.5 w-1.5 rounded-full bg-[#2cd4a3]" aria-hidden="true" />
        <span>Fun Play</span>
      </div>
    );
  }

  const isReal = accountMode === 'real';
  const activeAmount = isReal ? realBalance : demoBalance;

  if (isReal) {
    return (
      <button
        type="button"
        onClick={onOpenWallet}
        title="Real Account Balance — Click to Deposit or Withdraw"
        className="inline-flex items-center gap-1.5 rounded-full border border-[#f5c417]/55 bg-[#0b111c] py-1 pl-2 pr-2 text-[10px] sm:text-xs font-extrabold text-white shadow-[0_2px_12px_rgba(245,196,23,0.18)] transition-all hover:border-[#f5c417] active:scale-95 cursor-pointer whitespace-nowrap"
      >
        <span className="inline-flex items-center gap-1 rounded-full bg-[#f5c417] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#111827]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#15803d]" aria-hidden="true" />
          Real
        </span>
        <span className="hidden xs:inline uppercase tracking-wide text-[#cbd5e1] font-bold">
          Balance:
        </span>
        <span className="font-mono font-black text-[#fde047] tabular-nums">
          {formatMoney(activeAmount, country)}
        </span>
        <span
          className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#7bc114] text-[#091202]"
          aria-hidden="true"
        >
          <Plus className="h-3 w-3 stroke-[3]" />
        </span>
      </button>
    );
  }

  return (
    <div
      title="Demo Account Balance (Practice Funds)"
      className="inline-flex items-center gap-1.5 rounded-full border border-[#2cd4a3]/45 bg-[#09181b] py-1 pl-2 pr-2.5 text-[10px] sm:text-xs font-extrabold text-white shadow-[0_2px_10px_rgba(44,212,163,0.14)] whitespace-nowrap"
    >
      <span className="inline-flex items-center gap-1 rounded-full bg-[#2cd4a3] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#042f2e]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#064e3b]" aria-hidden="true" />
        Demo
      </span>
      <span className="hidden xs:inline uppercase tracking-wide text-[#a7f3d0] font-bold">
        Balance:
      </span>
      <span className="font-mono font-black text-[#5eead4] tabular-nums">
        {formatMoney(activeAmount, country)}
      </span>
    </div>
  );
}

export function CrashDualBalanceBar({
  demoBalance,
  realBalance,
  accountMode,
  country = 'Kenya',
  isLoggedIn = false,
  onSelectMode: _onSelectMode,
  onOpenWallet,
}: CrashDualBalanceBarProps) {
  if (!isLoggedIn) {
    return null;
  }

  if (accountMode === 'real') {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenWallet}
          title="Real Wallet Balance"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0d1420]/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-inner hover:border-[#f5c417]/60 transition-colors cursor-pointer sm:text-[11px]"
        >
          <Wallet className="h-3 w-3 text-[#f5c417]" aria-hidden="true" />
          <span className="font-mono font-extrabold text-[#fde047] tabular-nums">
            {formatMoney(realBalance, country)}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenWallet}
          className="inline-flex items-center gap-1 rounded-full bg-[#7bc114] px-2.5 py-1 text-[10px] font-extrabold text-[#0b1404] shadow-sm hover:brightness-110 active:scale-95 cursor-pointer sm:text-[11px]"
        >
          <Plus className="h-3 w-3 stroke-[2.8]" aria-hidden="true" />
          <span>Deposit</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div
        title="Demo Practice Balance"
        className="inline-flex items-center gap-1.5 rounded-full border border-[#2cd4a3]/35 bg-[#08191c]/90 px-2.5 py-1 text-[10px] font-bold text-[#99f6e4] shadow-inner sm:text-[11px]"
      >
        <Coins className="h-3 w-3 text-[#2cd4a3]" aria-hidden="true" />
        <span className="uppercase tracking-wider text-[9px] font-black text-[#2cd4a3]">
          Fun Play
        </span>
        <span className="font-mono font-extrabold text-white tabular-nums">
          {formatMoney(demoBalance, country)}
        </span>
      </div>
    </div>
  );
}

