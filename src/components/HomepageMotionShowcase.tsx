import { useEffect, useState } from 'react';
import { ArrowUpRight, Flame, Trophy, Zap } from 'lucide-react';
import heroBasketballImg from '../assets/images/hero_basketball_arena_1794990275131.jpg';
import heroFootballImg from '../assets/images/hero_football_stadium_1794990277797.jpg';
import heroJackpotImg from '../assets/images/hero_jackpot_trophy_1794990277606.jpg';
import heroMultisportImg from '../assets/images/hero_multisport_events_1794990278048.jpg';
import heroTennisImg from '../assets/images/hero_tennis_court_1794990276435.jpg';

interface ShowcaseSlide {
  id: string;
  image: string;
  fallbackGradient: string;
  kicker: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  promoHighlight: string;
  action: 'matches' | 'livescore' | 'crash' | 'wallet';
}

const HERO_SLIDES: ShowcaseSlide[] = [
  {
    id: 'football',
    image: heroFootballImg,
    fallbackGradient: 'from-[#0f291e] via-[#13263a] to-[#0a111a]',
    kicker: 'Football · Champions & League Action · Live Odds',
    title: 'Matchday Odds on Every Top Fixture',
    subtitle: 'Real-time 1×2, Over/Under & live matchday markets across global football.',
    ctaLabel: 'Bet on Football',
    promoHighlight: 'Boosted Accumulator Returns',
    action: 'matches',
  },
  {
    id: 'jackpot',
    image: heroJackpotImg,
    fallbackGradient: 'from-[#281e09] via-[#1b2217] to-[#0b1118]',
    kicker: 'Jackpot & Crash Arena · Win Up To 5 Million',
    title: '5 Million Jackpot & Instant Multipliers',
    subtitle: 'Ride Aviator, JetX, Spaceman & weekly jackpot pools with live payouts.',
    ctaLabel: 'Open Crash & Jackpots',
    promoHighlight: 'Up To 5,000,000 Payout Pool',
    action: 'crash',
  },
  {
    id: 'basketball',
    image: heroBasketballImg,
    fallbackGradient: 'from-[#261613] via-[#172030] to-[#0b111a]',
    kicker: 'Basketball · Fast-Break Arena · Quarter & Game Lines',
    title: 'Court-Side Basketball & Slam Dunk Markets',
    subtitle: 'Full-game winners, totals and fast live momentum swings all night.',
    ctaLabel: 'Explore LiveScore',
    promoHighlight: 'Fast Payout Settlement',
    action: 'livescore',
  },
  {
    id: 'tennis',
    image: heroTennisImg,
    fallbackGradient: 'from-[#0c2138] via-[#14273c] to-[#09111b]',
    kicker: 'Tennis · Grand Slam Hardcourt · Set-by-Set Odds',
    title: 'Championship Tennis & Point Momentum',
    subtitle: 'Follow intense rallies and back match winners before every serve.',
    ctaLabel: 'View Live Matches',
    promoHighlight: 'Instant Live Odds Updates',
    action: 'matches',
  },
  {
    id: 'multisport',
    image: heroMultisportImg,
    fallbackGradient: 'from-[#102620] via-[#182436] to-[#0a1019]',
    kicker: 'Welcome & Real Deposit Bonus · From $6.00 USD',
    title: 'Multi-Sport Events & Real Wallet Rewards',
    subtitle: 'Track sprints, combat & global events with instant wallet deposits.',
    ctaLabel: 'Deposit & Claim Bonus',
    promoHighlight: 'Instant Wallet Deposit',
    action: 'wallet',
  },
];

interface MarqueeCard {
  id: string;
  image: string;
  fallbackGradient: string;
  category: string;
  headline: string;
  promoLine: string;
  action: ShowcaseSlide['action'];
}

