import { useEffect, useState } from 'react';

import { seededActions } from '@/data/constants';
import { useAuth } from '@/hooks/AuthContext';
import { getRayfinClient } from '@/services/rayfinClient';
import type {
  ActionItem,
  ActionStatus,
  ActionStorageMode,
  BatchRunRecord,
  BusinessUnit,
  CopilotDefinition,
  CopilotId,
  DashboardTab,
  GlossaryEntry,
  MatrixCellDetails,
  MatrixWatchlistRow,
  MetricFitRow,
  MethodologyMetricRow,
  MethodologyPatternRow,
  MetricsStorageMode,
  PortfolioStatus,
  ProductProfile,
  PrototypeSeedData,
  Recommendation,
  UnitProfile,
  UsageRecord,
} from '@/types';

import { InsightsTab } from './tabs/InsightsTab';
import { OverviewTab } from './tabs/OverviewTab';
import { PortfolioTab } from './tabs/PortfolioTab';
import { SummaryTab } from './tabs/SummaryTab';

type DataAgentMessage = {
  id: string;
  role: 'user' | 'agent';
  content: string;
};

const copilots: CopilotDefinition[] = [
  {
    id: 'm365',
    name: 'Microsoft 365 Copilot',
    shortName: 'M365',
    lens: 'meeting recap, drafting, and day-to-day productivity',
  },
  {
    id: 'github',
    name: 'GitHub Copilot',
    shortName: 'GitHub',
    lens: 'developer throughput and code acceptance velocity',
  },
  {
    id: 'studio',
    name: 'Copilot Studio',
    shortName: 'Studio',
    lens: 'workflow automation and conversational orchestration',
  },
  {
    id: 'fabric',
    name: 'Power BI / Fabric Copilot',
    shortName: 'Fabric',
    lens: 'analytics creation, insight exploration, and data storytelling',
  },
  {
    id: 'security',
    name: 'Microsoft Security Copilot',
    shortName: 'Security',
    lens: 'incident triage and analyst response acceleration',
  },
];

const businessUnits: BusinessUnit[] = [
  'Sales',
  'Finance',
  'Engineering',
  'Customer Success',
  'Marketing',
  'Operations',
  'HR',
  'Legal',
];

const unitProfiles: Record<BusinessUnit, UnitProfile> = {
  Sales: {
    licensedUsers: 240,
    baseAdoption: 64,
    sessionDepth: 15,
    tokenVariance: 280,
    workflowDepth: 6.8,
    blockerRate: 0.12,
    satisfaction: 4.2,
  },
  Finance: {
    licensedUsers: 118,
    baseAdoption: 57,
    sessionDepth: 13,
    tokenVariance: 220,
    workflowDepth: 5.4,
    blockerRate: 0.14,
    satisfaction: 4.0,
  },
  Engineering: {
    licensedUsers: 320,
    baseAdoption: 69,
    sessionDepth: 18,
    tokenVariance: 360,
    workflowDepth: 7.6,
    blockerRate: 0.1,
    satisfaction: 4.3,
  },
  'Customer Success': {
    licensedUsers: 182,
    baseAdoption: 61,
    sessionDepth: 14,
    tokenVariance: 260,
    workflowDepth: 6.1,
    blockerRate: 0.13,
    satisfaction: 4.1,
  },
  Marketing: {
    licensedUsers: 156,
    baseAdoption: 59,
    sessionDepth: 16,
    tokenVariance: 310,
    workflowDepth: 6.6,
    blockerRate: 0.11,
    satisfaction: 4.2,
  },
  Operations: {
    licensedUsers: 208,
    baseAdoption: 55,
    sessionDepth: 15,
    tokenVariance: 240,
    workflowDepth: 5.9,
    blockerRate: 0.16,
    satisfaction: 3.9,
  },
  HR: {
    licensedUsers: 84,
    baseAdoption: 49,
    sessionDepth: 11,
    tokenVariance: 180,
    workflowDepth: 4.6,
    blockerRate: 0.17,
    satisfaction: 3.8,
  },
  Legal: {
    licensedUsers: 62,
    baseAdoption: 46,
    sessionDepth: 10,
    tokenVariance: 170,
    workflowDepth: 4.3,
    blockerRate: 0.18,
    satisfaction: 3.8,
  },
};

const productProfiles: Record<CopilotId, ProductProfile> = {
  m365: {
    licenseShare: 0.92,
    adoptionBias: 8,
    sessionLift: 2,
    tokensPerSession: 1160,
    valueBias: 16,
    acceptanceBias: 0.09,
    workflowBias: 1.14,
    blockerBias: 0.01,
  },
  github: {
    licenseShare: 0.42,
    adoptionBias: -3,
    sessionLift: 6,
    tokensPerSession: 2120,
    valueBias: 7,
    acceptanceBias: 0.08,
    workflowBias: 1.16,
    blockerBias: 0.01,
  },
  studio: {
    licenseShare: 0.3,
    adoptionBias: -9,
    sessionLift: 5,
    tokensPerSession: 1780,
    valueBias: 9,
    acceptanceBias: 0.07,
    workflowBias: 1.12,
    blockerBias: 0.03,
  },
  fabric: {
    licenseShare: 0.34,
    adoptionBias: -7,
    sessionLift: 5,
    tokensPerSession: 2240,
    valueBias: 6,
    acceptanceBias: 0.07,
    workflowBias: 1.08,
    blockerBias: 0.02,
  },
  security: {
    licenseShare: 0.24,
    adoptionBias: -6,
    sessionLift: 3,
    tokensPerSession: 1520,
    valueBias: 11,
    acceptanceBias: 0.06,
    workflowBias: 1.12,
    blockerBias: 0.05,
  },
};

const fitMatrix: Record<BusinessUnit, Record<CopilotId, number>> = {
  Sales: {
    m365: 1,
    github: 0.18,
    studio: 0.56,
    fabric: 0.38,
    security: 0.24,
  },
  Finance: {
    m365: 0.78,
    github: 0.14,
    studio: 0.34,
    fabric: 0.74,
    security: 0.41,
  },
  Engineering: {
    m365: 0.72,
    github: 1,
    studio: 0.62,
    fabric: 0.82,
    security: 0.54,
  },
  'Customer Success': {
    m365: 0.91,
    github: 0.16,
    studio: 0.58,
    fabric: 0.35,
    security: 0.29,
  },
  Marketing: {
    m365: 0.95,
    github: 0.12,
    studio: 0.61,
    fabric: 0.43,
    security: 0.18,
  },
  Operations: {
    m365: 0.86,
    github: 0.22,
    studio: 0.74,
    fabric: 0.49,
    security: 0.57,
  },
  HR: {
    m365: 0.83,
    github: 0.1,
    studio: 0.29,
    fabric: 0.24,
    security: 0.44,
  },
  Legal: {
    m365: 0.76,
    github: 0.08,
    studio: 0.22,
    fabric: 0.21,
    security: 0.68,
  },
};


const actionStatuses: ActionStatus[] = [
  'Not started',
  'In progress',
  'Blocked',
  'Done',
];

const glossaryEntries: GlossaryEntry[] = [
  {
    term: 'Accepted Recommendations',
    definition:
      'Count of AI-generated recommendations that teams have accepted into real workflows.',
    businessRule:
      'Calculated from completed workflows and recommendation acceptance propensity in each unit/product profile.',
  },
  {
    term: 'Action Tracker Statuses',
    definition:
      'Execution states for recommendations moved into operational follow-through.',
    businessRule:
      'Status progression uses Not started -> In progress -> Done, and Blocked is controlled with a dedicated blocker toggle.',
  },
  {
    term: 'Adoption Rate',
    definition:
      'Percent of licensed users who are active in a selected Copilot scope.',
    businessRule:
      'Computed as activeUsers / licensedUsers * 100 using the current filter lens.',
  },
  {
    term: 'Copilot Portfolio Heatmap',
    definition:
      'Executive comparison table that shows all Copilot products in a single view.',
    businessRule:
      'The heatmap uses product-level aggregates from the active filter lens and highlights rows with high token intensity and moderate/low value realization.',
  },
  {
    term: 'Cost per Outcome Index',
    definition:
      'Composite index indicating whether Copilot usage is producing worthwhile outcomes at an acceptable cost and quality level.',
    businessRule:
      'Formula: Cost per Outcome Index = (tokens used / max tokens used in comparison group) / primary outcome rate. Primary outcome rate is Value Realization Rate for most Copilots and Accepted Output Rate for GitHub Copilot. Lower is better: < 1.0 strong outcome efficiency, 1.0-1.5 acceptable/monitor, 1.5-2.0 watchlist, > 2.0 cost-outcome concern.',
  },
  {
    term: 'High-token / Low-value Alert',
    definition:
      'Priority signal that flags segments consuming significant tokens with weak realized value.',
    businessRule:
      'Primary detection uses totalTokens > 1,000,000 and valueRealizationRate < 66; fallback selects highest Cost per Outcome Index.',
  },
  {
    term: 'Portfolio Status Badge',
    definition:
      'Classification label that summarizes product health as Efficient, Stable, Watchlist, Low-value, or Not started.',
    businessRule:
      'Primary classification uses Cost per Outcome Index:',
    businessRuleBullets: [
      'Efficient (<1.0 with value realization >=70% and stable/positive trend)',
      'Stable (1.0–1.5)',
      'Watchlist (>=1.5, or declining trend <-0.4%, or Outcome Rate <62%)',
      'Low-value (>2.0 or high-token/low-value risk flag)',
      'No workflows or active users results in Not started.',
    ],
  },
  {
    term: 'Satisfaction Score',
    definition:
      'Modeled user experience signal used as contextual background data, not as a primary decision metric.',
    businessRule:
      'Prototype-modeled from a per-unit baseline (3.8–4.3), adjusted by workflow fit, product value bias, and token load. Bounded 3.4–4.9. In production this would come from surveys or feedback telemetry.',
  },
  {
    term: 'Scope Lens',
    definition:
      'User-selected dashboard filter context by business unit, Copilot product, and risk-only mode.',
    businessRule:
      'All portfolio KPIs, recommendations, and summary narratives recompute from visible records in this lens.',
  },
  {
    term: 'Value Realization Rate',
    definition:
      'Estimated percentage of Copilot usage that translated into accepted business outputs.',
    businessRule:
      'Derived from modeled workflow completion, recommendation acceptance, and product bias factors.',
  },
];

const metricFitRows: MetricFitRow[] = [
  {
    copilot: 'Microsoft 365 Copilot',
    costPerUser:
      'Good fit — useful for license/value governance across broad knowledge-worker usage.',
    acceptedOutput:
      'Medium fit — harder to observe because many outputs are edited, copied, or used informally.',
    valueRealization:
      'Strong fit — can tie usage to drafts approved, meetings summarized, actions created, or workflows completed.',
    bestMetric: 'Value Realization Rate',
  },
  {
    copilot: 'GitHub Copilot',
    costPerUser:
      'Good fit — useful for comparing cost against developer activity and team usage.',
    acceptedOutput:
      'Strong fit — code suggestion acceptance is directly observable.',
    valueRealization:
      'Strong fit — can connect accepted suggestions, PRs, completed issues, and developer workflow outcomes.',
    bestMetric: 'Accepted Output Rate',
  },
  {
    copilot: 'Copilot Studio',
    costPerUser:
      'Good fit — useful for cost per agent, flow, or conversation.',
    acceptedOutput:
      'Strong fit — accepted/resolved bot answers, successful handoffs, and completed flows can be tracked.',
    valueRealization:
      'Strong fit — ideal for measuring completed automations, resolved requests, and successful agent outcomes.',
    bestMetric: 'Value Realization Rate',
  },
  {
    copilot: 'Power BI / Fabric Copilot',
    costPerUser:
      'Good fit — useful for cost per analyst, report, semantic model, or insight workflow.',
    acceptedOutput:
      'Medium fit — acceptance can be tracked if users save generated measures, visuals, summaries, or reports.',
    valueRealization:
      'Strong fit — can track insights generated, reports completed, summaries used, or decisions supported.',
    bestMetric: 'Value Realization Rate',
  },
  {
    copilot: 'Microsoft Security Copilot',
    costPerUser:
      'Good fit — useful for cost per analyst, investigation, or incident.',
    acceptedOutput:
      'Medium fit — acceptance matters, but analysts may validate or modify outputs before acting.',
    valueRealization:
      'Strong fit — best tied to investigations accelerated, incidents triaged, detections enriched, or response actions completed.',
    bestMetric: 'Value Realization Rate',
  },
];

