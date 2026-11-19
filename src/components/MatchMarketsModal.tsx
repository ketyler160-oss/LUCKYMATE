import { useEffect, useState } from 'react';
import { BarChart2, Cpu, Users, X } from 'lucide-react';
import { analyzeMatchWithAI, fetchMatchSummaryDetails } from '../lib/api';
import {
  MarketSelection,
  MatchAnalysisResult,
  MatchItem,
  MatchSummaryDetailsResponse,
  SlipPick,
} from '../types';
import { TeamCrest } from './BrandVisuals';

interface MatchMarketsModalProps {
  match: MatchItem;
  activePick?: SlipPick;
  onTogglePick: (match: MatchItem, selection: MarketSelection) => void;
  onClose: () => void;
}

export function MatchMarketsModal({
  match,
  activePick,
  onTogglePick,
  onClose,
}: MatchMarketsModalProps) {
  const [modalTab, setModalTab] = useState<'markets' | 'players'>('markets');
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MatchAnalysisResult | null>(null);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [playersError, setPlayersError] = useState<string | null>(null);
  const [matchSummary, setMatchSummary] = useState<MatchSummaryDetailsResponse | null>(null);

  useEffect(() => {
    if (modalTab !== 'players' || matchSummary || loadingPlayers) return;
    if (!match.rawEventId && !match.homeTeamId && !match.awayTeamId) return;

    setLoadingPlayers(true);
    setPlayersError(null);
    fetchMatchSummaryDetails({
      eventId: match.rawEventId || match.id,
      leagueSlug: match.leagueSlug,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      homeTeamName: match.homeTeam,
      awayTeamName: match.awayTeam,
      homeLogo: match.homeLogo,
      awayLogo: match.awayLogo,
    })
      .then((res) => setMatchSummary(res))
      .catch((err) => {
        setPlayersError(
          err instanceof Error ? err.message : 'Unable to load match players.'
        );
      })
      .finally(() => setLoadingPlayers(false));
  }, [modalTab, match, matchSummary, loadingPlayers]);

  const handleRunAi = async () => {
    setLoadingAi(true);
    setAiError(null);
    try {
      const res = await analyzeMatchWithAI({
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        league: match.league,
        homeOdds: match.odds.home,
        drawOdds: match.odds.draw,
        awayOdds: match.odds.away,
      });
      setAnalysis(res);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI analysis unavailable.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="lm-modal-pop max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-[#154542] bg-[#071e1e] p-5 shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-[#154542] pb-3.5">
          <div>
            <p className="text-xs font-medium text-[#8bb0ab]">
              {match.league} · {match.kickoff}
            </p>
            <h3 className="font-display text-lg font-bold text-white">
              {match.homeTeam} vs {match.awayTeam}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close match markets"
            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg bg-[#134843] text-white hover:bg-[#195c55] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-around rounded-xl border border-[#154542] bg-[#0b2c2a] p-4">
          <div className="flex flex-col items-center gap-1.5 text-center max-w-[120px]">
            {match.homeLogo ? (
              <img
                src={match.homeLogo}
                alt={`${match.homeTeam} crest`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="h-10 w-10 object-contain"
              />
            ) : (
              <TeamCrest code={match.homeCode} colors={match.homeColors} />
            )}
            <span className="text-xs font-bold text-white leading-tight">{match.homeTeam}</span>
          </div>
          <div className="flex flex-col items-center">
            {match.state && match.state !== 'pre' ? (
              <>
                <span className="font-mono text-xl font-black text-[#f5c417] tabular-nums">
                  {match.scoreHome ?? 0} - {match.scoreAway ?? 0}
                </span>
                <span className="mt-0.5 rounded bg-[#134843] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#7bc114]">
                  {match.minute || match.statusText || 'LIVE'}
                </span>
              </>
            ) : (
              <span className="font-display text-sm font-bold text-[#8bb0ab]">VS</span>
            )}
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center max-w-[120px]">
            {match.awayLogo ? (
              <img
                src={match.awayLogo}
                alt={`${match.awayTeam} crest`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="h-10 w-10 object-contain"
              />
            ) : (
              <TeamCrest code={match.awayCode} colors={match.awayColors} />
            )}
            <span className="text-xs font-bold text-white leading-tight">{match.awayTeam}</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-[#0b2c2a] p-1">
          <button
            type="button"
            onClick={() => setModalTab('markets')}
            className={`min-h-[36px] rounded-md text-xs font-bold transition-colors cursor-pointer ${
              modalTab === 'markets'
                ? 'bg-[#7bc114] text-[#0b1404]'
                : 'text-[#8bb0ab] hover:text-white'
            }`}
          >
            Match Markets &amp; AI
          </button>
          <button
            type="button"
            onClick={() => setModalTab('players')}
            className={`inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
              modalTab === 'players'
                ? 'bg-[#f6d663] text-[#111c17]'
                : 'text-[#8bb0ab] hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Real Players &amp; Events</span>
          </button>
        </div>

        {modalTab === 'players' ? (
          <div className="mt-4 space-y-3">
            {loadingPlayers ? (
              <div className="space-y-2 py-4">
                <div className="h-4 w-44 animate-pulse rounded bg-[#154542]" />
                <div className="h-16 w-full animate-pulse rounded bg-[#0b2c2a]" />
                <div className="h-16 w-full animate-pulse rounded bg-[#0b2c2a]" />
              </div>
            ) : playersError ? (
              <p className="rounded-lg border border-[#6d3838] bg-[#2a1414] p-3 text-xs text-[#fecaca]">
                {playersError}
              </p>
            ) : matchSummary ? (
              <div className="space-y-3">
                {matchSummary.keyEvents.length > 0 && (
                  <div className="rounded-xl border border-[#154542] bg-[#0b2c2a] p-3 space-y-1.5">
                    <p className="text-xs font-bold text-[#f6d663]">Official Match Timeline</p>
                    <ul className="space-y-1 max-h-36 overflow-y-auto text-[11px] text-[#d7ebe8]">
                      {matchSummary.keyEvents.map((ev, i) => (
                        <li key={`${ev.minute}-${i}`} className="flex items-start gap-2">
                          <span className="font-mono font-bold text-[#7bc114] shrink-0 tabular-nums">
                            {ev.minute || '•'}
                          </span>
                          <span>{ev.text || `${ev.type} — ${ev.playerName}`}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  {[matchSummary.homeTeam, matchSummary.awayTeam].map((team) => (
                    <div
                      key={team.name}
                      className="rounded-xl border border-[#154542] bg-[#0b2c2a] p-3 space-y-2"
                    >
                      <p className="border-b border-[#154542] pb-1.5 text-xs font-bold text-white">
                        {team.name}
                      </p>
                      {team.players.length === 0 ? (
                        <p className="text-[11px] text-[#8bb0ab]">
                          Squad lineups are not yet released for this fixture.
                        </p>
                      ) : (
                        <ul className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-[11px]">
                          {team.players.map((pl) => (
                            <li
                              key={`${team.name}-${pl.id}`}
                              className="flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <span className="font-mono font-bold text-[#f6d663] mr-1.5 tabular-nums">
                                  #{pl.jersey}
                                </span>
                                <span className="text-white font-medium">{pl.name}</span>
                                {pl.nationality && (
                                  <span className="ml-1.5 text-[10px] text-[#8bb0ab]">
                                    ({pl.nationality})
                                  </span>
                                )}
                              </div>
                              <span className="shrink-0 font-mono text-[10px] text-[#8bb0ab] tabular-nums">
                                {pl.position}
                                {pl.goals > 0 ? ` · ⚽${pl.goals}` : ''}
                                {pl.assists > 0 ? ` · A${pl.assists}` : ''}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#8bb0ab]">
                Player lineup data is published closer to kickoff.
              </p>
            )}
          </div>
        ) : (
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-xs font-bold text-[#8bb0ab]">1×2 Match Result</p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { key: '1', label: '1', odds: match.odds.home },
                  { key: 'X', label: 'X', odds: match.odds.draw },
                  { key: '2', label: '2', odds: match.odds.away },
                ] as const
              ).map((opt) => {
                const selected = activePick?.selection === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => onTogglePick(match, opt.key)}
                    className={`min-h-[44px] rounded-lg border px-2 py-2 text-xs font-bold tabular-nums cursor-pointer ${
                      selected
                        ? 'border-[#f6d663] bg-[#f6d663] text-[#111c17]'
                        : 'border-[#19534e] bg-[#134843] text-white hover:bg-[#195c55]'
                    }`}
                  >
                    <span className="block text-[10px] opacity-80">{opt.label}</span>
                    {opt.odds.toFixed(2)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-[#8bb0ab]">Double Chance (Illustrative)</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '1X', val: match.doubleChance.homeOrDraw },
                { label: '12', val: match.doubleChance.homeOrAway },
                { label: 'X2', val: match.doubleChance.drawOrAway },
              ].map((dc) => (
                <div
                  key={dc.label}
                  className="rounded-lg border border-[#154542] bg-[#0b2c2a] px-2 py-2 text-center text-xs font-bold text-white tabular-nums"
                >
                  <span className="block text-[10px] text-[#8bb0ab]">{dc.label}</span>
                  {dc.val.toFixed(2)}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-[#8bb0ab]">
              Total Goals {match.overUnderLine} (Illustrative)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onTogglePick(match, 'O')}
                className={`rounded-lg border px-3 py-2 text-center text-xs font-bold tabular-nums cursor-pointer ${
                  activePick?.selection === 'O'
                    ? 'border-[#f6d663] bg-[#f6d663] text-[#111c17]'
                    : 'border-[#19534e] bg-[#134843] text-white'
                }`}
              >
                <span className="block text-[10px] opacity-80">Over {match.overUnderLine}</span>
                {match.overUnder25.over.toFixed(2)}
              </button>
              <button
                type="button"
                onClick={() => onTogglePick(match, 'U')}
                className={`rounded-lg border px-3 py-2 text-center text-xs font-bold tabular-nums cursor-pointer ${
                  activePick?.selection === 'U'
                    ? 'border-[#f6d663] bg-[#f6d663] text-[#111c17]'
                    : 'border-[#19534e] bg-[#134843] text-white'
                }`}
              >
                <span className="block text-[10px] opacity-80">Under {match.overUnderLine}</span>
                {match.overUnder25.under.toFixed(2)}
              </button>
            </div>
          </div>

          <div className="border-t border-[#154542] pt-4">
            <button
              type="button"
              disabled={loadingAi}
              onClick={handleRunAi}
              className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg bg-[#f6d663] px-4 py-2 text-xs font-extrabold text-[#111c17] cursor-pointer hover:bg-[#fae07d] disabled:opacity-60"
            >
              <Cpu className="h-4 w-4" aria-hidden="true" />
              {loadingAi ? 'Analyzing Match...' : 'Run AI Match Insight'}
            </button>

            {aiError && <p className="mt-2 text-xs text-[#f87171]">{aiError}</p>}

            {analysis && (
              <div className="mt-3 rounded-xl border border-[#154542] bg-[#0b2c2a] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f6d663]">
                    <BarChart2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {analysis.headlineCall}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#2cd4a3] tabular-nums">
                    {analysis.confidencePercent}% ({analysis.confidenceLevel})
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[#d7ebe8]">{analysis.formSummary}</p>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-[11px] tabular-nums">
                  <div className="rounded bg-[#071e1e] py-1.5">
                    1: {analysis.probabilities.homeWin}%
                  </div>
                  <div className="rounded bg-[#071e1e] py-1.5">
                    X: {analysis.probabilities.draw}%
                  </div>
                  <div className="rounded bg-[#071e1e] py-1.5">
                    2: {analysis.probabilities.awayWin}%
                  </div>
                </div>
                <p className="text-[11px] text-[#8bb0ab]">{analysis.riskNote}</p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