const MARQUEE_CARDS: MarqueeCard[] = [
  {
    id: 'm-football',
    image: heroFootballImg,
    fallbackGradient: 'from-[#0f291e] to-[#0c1622]',
    category: 'Football',
    headline: 'Premier & European Nights',
    promoLine: 'Live 1×2 · Over/Under 2.5',
    action: 'matches',
  },
  {
    id: 'm-jackpot',
    image: heroJackpotImg,
    fallbackGradient: 'from-[#2b200a] to-[#111824]',
    category: 'Jackpot Bonus',
    headline: 'Win Up To 5 Million',
    promoLine: 'Aviator & Crash Jackpot Pool',
    action: 'crash',
  },
  {
    id: 'm-basketball',
    image: heroBasketballImg,
    fallbackGradient: 'from-[#251613] to-[#111926]',
    category: 'Basketball',
    headline: 'Night Arena Matchups',
    promoLine: 'Fast Quarters · Live Totals',
    action: 'livescore',
  },
  {
    id: 'm-tennis',
    image: heroTennisImg,
    fallbackGradient: 'from-[#0d2238] to-[#0e1622]',
    category: 'Tennis',
    headline: 'Grand Slam Stadium Action',
    promoLine: 'Match Winner · Set Spreads',
    action: 'matches',
  },
  {
    id: 'm-athletics',
    image: heroMultisportImg,
    fallbackGradient: 'from-[#0e261f] to-[#101824]',
    category: 'Bonus Opportunity',
    headline: 'Deposit $6+ & Play Real',
    promoLine: 'Instant Wallet Credit',
    action: 'wallet',
  },
];

interface HomepageMotionShowcaseProps {
  dataSaver?: boolean;
  onNavigateTab: (tab: 'crash' | 'ai-insights' | 'livescore') => void;
  onOpenWallet: () => void;
  onFocusMatches: () => void;
  onOpenLivescore: () => void;
}

