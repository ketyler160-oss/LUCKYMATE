import { useEffect } from 'react';
import {
  Award,
  Check,
  CircleDot,
  Clock,
  Cpu,
  Headphones,
  Layers,
  Moon,
  Percent,
  Plane,
  PlaySquare,
  Shirt,
  Smartphone,
  Sparkles,
  Sun,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { CountryOption, CrashGameId, TopCategoryTab } from '../types';

interface NavigationDrawerProps {
  open: boolean;
  country: CountryOption;
  theme: 'dark' | 'light';
  dataSaver: boolean;
  onClose: () => void;
  onSelectCategory: (tab: TopCategoryTab) => void;
  onOpenCrashGame: (gameId: CrashGameId) => void;
  onOpenAviator: () => void;
  onOpenDownloadApp: () => void;
  onOpenSupport: () => void;
  onOpenWallet: () => void;
  onToggleTheme: () => void;
  onToggleDataSaver: () => void;
}

export function NavigationDrawer({
  open,
  theme,
  dataSaver,
  onClose,
  onSelectCategory,
  onOpenCrashGame,
  onOpenAviator,
  onOpenDownloadApp,
  onOpenSupport,
  onOpenWallet,
  onToggleTheme,
  onToggleDataSaver,
}: NavigationDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const navigate = (fn: () => void) => {
    onClose();
    fn();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="Luckymate navigation menu"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-[2px] cursor-pointer"
      />

      {/* Drawer Panel matching attached menu layout */}
      <aside className="lm-drawer relative z-10 flex h-full w-[88vw] max-w-[360px] flex-col overflow-y-auto bg-[#121923] px-3.5 pb-8 pt-3 text-white shadow-2xl border-r border-[#212c3b]">
        {/* Top Close Strip */}
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="font-display text-base font-black uppercase tracking-[0.06em]">
            <span className="text-[#f5c417]">LUCKY</span>
            <span className="lm-drawer-title text-white">MATE</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-[#1e2836] hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Navigation Card */}
        <div className="lm-drawer-card rounded-2xl border border-[#232f40] bg-[#1a2330] py-2">
          <DrawerItem
            icon={<Shirt className="h-5 w-5" aria-hidden="true" />}
            label="Prematch"
            onClick={() => navigate(() => onSelectCategory('sports'))}
          />
          <DrawerItem
            icon={<PlaySquare className="h-5 w-5" aria-hidden="true" />}
            label="Live Games"
            onClick={() => navigate(() => onSelectCategory('in-play'))}
          />
          <DrawerItem
            icon={<Award className="h-5 w-5" aria-hidden="true" />}
            label="Jackpots"
            onClick={() => navigate(() => onSelectCategory('promos'))}
          />
          <DrawerItem
            icon={<Layers className="h-5 w-5" aria-hidden="true" />}
            label="Crash Games"
            onClick={() => navigate(() => onSelectCategory('crash'))}
          />
          <DrawerItem
            icon={<CircleDot className="h-5 w-5" aria-hidden="true" />}
            label="Casino"
            onClick={() => navigate(() => onSelectCategory('casino'))}
          />
          <DrawerItem
            icon={<Sparkles className="h-5 w-5" aria-hidden="true" />}
            label="Lucky Spins"
            onClick={() => navigate(() => onOpenCrashGame('fortune-spins'))}
          />
          <DrawerItem
            icon={<Zap className="h-5 w-5" aria-hidden="true" />}
            label="Luckymate Fasta"
            onClick={() => navigate(() => onSelectCategory('virtuals'))}
          />
          <DrawerItem
            icon={<Plane className="h-5 w-5" aria-hidden="true" />}
            label="Aviator"
            onClick={() => navigate(onOpenAviator)}
          />
          <DrawerItem
            icon={<Cpu className="h-5 w-5" aria-hidden="true" />}
            label="Shikisha Bet"
            onClick={() => navigate(() => onSelectCategory('ai-insights'))}
          />

          <div className="my-2 mx-4 border-t border-[#283546]" />

          <DrawerItem
            icon={<Clock className="h-5 w-5" aria-hidden="true" />}
            label="Live Score"
            onClick={() => navigate(() => onSelectCategory('livescore'))}
          />
          <DrawerItem
            icon={<Smartphone className="h-5 w-5" aria-hidden="true" />}
            label="Download App"
            onClick={() => navigate(onOpenDownloadApp)}
          />
          <DrawerItem
            icon={<Percent className="h-5 w-5" aria-hidden="true" />}
            label="Promotions"
            badge="New"
            onClick={() => navigate(() => onSelectCategory('promos'))}
          />
        </div>

        {/* Preferences Header */}
        <div className="mt-5 px-1.5">
          <h3 className="text-base font-bold text-white lm-drawer-title">Preferences</h3>
          <p className="text-xs text-[#94a3b8]">Customise your experience</p>
        </div>

        {/* Preferences Card: Display + Data Saver */}
        <div className="lm-drawer-card mt-2.5 rounded-2xl border border-[#232f40] bg-[#1a2330] p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-white lm-drawer-title">Display</p>
              <p className="text-xs text-[#94a3b8]">
                Switch between light theme and dark theme
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Current: ${theme === 'dark' ? 'Dark' : 'Light'} theme`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-[#243142] transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="h-6 w-6 text-[#f59e0b] fill-[#f59e0b]" aria-hidden="true" />
              ) : (
                <Moon className="h-6 w-6 text-[#38bdf8] fill-[#38bdf8]" aria-hidden="true" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-white lm-drawer-title">Data Saver</p>
              <p className="text-xs text-[#94a3b8]">Turn on to save data bundles</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={dataSaver}
              aria-label="Toggle Data Saver"
              onClick={onToggleDataSaver}
              className={`relative inline-flex h-7 w-13 shrink-0 items-center rounded-full px-1 transition-colors cursor-pointer ${
                dataSaver ? 'bg-[#7bc114]' : 'bg-[#2c3a4c]'
              }`}
            >
              {dataSaver && (
                <Check className="h-3.5 w-3.5 text-white stroke-[3]" aria-hidden="true" />
              )}
              <span
                className={`ml-auto h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  dataSaver ? 'translate-x-0' : '-translate-x-6'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Get Help Section */}
        <div className="mt-5 px-1.5">
          <h3 className="text-base font-bold text-white lm-drawer-title">Get Help</h3>
        </div>
        <div className="lm-drawer-card mt-2 rounded-2xl border border-[#232f40] bg-[#1a2330] py-1.5">
          <DrawerItem
            icon={<Headphones className="h-5 w-5" aria-hidden="true" />}
            label="Support & Account Rules"
            onClick={() => navigate(onOpenSupport)}
          />
          <DrawerItem
            icon={<Wallet className="h-5 w-5" aria-hidden="true" />}
            label="Deposit & Withdraw"
            onClick={() => navigate(onOpenWallet)}
          />
        </div>
      </aside>
    </div>
  );
}

function DrawerItem({
  icon,
  label,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[46px] w-full items-center gap-3.5 px-4 py-2 text-left text-[15px] font-medium text-[#e2e8f0] hover:bg-[#232f40] hover:text-white transition-colors cursor-pointer lm-drawer-row"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#cbd5e1]">
        {icon}
      </span>
      <span className="truncate">{label}</span>
      {badge && (
        <span className="ml-1 rounded-md bg-[#454d23] px-2.5 py-0.5 text-[11px] font-bold text-[#e4ee5a]">
          {badge}
        </span>
      )}
    </button>
  );
}
