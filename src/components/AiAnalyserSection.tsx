import { useEffect, useState } from 'react';
import { AlertTriangle, BarChart2, Play, ShieldAlert, TrendingUp } from 'lucide-react';
import { SAMPLE_MATCHES } from '../data/matches';
import { analyzeMatchWithAI } from '../lib/api';
import { MatchAnalysisResult, MatchItem } from '../types';
import { AiRobotMascot } from './BrandVisuals';

interface AiAnalyserSectionProps {
  selectedMatch: MatchItem | null;
  onAnalysisComplete?: (result: MatchAnalysisResult) => void;
}

export function AiAnalyserSection({
  selectedMatch,
  onAnalysisComplete,
}: AiAnalyserSectionProps) {
  const [matchId, setMatchId] = useState<string>(selectedMatch?.id || SAMPLE_MATCHES[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MatchAnalysisResult | null>(null);

  const matchOptions =
    selectedMatch && !SAMPLE_MATCHES.some((m) => m.id === selectedMatch.id)
      ? [selectedMatch, ...SAMPLE_MATCHES]
      : SAMPLE_MATCHES;

  const currentMatch = matchOptions.find((m) => m.id === matchId) ?? matchOptions[0];

  const runAnalysis = async (match: MatchItem) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeMatchWithAI({
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        league: match.league,
        homeOdds: match.odds.home,
        drawOdds: match.odds.draw,
        awayOdds: match.odds.away,
      });
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to run AI match analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMatch) {
      setMatchId(selectedMatch.id);
      runAnalysis(selectedMatch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMatch]);

  return (
    <div className="space-y-4">
      <div className="lm-card flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AiRobotMascot className="h-16 w-14 shrink-0" />
          <div>
            <h2 className="font-display text-xl font-bold text-white">AI Football Insights</h2>
            <p className="text-xs text-[#9fb3c8]">
              Generate statistical probability models and match breakdowns
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label htmlFor="analyser-match-select" className="sr-only">
            Select fixture to analyze
          </label>
          <select
            id="analyser-match-select"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            className="min-h-[42px] rounded-lg border border-[#2a4954] bg-[#081322] px-3 py-2 text-sm text-white focus:border-[#22f06a] focus:outline-none"
          >
            {matchOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.homeTeam} vs {m.awayTeam} ({m.country || m.league})
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={loading}
            onClick={() => runAnalysis(currentMatch)}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#fde047] px-4 py-2 text-sm font-extrabold text-[#120e02] whitespace-nowrap shrink-0 transition-colors hover:bg-[#fef08a] disabled:opacity-60 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            {loading ? 'Analyzing...' : 'Run AI Analysis'}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-xl border border-[#6d3838] bg-[#2a1414] px-4 py-3 text-sm text-[#f9b4b4]"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lm-card rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#22f06a]">
            <span>Match Analysis</span>
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
          </div>
          <h3 className="mt-2 font-display text-lg font-bold text-white">Team Performance</h3>

          {loading ? (
            <div className="mt-4 space-y-2.5">
              <div className="h-3.5 w-full animate-pulse rounded bg-[#182940]" />
              <div className="h-3.5 w-5/6 animate-pulse rounded bg-[#182940]" />
              <div className="h-3.5 w-4/6 animate-pulse rounded bg-[#182940]" />
            </div>
          ) : analysis ? (
            <div className="mt-3 space-y-2.5">
              <p className="text-xs font-semibold text-[#fde047]">
                {analysis.headlineCall} · {analysis.league}
              </p>
              <p className="text-sm leading-relaxed text-[#c9d7e8]">{analysis.formSummary}</p>
            </div>
          ) : (
            <p className="mt-2.5 text-sm leading-relaxed text-[#9fb3c8]">
              Compare recent form, goals scored, goals conceded, and tactical matchup balance.
              Click Run AI Analysis above to generate a live breakdown.
            </p>
          )}
        </div>

        <div className="lm-card rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#22f06a]">
            <span>Statistical Model</span>
            <BarChart2 className="h-4 w-4" aria-hidden="true" />
          </div>
          <h3 className="mt-2 font-display text-lg font-bold text-white">Probability Estimates</h3>

          {loading ? (
            <div className="mt-4 space-y-3">
              <div className="h-6 w-full animate-pulse rounded bg-[#182940]" />
              <div className="h-6 w-full animate-pulse rounded bg-[#182940]" />
              <div className="h-6 w-full animate-pulse rounded bg-[#182940]" />
            </div>
          ) : analysis ? (
            <div className="mt-3.5 space-y-3">
              {[
                {
                  label: `${analysis.homeTeam} (1)`,
                  pct: analysis.probabilities.homeWin,
                  barClass: 'bg-[#22f06a]',
                },
                {
                  label: 'Draw (X)',
                  pct: analysis.probabilities.draw,
                  barClass: 'bg-[#fde047]',
                },
                {
                  label: `${analysis.awayTeam} (2)`,
                  pct: analysis.probabilities.awayWin,
                  barClass: 'bg-[#38bdf8]',
                },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#e2ecf7] truncate pr-2">{row.label}</span>
                    <span className="font-mono font-bold text-white tabular-nums">{row.pct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#16273f]">
                    <div
                      className={`h-full rounded-full ${row.barClass} transition-all duration-300`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2.5 text-sm leading-relaxed text-[#9fb3c8]">
              Displays estimated probabilities for Home Win (1), Draw (X), and Away Win (2) across
              selected fixtures.
            </p>
          )}
        </div>

        <div className="lm-card rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#22f06a]">
            <span>Risk Information</span>
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          </div>
          <h3 className="mt-2 font-display text-lg font-bold text-white">Prediction Confidence</h3>

          {loading ? (
            <div className="mt-4 space-y-2.5">
              <div className="h-4 w-1/2 animate-pulse rounded bg-[#182940]" />
              <div className="h-3.5 w-full animate-pulse rounded bg-[#182940]" />
              <div className="h-3.5 w-5/6 animate-pulse rounded bg-[#182940]" />
            </div>
          ) : analysis ? (
            <div className="mt-3 space-y-3">
              <p className="text-xs font-bold text-[#fde047]">
                Confidence: {analysis.confidencePercent}% ({analysis.confidenceLevel})
              </p>
              {analysis.keyFactors.length > 0 && (
                <ul className="space-y-1.5 text-xs leading-relaxed text-[#c9d7e8]">
                  {analysis.keyFactors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-mono text-[#22f06a]">0{idx + 1}.</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="border-t border-[#183044] pt-2.5 text-xs leading-relaxed text-[#9fb3c8]">
                {analysis.riskNote}
              </p>
            </div>
          ) : (
            <p className="mt-2.5 text-sm leading-relaxed text-[#9fb3c8]">
              Displays model certainty, key tactical factors, and variance caveats. No statistical
              prediction guarantees a match outcome.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