export function HomepageMotionShowcase({
  dataSaver = false,
  onNavigateTab,
  onOpenWallet,
  onFocusMatches,
  onOpenLivescore,
}: HomepageMotionShowcaseProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [disableTransition, setDisableTransition] = useState(false);

  const extendedSlides = [...HERO_SLIDES, HERO_SLIDES[0]];
  const visibleLogicalIndex = slideIndex >= HERO_SLIDES.length ? 0 : slideIndex;

  useEffect(() => {
    if (dataSaver) return;
    const timer = window.setInterval(() => {
      setDisableTransition(false);
      setSlideIndex((prev) => (prev >= HERO_SLIDES.length ? 1 : prev + 1));
    }, 4200);
    return () => window.clearInterval(timer);
  }, [dataSaver]);

  const handleTrackTransitionEnd = () => {
    if (slideIndex >= HERO_SLIDES.length) {
      setDisableTransition(true);
      setSlideIndex(0);
    }
  };

  const triggerAction = (action: ShowcaseSlide['action']) => {
    if (action === 'crash') {
      onNavigateTab('crash');
    } else if (action === 'wallet') {
      onOpenWallet();
    } else if (action === 'livescore') {
      onOpenLivescore();
    } else {
      onFocusMatches();
    }
  };

  return (
    <section aria-label="Featured Sports & Promotions" className="px-3 pt-2.5 pb-2 space-y-2.5">
      {/* 1. Continuous Auto-Sliding Sports & Promo Hero Carousel */}
      <div className="relative overflow-hidden rounded-2xl border border-[#233144] bg-[#0b1119] shadow-xl">
        <div
          onTransitionEnd={handleTrackTransitionEnd}
          className={`flex ${
            disableTransition
              ? 'transition-none'
              : 'transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]'
          }`}
          style={{ transform: `translate3d(-${slideIndex * 100}%, 0, 0)` }}
        >
          {extendedSlides.map((slide, idx) => {
            const isCurrent = idx === slideIndex;
            return (
              <div
                key={`${slide.id}-${idx}`}
                className={`relative h-[225px] w-full shrink-0 overflow-hidden bg-gradient-to-br sm:h-[265px] lg:h-[300px] ${slide.fallbackGradient}`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  referrerPolicy="no-referrer"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className={`h-full w-full object-cover ${isCurrent ? 'lm-kenburns' : ''}`}
                />

                {/* Measured contrast scrim (>4.5:1 text legibility across all sports photos) */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#080d14]/95 via-[#080d14]/55 to-[#080d14]/20"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-[#080d14]/85 via-[#080d14]/35 to-transparent"
                />

                {/* Slide Copy & Single Primary Action */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-[#d9e5f0]">
                    <span className="truncate">{slide.kicker}</span>
                    <span className="font-mono text-[#f5c417] whitespace-nowrap shrink-0">
                      {slide.promoHighlight}
                    </span>
                  </div>

                  <div className="max-w-xl space-y-1.5 sm:space-y-2">
                    <h2
                      className="font-display text-xl font-extrabold leading-tight tracking-tight text-white sm:text-2xl lg:text-3xl"
                      style={{ textWrap: 'balance' }}
                    >
                      {slide.title}
                    </h2>
                    <p className="line-clamp-2 text-xs leading-relaxed text-[#cbd5e1] sm:text-sm">
                      {slide.subtitle}
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => triggerAction(slide.action)}
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-[#7bc114] px-4 py-2 text-xs font-extrabold text-[#0b1404] transition-transform hover:bg-[#8cd61e] active:scale-[0.98] cursor-pointer whitespace-nowrap sm:text-sm"
                      >
                        <span>{slide.ctaLabel}</span>
                        <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continuous Slide Progress Indicators */}
        <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 sm:bottom-3.5 sm:right-5">
          {HERO_SLIDES.map((s, idx) => {
            const active = idx === visibleLogicalIndex;
            return (
              <button
                key={s.id}
                type="button"
                aria-label={`Show ${s.id} highlight`}
                onClick={() => {
                  setDisableTransition(false);
                  setSlideIndex(idx);
                }}
                className="flex min-h-[36px] items-center px-0.5 cursor-pointer"
              >
                <span className="relative block h-1.5 w-7 overflow-hidden rounded-full bg-white/25 sm:w-9">
                  {active && (
                    <span
                      key={`prog-${slideIndex}`}
                      className="lm-slide-progress absolute inset-0 rounded-full bg-[#7bc114]"
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Continuous Non-Stop Moving Sports & Promotional Banner Marquee */}
      <div className="relative overflow-hidden rounded-xl border border-[#223043] bg-[#0e151f] py-2">
        <div className="lm-marquee-track gap-2.5 px-2.5">
          {[...MARQUEE_CARDS, ...MARQUEE_CARDS].map((card, i) => (
            <button
              key={`${card.id}-${i}`}
              type="button"
              onClick={() => triggerAction(card.action)}
              className={`group relative h-[96px] w-[215px] shrink-0 overflow-hidden rounded-xl border border-[#28384d] bg-gradient-to-br text-left transition-transform active:scale-[0.98] cursor-pointer sm:h-[108px] sm:w-[250px] ${card.fallbackGradient}`}
            >
              <img
                src={card.image}
                alt={`${card.category} - ${card.headline}`}
                referrerPolicy="no-referrer"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#070b12]/95 via-[#070b12]/50 to-[#070b12]/15"
              />
              <div className="absolute inset-0 flex flex-col justify-between p-2.5">
                <span className="text-[10px] font-bold tracking-wide text-[#f5c417]">
                  {card.category}
                </span>
                <div>
                  <p className="truncate font-display text-sm font-extrabold leading-tight text-white">
                    {card.headline}
                  </p>
                  <p className="truncate text-[10px] font-medium text-[#cbd5e1]">
                    {card.promoLine}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Animated Promotional Opportunities Banner (Bonuses, Jackpots & Crash Multipliers) */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onNavigateTab('crash')}
          className="lm-shimmer-sweep flex min-h-[60px] items-center justify-between gap-3 rounded-xl border border-[#4f3275]/60 px-4 py-2.5 text-left transition-transform active:scale-[0.99] cursor-pointer"
          style={{
            background:
              'radial-gradient(circle at 22% 50%, rgba(168, 85, 247, 0.35), transparent 55%), linear-gradient(95deg, #0d071c 0%, #241046 52%, #10172b 100%)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="lm-float-gentle flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#f5c417]/70 bg-[#2d1358] text-[#fde047]">
              <Trophy className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-wide text-[#f5c417]">
                Jackpot &amp; Crash Arena
              </p>
              <p className="truncate font-display text-sm font-black text-white">
                WIN UP TO 5 MILLION · Aviator &amp; Crash
              </p>
            </div>
          </div>
          <Flame className="h-4 w-4 shrink-0 text-[#f5c417]" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onOpenWallet}
          className="lm-shimmer-sweep flex min-h-[60px] items-center justify-between gap-3 rounded-xl border border-[#245946]/70 px-4 py-2.5 text-left transition-transform active:scale-[0.99] cursor-pointer"
          style={{
            background:
              'radial-gradient(circle at 80% 45%, rgba(123, 193, 20, 0.25), transparent 55%), linear-gradient(95deg, #0b1f1a 0%, #102a24 55%, #0e1726 100%)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="lm-float-gentle flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#7bc114]/70 bg-[#123328] text-[#98e02a]">
              <Zap className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-wide text-[#98e02a]">
                Real Money &amp; Bonus Opportunity
              </p>
              <p className="truncate font-display text-sm font-black text-white">
                Instant Wallet Deposit from $6.00 USD
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-[#98e02a]" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
