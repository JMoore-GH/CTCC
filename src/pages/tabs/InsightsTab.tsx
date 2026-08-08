import type {
  CopilotDefinition,
  MatrixCellDetails,
  MatrixRow,
  MatrixWatchlistRow,
  Recommendation,
} from '@/types';
import { DollarBills } from '@/components/DollarBills';
import {
  formatCompact,
  formatInteger,
  formatPercent,
  getMatrixBandLabel,
  getMatrixTooltipClass,
  getMatrixTone,
  getPortfolioStatusTone,
  getTrendLabel,
} from '@/utils';

interface InsightsTabProps {
  matrixRows: MatrixRow[];
  copilots: CopilotDefinition[];
  topWatchlist: MatrixWatchlistRow[];
  selectedMatrixCellKey: string | null;
  onCellSelect: (key: string) => void;
  selectedMatrixCell: MatrixCellDetails | null;
  selectedMatrixNarrative: string;
  recommendations: Recommendation[];
  selectedRecommendation: Recommendation;
  onSelectRecommendation: (id: string) => void;
  onStageAction: (recommendation: Recommendation) => void;
}

export function InsightsTab({
  matrixRows,
  copilots,
  topWatchlist,
  selectedMatrixCellKey: _selectedMatrixCellKey,
  onCellSelect,
  selectedMatrixCell,
  selectedMatrixNarrative,
  recommendations,
  selectedRecommendation,
  onSelectRecommendation,
  onStageAction,
}: InsightsTabProps) {
  const bestAvgIndex = matrixRows.length
    ? Math.min(...matrixRows.map((row) => row.avgIndex))
    : null;

  return (
    <section className="grid gap-6">
      <div className="glass-panel relative z-20 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Cost-to-outcome by Business unit</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">
              Lower index values indicate stronger outcome efficiency.
            </h2>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-[#fbbf24]/35 bg-white/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                Top watchlist
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-200">
                The highest-risk combinations ranked by cost pressure, token intensity, and
                weak outcomes.
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Rank by cost per outcome index
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Rank</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Business Unit</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Copilot</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Cost per Outcome Index</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Adoption</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Outcome</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Recommended Action</th>
                </tr>
              </thead>
              <tbody>
                {topWatchlist.length > 0 ? (
                  topWatchlist.map((row) => (
                    <tr
                      key={`${row.businessUnit}-${row.copilotId}`}
                      className="border-t border-white/10"
                    >
                      <td className="px-3 py-3 text-sm font-semibold text-slate-100">{row.rank}</td>
                      <td className="px-3 py-3 text-sm text-slate-200">{row.businessUnit}</td>
                      <td className="px-3 py-3 text-sm text-slate-200">{row.copilotName}</td>
                      <td className="px-3 py-3 text-sm font-semibold text-slate-100">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-block w-9 tabular-nums">
                            {row.costPerOutcomeIndex.toFixed(2)}
                          </span>
                          <DollarBills value={row.costPerOutcomeIndex} />
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-200">
                        {formatPercent(row.adoptionRate)}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-200">
                        {formatPercent(row.outcomeRate)}
                      </td>
                      <td className="px-3 py-3 text-sm leading-6 text-slate-200">
                        {row.recommendedAction}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-3 py-4 text-sm text-slate-400" colSpan={7}>
                      No watchlist rows in the current scope.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
          <span className="rounded-full border border-[#22c55e]/50 bg-white/5 px-3 py-1 text-[#15803d]">
            &lt; 1.0 = Strong
          </span>
          <span className="rounded-full border border-[#f59e0b]/50 bg-white/5 px-3 py-1 text-[#b45309]">
            1.0–1.5 = Monitor
          </span>
          <span className="rounded-full border border-[#ef4444]/50 bg-white/5 px-3 py-1 text-[#dc2626]">
            1.5–2.0 = Watchlist
          </span>
          <span className="rounded-full border border-[#dc2626]/70 bg-white/5 px-3 py-1 text-[#991b1b]">
            &gt; 2.0 = Cost concern
          </span>
        </div>

        <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-50">
          Red cells show where token consumption is high relative to observable value.
        </p>

        <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1">
            <table className="w-full border-separate border-spacing-y-1.5 text-left">
            <thead>
              <tr>
                <th className="px-2 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Business Unit
                </th>
                {copilots.map((copilot) => (
                  <th
                    key={copilot.id}
                    className="px-1.5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
                  >
                    {copilot.shortName}
                  </th>
                ))}
                <th className="px-2 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Avg Index
                </th>
              </tr>
            </thead>
            <tbody>
              {matrixRows.map((row) => (
                <tr key={row.businessUnit}>
                  <td className="rounded-l-xl bg-white/5 px-2 align-middle shadow-sm">
                    <p className="text-sm font-semibold text-slate-100">
                      {row.businessUnit}
                    </p>
                  </td>
                  {row.cells.map((cell, copilotIndex) => (
                    <td
                      key={`${row.businessUnit}-${copilots[copilotIndex]?.id ?? copilotIndex}`}
                      className="px-1 align-middle"
                    >
                      {cell ? (
                        <button
                          type="button"
                          onClick={() =>
                            onCellSelect(`${row.businessUnit}-${cell.copilotId}`)
                          }
                          className={`group relative block w-full rounded-lg border px-2 py-2 text-center font-semibold tabular-nums transition focus:outline-none focus:ring-2 focus:ring-slate-900/20 ${getMatrixTone(cell.costPerOutcomeIndex)}`}
                          title={`${cell.businessUnit} · ${cell.copilotName} · ${cell.costPerOutcomeIndex.toFixed(2)}`}
                        >
                          <span className="relative z-10 block text-sm text-slate-50">
                            {cell.costPerOutcomeIndex.toFixed(2)}
                          </span>
                          <div className={getMatrixTooltipClass()}>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                              Cost per Outcome Detail
                            </p>
                            <div className="mt-2 grid gap-1 text-xs leading-5 text-slate-200">
                              <p>
                                <span className="font-semibold text-slate-100">Business Unit:</span>{' '}
                                {cell.businessUnit}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-100">Copilot:</span>{' '}
                                {cell.copilotName}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-100">
                                  Cost per Outcome Index:
                                </span>{' '}
                                {cell.costPerOutcomeIndex.toFixed(2)}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-100">
                                  Adoption Rate:
                                </span>{' '}
                                {formatPercent(cell.adoptionRate)}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-100">
                                  Value Realization Rate:
                                </span>{' '}
                                {formatPercent(cell.valueRealizationRate)}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-100">
                                  Accepted Output Rate:
                                </span>{' '}
                                {formatPercent(cell.acceptedOutputRate)}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-100">Active Users:</span>{' '}
                                {formatInteger(cell.activeUsers)}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-100">
                                  Licensed Users:
                                </span>{' '}
                                {formatInteger(cell.licensedUsers)}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-100">Total Tokens:</span>{' '}
                                {formatCompact(cell.totalTokens)}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-100">
                                  Completed Workflows:
                                </span>{' '}
                                {formatInteger(cell.completedWorkflows)}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-100">Token Trend:</span>{' '}
                                {getTrendLabel(cell.tokenTrend)}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-100">
                                  Portfolio Status:
                                </span>{' '}
                                {cell.portfolioStatus}
                              </p>
                            </div>
                          </div>
                        </button>
                      ) : (
                        <div className="matrix-cell matrix-cell--low-data">--</div>
                      )}
                    </td>
                  ))}
                  <td className="rounded-r-xl bg-white/5 px-2 align-middle text-sm font-medium text-slate-200 shadow-sm">
                    <span className="inline-flex items-center gap-1.5">
                      {row.avgIndex.toFixed(2)}
                      {bestAvgIndex !== null && row.avgIndex === bestAvgIndex && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5 text-[#f2b01e]"
                          aria-label="Best average index"
                          role="img"
                        >
                          <path d="m12 3.5 2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 17.77l-5.2 2.73.99-5.79-4.21-4.1 5.82-.85L12 3.5Z" />
                        </svg>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {selectedMatrixCell && (
            <div className="w-full xl:w-[24rem] xl:flex-none rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">Selected detail</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-50">
                    {selectedMatrixCell.businessUnit} · {selectedMatrixCell.copilotName}
                  </h3>
                </div>
                <span className={getPortfolioStatusTone(selectedMatrixCell.portfolioStatus)}>
                  {selectedMatrixCell.portfolioStatus}
                </span>
              </div>
              <div className="mt-3 grid gap-3">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
                  <p className="font-semibold text-slate-100">Why it is classified this way</p>
                  <p className="mt-2">
                    {selectedMatrixNarrative} The current index is{' '}
                    {selectedMatrixCell.costPerOutcomeIndex.toFixed(2)}, which falls in the{' '}
                    {getMatrixBandLabel(selectedMatrixCell.costPerOutcomeIndex).toLowerCase()} band.
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
                  <p className="font-semibold text-slate-100">Recommendation</p>
                  <p className="mt-2">{selectedMatrixCell.recommendedAction}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {selectedMatrixCell.businessUnit} · {selectedMatrixCell.copilotName}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      onStageAction({
                        id: `matrix-${selectedMatrixCell.key}`,
                        title: selectedMatrixCell.recommendedAction,
                        focusArea: `${selectedMatrixCell.businessUnit} · ${selectedMatrixCell.copilotName}`,
                        narrative: selectedMatrixNarrative,
                        impact: selectedMatrixCell.recommendedAction,
                        owner: `${selectedMatrixCell.businessUnit} lead`,
                        dueDate: '',
                      })
                    }
                    className="mt-3 inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.16]"
                  >
                    Create Action
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel p-5">
        <p className="eyebrow">AI recommendations</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">
          Leadership actions ranked by business-outcome upside.
        </h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-2.5">
            {recommendations.map((recommendation, index) => {
              const priority =
                index === 0
                  ? { dot: 'bg-red-400', label: 'High' }
                  : index === 1
                    ? { dot: 'bg-amber-400', label: 'Medium' }
                    : { dot: 'bg-emerald-400', label: 'Steady' };
              const isActive = selectedRecommendation.id === recommendation.id;
              return (
                <button
                  key={recommendation.id}
                  type="button"
                  onClick={() => onSelectRecommendation(recommendation.id)}
                  aria-pressed={isActive}
                  className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    isActive
                      ? 'border-white/40 bg-white/[0.08]'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-50">
                      {recommendation.title}
                    </span>
                    <span className="mt-1 block text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                      {recommendation.owner}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-slate-300">
                    {priority.label}
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${priority.dot}`}
                      aria-hidden="true"
                    />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="eyebrow">Recommendation detail</p>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                Due{' '}
                {new Date(selectedRecommendation.dueDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-50">
              {selectedRecommendation.title}
            </h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              {selectedRecommendation.owner}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {selectedRecommendation.focusArea}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              {selectedRecommendation.narrative}
            </p>
            <div className="mt-4 rounded-lg border border-[#4ade80]/30 bg-white/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Expected impact
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-100">
                {selectedRecommendation.impact}
              </p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => onStageAction(selectedRecommendation)}
                className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.16]"
              >
                Create Action
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

