import type { CSSProperties } from 'react';

import type {
  ActionStatus,
  MatrixCellDetails,
  PortfolioStatus,
  UsageRecord,
} from '@/types';
import {
  actionProgressStatuses,
  businessUnits,
  clamp,
  compactFormatter,
  copilots,
  numberFormatter,
} from '@/data/constants';

// --- Formatters ---

export function formatInteger(value: number) {
  return numberFormatter.format(Math.round(value));
}

export function formatCompact(value: number) {
  return compactFormatter.format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatScore(value: number) {
  return value.toFixed(1);
}

export function formatTimestamp(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDateOnly(value: string | Date) {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toISOString().slice(0, 10);
}

export function formatWeekEndingLabel(value: string | Date) {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return `Week ending ${String(value)}`;
  return `Week ending ${parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

// --- Matrix / cost-outcome utilities ---

export function getMatrixBand(
  index: number
): MatrixCellDetails['costBand'] {
  if (index < 1) return 'strong';
  if (index < 1.5) return 'monitor';
  if (index < 2) return 'watchlist';
  return 'cost-concern';
}

export function getMatrixTone(index: number, hasData = true) {
  if (!hasData) return 'matrix-cell matrix-cell--low-data';
  const band = getMatrixBand(index);
  if (band === 'strong') return 'matrix-cell matrix-cell--strong';
  if (band === 'monitor') return 'matrix-cell matrix-cell--monitor';
  if (band === 'watchlist') return 'matrix-cell matrix-cell--watchlist';
  return 'matrix-cell matrix-cell--cost-concern';
}

export function getMatrixBandLabel(index: number) {
  const band = getMatrixBand(index);
  if (band === 'strong') return 'Strong';
  if (band === 'monitor') return 'Monitor';
  if (band === 'watchlist') return 'Watchlist';
  return 'Cost concern';
}

export function getRecommendedMatrixAction(record: UsageRecord): string {
  if (record.costPerOutcomeIndex > 2) {
    return 'Cut token waste and tighten prompt scope';
  }
  if (record.costPerOutcomeIndex >= 1.5) {
    return record.tokenTrend < 0
      ? 'Review declining workflows and simplify prompts'
      : 'Run a prompt and workflow optimization review';
  }
  if (record.adoptionRate < 55) {
    return 'Launch an adoption and enablement push';
  }
  if (record.valueRealizationRate < 62) {
    return 'Improve workflow handoffs and outcome tracking';
  }
  if (record.tokenTrend < -0.5) {
    return 'Investigate declining usage and re-baseline value';
  }
  return 'Monitor and replicate the current pattern';
}

export function getRowPrimaryRisk(records: UsageRecord[]) {
  if (records.length === 0) return 'Low data';
  const averageIndex =
    records.reduce((sum, r) => sum + r.costPerOutcomeIndex, 0) / records.length;
  const worstRecord = [...records].sort(
    (a, b) =>
      b.costPerOutcomeIndex - a.costPerOutcomeIndex ||
      b.totalTokens - a.totalTokens ||
      a.valueRealizationRate - b.valueRealizationRate
  )[0];

  if (averageIndex < 1) return 'Efficient';
  if (worstRecord.costPerOutcomeIndex > 2) return 'High token cost';
  if (records.some((r) => r.adoptionRate < 55)) return 'Low adoption';
  if (records.some((r) => r.tokenTrend < -0.4)) return 'Declining trend';
  if (records.some((r) => r.valueRealizationRate < 62)) return 'Low outcome rate';
  return 'Monitor';
}

export function getRowBestCopilot(records: UsageRecord[]) {
  if (records.length === 0) return 'N/A';
  const best = [...records].sort(
    (a, b) =>
      a.costPerOutcomeIndex - b.costPerOutcomeIndex ||
      b.valueRealizationRate - a.valueRealizationRate ||
      b.adoptionRate - a.adoptionRate
  )[0];
  return best?.copilotName ?? 'N/A';
}

export function getMatrixTooltipClass() {
  return [
    'pointer-events-none absolute left-1/2 top-full z-40 mt-2 w-72 -translate-x-1/2 rounded-xl border border-white/12 bg-white p-3 text-left shadow-2xl opacity-0 transition duration-150 ease-out group-hover:opacity-100 group-focus-within:opacity-100',
  ].join(' ');
}

export function mergeSnapshotRecords(
  primary: UsageRecord[],
  fallback: UsageRecord[]
): UsageRecord[] {
  const merged = new Map<string, UsageRecord>();
  [...fallback, ...primary].forEach((record) => {
    merged.set(`${record.businessUnit}-${record.copilotId}`, record);
  });

  return businessUnits
    .flatMap((businessUnit) =>
      copilots.map(
        (copilot) =>
          merged.get(`${businessUnit}-${copilot.id}`) ??
          fallback.find(
            (r) => r.businessUnit === businessUnit && r.copilotId === copilot.id
          ) ??
          primary.find(
            (r) => r.businessUnit === businessUnit && r.copilotId === copilot.id
          )
      )
    )
    .filter((record): record is UsageRecord => Boolean(record));
}

// --- Status / trend display ---

export function getStatusTone(status: ActionStatus) {
  if (status === 'Done') return 'status-pill status-pill--done';
  if (status === 'In progress') return 'status-pill status-pill--progress';
  if (status === 'Blocked') return 'status-pill status-pill--blocked';
  return 'status-pill status-pill--idle';
}

export function getTrendLabel(value: number) {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function getTrendDirection(value: number) {
  if (value > 0.4) return 'up' as const;
  if (value < -0.4) return 'down' as const;
  return 'flat' as const;
}

export function getPortfolioStatusTone(status: PortfolioStatus) {
  if (status === 'Efficient') return 'portfolio-status portfolio-status--efficient';
  if (status === 'Stable') return 'portfolio-status portfolio-status--stable';
  if (status === 'Watchlist') return 'portfolio-status portfolio-status--watchlist';
  if (status === 'Low-value') return 'portfolio-status portfolio-status--low-value';
  return 'portfolio-status portfolio-status--not-started';
}

export function getTrendTone(direction: 'up' | 'flat' | 'down') {
  if (direction === 'up') return 'portfolio-trend portfolio-trend--up';
  if (direction === 'down') return 'portfolio-trend portfolio-trend--down';
  return 'portfolio-trend portfolio-trend--flat';
}

export function getTrendSymbol(direction: 'up' | 'flat' | 'down') {
  if (direction === 'up') return '↑';
  if (direction === 'down') return '↓';
  return '→';
}

// --- Action status slider ---

export function getSliderIndex(status: ActionStatus): number {
  if (status === 'Done') return 2;
  if (status === 'Not started') return 0;
  return 1;
}

export function getStatusFromSliderIndex(index: number): ActionStatus {
  const bounded = clamp(index, 0, actionProgressStatuses.length - 1);
  return actionProgressStatuses[bounded];
}

function getSliderFill(status: ActionStatus): string {
  if (status === 'Done') {
    return 'linear-gradient(90deg, #d13438 0%, #f59e0b 32%, #107c10 100%)';
  }
  if (status === 'Not started') return 'linear-gradient(90deg, #d13438 0%, #d13438 100%)';
  return 'linear-gradient(90deg, #d13438 0%, #f59e0b 36%, #f59e0b 100%)';
}

function getSliderThumbColor(status: ActionStatus): string {
  if (status === 'Done') return '#107c10';
  if (status === 'Not started') return '#d13438';
  return '#f59e0b';
}

export function getStatusSliderStyle(status: ActionStatus): CSSProperties {
  return {
    '--ctcc-slider-progress': `${getSliderIndex(status) * 50}%`,
    '--ctcc-slider-fill': getSliderFill(status),
    '--ctcc-slider-thumb': getSliderThumbColor(status),
  } as CSSProperties;
}

// Re-export math helpers for callers that import only from utils
export { average, clamp, round1, round2 } from '@/utils/math';
