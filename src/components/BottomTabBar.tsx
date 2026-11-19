import { FileText, Home, PlayCircle, ReceiptText, User } from 'lucide-react';
import { BottomNavTab } from '../types';

interface BottomTabBarProps {
  activeTab: BottomNavTab;
  slipCount: number;
  liveCount?: number;
  onSelectTab: (tab: BottomNavTab) => void;
}

export function BottomTabBar({
  activeTab,
  slipCount,
  liveCount = 0,
  onSelectTab,
}: BottomTabBarProps) {
  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-30 h-[62px] border-t border-[#232d3b] bg-[#141b24]/95 backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto grid h-full max-w-6xl grid-cols-5 items-center">
        {/* Home */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'home' ? 'text-[#7bc114]' : 'text-[#9aa7b8] hover:text-white'
          }`}
        >
          <Home className="h-5 w-5" aria-hidden="true" />
          <span>Home</span>
        </button>

        {/* Live (80) */}
        <button
          type="button"
          onClick={() => onSelectTab('live')}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'live' ? 'text-[#7bc114]' : 'text-[#9aa7b8] hover:text-white'
          }`}
        >
          <PlayCircle className="h-5 w-5" aria-hidden="true" />
          <span>Live ({liveCount})</span>
        </button>

        {/* Center Floating Yellow Betslip Button */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            aria-label="Open betslip"
            onClick={() => onSelectTab('my-bets')}
            className="relative -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#f5c417] text-[#111827] shadow-[0_6px_20px_rgba(245,196,23,0.38)] ring-4 ring-[#141b24] transition-transform active:scale-95 cursor-pointer"
          >
            <ReceiptText className="h-6 w-6" aria-hidden="true" />
            {slipCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#7bc114] px-1 font-mono text-[10px] font-extrabold text-[#0b1404] tabular-nums">
                {slipCount}
              </span>
            )}
          </button>
        </div>

        {/* My Bets */}
        <button
          type="button"
          onClick={() => onSelectTab('my-bets')}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'my-bets' ? 'text-[#7bc114]' : 'text-[#9aa7b8] hover:text-white'
          }`}
        >
          <FileText className="h-5 w-5" aria-hidden="true" />
          <span>My Bets</span>
        </button>

        {/* Profile */}
        <button
          type="button"
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'profile' || activeTab === 'wallet'
              ? 'text-[#7bc114]'
              : 'text-[#9aa7b8] hover:text-white'
          }`}
        >
          <User className="h-5 w-5" aria-hidden="true" />
          <span>Profile</span>
        </button>
      </div>
    </nav>
  );
}
