import type { ActionStatus, Recommendation, UsageRecord } from '@/types';
import { formatCompact, formatPercent } from '@/utils';

interface SummaryTabProps {
  executiveSummary: string;
  isGenuineAlert: boolean;
  alertRecord: UsageRecord;
  selectedRecommendation: Recommendation;
  actionCounts: Record<ActionStatus, number>;
  orgEfficiencyScore: number;
  orgValueRate: number;
  reclaimableTokens: number;
  reclaimableTokenShare: number;
  watchlistCount: number;
  onGenerate: () => void;
}

export function SummaryTab({
  executiveSummary,
  isGenuineAlert,
  alertRecord,
  selectedRecommendation,
  actionCounts,
  orgEfficiencyScore,
  orgValueRate,
  reclaimableTokens,
  reclaimableTokenShare,
  watchlistCount,
  onGenerate,
}: SummaryTabProps) {
  return (
    <section className="glass-panel p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Executive readout</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">
            One board-ready view of spend, outcomes, and the next action.
          </h2>
        </div>
        <button
          onClick={onGenerate}
          className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.16]"
        >
          Generate summary
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="ctcc-kpi">
          <span className="ctcc-kpi__label">Est. reclaimable tokens</span>
          <strong>{formatCompact(reclaimableTokens)}</strong>
          <span className="ctcc-kpi__meta">{reclaimableTokenShare}% of monitored spend</span>
        </div>
        <div className="ctcc-kpi">
          <span className="ctcc-kpi__label">Cost per outcome index</span>
          <strong>{orgEfficiencyScore}</strong>
          <span className="ctcc-kpi__meta">lower is stronger efficiency</span>
        </div>
        <div className="ctcc-kpi">
          <span className="ctcc-kpi__label">Outcome rate</span>
          <strong>{formatPercent(orgValueRate)}</strong>
          <span className="ctcc-kpi__meta">value realized from usage</span>
        </div>
        <div className="ctcc-kpi">
          <span className="ctcc-kpi__label">Watchlist segments</span>
          <strong>{watchlistCount}</strong>
          <span className="ctcc-kpi__meta">{actionCounts.Done} actions complete</span>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Insight to action path
          </p>
          <ol className="mt-4 space-y-4 text-sm leading-6 text-slate-300">
            <li>
              <span className="ctcc-path-step">1 &middot; Insight</span>
              <p className="mt-1 text-slate-200">
                {isGenuineAlert
                  ? `${alertRecord.businessUnit} and ${alertRecord.copilotName} are the clearest cost-outcome risk.`
                  : `All segments are operating within efficient range. ${alertRecord.businessUnit} carries the highest index at ${alertRecord.costPerOutcomeIndex.toFixed(2)}, which remains acceptable.`}
              </p>
            </li>
            <li>
              <span className="ctcc-path-step">2 &middot; Recommendation</span>
              <p className="mt-1 text-slate-200">{selectedRecommendation.title}.</p>
            </li>
            <li>
              <span className="ctcc-path-step">3 &middot; Action</span>
              <p className="mt-1 text-slate-200">
                {actionCounts['In progress']} active, {actionCounts.Blocked} blocked, and{' '}
                {actionCounts.Done} complete.
              </p>
            </li>
          </ol>
        </div>

        <div className="summary-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Board narrative
          </p>
          {executiveSummary ? (
            <p className="mt-3 text-base leading-7 text-slate-200">{executiveSummary}</p>
          ) : (
            <p className="mt-3 text-base leading-7 text-slate-400">
              Generate a summary to package the current insight, selected recommendation, and
              action progress into a single executive narrative.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
