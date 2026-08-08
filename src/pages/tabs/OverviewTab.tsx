import type { ProductComparison, Recommendation, UsageRecord } from '@/types';
import { DollarBills } from '@/components/DollarBills';
import {
  formatCompact,
  formatInteger,
  formatPercent,
  getPortfolioStatusTone,
  getTrendLabel,
} from '@/utils';

interface OverviewTabProps {
  isGenuineAlert: boolean;
  alertRecord: UsageRecord;
  onConvertAlert: () => void;
  productComparison: ProductComparison[];
  maxProductTokens: number;
  portfolioInsight: string;
  recommendations: Recommendation[];
  onCreateAction: (recommendation: Recommendation) => void;
  onViewInsights: () => void;
}

export function OverviewTab({
  isGenuineAlert,
  alertRecord,
  onConvertAlert,
  productComparison,
  maxProductTokens,
  portfolioInsight,
  recommendations,
  onCreateAction,
  onViewInsights,
}: OverviewTabProps) {
  return (
    <>
      <div className="glass-panel p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Copilot product comparison</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">
              Compare portfolio performance across all five Copilots.
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Evaluate where more adoption creates outcomes and where more usage only burns tokens.
          </p>
        </div>
        <div className="mt-5 space-y-4">
          <div className="portfolio-insight rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8fbaff]">
              AI portfolio insight
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{portfolioInsight}</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="portfolio-table min-w-[980px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th>Copilot</th>
                  <th>Active users</th>
                  <th>Adoption rate</th>
                  <th>Token usage</th>
                  <th>Completed workflows</th>
                  <th>Outcome rate</th>
                  <th>Cost per outcome index</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {productComparison.map((product) => {
                  const tokenIntensity = Math.round(
                    (product.totalTokens / maxProductTokens) * 100
                  );
                  const emphasizeRow =
                    product.highTokenLowValue ||
                    (tokenIntensity >= 80 && product.valueRealizationRate < 70);
                  const optimizationRecommendation =
                    recommendations.find(
                      (r) =>
                        r.id.includes(product.id) && r.id.includes('cost-outcome')
                    ) ??
                    recommendations.find((r) => r.id.includes(product.id)) ??
                    recommendations[0];

                  return (
                    <tr
                      key={product.id}
                      className={emphasizeRow ? 'portfolio-row--risk' : undefined}
                    >
                      <td>
                        <p className="font-semibold text-slate-50">{product.name}</p>
                        <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                          {product.shortName}
                        </p>
                        <p className="portfolio-copilot-lens">
                          Best suited for {product.lens}
                        </p>
                      </td>
                      <td>{formatInteger(product.activeUsers)}</td>
                      <td>{formatPercent(product.adoptionRate)}</td>
                      <td>
                        <p className="font-semibold text-slate-50">
                          {formatCompact(product.totalTokens)}
                        </p>
                        <div className="portfolio-token-bar mt-2">
                          <div
                            className="portfolio-token-bar__fill"
                            style={{ width: `${tokenIntensity}%` }}
                          />
                        </div>
                      </td>
                      <td>{formatInteger(product.workflows)}</td>
                      <td>{formatPercent(product.valueRealizationRate)}</td>
                      <td>
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-block w-9 font-semibold tabular-nums text-slate-50">
                            {product.costPerOutcomeIndex.toFixed(2)}
                          </span>
                          <DollarBills value={product.costPerOutcomeIndex} />
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-col items-start gap-2">
                          <span className={getPortfolioStatusTone(product.status)}>
                            {product.status}
                          </span>
                          {(product.status === 'Watchlist' ||
                            product.status === 'Low-value') && (
                            <button
                              type="button"
                              onClick={() => onCreateAction(optimizationRecommendation)}
                              className="ctcc-take-action-btn"
                            >
                              Create Action
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <section>
        <div className="glass-panel p-5">
          <p className="eyebrow">Narrative signal</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">
            Highest-impact insight in the current scope.
          </h2>
          <div
            className={`mt-5 rounded-xl border p-5 ${
              isGenuineAlert
                ? 'border-[#fbbf24]/40 bg-white/5'
                : 'border-[#4ade80]/40 bg-white/5'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p
                  className={`text-sm font-semibold uppercase tracking-[0.2em] ${
                    isGenuineAlert ? 'text-amber-300' : 'text-emerald-300'
                  }`}
                >
                  {isGenuineAlert
                    ? 'High-token / low-value alert'
                    : 'Portfolio signal — no active concern'}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-50">
                  {alertRecord.businessUnit} using {alertRecord.copilotName}
                </h3>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  isGenuineAlert ? 'bg-white/10 text-amber-200' : 'bg-white/10 text-emerald-200'
                }`}
              >
                Cost/Outcome {alertRecord.costPerOutcomeIndex.toFixed(2)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              {isGenuineAlert
                ? `${formatCompact(alertRecord.totalTokens)} tokens across ${formatInteger(alertRecord.copilotSessions)} sessions are only delivering ${formatPercent(alertRecord.valueRealizationRate)} outcome rate. Token trend is ${getTrendLabel(alertRecord.tokenTrend)} versus the prior review period.`
                : `${formatCompact(alertRecord.totalTokens)} tokens across ${formatInteger(alertRecord.copilotSessions)} sessions are delivering ${formatPercent(alertRecord.valueRealizationRate)} outcome rate — the highest index in the current lens at ${alertRecord.costPerOutcomeIndex.toFixed(2)}, still within efficient range. Token trend is ${getTrendLabel(alertRecord.tokenTrend)} versus the prior review period.`}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="insight-pill">
                {formatInteger(alertRecord.activeUsers)} active users
              </span>
              <span className="insight-pill">
                {formatInteger(Math.round(alertRecord.tokensPerActiveUser))} tokens per user
              </span>
              <span className="insight-pill">
                {formatInteger(alertRecord.completedWorkflows)} completed workflows
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                onClick={onConvertAlert}
                className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.16]"
              >
                Convert alert into action
              </button>
              <button
                onClick={onViewInsights}
                className="inline-flex items-center justify-center rounded-lg border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:bg-white/10"
              >
                View insights
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
