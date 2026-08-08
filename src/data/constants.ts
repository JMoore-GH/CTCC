import type {
  ActionItem,
  ActionStatus,
  BatchRunRecord,
  BusinessUnit,
  CopilotDefinition,
  CopilotId,
  GlossaryEntry,
  MetricFitRow,
  MethodologyMetricRow,
  MethodologyPatternRow,
  PortfolioStatus,
  ProductProfile,
  PrototypeSeedData,
  UnitProfile,
  UsageRecord,
} from '@/types';
import { clamp, round1, round2 } from '@/utils/math';

export const PROTOTYPE_FIRST_WEEK_ENDING = '2026-01-16';
export const PROTOTYPE_LATEST_WEEK_ENDING = '2026-07-24';
export const WEEKLY_BATCH_SOURCE_SUMMARY =
  'Simulated weekly Copilot usage, token, outcome, and action telemetry.';
export const NEXT_WEEKLY_RUN_PLACEHOLDER = 'Next simulated run: Friday, July 31, 2026';

export const numberFormatter = new Intl.NumberFormat('en-US');
export const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const copilots: CopilotDefinition[] = [
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

export const businessUnits: BusinessUnit[] = [
  'Sales',
  'Finance',
  'Engineering',
  'Customer Success',
  'Marketing',
  'Operations',
  'HR',
  'Legal',
];

export const unitProfiles: Record<BusinessUnit, UnitProfile> = {
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

export const productProfiles: Record<CopilotId, ProductProfile> = {
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

export const fitMatrix: Record<BusinessUnit, Record<CopilotId, number>> = {
  Sales: { m365: 1, github: 0.18, studio: 0.56, fabric: 0.38, security: 0.24 },
  Finance: { m365: 0.78, github: 0.14, studio: 0.34, fabric: 0.74, security: 0.41 },
  Engineering: { m365: 0.72, github: 1, studio: 0.62, fabric: 0.82, security: 0.54 },
  'Customer Success': { m365: 0.91, github: 0.16, studio: 0.58, fabric: 0.35, security: 0.29 },
  Marketing: { m365: 0.95, github: 0.12, studio: 0.61, fabric: 0.43, security: 0.18 },
  Operations: { m365: 0.86, github: 0.22, studio: 0.74, fabric: 0.49, security: 0.57 },
  HR: { m365: 0.83, github: 0.1, studio: 0.29, fabric: 0.24, security: 0.44 },
  Legal: { m365: 0.76, github: 0.08, studio: 0.22, fabric: 0.21, security: 0.68 },
};

export const seededActions: ActionItem[] = [
  {
    id: 'action-1',
    title: 'Roll out Sales prompt kits for Microsoft 365 Copilot',
    owner: 'Maya Chen',
    dueDate: '2026-08-04',
    status: 'In progress',
    outcome: 'Raise value per seller by shortening proposal preparation cycles.',
    linkedRecommendationId: 'rec-sales-m365',
  },
  {
    id: 'action-2',
    title: 'Tighten Engineering completion policy for GitHub Copilot chat sessions',
    owner: 'Luca Reyes',
    dueDate: '2026-08-08',
    status: 'Blocked',
    outcome: 'Reduce exploratory token burn in long-running development chats.',
    linkedRecommendationId: 'rec-engineering-github',
  },
  {
    id: 'action-3',
    title: 'Expand Finance Fabric Copilot analyst office hours',
    owner: 'Noah Grant',
    dueDate: '2026-08-11',
    status: 'Not started',
    outcome: 'Lift dashboard adoption and self-serve insight completion in finance.',
    linkedRecommendationId: 'rec-finance-fabric',
  },
];

export const actionStatuses: ActionStatus[] = [
  'Not started',
  'In progress',
  'Blocked',
  'Done',
];

export const actionProgressStatuses: ActionStatus[] = [
  'Not started',
  'In progress',
  'Done',
];

export const glossaryEntries: GlossaryEntry[] = [
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

export const metricFitRows: MetricFitRow[] = [
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
    costPerUser: 'Good fit — useful for cost per agent, flow, or conversation.',
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

export const methodologyMetricsRows: MethodologyMetricRow[] = [
  {
    metric: 'Cost per Active User / Workflow',
    measure: 'Estimated AI cost normalized by active users or completed workflows.',
    observability: 'Easy',
    decision: 'Use as an executive cost governance metric.',
  },
  {
    metric: 'Accepted Output Rate',
    measure: 'How often users accept or use AI-generated outputs or recommendations.',
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
    measure: 'Estimated AI cost divided by successful Copilot-assisted outcomes.',
    observability: 'Medium to Hard',
    decision:
      'Treat as a future maturity metric once outcome tracking is reliable.',
  },
  {
    metric: 'Rework Rate',
    measure: 'How often AI outputs require major correction or downstream rework.',
    observability: 'Hard',
    decision:
      'Exclude from the core prototype model; include only as a qualitative signal or future enhancement.',
  },
];

export const methodologyPatternRows: MethodologyPatternRow[] = [
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

// --- Type-safe coercions ---

export function asActionStatus(value: string): ActionStatus {
  return actionStatuses.includes(value as ActionStatus)
    ? (value as ActionStatus)
    : 'Not started';
}

export function asBusinessUnit(value: string): BusinessUnit {
  return businessUnits.includes(value as BusinessUnit)
    ? (value as BusinessUnit)
    : 'Operations';
}

export function asCopilotId(value: string): CopilotId {
  return copilots.some((copilot) => copilot.id === value)
    ? (value as CopilotId)
    : 'm365';
}

export function asPortfolioStatus(value: string): PortfolioStatus {
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

// --- Domain logic: portfolio classification ---

export function getPortfolioStatus(
  activeUsers: number,
  workflows: number,
  valueRealizationRate: number,
  costPerOutcomeIndex: number,
  tokenTrend: number,
  highTokenLowValue: boolean
): PortfolioStatus {
  if (activeUsers === 0 || workflows === 0) return 'Not started';
  if (highTokenLowValue || costPerOutcomeIndex > 2) return 'Low-value';
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

// --- Seed data generation ---

export function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function listWeekEndingDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  for (let cursor = start; cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 7)) {
    dates.push(toIsoDate(cursor));
  }

  return dates;
}

export function wave(weekIndex: number, unitIndex: number, productIndex: number): number {
  const seed = (weekIndex + 3) * (unitIndex + 5) * (productIndex + 7);
  return Math.sin(seed / 11) * 0.62 + Math.cos(seed / 17) * 0.38;
}

export function seedPrototypeDataset(): PrototypeSeedData {
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
        const adoptionDrag =
          businessUnit === 'Legal' || businessUnit === 'HR'
            ? weekIndex * 0.1
            : 0;
        const periodicDip =
          (businessUnit === 'Operations' &&
          (copilot.id === 'fabric' || copilot.id === 'studio') &&
          weekIndex % 8 === 5
            ? 3.6
            : 0) +
          (businessUnit === 'Engineering' &&
          copilot.id === 'github' &&
          weekIndex % 7 === 3
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
          (businessUnit === 'Operations' &&
          copilot.id === 'fabric' &&
          weekIndex % 5 === 2
            ? 320
            : 0);
        const totalTokens = Math.max(5_000, Math.round(copilotSessions * tokensPerSession));

        const workflowLift = clamp(
          0.54 +
            fit * 0.58 +
            weekIndex * 0.006 +
            pulse * 0.012 -
            (highTokenPattern ? 0.08 : 0),
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
        const acceptedRecommendations = Math.max(
          1,
          Math.round(completedWorkflows * acceptedRate)
        );
        const acceptedOutputRate = round2(
          clamp(acceptedRecommendations / Math.max(completedWorkflows, 1), 0.18, 0.96)
        );

        const blockersResolved = Math.max(
          1,
          Math.round(
            activeUsers *
              clamp(
                unit.blockerRate +
                  product.blockerBias +
                  fit * 0.05 +
                  pulse * 0.012,
                0.06,
                0.34
              )
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

        if (
          periodicDip > 0 ||
          (weekIndex % 10 === 7 && businessUnit === 'Operations')
        ) {
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

        if (
          businessUnit === 'Operations' &&
          copilot.id === 'fabric' &&
          weekIndex % 6 >= 4
        ) {
          valueRealizationRate = round1(clamp(valueRealizationRate - 3.2, 36, 93));
        }

        if (
          businessUnit === 'Engineering' &&
          copilot.id === 'github' &&
          weekIndex % 8 === 4
        ) {
          valueRealizationRate = round1(clamp(valueRealizationRate - 2.1, 36, 93));
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

    const maxTokensInDay = Math.max(...weeklyBase.map((r) => r.totalTokens), 1);

    const weeklyRecords = weeklyBase.map((record) => {
      const normalizedTokenUsage = record.totalTokens / maxTokensInDay;
      const primaryOutcomeRate =
        record.copilotId === 'github'
          ? record.acceptedOutputRate
          : record.valueRealizationRate / 100;
      const costPerOutcomeIndex = round2(
        normalizedTokenUsage / Math.max(primaryOutcomeRate, 0.05)
      );
      const highTokenLowValue =
        record.totalTokens > 1_000_000 && record.valueRealizationRate < 66;

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

export const fallbackSeedData = seedPrototypeDataset();
export const fallbackUsageRecords = fallbackSeedData.metrics.filter(
  (record) => record.snapshotDate === fallbackSeedData.latestSnapshotDate
);

// Re-export for convenient access alongside the constants
export { clamp, round1, round2 } from '@/utils/math';
export { average } from '@/utils/math';
