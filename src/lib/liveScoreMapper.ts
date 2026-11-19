import { LiveScoreMatch, MatchItem, PopularBetItem } from '../types';

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function parseWinRatio(record: string): number | null {
  const parts = record.split('-').map((p) => Number(p.trim()));
  if (parts.length < 2 || parts.some((n) => !Number.isFinite(n))) return null;
  const wins = parts[0];
  const draws = parts.length >= 3 ? parts[1] : 0;
  const losses = parts.length >= 3 ? parts[2] : parts[1];
  const total = wins + draws + losses;
  if (total <= 0) return null;
  return (wins + draws * 0.45) / total;
}

function deriveReferenceOdds(m: LiveScoreMatch): { home: number; draw: number; away: number } {
  if (m.odds?.home && m.odds?.draw && m.odds?.away) {
    return {
      home: m.odds.home,
      draw: m.odds.draw,
      away: m.odds.away,
    };
  }

  const hRatio = parseWinRatio(m.homeTeam.record);
  const aRatio = parseWinRatio(m.awayTeam.record);
  const seed = hashString(m.id);

  let homeProb = 0.41;
  let drawProb = 0.27;
  let awayProb = 0.32;

  if (hRatio !== null && aRatio !== null) {
    const diff = Math.max(-0.45, Math.min(0.45, hRatio - aRatio));
    homeProb = Math.max(0.16, Math.min(0.72, 0.42 + diff * 0.52));
    drawProb = Math.max(0.18, 0.29 - Math.abs(diff) * 0.16);
    awayProb = Math.max(0.12, 1 - homeProb - drawProb);
  } else {
    const shift = ((seed % 21) - 10) * 0.015;
    homeProb = Math.max(0.22, Math.min(0.62, 0.42 + shift));
    drawProb = 0.27;
    awayProb = Math.max(0.16, 1 - homeProb - drawProb);
  }

  // Standard 5% sportsbook overround
  const margin = 1.05;
  return {
    home: Number(Math.max(1.12, Math.min(18, 1 / (homeProb * margin))).toFixed(2)),
    draw: Number(Math.max(2.35, Math.min(12, 1 / (drawProb * margin))).toFixed(2)),
    away: Number(Math.max(1.12, Math.min(18, 1 / (awayProb * margin))).toFixed(2)),
  };
}

export function formatActualLocalKickoff(isoDate: string, fallback?: string): string {
  const dt = new Date(isoDate);
  if (Number.isNaN(dt.getTime())) return fallback || '--:--';

  const now = new Date();
  const sameDay =
    dt.getFullYear() === now.getFullYear() &&
    dt.getMonth() === now.getMonth() &&
    dt.getDate() === now.getDate();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    dt.getFullYear() === tomorrow.getFullYear() &&
    dt.getMonth() === tomorrow.getMonth() &&
    dt.getDate() === tomorrow.getDate();

  const timeStr = dt.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (sameDay) return `Today, ${timeStr}`;
  if (isTomorrow) return `Tomorrow, ${timeStr}`;

  const dateStr = dt.toLocaleDateString([], {
    day: '2-digit',
    month: 'short',
  });
  return `${dateStr}, ${timeStr}`;
}

export function formatKickoffCountdown(isoDate: string, nowMs: number): string | null {
  const target = new Date(isoDate).getTime();
  if (!Number.isFinite(target)) return null;
  const diffMs = target - nowMs;
  if (diffMs <= 0 || diffMs > 48 * 3600_000) return null;
  const totalMins = Math.floor(diffMs / 60_000);
  if (totalMins < 1) return 'Starting now';
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs === 0) return `In ${mins}m`;
  return `In ${hrs}h ${String(mins).padStart(2, '0')}m`;
}

export function mapLiveScoreToMatchItem(m: LiveScoreMatch): MatchItem {
  const odds = deriveReferenceOdds(m);
  const seed = hashString(m.id);

  const invHomeDraw = 1 / odds.home + 1 / odds.draw;
  const invHomeAway = 1 / odds.home + 1 / odds.away;
  const invDrawAway = 1 / odds.draw + 1 / odds.away;

  const overOdds = Number((1.65 + (seed % 42) * 0.01).toFixed(2));
  const underOdds = Number((2.22 - (seed % 42) * 0.01).toFixed(2));

  const marketCount = 24 + (seed % 48);

  return {
    id: `ls-${m.id}`,
    rawEventId: m.id,
    code: m.id.slice(-4),
    league: m.league,
    leagueSlug: m.leagueSlug,
    country: m.venue || m.league,
    kickoff: formatActualLocalKickoff(m.date, m.kickoffLabel),
    dateIso: m.date,
    minute: m.clock || m.statusText,
    statusText: m.statusText,
    state: m.state,
    venue: m.venue,
    scoreHome: m.homeTeam.score ?? undefined,
    scoreAway: m.awayTeam.score ?? undefined,
    isLiveDemo: m.state === 'in',
    isUpcoming: m.state === 'pre',
    isFeatured: m.state !== 'post',
    marketsCount: marketCount,
    homeTeamId: m.homeTeam.id,
    awayTeamId: m.awayTeam.id,
    homeTeam: m.homeTeam.name,
    awayTeam: m.awayTeam.name,
    homeCode: m.homeTeam.abbreviation,
    awayCode: m.awayTeam.abbreviation,
    homeLogo: m.homeTeam.logo,
    awayLogo: m.awayTeam.logo,
    homeColors: [`#${m.homeTeam.color || '253141'}`, '#111827'],
    awayColors: [`#${m.awayTeam.color || '253141'}`, '#111827'],
    keyEvents: m.keyEvents,
    odds,
    doubleChance: {
      homeOrDraw: Number(Math.max(1.03, 1 / Math.min(0.97, invHomeDraw)).toFixed(2)),
      homeOrAway: Number(Math.max(1.03, 1 / Math.min(0.97, invHomeAway)).toFixed(2)),
      drawOrAway: Number(Math.max(1.03, 1 / Math.min(0.97, invDrawAway)).toFixed(2)),
    },
    overUnderLine: 2.5,
    overUnder25: {
      over: overOdds,
      under: underOdds,
    },
  };
}

export function buildPopularBetsFromMatches(matches: MatchItem[]): PopularBetItem[] {
  const candidates = matches.filter((m) => m.state !== 'post').slice(0, 5);
  return candidates.map((m, idx) => {
    const pickHome = m.odds.home <= m.odds.away;
    const selection = pickHome ? '1' : '2';
    const odds = pickHome ? m.odds.home : m.odds.away;
    return {
      id: `real-pop-${m.id}-${idx}`,
      matchId: m.id,
      matchLabel: `${m.homeTeam} vs ${m.awayTeam}`,
      market: '1x2',
      pickLabel: pickHome ? m.homeTeam : m.awayTeam,
      selection,
      odds,
      fractionalOdds: `${odds.toFixed(2)}`,
    };
  });
}