const methodologyMetricsRows: MethodologyMetricRow[] = [
  {
    metric: 'Cost per Active User / Workflow',
    measure:
      'Estimated AI cost normalized by active users or completed workflows.',
    observability: 'Easy',
    decision: 'Use as an executive cost governance metric.',
  },
  {
    metric: 'Accepted Output Rate',
    measure:
      'How often users accept or use AI-generated outputs or recommendations.',
    observability: 'Easy to Medium',
    decision: 'Use as a usefulness proxy where acceptance can be tracked.',
  },
  {
    metric: 'Value Realization Rate',
    measure:
      'Share of AI-assisted activity that becomes a completed workflow, accepted recommendation, created action, or resolved blocker.',
    observability: 'Medium',
    decision: 'Use as the primary business-value signal.',
  },
  {
    metric: 'Cost per Successful Outcome',
    measure:
      'Estimated AI cost divided by successful Copilot-assisted outcomes.',
    observability: 'Medium to Hard',
    decision:
      'Treat as a future maturity metric once outcome tracking is reliable.',
  },
  {
    metric: 'Rework Rate',
    measure:
      'How often AI outputs require major correction or downstream rework.',
    observability: 'Hard',
    decision:
      'Exclude from the core prototype model; include only as a qualitative signal or future enhancement.',
  },
];

const methodologyPatternRows: MethodologyPatternRow[] = [
  {
    pattern: 'High tokens + high outcomes',
    interpretation: 'Strong value creation',
    action: 'Scale the workflow and document best practices.',
  },
  {
    pattern: 'High tokens + low outcomes',
    interpretation: 'Watchlist: possible inefficient usage',
    action:
      'Review top workflows, improve prompts, and assign an optimization owner.',
  },
  {
    pattern: 'Low tokens + high outcomes',
    interpretation: 'Efficient best practice',
    action: 'Promote as a model pattern for other teams.',
  },
  {
    pattern: 'Low adoption + low tokens',
    interpretation: 'Enablement opportunity',
    action: 'Identify blockers, provide training, and clarify priority use cases.',
  },
  {
    pattern: 'High cost per active user + flat value realization',
    interpretation: 'Cost governance concern',
    action:
      'Investigate license allocation, usage concentration, and workflow fit.',
  },
  {
    pattern: 'High accepted output rate + low action conversion',
    interpretation: 'Good AI output but weak operational follow-through',
    action: 'Add clearer handoffs, owners, and action tracking.',
  },
];

function asActionStatus(value: string): ActionStatus {
  return actionStatuses.includes(value as ActionStatus)
    ? (value as ActionStatus)
    : 'Not started';
}

function asBusinessUnit(value: string): BusinessUnit {
  return businessUnits.includes(value as BusinessUnit)
    ? (value as BusinessUnit)
    : 'Operations';
}

function asCopilotId(value: string): CopilotId {
  return copilots.some((copilot) => copilot.id === value)
    ? (value as CopilotId)
    : 'm365';
}

function asPortfolioStatus(value: string): PortfolioStatus {
  const statuses: PortfolioStatus[] = [
    'Efficient',
    'Stable',
    'Watchlist',
    'Low-value',
    'Not started',
  ];

  return statuses.includes(value as PortfolioStatus)
    ? (value as PortfolioStatus)
    : 'Stable';
}

const numberFormatter = new Intl.NumberFormat('en-US');
const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const round1 = (value: number) => Number(value.toFixed(1));
const round2 = (value: number) => Number(value.toFixed(2));

const PROTOTYPE_FIRST_WEEK_ENDING = '2026-01-30';
const PROTOTYPE_LATEST_WEEK_ENDING = '2026-08-07';
const WEEKLY_BATCH_SOURCE_SUMMARY =
  'Simulated weekly Copilot usage, token, outcome, and action telemetry.';

const FORCED_WATCHLIST_BY_WEEK: Record<string, Record<string, number>> = {
  '2026-07-31': {
    'Engineering-github': 1.86,
    'Operations-fabric': 1.74,
    'Operations-studio': 1.63,
    'Marketing-m365': 1.55,
  },
  '2026-08-07': {
    'Engineering-github': 1.92,
    'Operations-fabric': 1.71,
    'Finance-m365': 1.58,
  },
};

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function listWeekEndingDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  for (let cursor = start; cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 7)) {
    dates.push(toIsoDate(cursor));
  }

  return dates;
}

function wave(weekIndex: number, unitIndex: number, productIndex: number): number {
  const seed = (weekIndex + 3) * (unitIndex + 5) * (productIndex + 7);
  return Math.sin(seed / 11) * 0.62 + Math.cos(seed / 17) * 0.38;
}

function getForcedWatchlistIndex(
  weekEndingDate: string,
  businessUnit: BusinessUnit,
  copilotId: CopilotId
) {
  return FORCED_WATCHLIST_BY_WEEK[weekEndingDate]?.[`${businessUnit}-${copilotId}`];
}

function seedPrototypeDataset(): PrototypeSeedData {
  const weekEndingDates = listWeekEndingDates(
    PROTOTYPE_FIRST_WEEK_ENDING,
    PROTOTYPE_LATEST_WEEK_ENDING
  );
  const allMetrics: UsageRecord[] = [];
  const allBatchRuns: BatchRunRecord[] = [];

  weekEndingDates.forEach((weekEndingDate, weekIndex) => {
    const weeklyBase = businessUnits.flatMap((businessUnit, unitIndex) =>
      copilots.map((copilot, productIndex) => {
        const unit = unitProfiles[businessUnit];
        const product = productProfiles[copilot.id];
        const fit = fitMatrix[businessUnit][copilot.id];
        const pulse = wave(weekIndex, unitIndex, productIndex);

        const highTokenPattern =
          (businessUnit === 'Operations' || businessUnit === 'Engineering') &&
          (copilot.id === 'github' || copilot.id === 'fabric');

        const optimizationBoost =
          weekIndex >= 14 &&
          (businessUnit === 'Finance' || businessUnit === 'Customer Success')
            ? 2.5
            : 0;

        const licensedUsers = Math.max(
          18,
          Math.round(
            unit.licensedUsers *
              product.licenseShare *
              (0.7 + fit * 0.5) *
              (1 + weekIndex * 0.0035 + pulse * 0.004)
          )
        );

        const baselineAdoption =
          unit.baseAdoption +
          product.adoptionBias +
          (fit - 0.55) * 24 +
          (unitIndex - productIndex) * 0.8;
        const adoptionGrowth = weekIndex * (0.55 + fit * 0.12);
        const adoptionDrag = (businessUnit === 'Legal' || businessUnit === 'HR')
          ? weekIndex * 0.1
          : 0;
        const periodicDip =
          (businessUnit === 'Operations' &&
            (copilot.id === 'fabric' || copilot.id === 'studio') &&
            weekIndex % 8 === 5
            ? 3.6
            : 0) +
          (businessUnit === 'Engineering' && copilot.id === 'github' && weekIndex % 7 === 3
            ? 4.1
            : 0);
        const adoptionRate = round1(
          clamp(
            baselineAdoption + adoptionGrowth - adoptionDrag - periodicDip + pulse * 2.4,
            28,
            95
          )
        );

        const activeUsers = Math.max(
          10,
          Math.round((licensedUsers * adoptionRate) / 100)
        );

        const sessionLoad =
          unit.sessionDepth +
          product.sessionLift +
          fit * 3 +
          weekIndex * 0.16 +
          pulse * 1.2 +
          (highTokenPattern ? 0.9 : 0);
        const copilotSessions = Math.max(8, Math.round(activeUsers * sessionLoad));

        const tokensPerSession =
          product.tokensPerSession +
          unit.tokenVariance +
          fit * 180 +
          weekIndex * (highTokenPattern ? 22 : 9) +
          pulse * 150 +
          (highTokenPattern && weekIndex % 6 === 0 ? 550 : 0) +
          (businessUnit === 'Operations' && copilot.id === 'fabric' && weekIndex % 5 === 2
            ? 320
            : 0);
        let totalTokens = Math.max(5_000, Math.round(copilotSessions * tokensPerSession));

        const workflowLift = clamp(
          0.54 + fit * 0.58 + weekIndex * 0.006 + pulse * 0.012 - (highTokenPattern ? 0.08 : 0),
          0.45,
          1.35
        );
        const completedWorkflows = Math.max(
          6,
          Math.round(activeUsers * unit.workflowDepth * product.workflowBias * workflowLift)
        );

        const acceptedRate = clamp(
          0.43 +
            product.acceptanceBias +
            fit * 0.17 +
            weekIndex * 0.003 +
            pulse * 0.014 +
            (copilot.id === 'github' ? 0.05 : 0) -
            (highTokenPattern && weekIndex % 9 >= 6 ? 0.08 : 0) +
            (optimizationBoost > 0 && copilot.id !== 'github' ? 0.02 : 0),
          0.3,
          0.94
        );
        let acceptedRecommendations = Math.max(
          1,
          Math.round(completedWorkflows * acceptedRate)
        );
        let acceptedOutputRate = round2(
          clamp(acceptedRecommendations / Math.max(completedWorkflows, 1), 0.18, 0.96)
        );

        const blockersResolved = Math.max(
          1,
          Math.round(
            activeUsers *
              clamp(unit.blockerRate + product.blockerBias + fit * 0.05 + pulse * 0.012, 0.06, 0.34)
          )
        );

        const satisfactionScore = round1(
          clamp(
            unit.satisfaction +
              fit * 0.45 +
              product.valueBias / 42 -
              unit.tokenVariance / 1800 +
              weekIndex * 0.01 -
              (highTokenPattern ? 0.12 : 0) +
              pulse * 0.09 +
              optimizationBoost * 0.05,
            3.4,
            4.9
          )
        );

        let tokenTrend = round1(
          clamp(
            0.8 + pulse * 2.2 + weekIndex * 0.05 - (highTokenPattern ? 0.5 : 0.15),
            -5,
            8
          )
        );

        if (periodicDip > 0 || (weekIndex % 10 === 7 && businessUnit === 'Operations')) {
          tokenTrend = round1(tokenTrend - 2.1);
        }

        let valueRealizationRate = round1(
          clamp(
            41 +
              fit * 24 +
              product.valueBias +
              unit.workflowDepth * 2.6 -
              product.tokensPerSession / 250 +
              weekIndex * (copilot.id === 'github' ? 0.26 : 0.32) +
              pulse * 2.2 +
              optimizationBoost -
              (highTokenPattern ? 4 : 0),
            36,
            93
          )
        );

        if (businessUnit === 'Operations' && copilot.id === 'fabric' && weekIndex % 6 >= 4) {
          valueRealizationRate = round1(clamp(valueRealizationRate - 3.2, 36, 93));
        }

        if (businessUnit === 'Engineering' && copilot.id === 'github' && weekIndex % 8 === 4) {
          valueRealizationRate = round1(clamp(valueRealizationRate - 2.1, 36, 93));
        }

        const forcedWatchlistIndex = getForcedWatchlistIndex(
          weekEndingDate,
          businessUnit,
          copilot.id
        );

        if (forcedWatchlistIndex) {
          totalTokens = Math.round(totalTokens * 1.42);
          tokenTrend = round1(Math.min(tokenTrend, -1.4));
          valueRealizationRate = round1(clamp(valueRealizationRate - 16, 36, 93));
          acceptedOutputRate = round2(clamp(acceptedOutputRate - 0.12, 0.18, 0.96));
          acceptedRecommendations = Math.max(
            1,
            Math.round(completedWorkflows * acceptedOutputRate)
          );
        }

        const tokensPerActiveUser = round1(totalTokens / Math.max(activeUsers, 1));

        return {
          snapshotDate: weekEndingDate,
          businessUnit,
          copilotId: copilot.id,
          copilotName: copilot.name,
          licensedUsers,
          activeUsers,
          adoptionRate,
          copilotSessions,
          totalTokens,
          tokensPerActiveUser,
          completedWorkflows,
          acceptedRecommendations,
          acceptedOutputRate,
          blockersResolved,
          satisfactionScore,
          tokenTrend,
          valueRealizationRate,
        };
      })
    );

    const maxTokensInDay = Math.max(
      ...weeklyBase.map((record) => record.totalTokens),
      1
    );

    const weeklyRecords = weeklyBase.map((record) => {
      const normalizedTokenUsage = record.totalTokens / maxTokensInDay;
      const primaryOutcomeRate =
        record.copilotId === 'github'
          ? record.acceptedOutputRate
          : record.valueRealizationRate / 100;
      const rawCostPerOutcomeIndex = round2(
        normalizedTokenUsage / Math.max(primaryOutcomeRate, 0.05)
      );
      const forcedWatchlistIndex = getForcedWatchlistIndex(
        record.snapshotDate,
        record.businessUnit,
        record.copilotId
      );
      const costPerOutcomeIndex = forcedWatchlistIndex
        ? forcedWatchlistIndex
        : FORCED_WATCHLIST_BY_WEEK[record.snapshotDate]
          ? Math.min(rawCostPerOutcomeIndex, 1.42)
          : rawCostPerOutcomeIndex;
      const highTokenLowValue =
        Boolean(forcedWatchlistIndex) ||
        (record.totalTokens > 1_000_000 && record.valueRealizationRate < 66);

      return {
        ...record,
        costPerOutcomeIndex,
        portfolioStatus: getPortfolioStatus(
          record.activeUsers,
          record.completedWorkflows,
          record.valueRealizationRate,
          costPerOutcomeIndex,
          record.tokenTrend,
          highTokenLowValue
        ),
      };
    });

    allMetrics.push(...weeklyRecords);

    const completedMinutes = String(8 + (weekIndex % 7)).padStart(2, '0');
    allBatchRuns.push({
      runDate: weekEndingDate,
      status: 'Completed',
      startedAt: `${weekEndingDate}T02:00:00Z`,
      completedAt: `${weekEndingDate}T02:${completedMinutes}:00Z`,
      recordsProcessed: weeklyRecords.length,
      sourceSummary: WEEKLY_BATCH_SOURCE_SUMMARY,
      notes:
        weekIndex % 9 === 0
          ? 'Weekly close captured a token spike from engineering refactors and operations automation.'
          : 'Weekly simulated telemetry close completed normally.',
    });
  });

  return {
    metrics: allMetrics,
    batchRuns: allBatchRuns,
    latestSnapshotDate:
      weekEndingDates[weekEndingDates.length - 1] ?? PROTOTYPE_LATEST_WEEK_ENDING,
  };
}

const fallbackSeedData = seedPrototypeDataset();
const fallbackUsageRecords = fallbackSeedData.metrics.filter(
  (record) => record.snapshotDate === fallbackSeedData.latestSnapshotDate
);

function formatInteger(value: number) {
  return numberFormatter.format(Math.round(value));
}

function formatCompact(value: number) {
  return compactFormatter.format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatScore(value: number) {
  return value.toFixed(1);
}

function formatTimestamp(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDateOnly(value: string | Date) {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }
  return parsed.toISOString().slice(0, 10);
}

function getActionDedupeKey(action: Pick<ActionItem, 'linkedRecommendationId' | 'title'>) {
  return (action.linkedRecommendationId || action.title).trim().toLowerCase();
}

function toActionItem(action: {
  id: string;
  title: string;
  owner: string;
  dueDate: string | Date;
  status: string;
  outcome: string;
  linkedRecommendationId: string;
}): ActionItem {
  return {
    id: action.id,
    title: action.title,
    owner: action.owner,
    dueDate: formatDateOnly(action.dueDate),
    status: asActionStatus(action.status),
    outcome: action.outcome,
    linkedRecommendationId: action.linkedRecommendationId,
  };
}

function dedupeActions<T extends Pick<ActionItem, 'linkedRecommendationId' | 'title'>>(
  actions: T[]
) {
  const unique: T[] = [];
  const duplicates: T[] = [];
  const seen = new Set<string>();

  actions.forEach((action) => {
    const key = getActionDedupeKey(action);
    if (seen.has(key)) {
      duplicates.push(action);
      return;
    }

    seen.add(key);
    unique.push(action);
  });

  return { unique, duplicates };
}

function formatWeekEndingFriday(value: string | Date) {
  let date: Date;
  if (value instanceof Date) {
    date = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  } else {
    const [year, month, day] = value.split('-').map(Number);
    date =
      Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)
        ? new Date(year, month - 1, day)
        : new Date(value);
  }
  if (Number.isNaN(date.getTime())) return String(value);
  const jsDay = date.getDay(); // 0 = Sun ... 6 = Sat
  const isoDay = jsDay === 0 ? 7 : jsDay; // Mon = 1 ... Sun = 7
  date.setDate(date.getDate() + (5 - isoDay)); // snap to Friday of that week
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getUpcomingFridayDateOnly() {
  const date = new Date();
  const day = date.getDay(); // 0 = Sun ... 5 = Fri ... 6 = Sat
  const daysUntilFriday = (5 - day + 7) % 7; // 0 if today is Friday
  date.setDate(date.getDate() + daysUntilFriday);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayOfMonth}`;
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function getMatrixBand(index: number): MatrixCellDetails['costBand'] {
  if (index < 1) return 'strong';
  if (index < 1.5) return 'monitor';
  if (index < 2) return 'watchlist';
  return 'cost-concern';
}

function getRecommendedMatrixAction(record: UsageRecord): string {
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

function getRowPrimaryRisk(records: UsageRecord[]) {
  if (records.length === 0) return 'Low data';

  const averageIndex = average(records.map((record) => record.costPerOutcomeIndex));
  const worstRecord = [...records].sort(
    (left, right) =>
      right.costPerOutcomeIndex - left.costPerOutcomeIndex ||
      right.totalTokens - left.totalTokens ||
      left.valueRealizationRate - right.valueRealizationRate
  )[0];

  if (averageIndex < 1) return 'Efficient';
  if (worstRecord.costPerOutcomeIndex > 2) return 'High token cost';
  if (records.some((record) => record.adoptionRate < 55)) return 'Low adoption';
  if (records.some((record) => record.tokenTrend < -0.4)) return 'Declining trend';
  if (records.some((record) => record.valueRealizationRate < 62)) return 'Low outcome rate';
  return 'Monitor';
}

function getRowBestCopilot(records: UsageRecord[]) {
  if (records.length === 0) return 'N/A';

  const best = [...records].sort(
    (left, right) =>
      left.costPerOutcomeIndex - right.costPerOutcomeIndex ||
      right.valueRealizationRate - left.valueRealizationRate ||
      right.adoptionRate - left.adoptionRate
  )[0];

  return best?.copilotName ?? 'N/A';
}

function mergeSnapshotRecords(
  primary: UsageRecord[],
  fallback: UsageRecord[]
): UsageRecord[] {
  const merged = new Map<string, UsageRecord>();

  [...fallback, ...primary].forEach((record) => {
    merged.set(`${record.businessUnit}-${record.copilotId}`, record);
  });

  return businessUnits.flatMap((businessUnit) =>
    copilots.map(
      (copilot) =>
        merged.get(`${businessUnit}-${copilot.id}`) ??
        fallback.find(
          (record) =>
            record.businessUnit === businessUnit && record.copilotId === copilot.id
        ) ??
        primary.find(
          (record) =>
            record.businessUnit === businessUnit && record.copilotId === copilot.id
        )
    )
  ).filter((record): record is UsageRecord => Boolean(record));
}

function getTrendDirection(value: number) {
  if (value > 0.4) return 'up';
  if (value < -0.4) return 'down';
  return 'flat';
}

function getPortfolioStatus(
  activeUsers: number,
  workflows: number,
  valueRealizationRate: number,
  costPerOutcomeIndex: number,
  tokenTrend: number,
  highTokenLowValue: boolean
): PortfolioStatus {
  if (activeUsers === 0 || workflows === 0) return 'Not started';
  if (highTokenLowValue || costPerOutcomeIndex > 2) {
    return 'Low-value';
  }
  if (
    costPerOutcomeIndex < 1 &&
    valueRealizationRate >= 70 &&
    tokenTrend >= -0.2
  ) {
    return 'Efficient';
  }
  if (
    costPerOutcomeIndex >= 1.5 ||
    tokenTrend < -0.4 ||
    valueRealizationRate < 62
  ) {
    return 'Watchlist';
  }
  return 'Stable';
}

export function HomePage() {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [selectedUnit] = useState<BusinessUnit | 'All'>('All');
  const [selectedCopilot] = useState<CopilotId | 'All'>('All');
  const [underperformingOnly] = useState(false);
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | null>(
    null
  );
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [newActionIds, setNewActionIds] = useState<string[]>([]);
  const [actionsStorageMode, setActionsStorageMode] =
    useState<ActionStorageMode>('remote');
  const [actionsStatusMessage, setActionsStatusMessage] = useState<string | null>(null);
  const [allMetrics, setAllMetrics] = useState<UsageRecord[]>(fallbackSeedData.metrics);
  const [, setSnapshotDates] = useState<string[]>(
    listWeekEndingDates(PROTOTYPE_FIRST_WEEK_ENDING, PROTOTYPE_LATEST_WEEK_ENDING)
  );
  const [selectedSnapshotDate, setSelectedSnapshotDate] = useState<string>(
    fallbackSeedData.latestSnapshotDate
  );
  const [, setBatchRuns] = useState<BatchRunRecord[]>(fallbackSeedData.batchRuns);
  const [metricsStorageMode, setMetricsStorageMode] =
    useState<MetricsStorageMode>('remote');
  const [metricsStatusMessage, setMetricsStatusMessage] = useState<string | null>(null);
  const [selectedMatrixCellKey, setSelectedMatrixCellKey] = useState<string | null>(null);
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [dataAgentOpen, setDataAgentOpen] = useState(false);
  const [dataAgentInput, setDataAgentInput] = useState('');
  const [dataAgentMessages, setDataAgentMessages] = useState<DataAgentMessage[]>([
    {
      id: 'agent-welcome',
      role: 'agent',
      content:
        'Ask me about CTCC data: watchlist segments, token pressure, best performers, adoption gaps, or recommended actions.',
    },
  ]);

  useEffect(() => {
    if (!user?.id) {
      setAllMetrics(fallbackSeedData.metrics);
      setBatchRuns(fallbackSeedData.batchRuns);
      setSnapshotDates(
        listWeekEndingDates(PROTOTYPE_FIRST_WEEK_ENDING, PROTOTYPE_LATEST_WEEK_ENDING)
      );
      setSelectedSnapshotDate(fallbackSeedData.latestSnapshotDate);
      setMetricsStorageMode('local');
      setMetricsStatusMessage(
        'Rayfin data is unavailable. Using generated in-memory weekly prototype snapshots.'
      );
      return;
    }

    let cancelled = false;

    const loadMetrics = async () => {
      const client = getRayfinClient();

      const readWeeklyMetrics = async () =>
        client.data.CopilotDailyMetric.select([
          'snapshotDate',
          'businessUnit',
          'copilotId',
          'copilotName',
          'licensedUsers',
          'activeUsers',
          'adoptionRate',
          'copilotSessions',
          'totalTokens',
          'tokensPerActiveUser',
          'completedWorkflows',
          'acceptedRecommendations',
          'acceptedOutputRate',
          'blockersResolved',
          'satisfactionScore',
          'tokenTrend',
          'valueRealizationRate',
          'costPerOutcomeIndex',
          'portfolioStatus',
        ])
          .orderBy({ snapshotDate: 'asc' })
          .first(2000)
          .execute();

      const readBatchRuns = async () =>
        client.data.BatchRun.select([
          'runDate',
          'status',
          'startedAt',
          'completedAt',
          'recordsProcessed',
          'sourceSummary',
          'notes',
        ])
          .orderBy({ runDate: 'asc' })
          .execute();

      const mapMetric = (metric: {
        snapshotDate: string | Date;
        businessUnit: string;
        copilotId: string;
        copilotName: string;
        licensedUsers: number;
        activeUsers: number;
        adoptionRate: number;
        copilotSessions: number;
        totalTokens: number;
        tokensPerActiveUser: number;
        completedWorkflows: number;
        acceptedRecommendations: number;
        acceptedOutputRate: number;
        blockersResolved: number;
        satisfactionScore: number;
        tokenTrend: number;
        valueRealizationRate: number;
        costPerOutcomeIndex: number;
        portfolioStatus: string;
      }): UsageRecord => ({
        snapshotDate: formatDateOnly(metric.snapshotDate),
        businessUnit: asBusinessUnit(metric.businessUnit),
        copilotId: asCopilotId(metric.copilotId),
        copilotName: metric.copilotName,
        licensedUsers: metric.licensedUsers,
        activeUsers: metric.activeUsers,
        adoptionRate: Number(metric.adoptionRate),
        copilotSessions: metric.copilotSessions,
        totalTokens: metric.totalTokens,
        tokensPerActiveUser: Number(metric.tokensPerActiveUser),
        completedWorkflows: metric.completedWorkflows,
        acceptedRecommendations: metric.acceptedRecommendations,
        acceptedOutputRate: Number(metric.acceptedOutputRate),
        blockersResolved: metric.blockersResolved,
        satisfactionScore: Number(metric.satisfactionScore),
        tokenTrend: Number(metric.tokenTrend),
        valueRealizationRate: Number(metric.valueRealizationRate),
        costPerOutcomeIndex: Number(metric.costPerOutcomeIndex),
        portfolioStatus: asPortfolioStatus(metric.portfolioStatus),
      });

      const mapBatchRun = (run: {
        runDate: string | Date;
        status: string;
        startedAt: string | Date;
        completedAt: string | Date;
        recordsProcessed: number;
        sourceSummary: string;
        notes?: string;
      }): BatchRunRecord => ({
        runDate: formatDateOnly(run.runDate),
        status: run.status,
        startedAt: formatTimestamp(String(run.startedAt)),
        completedAt: formatTimestamp(String(run.completedAt)),
        recordsProcessed: run.recordsProcessed,
        sourceSummary: run.sourceSummary,
        notes: run.notes,
      });

      try {
        const [fetchedMetrics, fetchedBatchRuns] = await Promise.all([
          readWeeklyMetrics(),
          readBatchRuns(),
        ]);

        if (cancelled) return;

        if (fetchedMetrics.length === 0) {
          const seedData = seedPrototypeDataset();

          const metricChunkSize = 120;
          for (let i = 0; i < seedData.metrics.length; i += metricChunkSize) {
            const chunk = seedData.metrics.slice(i, i + metricChunkSize);
            await Promise.all(
              chunk.map((metric) =>
                client.data.CopilotDailyMetric.create({
                  snapshotDate: metric.snapshotDate,
                  businessUnit: metric.businessUnit,
                  copilotId: metric.copilotId,
                  copilotName: metric.copilotName,
                  licensedUsers: metric.licensedUsers,
                  activeUsers: metric.activeUsers,
                  adoptionRate: metric.adoptionRate,
                  copilotSessions: metric.copilotSessions,
                  totalTokens: metric.totalTokens,
                  tokensPerActiveUser: metric.tokensPerActiveUser,
                  completedWorkflows: metric.completedWorkflows,
                  acceptedRecommendations: metric.acceptedRecommendations,
                  acceptedOutputRate: metric.acceptedOutputRate,
                  blockersResolved: metric.blockersResolved,
                  satisfactionScore: metric.satisfactionScore,
                  tokenTrend: metric.tokenTrend,
                  valueRealizationRate: metric.valueRealizationRate,
                  costPerOutcomeIndex: metric.costPerOutcomeIndex,
                  portfolioStatus: metric.portfolioStatus,
                })
              )
            );
          }

          if (fetchedBatchRuns.length === 0) {
            const runChunkSize = 40;
            for (let i = 0; i < seedData.batchRuns.length; i += runChunkSize) {
              const chunk = seedData.batchRuns.slice(i, i + runChunkSize);
              await Promise.all(
                chunk.map((run) =>
                  client.data.BatchRun.create({
                    runDate: run.runDate,
                    status: run.status,
                    startedAt: run.startedAt,
                    completedAt: run.completedAt,
                    recordsProcessed: run.recordsProcessed,
                    sourceSummary: run.sourceSummary,
                    notes: run.notes,
                  })
                )
              );
            }
          }

          if (cancelled) return;

          const [seededMetrics, seededBatchRuns] = await Promise.all([
            readWeeklyMetrics(),
            readBatchRuns(),
          ]);

          if (cancelled) return;

          const normalizedSeededMetrics = seededMetrics.map(mapMetric);
          const availableSnapshotDates = Array.from(
            new Set(normalizedSeededMetrics.map((metric) => metric.snapshotDate))
          ).sort();
          const latestDate =
            availableSnapshotDates[availableSnapshotDates.length - 1] ??
            seedData.latestSnapshotDate;

          setAllMetrics(normalizedSeededMetrics.length > 0 ? normalizedSeededMetrics : seedData.metrics);
          setBatchRuns(
            seededBatchRuns.length > 0
              ? seededBatchRuns.map(mapBatchRun)
              : seedData.batchRuns
          );
          setSnapshotDates(
            availableSnapshotDates.length > 0
              ? availableSnapshotDates
              : listWeekEndingDates(PROTOTYPE_FIRST_WEEK_ENDING, PROTOTYPE_LATEST_WEEK_ENDING)
          );
          setSelectedSnapshotDate(latestDate);
          setMetricsStorageMode('remote');
          setMetricsStatusMessage(null);
          return;
        }

        let effectiveMetrics = fetchedMetrics;
        let effectiveBatchRuns = fetchedBatchRuns;
        const seedData = seedPrototypeDataset();
        const existingMetricKeys = new Set(
          fetchedMetrics.map(
            (metric) =>
              `${formatDateOnly(metric.snapshotDate)}-${metric.businessUnit}-${metric.copilotId}`
          )
        );
        const missingMetrics = seedData.metrics.filter(
          (metric) =>
            !existingMetricKeys.has(
              `${metric.snapshotDate}-${metric.businessUnit}-${metric.copilotId}`
            )
        );
        const existingRunDates = new Set(
          fetchedBatchRuns.map((run) => formatDateOnly(run.runDate))
        );
        const missingBatchRuns = seedData.batchRuns.filter(
          (run) => !existingRunDates.has(run.runDate)
        );

        if (missingMetrics.length > 0) {
          const metricChunkSize = 120;
          for (let i = 0; i < missingMetrics.length; i += metricChunkSize) {
            const chunk = missingMetrics.slice(i, i + metricChunkSize);
            await Promise.all(
              chunk.map((metric) =>
                client.data.CopilotDailyMetric.create({
                  snapshotDate: metric.snapshotDate,
                  businessUnit: metric.businessUnit,
                  copilotId: metric.copilotId,
                  copilotName: metric.copilotName,
                  licensedUsers: metric.licensedUsers,
                  activeUsers: metric.activeUsers,
                  adoptionRate: metric.adoptionRate,
                  copilotSessions: metric.copilotSessions,
                  totalTokens: metric.totalTokens,
                  tokensPerActiveUser: metric.tokensPerActiveUser,
                  completedWorkflows: metric.completedWorkflows,
                  acceptedRecommendations: metric.acceptedRecommendations,
                  acceptedOutputRate: metric.acceptedOutputRate,
                  blockersResolved: metric.blockersResolved,
                  satisfactionScore: metric.satisfactionScore,
                  tokenTrend: metric.tokenTrend,
                  valueRealizationRate: metric.valueRealizationRate,
                  costPerOutcomeIndex: metric.costPerOutcomeIndex,
                  portfolioStatus: metric.portfolioStatus,
                })
              )
            );
          }
        }

        if (missingBatchRuns.length > 0) {
          await Promise.all(
            missingBatchRuns.map((run) =>
              client.data.BatchRun.create({
                runDate: run.runDate,
                status: run.status,
                startedAt: run.startedAt,
                completedAt: run.completedAt,
                recordsProcessed: run.recordsProcessed,
                sourceSummary: run.sourceSummary,
                notes: run.notes,
              })
            )
          );
        }

        if (missingMetrics.length > 0 || missingBatchRuns.length > 0) {
          [effectiveMetrics, effectiveBatchRuns] = await Promise.all([
            readWeeklyMetrics(),
            readBatchRuns(),
          ]);
        }

        if (cancelled) return;

        const normalizedMetrics = effectiveMetrics.map(mapMetric);
        const availableSnapshotDates = Array.from(
          new Set(normalizedMetrics.map((metric) => metric.snapshotDate))
        ).sort();
        const latestDate =
          availableSnapshotDates[availableSnapshotDates.length - 1] ??
          fallbackSeedData.latestSnapshotDate;

        setAllMetrics(normalizedMetrics);
        setBatchRuns(effectiveBatchRuns.map(mapBatchRun));
        setSnapshotDates(availableSnapshotDates);
        setSelectedSnapshotDate((current) =>
          availableSnapshotDates.includes(current) ? current : latestDate
        );
        setMetricsStorageMode('remote');
        setMetricsStatusMessage(null);
      } catch {
        if (cancelled) return;
        setAllMetrics(fallbackSeedData.metrics);
        setBatchRuns(fallbackSeedData.batchRuns);
        setSnapshotDates(
          listWeekEndingDates(PROTOTYPE_FIRST_WEEK_ENDING, PROTOTYPE_LATEST_WEEK_ENDING)
        );
        setSelectedSnapshotDate(fallbackSeedData.latestSnapshotDate);
        setMetricsStorageMode('local');
        setMetricsStatusMessage(
          'Rayfin data is unavailable. Using generated in-memory weekly prototype snapshots.'
        );
      }
    };

    void loadMetrics();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setActions(seededActions);
      setActionsStorageMode('local');
      setActionsStatusMessage('Using local actions until a signed-in user is available.');
      return;
    }

    let cancelled = false;

    const loadActions = async () => {
      const client = getRayfinClient();

      try {
        const fetched = await client.data.CtccAction.select([
          'id',
          'title',
          'owner',
          'dueDate',
          'status',
          'outcome',
          'linkedRecommendationId',
        ])
          .orderBy({ dueDate: 'asc' })
          .execute();

        if (cancelled) return;

        if (fetched.length === 0) {
          const { unique: uniqueSeededActions } = dedupeActions(seededActions);
          const seeded = await Promise.all(
            uniqueSeededActions.map((action) =>
              client.data.CtccAction.create({
                title: action.title,
                owner: action.owner,
                dueDate: action.dueDate,
                status: action.status,
                outcome: action.outcome,
                linkedRecommendationId: action.linkedRecommendationId,
                user_id: user.id,
              })
            )
          );

          if (cancelled) return;

          setActions(seeded.map(toActionItem));
        } else {
          const { unique, duplicates } = dedupeActions(fetched);
          const deleteResults = await Promise.allSettled(
            duplicates.map((action) =>
              client.data.CtccAction.delete({ id: action.id })
            )
          );
          const failedDeletes = deleteResults.filter(
            (result) => result.status === 'rejected'
          ).length;

          if (cancelled) return;

          setActions(unique.map(toActionItem));
          if (duplicates.length > 0) {
            setActionsStatusMessage(
              failedDeletes > 0
                ? `Hidden ${duplicates.length} duplicate action records; ${failedDeletes} could not be removed from Rayfin Data.`
                : `Removed ${duplicates.length} duplicate action records from Rayfin Data.`
            );
          } else {
            setActionsStatusMessage(null);
          }
        }

        setActionsStorageMode('remote');
        if (fetched.length === 0) {
          setActionsStatusMessage(null);
        }
      } catch {
        if (cancelled) return;
        setActions(seededActions);
        setActionsStorageMode('local');
        setActionsStatusMessage(
          'Action tracker could not sync with Rayfin data. Changes stay in this browser session.'
        );
      }
    };

    void loadActions();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!glossaryOpen && !methodologyOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setGlossaryOpen(false);
        setMethodologyOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [glossaryOpen, methodologyOpen]);

  const usageRecords = allMetrics.filter(
    (record) => record.snapshotDate === selectedSnapshotDate
  );
  const visibleSnapshotRecords = mergeSnapshotRecords(
    usageRecords.length > 0 ? usageRecords : fallbackUsageRecords,
    fallbackUsageRecords
  );

  const filteredRecords = visibleSnapshotRecords.filter((record) => {
    const unitMatch = selectedUnit === 'All' || record.businessUnit === selectedUnit;
    const copilotMatch =
      selectedCopilot === 'All' || record.copilotId === selectedCopilot;
    const performanceMatch =
      !underperformingOnly ||
      (record.costPerOutcomeIndex >= 1.5 || record.valueRealizationRate < 65);
    return unitMatch && copilotMatch && performanceMatch;
  });

  const visibleRecords =
    filteredRecords.length > 0 ? filteredRecords : visibleSnapshotRecords;

  const totalLicensedUsers = visibleRecords.reduce(
    (sum, record) => sum + record.licensedUsers,
    0
  );
  const totalActiveUsers = visibleRecords.reduce(
    (sum, record) => sum + record.activeUsers,
    0
  );
  const totalSessions = visibleRecords.reduce(
    (sum, record) => sum + record.copilotSessions,
    0
  );
  const totalTokens = visibleRecords.reduce((sum, record) => sum + record.totalTokens, 0);
  const totalWorkflows = visibleRecords.reduce(
    (sum, record) => sum + record.completedWorkflows,
    0
  );
  const totalAcceptedRecommendations = visibleRecords.reduce(
    (sum, record) => sum + record.acceptedRecommendations,
    0
  );
  const orgAdoptionRate = round1((totalActiveUsers / totalLicensedUsers) * 100);
  const orgValueRate = round1(
    average(visibleRecords.map((record) => record.valueRealizationRate))
  );
  const orgEfficiencyScore = round2(
    average(visibleRecords.map((record) => record.costPerOutcomeIndex))
  );
  const averageTokensPerUser = round1(totalTokens / totalActiveUsers);
  const averageSatisfaction = round1(
    average(visibleRecords.map((record) => record.satisfactionScore))
  );

  const alertCandidates = [...visibleRecords]
    .filter(
      (record) => record.totalTokens > 1_000_000 && record.valueRealizationRate < 66
    )
    .sort(
      (left, right) =>
        right.totalTokens / Math.max(right.valueRealizationRate, 1) -
        left.totalTokens / Math.max(left.valueRealizationRate, 1)
    );
  const alertRecord = alertCandidates[0] ?? [...visibleRecords].sort(
    (left, right) =>
      right.costPerOutcomeIndex - left.costPerOutcomeIndex ||
      right.totalTokens - left.totalTokens
  )[0];

  const watchlistRecords = [...visibleRecords].filter(
    (record) =>
      record.costPerOutcomeIndex >= 1.5 ||
      record.valueRealizationRate < 62 ||
      record.tokenTrend < -0.4
  );

  const lowAdoptionRecord = [...visibleRecords].sort(
    (left, right) => left.adoptionRate - right.adoptionRate
  )[0];
  const scaleRecord = [...visibleRecords].sort(
    (left, right) =>
      right.valueRealizationRate + right.satisfactionScore * 5 -
      (left.valueRealizationRate + left.satisfactionScore * 5)
  )[0];
  const blockerRecord = [...visibleRecords].sort(
    (left, right) =>
      right.blockersResolved / Math.max(right.activeUsers, 1) -
      left.blockersResolved / Math.max(left.activeUsers, 1)
  )[0];

  const efficiencyTargetIndex = 1.0;
  const reclaimableTokens = Math.round(
    watchlistRecords.reduce((sum, record) => {
      if (record.costPerOutcomeIndex <= efficiencyTargetIndex) return sum;
      return (
        sum + record.totalTokens * (1 - efficiencyTargetIndex / record.costPerOutcomeIndex)
      );
    }, 0)
  );
  const reclaimableTokenShare =
    totalTokens > 0 ? round1((reclaimableTokens / totalTokens) * 100) : 0;

  // alertRecord is always the worst record in the visible set, but it is only
  // a genuine concern when it clears a real threshold. Index >= 1.0 or a
  // high-token/low-value candidate qualifies as a true alert.
  const isGenuineAlert =
    alertCandidates.length > 0 || alertRecord.costPerOutcomeIndex >= 1.0;

  const recommendations: Recommendation[] = [
    {
      id: `${alertRecord.businessUnit}-${alertRecord.copilotId}-cost-outcome`.toLowerCase(),
      title: `Cut high-token waste in ${alertRecord.businessUnit}`,
      focusArea: `${alertRecord.copilotName} is consuming ${formatCompact(
        alertRecord.totalTokens
      )} tokens with only ${formatPercent(alertRecord.valueRealizationRate)} outcome rate.`,
      narrative: `Introduce reusable prompt templates and short task caps for ${alertRecord.businessUnit} to reduce exploratory usage without losing adoption momentum.`,
      impact: `Target a 9-12 point lift in cost-per-outcome performance over the next review cycle.`,
      owner: 'Strategy PMO',
      dueDate: '2026-08-06',
    },
    {
      id: `${lowAdoptionRecord.businessUnit}-${lowAdoptionRecord.copilotId}-adoption`.toLowerCase(),
      title: `Re-activate low adoption in ${lowAdoptionRecord.businessUnit}`,
      focusArea: `${lowAdoptionRecord.copilotName} adoption is at ${formatPercent(
        lowAdoptionRecord.adoptionRate
      )}, well below the leadership target.`,
      narrative: `Pair enablement sessions with a business-specific workflow playbook so teams can move from experimentation into repeated usage.`,
      impact: `Recover 15-20 active users and convert unused licenses into workflow completions.`,
      owner: 'Enablement Lead',
      dueDate: '2026-08-12',
    },
    {
      id: `${scaleRecord.businessUnit}-${scaleRecord.copilotId}-scale`.toLowerCase(),
      title: `Scale the strongest outcome motion from ${scaleRecord.businessUnit}`,
      focusArea: `${scaleRecord.copilotName} is returning ${formatPercent(
        scaleRecord.valueRealizationRate
      )} outcome rate with a ${scaleRecord.costPerOutcomeIndex.toFixed(2)} cost-per-outcome index.`,
      narrative: `Capture the top prompts, workflow sequencing, and acceptance patterns from the best-performing team and replicate them in adjacent business units.`,
      impact: `Expand proven usage patterns instead of funding more generic experimentation.`,
      owner: 'Copilot Center of Excellence',
      dueDate: '2026-08-15',
    },
    {
      id: `${blockerRecord.businessUnit}-${blockerRecord.copilotId}-blockers`.toLowerCase(),
      title: `Turn blocker resolution into operating leverage`,
      focusArea: `${blockerRecord.businessUnit} is resolving blockers quickly, which indicates a reusable support motion for ${blockerRecord.copilotName}.`,
      narrative: `Formalize the top resolved blocker patterns into an action runbook and connect that runbook to weekly adoption reviews.`,
      impact: `Reduce time-to-value for teams still stalled by approval, data access, or prompt quality issues.`,
      owner: 'Operations Excellence',
      dueDate: '2026-08-18',
    },
  ];

  const selectedRecommendation =
    recommendations.find((recommendation) => recommendation.id === selectedRecommendationId) ??
    recommendations[0];

  const answerDataAgentQuestion = (question: string) => {
    const normalized = question.toLowerCase();
    const worstRecords = [...visibleRecords].sort(
      (left, right) =>
        right.costPerOutcomeIndex - left.costPerOutcomeIndex ||
        right.totalTokens - left.totalTokens ||
        left.valueRealizationRate - right.valueRealizationRate
    );
    const worst = worstRecords[0];
    const best = [...visibleRecords].sort(
      (left, right) =>
        left.costPerOutcomeIndex - right.costPerOutcomeIndex ||
        right.valueRealizationRate - left.valueRealizationRate
    )[0];

    if (normalized.includes('watch') || normalized.includes('risk') || normalized.includes('action')) {
      const topRisks = worstRecords
        .filter((record) => record.costPerOutcomeIndex >= 1.5)
        .slice(0, 4);
      const riskSummary =
        topRisks.length > 0
          ? topRisks
              .map(
                (record) =>
                  `${record.businessUnit} / ${record.copilotName} (${record.costPerOutcomeIndex.toFixed(2)})`
              )
              .join('; ')
          : `${worst.businessUnit} / ${worst.copilotName} is the highest current index at ${worst.costPerOutcomeIndex.toFixed(2)}.`;

      return `Top action areas: ${riskSummary}. Recommended next move: ${selectedRecommendation.title}. ${selectedRecommendation.impact}`;
    }

    if (normalized.includes('token') || normalized.includes('cost')) {
      return `Current scope consumed ${formatCompact(totalTokens)} tokens across ${formatInteger(totalSessions)} sessions. Average Cost per Outcome Index is ${orgEfficiencyScore}. The highest token-pressure segment is ${worst.businessUnit} / ${worst.copilotName} with ${formatCompact(worst.totalTokens)} tokens and a ${worst.costPerOutcomeIndex.toFixed(2)} index.`;
    }

    if (normalized.includes('adoption') || normalized.includes('user')) {
      return `Portfolio adoption is ${formatPercent(orgAdoptionRate)} with ${formatInteger(totalActiveUsers)} active users out of ${formatInteger(totalLicensedUsers)} licensed users. The lowest adoption segment is ${lowAdoptionRecord.businessUnit} / ${lowAdoptionRecord.copilotName} at ${formatPercent(lowAdoptionRecord.adoptionRate)}.`;
    }

    if (normalized.includes('best') || normalized.includes('scale') || normalized.includes('efficient')) {
      return `Best current pattern: ${best.businessUnit} / ${best.copilotName} with a ${best.costPerOutcomeIndex.toFixed(2)} Cost per Outcome Index and ${formatPercent(best.valueRealizationRate)} value realization. Scale motion: ${scaleRecord.businessUnit} / ${scaleRecord.copilotName}.`;
    }

    return `For ${selectedSnapshotDate}, CTCC shows ${formatPercent(orgAdoptionRate)} adoption, ${formatCompact(totalTokens)} tokens, ${formatPercent(orgValueRate)} value realization, and ${watchlistRecords.length} watchlist segments. The priority recommendation is: ${selectedRecommendation.title}.`;
  };

  const submitDataAgentQuestion = (question = dataAgentInput) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const userMessage: DataAgentMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    const agentMessage: DataAgentMessage = {
      id: `agent-${Date.now()}`,
      role: 'agent',
      content: answerDataAgentQuestion(trimmed),
    };

    setDataAgentMessages((current) => [...current, userMessage, agentMessage]);
    setDataAgentInput('');
    setDataAgentOpen(true);
  };

  const actionCounts = actionStatuses.reduce<Record<ActionStatus, number>>(
    (counts, status) => ({
      ...counts,
      [status]: actions.filter((action) => action.status === status).length,
    }),
    {
      'Not started': 0,
      'In progress': 0,
      Blocked: 0,
      Done: 0,
    }
  );

  const totalActions =
    actionCounts['Not started'] +
    actionCounts['In progress'] +
    actionCounts.Blocked +
    actionCounts.Done;
  const actionProgressWidth = (count: number) =>
    totalActions > 0 ? `${(count / totalActions) * 100}%` : '0%';

  const matrixCellDetails = visibleRecords.map<MatrixCellDetails>((record) => ({
    key: `${record.businessUnit}-${record.copilotId}`,
    businessUnit: record.businessUnit,
    copilotId: record.copilotId,
    copilotName: record.copilotName,
    costPerOutcomeIndex: record.costPerOutcomeIndex,
    adoptionRate: record.adoptionRate,
    valueRealizationRate: record.valueRealizationRate,
    acceptedOutputRate: record.acceptedOutputRate,
    activeUsers: record.activeUsers,
    licensedUsers: record.licensedUsers,
    totalTokens: record.totalTokens,
    completedWorkflows: record.completedWorkflows,
    tokenTrend: record.tokenTrend,
    portfolioStatus: record.portfolioStatus,
    recommendedAction: getRecommendedMatrixAction(record),
    costBand: getMatrixBand(record.costPerOutcomeIndex),
  }));

  const matrixCellLookup = new Map(
    matrixCellDetails.map((record) => [record.key, record])
  );

  const matrixRows = businessUnits.map((businessUnit) => {
    const records = visibleRecords.filter((record) => record.businessUnit === businessUnit);
    const avgIndex = round2(average(records.map((record) => record.costPerOutcomeIndex)));
    const bestCopilot = getRowBestCopilot(records);
    const primaryRisk = getRowPrimaryRisk(records);

    return {
      businessUnit,
      avgIndex,
      bestCopilot,
      primaryRisk,
      cells: copilots.map((copilot) =>
        records.find((record) => record.copilotId === copilot.id)
      ),
    };
  });

  const topWatchlist: MatrixWatchlistRow[] = [...visibleRecords]
    .sort(
      (left, right) =>
        right.costPerOutcomeIndex - left.costPerOutcomeIndex ||
        right.totalTokens - left.totalTokens ||
        left.valueRealizationRate - right.valueRealizationRate
    )
    .slice(0, 5)
    .map((record, index) => ({
      rank: index + 1,
      businessUnit: record.businessUnit,
      copilotId: record.copilotId,
      copilotName: record.copilotName,
      costPerOutcomeIndex: record.costPerOutcomeIndex,
      adoptionRate: record.adoptionRate,
      outcomeRate: record.copilotId === 'github' ? record.acceptedOutputRate : record.valueRealizationRate,
      totalTokens: record.totalTokens,
      recommendedAction: getRecommendedMatrixAction(record),
    }));

  const selectedMatrixCell =
    (selectedMatrixCellKey ? matrixCellLookup.get(selectedMatrixCellKey) : null) ??
    matrixCellDetails.find((record) => record.costBand !== 'low-data') ??
    null;

  const selectedMatrixNarrative = selectedMatrixCell
    ? selectedMatrixCell.costBand === 'strong'
      ? 'Efficient usage with strong output quality and acceptable token intensity.'
      : selectedMatrixCell.costBand === 'monitor'
        ? 'Healthy enough to keep running, but worth watching for drift in outcome efficiency.'
        : selectedMatrixCell.costBand === 'watchlist'
          ? 'Token usage is rising faster than observable value. This is a watchlist cell.'
          : 'Token consumption is high relative to value realization and should be treated as a cost concern.'
    : 'Click any cell to inspect the underlying operating signal.';

  const productComparisonBase = copilots.map((copilot) => {
    const records = visibleRecords.filter((record) => record.copilotId === copilot.id);
    const activeUsers = records.reduce((sum, record) => sum + record.activeUsers, 0);
    const licensedUsers = records.reduce((sum, record) => sum + record.licensedUsers, 0);
    const totalTokens = records.reduce((sum, record) => sum + record.totalTokens, 0);
    const workflows = records.reduce((sum, record) => sum + record.completedWorkflows, 0);
    const valueRealizationRate = round1(
      average(records.map((record) => record.valueRealizationRate))
    );
    const acceptedOutputRate = round2(
      average(records.map((record) => record.acceptedOutputRate))
    );
    const primaryOutcomeRate =
      copilot.id === 'github'
        ? acceptedOutputRate
        : round2(average(records.map((record) => record.valueRealizationRate / 100)));
    const tokenTrend = round1(average(records.map((record) => record.tokenTrend)));
    const adoptionRate = round1(
      (activeUsers / Math.max(licensedUsers, 1)) * 100
    );
    const highTokenLowValue = totalTokens > 1_000_000 && valueRealizationRate < 66;

    return {
      ...copilot,
      activeUsers,
      licensedUsers,
      adoptionRate,
      totalTokens,
      workflows,
      acceptedOutputRate,
      valueRealizationRate,
      primaryOutcomeRate,
      tokenTrend,
      highTokenLowValue,
    };
  });

  const maxProductTokens = Math.max(
    ...productComparisonBase.map((product) => product.totalTokens),
    1
  );

  const productComparisonWithIndex = productComparisonBase.map((product) => {
    const normalizedTokenUsage = round2(product.totalTokens / maxProductTokens);
    const costPerOutcomeIndex = round2(
      normalizedTokenUsage / Math.max(product.primaryOutcomeRate, 0.05)
    );

    return {
      ...product,
      normalizedTokenUsage,
      costPerOutcomeIndex,
    };
  });

  const productComparison = productComparisonWithIndex.map((product) => ({
    ...product,
    status: getPortfolioStatus(
      product.activeUsers,
      product.workflows,
      product.valueRealizationRate,
      product.costPerOutcomeIndex,
      product.tokenTrend,
      product.highTokenLowValue
    ),
  }));

  const priorityPortfolioRows = productComparison
    .filter(
      (product) =>
        product.status === 'Watchlist' || product.status === 'Low-value'
    )
    .sort((left, right) => right.totalTokens - left.totalTokens);

  const portfolioInsight =
    priorityPortfolioRows.length > 0
      ? `${priorityPortfolioRows
          .slice(0, 2)
          .map((product) => product.name)
          .join(' and ')} show elevated token usage with ${priorityPortfolioRows
          .slice(0, 2)
          .map((product) =>
            getTrendDirection(product.tokenTrend) === 'down' ? 'declining' : 'flat'
          )
          .join(' and ')} trend signals. Review top workflows and create optimization actions.`
      : 'Portfolio signals are mostly stable and efficient. Continue scaling proven workflows and monitor trend changes weekly.';

  const flashNewAction = (actionId: string) => {
    setNewActionIds((current) =>
      current.includes(actionId) ? current : [actionId, ...current]
    );
    window.setTimeout(() => {
      setNewActionIds((current) => current.filter((id) => id !== actionId));
    }, 6000);
  };

  const createAction = async (recommendation: Recommendation) => {
    setSelectedRecommendationId(recommendation.id);

    const duplicate = actions.find(
      (action) => action.linkedRecommendationId === recommendation.id
    );
    if (duplicate) {
      setActiveTab('portfolio');
      setActionsStatusMessage(`An action already exists for: ${recommendation.title}`);
      flashNewAction(duplicate.id);
      return;
    }

    const tempId = `action-${Date.now()}`;
    const optimisticAction: ActionItem = {
      id: tempId,
      title: recommendation.title,
      owner: recommendation.owner,
      dueDate: getUpcomingFridayDateOnly(),
      status: 'Not started',
      outcome: recommendation.impact,
      linkedRecommendationId: recommendation.id,
    };

    setActions((current) => [optimisticAction, ...current]);
    flashNewAction(tempId);
    setActiveTab('portfolio');
    setActionsStatusMessage(`Created action: ${recommendation.title}`);

    if (actionsStorageMode === 'local' || !user?.id) {
      return;
    }

    try {
      const created = await getRayfinClient().data.CtccAction.create({
        title: recommendation.title,
        owner: recommendation.owner,
        dueDate: optimisticAction.dueDate,
        status: 'Not started',
        outcome: recommendation.impact,
        linkedRecommendationId: recommendation.id,
        user_id: user.id,
      });

      setActions((current) =>
        current.map((action) =>
          action.id === tempId
            ? {
                id: created.id,
                title: created.title,
                owner: created.owner,
                dueDate: formatDateOnly(created.dueDate as string | Date),
                status: asActionStatus(created.status),
                outcome: created.outcome,
                linkedRecommendationId: created.linkedRecommendationId,
              }
            : action
        )
      );
      setNewActionIds((current) =>
        current.map((id) => (id === tempId ? created.id : id))
      );
      flashNewAction(created.id);
    } catch {
      setActionsStatusMessage(
        'Action added locally, but it could not sync to Rayfin and will not persist after a refresh.'
      );
    }
  };

  const setActionStatus = async (actionId: string, nextStatus: ActionStatus) => {
    const action = actions.find((item) => item.id === actionId);
    if (!action) return;

    if (nextStatus === action.status) return;

    setActions((current) =>
      current.map((item) =>
        item.id === actionId ? { ...item, status: nextStatus } : item
      )
    );

    if (actionsStorageMode === 'local') return;

    try {
      await getRayfinClient().data.CtccAction.update(
        { id: actionId },
        { status: nextStatus }
      );
    } catch {
      setActions((current) =>
        current.map((item) =>
          item.id === actionId ? { ...item, status: action.status } : item
        )
      );
      setActionsStatusMessage(
        'Unable to update action status in Rayfin. Restored previous value.'
      );
    }
  };

  const setBlocked = async (actionId: string, blocked: boolean) => {
    const action = actions.find((item) => item.id === actionId);
    if (!action || action.status === 'Done') return;

    const nextStatus: ActionStatus = blocked ? 'Blocked' : 'In progress';

    if (nextStatus === action.status) return;

    setActions((current) =>
      current.map((item) =>
        item.id === actionId ? { ...item, status: nextStatus } : item
      )
    );

    if (actionsStorageMode === 'local') return;

    try {
      await getRayfinClient().data.CtccAction.update(
        { id: actionId },
        { status: nextStatus }
      );
    } catch {
      setActions((current) =>
        current.map((item) =>
          item.id === actionId ? { ...item, status: action.status } : item
        )
      );
      setActionsStatusMessage(
        'Unable to update blocked status in Rayfin. Restored previous value.'
      );
    }
  };

  const setDueDate = async (actionId: string, nextDueDate: string) => {
    const action = actions.find((item) => item.id === actionId);
    if (!action || !nextDueDate || nextDueDate === action.dueDate) return;

    const previousDueDate = action.dueDate;

    setActions((current) =>
      current.map((item) =>
        item.id === actionId ? { ...item, dueDate: nextDueDate } : item
      )
    );

    if (actionsStorageMode === 'local') return;

    try {
      await getRayfinClient().data.CtccAction.update(
        { id: actionId },
        { dueDate: nextDueDate }
      );
    } catch {
      setActions((current) =>
        current.map((item) =>
          item.id === actionId ? { ...item, dueDate: previousDueDate } : item
        )
      );
      setActionsStatusMessage(
        'Unable to update due date in Rayfin. Restored previous value.'
      );
    }
  };

  const generateSummary = () => {
    const doneActions = actions.filter((action) => action.status === 'Done').length;
    const inFlightActions = actions.filter(
      (action) => action.status === 'In progress' || action.status === 'Blocked'
    ).length;
    const scopeLabel =
      selectedUnit === 'All' && selectedCopilot === 'All'
        ? 'the enterprise Copilot portfolio'
        : `${selectedUnit === 'All' ? 'cross-functional' : selectedUnit} ${
            selectedCopilot === 'All'
              ? 'Copilot usage'
              : copilots.find((copilot) => copilot.id === selectedCopilot)?.name
          }`;

    setExecutiveSummary(
      isGenuineAlert
        ? `CTCC indicates that ${scopeLabel} is operating at ${formatPercent(
            orgAdoptionRate
          )} adoption with ${formatCompact(totalTokens)} tokens consumed across ${formatInteger(
            totalSessions
          )} sessions. The main cost-outcome concern is ${alertRecord.businessUnit} using ${
            alertRecord.copilotName
          }, where ${formatCompact(alertRecord.totalTokens)} tokens are only yielding ${formatPercent(
            alertRecord.valueRealizationRate
          )} outcome rate and a cost-per-outcome index of ${alertRecord.costPerOutcomeIndex.toFixed(2)}. The priority recommendation is to ${selectedRecommendation.title.toLowerCase()}, which should ${selectedRecommendation.impact.toLowerCase()} ${doneActions} actions are already complete and ${inFlightActions} are in flight, giving leadership a concrete path from insight to action before the next business review.`
        : `CTCC indicates that ${scopeLabel} is operating at ${formatPercent(
            orgAdoptionRate
          )} adoption with ${formatCompact(totalTokens)} tokens consumed across ${formatInteger(
            totalSessions
          )} sessions. No segments are flagged as cost-outcome concerns — the highest index in the current lens is ${alertRecord.costPerOutcomeIndex.toFixed(2)} (${alertRecord.businessUnit} / ${alertRecord.copilotName}), which is within efficient range. The focus recommendation is to ${selectedRecommendation.title.toLowerCase()}, which should ${selectedRecommendation.impact.toLowerCase()} ${doneActions} actions are already complete and ${inFlightActions} are in flight.`
    );
  };

  return (
    <div className="ctcc-shell px-4 py-5 sm:px-6 lg:px-8 lg:pl-60">
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 pb-10">
        <div className="ctcc-userbar absolute right-0 -top-[5px]">
          <span className="ctcc-userbar__text">
            Signed in as <strong>{user?.name ?? 'Executive user'}</strong>
          </span>
          <button
            type="button"
            onClick={() => void signOut()}
            className="ctcc-userbar__signout"
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>

        <p className="ctcc-problem-line">
          <span className="eyebrow ctcc-action-spotlight__eyebrow">The problem:</span>
          <span className="text-sm font-medium leading-6 text-slate-200">
            Enterprises spend heavily on Copilot tokens but can&rsquo;t see whether that
            spend produces real outcomes.
          </span>
        </p>

        <div className="ctcc-header-brand -mt-4">
          <span className="eyebrow ctcc-action-spotlight__eyebrow">The Solution:</span>
          <p className="ctcc-brand-title">Copilot Token Command Center</p>
          <div className="ml-auto flex flex-col items-end gap-1" style={{ transform: 'translateY(7px)' }}>
            <span
              className={`ctcc-data-pill ${
                metricsStorageMode === 'remote'
                  ? 'ctcc-data-pill--live'
                  : 'ctcc-data-pill--fallback'
              }`}
              style={{ alignSelf: 'flex-end' }}
              title={
                metricsStorageMode === 'remote'
                  ? 'Metrics are loading live from the Rayfin SQL backend.'
                  : 'Rayfin backend unavailable — showing in-memory fallback data.'
              }
            >
              <span className="ctcc-data-dot" aria-hidden="true" />
              {metricsStorageMode === 'remote' ? 'Live Rayfin SQL' : 'Fallback data'}
            </span>
            <span className="ctcc-week-caption">
              For week ending: {formatWeekEndingFriday(selectedSnapshotDate)}
            </span>
          </div>
        </div>

        <section className="ctcc-kpi-band -mt-4" aria-label="Key performance indicators">
          <nav className="ctcc-sidenav" aria-label="Primary navigation">
            <div className="ctcc-tablist" role="tablist" aria-label="CTCC dashboard areas">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
                className={`ctcc-sidenav__item ${activeTab === 'overview' ? 'is-active' : ''}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
                <span className="ctcc-sidenav__label">Overview</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'insights'}
                onClick={() => setActiveTab('insights')}
                className={`ctcc-sidenav__item ${activeTab === 'insights' ? 'is-active' : ''}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 20V4" />
                  <path d="M4 20h16" />
                  <path d="M8 16l3.5-4 3 2.5L20 8" />
                </svg>
                <span className="ctcc-sidenav__label">Insights</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'portfolio'}
                onClick={() => setActiveTab('portfolio')}
                className={`ctcc-sidenav__item ${activeTab === 'portfolio' ? 'is-active' : ''}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3 3 7.5l9 4.5 9-4.5L12 3Z" />
                  <path d="M3 12l9 4.5L21 12" />
                  <path d="M3 16.5 12 21l9-4.5" />
                </svg>
                <span className="ctcc-sidenav__label">Actions</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'summary'}
                onClick={() => setActiveTab('summary')}
                className={`ctcc-sidenav__item ${activeTab === 'summary' ? 'is-active' : ''}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="5" y="3" width="14" height="18" rx="2" />
                  <path d="M9 8h6" />
                  <path d="M9 12h6" />
                  <path d="M9 16h4" />
                </svg>
                <span className="ctcc-sidenav__label">Summary</span>
              </button>
            </div>
          </nav>
          <div className="ctcc-kpi">
            <span className="ctcc-kpi__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="8" r="3.25" />
                <path d="M2.75 19a6.25 6.25 0 0 1 12.5 0" />
                <path d="M16.5 5.4a3 3 0 0 1 0 5.2" />
                <path d="M18 19a6.25 6.25 0 0 0-2.4-4.9" />
              </svg>
            </span>
            <span className="ctcc-kpi__label">Active users</span>
            <strong>{formatInteger(totalActiveUsers)}</strong>
            <span className="ctcc-kpi__meta">{formatPercent(orgAdoptionRate)} portfolio adoption</span>
          </div>
          <div className="ctcc-kpi">
            <span className="ctcc-kpi__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2.5" y="6" width="19" height="12" rx="1.6" />
                <circle cx="12" cy="12" r="2.4" />
                <path d="M12 9.8v4.4" />
                <path d="M13.1 10.7c-.55-.5-2.1-.4-2.1.55 0 .95 2.1.5 2.1 1.5 0 .95-1.55 1.05-2.1.55" />
                <path d="M5.4 12h.01" />
                <path d="M18.6 12h.01" />
              </svg>
            </span>
            <span className="ctcc-kpi__label">Cost per outcome index</span>
            <strong>{orgEfficiencyScore}</strong>
            <span className="ctcc-kpi__meta">{formatPercent(orgValueRate)} outcome rate</span>
          </div>
          <div className="ctcc-kpi">
            <span className="ctcc-kpi__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" />
              </svg>
            </span>
            <span className="ctcc-kpi__label">Workflow throughput</span>
            <strong>{formatInteger(totalWorkflows)}</strong>
            <span className="ctcc-kpi__meta">
              {formatInteger(totalAcceptedRecommendations)} accepted recommendations
            </span>
          </div>
          <div className="ctcc-kpi">
            <span className="ctcc-kpi__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m12 3.5 2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 17.77l-5.2 2.73.99-5.79-4.21-4.1 5.82-.85L12 3.5Z" />
              </svg>
            </span>
            <span className="ctcc-kpi__label">Satisfaction</span>
            <strong>{formatScore(averageSatisfaction)}/5</strong>
            <span className="ctcc-kpi__meta">
              {formatInteger(Math.round(averageTokensPerUser))} tokens per active user
            </span>
          </div>
        </section>

        {activeTab === 'overview' && (
          <section className="glass-panel hero-panel overflow-hidden">
            <div className="border-l-[3px] border-[color:var(--ctcc-accent)] pl-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="eyebrow ctcc-action-spotlight__eyebrow">Recommended next action</p>
                  <span className="ctcc-action-spotlight__tag">
                    {selectedRecommendation.focusArea}
                  </span>
                </div>
                <p className="mt-2 text-lg font-semibold leading-6 text-white">
                  {selectedRecommendation.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {selectedRecommendation.impact}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => void createAction(selectedRecommendation)}
                    className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.16]"
                  >
                    Create Action
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('insights')}
                    className="inline-flex items-center justify-center rounded-lg border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:bg-white/10"
                  >
                    View insights
                  </button>
                </div>
                <div
                  className="ctcc-progress mt-4"
                  role="img"
                  aria-label={`Action progress: ${actionCounts.Done} done, ${actionCounts['In progress']} in progress, ${actionCounts.Blocked} blocked, ${actionCounts['Not started']} not started`}
                >
                  {totalActions > 0 ? (
                    <>
                      <span
                        className="ctcc-progress__seg ctcc-progress__seg--done"
                        style={{ width: actionProgressWidth(actionCounts.Done) }}
                      />
                      <span
                        className="ctcc-progress__seg ctcc-progress__seg--active"
                        style={{ width: actionProgressWidth(actionCounts['In progress']) }}
                      />
                      <span
                        className="ctcc-progress__seg ctcc-progress__seg--blocked"
                        style={{ width: actionProgressWidth(actionCounts.Blocked) }}
                      />
                      <span
                        className="ctcc-progress__seg ctcc-progress__seg--todo"
                        style={{ width: actionProgressWidth(actionCounts['Not started']) }}
                      />
                    </>
                  ) : (
                    <span className="ctcc-progress__seg ctcc-progress__seg--todo" style={{ width: '100%' }} />
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="ctcc-action-chip">{watchlistRecords.length} watchlist segments</span>
                  <span className="ctcc-action-chip">{actionCounts['In progress']} in progress</span>
                  <span className="ctcc-action-chip ctcc-action-chip--warn">
                    {actionCounts.Blocked} blocked
                  </span>
                  <span className="ctcc-action-chip ctcc-action-chip--done">
                    {actionCounts.Done} done
                  </span>
                </div>
            </div>
        </section>
        )}

        {(metricsStatusMessage || actionsStatusMessage) && (
          <section
            className="glass-panel border border-[#fbbf24]/35 bg-[#fff8e6] p-4"
            aria-live="polite"
          >
            {metricsStatusMessage && (
              <p className="text-sm font-medium text-[#9a5b00]">{metricsStatusMessage}</p>
            )}
            {actionsStatusMessage && (
              <p className="mt-2 text-sm font-medium text-[#9a5b00]">{actionsStatusMessage}</p>
            )}
          </section>
        )}

        {activeTab === 'overview' && (
          <OverviewTab
            isGenuineAlert={isGenuineAlert}
            alertRecord={alertRecord}
            onConvertAlert={() => void createAction(recommendations[0])}
            productComparison={productComparison}
            maxProductTokens={maxProductTokens}
            portfolioInsight={portfolioInsight}
            recommendations={recommendations}
            onCreateAction={(rec) => void createAction(rec)}
            onViewInsights={() => setActiveTab('insights')}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsTab
            matrixRows={matrixRows}
            copilots={copilots}
            topWatchlist={topWatchlist}
            selectedMatrixCellKey={selectedMatrixCellKey}
            onCellSelect={setSelectedMatrixCellKey}
            selectedMatrixCell={selectedMatrixCell}
            selectedMatrixNarrative={selectedMatrixNarrative}
            recommendations={recommendations}
            selectedRecommendation={selectedRecommendation}
            onSelectRecommendation={setSelectedRecommendationId}
            onStageAction={(rec) => void createAction(rec)}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioTab
            actions={actions}
            newActionIds={newActionIds}
            actionsStatusMessage={actionsStatusMessage}
            actionCounts={actionCounts}
            onStatusChange={(id, status) => void setActionStatus(id, status)}
            onBlockedChange={(id, blocked) => void setBlocked(id, blocked)}
            onDueDateChange={(id, dueDate) => void setDueDate(id, dueDate)}
          />
        )}

        {activeTab === 'summary' && (
          <SummaryTab
            executiveSummary={executiveSummary}
            isGenuineAlert={isGenuineAlert}
            alertRecord={alertRecord}
            selectedRecommendation={selectedRecommendation}
            actionCounts={actionCounts}
            orgEfficiencyScore={orgEfficiencyScore}
            orgValueRate={orgValueRate}
            reclaimableTokens={reclaimableTokens}
            reclaimableTokenShare={reclaimableTokenShare}
            watchlistCount={watchlistRecords.length}
            onGenerate={generateSummary}
          />
        )}

        <aside className="fixed bottom-5 right-5 z-30 w-[min(24rem,calc(100vw-2rem))]">
          {dataAgentOpen && (
            <div className="glass-panel mb-3 overflow-hidden">
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7fb0ff]">
                    Data Agent
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-slate-950">
                    Chat with CTCC data
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setDataAgentOpen(false)}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  aria-label="Close Data Agent"
                >
                  Close
                </button>
              </div>
              <div className="max-h-80 space-y-3 overflow-y-auto px-4 py-3">
                {dataAgentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-lg px-3 py-2 text-sm leading-6 ${
                      message.role === 'user'
                        ? 'ml-8 bg-[#7fb0ff] text-[#10233f]'
                        : 'mr-8 border border-slate-200 bg-slate-100 text-slate-800'
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 px-4 py-3">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {['What needs action?', 'Where are tokens high?', 'Best performer?'].map(
                    (starter) => (
                      <button
                        key={starter}
                        type="button"
                        onClick={() => submitDataAgentQuestion(starter)}
                        className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-[#7fb0ff]/60 hover:bg-slate-100"
                      >
                        {starter}
                      </button>
                    )
                  )}
                </div>
                <form
                  className="flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    submitDataAgentQuestion();
                  }}
                >
                  <input
                    value={dataAgentInput}
                    onChange={(event) => setDataAgentInput(event.target.value)}
                    placeholder="Ask about watchlist, tokens, adoption..."
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#7fb0ff]"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-[#7fb0ff] px-3 py-2 text-sm font-semibold text-[#10233f] transition hover:bg-[#6f9fe6]"
                  >
                    Ask
                  </button>
                </form>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setDataAgentOpen((current) => !current)}
            className="ml-auto flex items-center gap-2 rounded-full border border-white/12 bg-[#7fb0ff] px-4 py-3 text-sm font-semibold text-[#10233f] shadow-lg shadow-slate-950/25 transition hover:bg-[#6f9fe6]"
          >
            <span className="h-2 w-2 rounded-full bg-[#4ade80]" />
            {dataAgentOpen ? 'Hide Data Agent' : 'Chat'}
          </button>
        </aside>

        <footer className="flex flex-wrap items-center justify-center gap-2 pb-2">
          <button
            type="button"
            onClick={() => setGlossaryOpen(true)}
            className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-[#6ea8ff]/60 hover:bg-white/10"
          >
            Glossary of Business Rules and Terms
          </button>
          <button
            type="button"
            onClick={() => setMethodologyOpen(true)}
            className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-[#6ea8ff]/60 hover:bg-white/10"
          >
            Outcome Index Methodology
          </button>
        </footer>

        {glossaryOpen && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-4 py-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ctcc-glossary-title"
            onClick={() => setGlossaryOpen(false)}
          >
            <div
              className="glass-panel w-full max-w-3xl p-4 sm:p-5"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">Glossary</p>
                  <h2
                    id="ctcc-glossary-title"
                    className="mt-2 text-2xl font-semibold tracking-tight text-slate-50"
                  >
                    Business Rules and Analytics Terms
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setGlossaryOpen(false)}
                  className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:border-[#6ea8ff]/60 hover:bg-white/10"
                  aria-label="Close glossary popup"
                >
                  Close
                </button>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Definitions below describe how CTCC interprets adoption, value, and operational progress across Copilot surfaces.
              </p>

              <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                {glossaryEntries.map((entry) => (
                  <article
                    key={entry.term}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <h3 className="text-base font-semibold text-slate-50">{entry.term}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-200">{entry.definition}</p>
                    {entry.businessRule && (
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        <span className="font-semibold text-slate-200">Rule:</span>{' '}
                        {entry.businessRule}
                      </p>
                    )}
                    {entry.businessRuleBullets && entry.businessRuleBullets.length > 0 && (
                      <ul className="mt-2 list-disc pl-5 text-sm leading-6 text-slate-400">
                        {entry.businessRuleBullets.map((rule) => (
                          <li key={rule}>{rule}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {methodologyOpen && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-4 py-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ctcc-methodology-title"
            onClick={() => setMethodologyOpen(false)}
          >
            <div
              className="glass-panel w-full max-w-5xl p-4 sm:p-5"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">Reference</p>
                  <h2
                    id="ctcc-methodology-title"
                    className="mt-2 text-2xl font-semibold tracking-tight text-slate-50"
                  >
                    Outcome Index Methodology
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMethodologyOpen(false)}
                  className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:border-[#6ea8ff]/60 hover:bg-white/10"
                  aria-label="Close outcome index methodology popup"
                >
                  Close
                </button>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-200">
                CTCC evaluates Copilot usage through an enterprise value lens. Token
                consumption alone does not prove value or waste. A high-token workflow
                may be worthwhile if it produces accepted outputs, completed work, or
                resolved blockers. A low-token workflow may still be low value if
                outputs are ignored or do not lead to action. For the prototype, CTCC
                emphasizes metrics that can be observed and measured reliably.
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-200">
                Each week contains one completed BatchRun and 40 weekly metric rows (8 business units × 5 copilots). Please continue reading for the full thought process leading to this methodology.
              </p>

              <div className="mt-4 max-h-[62vh] space-y-4 overflow-y-auto pr-1">
                <article className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-base font-semibold text-slate-50">
                    Common AI Value Metrics
                  </h3>
                  <div className="mt-3 overflow-x-auto rounded-lg border border-white/10">
                    <table className="methodology-table min-w-[860px] w-full border-separate border-spacing-0 text-left">
                      <thead>
                        <tr>
                          <th>Metric</th>
                          <th>What it measures</th>
                          <th>Observability</th>
                          <th>CTCC usage decision</th>
                        </tr>
                      </thead>
                      <tbody>
                        {methodologyMetricsRows.map((row) => (
                          <tr key={row.metric}>
                            <td>{row.metric}</td>
                            <td>{row.measure}</td>
                            <td>{row.observability}</td>
                            <td>{row.decision}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>

                <article className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-base font-semibold text-slate-50">
                    CTCC Pattern Logic
                  </h3>
                  <div className="mt-3 overflow-x-auto rounded-lg border border-white/10">
                    <table className="methodology-table min-w-[860px] w-full border-separate border-spacing-0 text-left">
                      <thead>
                        <tr>
                          <th>Usage pattern</th>
                          <th>Interpretation</th>
                          <th>Suggested action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {methodologyPatternRows.map((row) => (
                          <tr key={row.pattern}>
                            <td>{row.pattern}</td>
                            <td>{row.interpretation}</td>
                            <td>{row.action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>

                <article className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-base font-semibold text-slate-50">
                    Metric Fit by Copilot Experience
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Shows which observable value metrics are most appropriate for each Copilot
                    experience and explains why CTCC uses different primary outcome metrics
                    depending on the product.
                  </p>
                  <div className="mt-3 overflow-x-auto rounded-lg border border-white/10">
                    <table className="methodology-table min-w-[900px] w-full border-separate border-spacing-0 text-left">
                      <thead>
                        <tr>
                          <th>Copilot experience</th>
                          <th>Cost per Active User / Workflow</th>
                          <th>Accepted Output Rate</th>
                          <th>Value Realization Rate</th>
                          <th>Best primary metric</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metricFitRows.map((row) => (
                          <tr key={row.copilot}>
                            <td className="font-semibold text-slate-50 whitespace-nowrap">{row.copilot}</td>
                            <td>{row.costPerUser}</td>
                            <td>{row.acceptedOutput}</td>
                            <td>{row.valueRealization}</td>
                            <td>
                              <span className={`portfolio-status portfolio-status--soft ${
                                row.bestMetric === 'Accepted Output Rate'
                                  ? 'portfolio-status--stable'
                                  : 'portfolio-status--efficient'
                              }`}>
                                {row.bestMetric}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <aside className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm leading-6 text-slate-200">
                    CTCC uses <strong>Value Realization Rate</strong> as the default executive
                    outcome metric because it can represent completed workflows, accepted
                    recommendations, resolved blockers, and action creation across most Copilot
                    experiences. GitHub Copilot is the exception: CTCC uses{' '}
                    <strong>Accepted Output Rate</strong> as its primary outcome metric because
                    code suggestion acceptance is more directly observable and product-specific.
                  </aside>
                </article>

                <article className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h3 className="text-base font-semibold text-slate-50">
                    Cost per Outcome Index
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    CTCC calculates Cost per Outcome Index by comparing normalized
                    token consumption against the most relevant observable outcome
                    metric for each Copilot experience. For most Copilots, the
                    primary outcome metric is Value Realization Rate. For GitHub
                    Copilot, the primary metric is Accepted Output Rate because code
                    suggestion acceptance is more directly observable. Lower index
                    values indicate stronger outcome efficiency.
                  </p>
                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-white/[0.07] p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fbaff]">
                        Core Equation
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-50">
                        Cost per Outcome Index = Normalized Token Usage / Primary Outcome Metric
                      </p>
                      <p className="mt-2 text-xs leading-5 text-slate-300">
                        Normalized Token Usage = Copilot tokens used / highest token usage
                        across compared Copilots or teams.
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-300">
                        Primary Outcome Metric = Value Realization Rate (most Copilots);
                        GitHub Copilot uses Accepted Output Rate.
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.07] p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fbaff]">
                        Full Expression
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-50">
                        Cost per Outcome Index =
                        (tokens used / max tokens used in comparison group) /
                        primary outcome rate
                      </p>
                      <p className="mt-2 text-xs leading-5 text-slate-300">
                        Example: if normalized token usage is 0.82 and value
                        realization rate is 0.64, then 0.82 / 0.64 = 1.28.
                        Interpretation: acceptable / monitor.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 overflow-x-auto rounded-lg border border-white/10 bg-white/5">
                    <table className="methodology-table min-w-[640px] w-full border-separate border-spacing-0 text-left">
                      <thead>
                        <tr>
                          <th>Interpretation threshold</th>
                          <th>Meaning</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Lower is better</td>
                          <td>Lower index indicates stronger outcome efficiency.</td>
                        </tr>
                        <tr>
                          <td>&lt; 1.0</td>
                          <td>Strong outcome efficiency</td>
                        </tr>
                        <tr>
                          <td>1.0-1.5</td>
                          <td>Acceptable / monitor</td>
                        </tr>
                        <tr>
                          <td>1.5-2.0</td>
                          <td>Watchlist</td>
                        </tr>
                        <tr>
                          <td>&gt; 2.0</td>
                          <td>Cost-outcome concern</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </article>

                <aside className="rounded-lg border border-[#fbbf24]/35 bg-white/5 p-4 text-sm leading-6 text-slate-200">
                  <span className="font-semibold text-amber-200">Prototype assumption:</span>{' '}
                  CTCC uses realistic sample data to model how enterprises could
                  combine Copilot usage telemetry, cost proxies, accepted outputs,
                  workflow completion, blocker resolution, and action tracking. In
                  production, these metrics would come from Copilot usage reports,
                  app telemetry, workflow systems, surveys, and business system
                  integrations.
                </aside>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
