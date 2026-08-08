import type { CSSProperties } from 'react';

export type CopilotId = 'm365' | 'github' | 'studio' | 'fabric' | 'security';
export type DashboardTab = 'overview' | 'insights' | 'portfolio' | 'summary';
export type BusinessUnit =
  | 'Sales'
  | 'Finance'
  | 'Engineering'
  | 'Customer Success'
  | 'Marketing'
  | 'Operations'
  | 'HR'
  | 'Legal';
export type ActionStatus = 'Not started' | 'In progress' | 'Blocked' | 'Done';
export type PortfolioStatus =
  | 'Efficient'
  | 'Stable'
  | 'Watchlist'
  | 'Low-value'
  | 'Not started';
export type ActionStorageMode = 'remote' | 'local';
export type MetricsStorageMode = 'remote' | 'local';

export interface CopilotDefinition {
  id: CopilotId;
  name: string;
  shortName: string;
  lens: string;
}

export interface UnitProfile {
  licensedUsers: number;
  baseAdoption: number;
  sessionDepth: number;
  tokenVariance: number;
  workflowDepth: number;
  blockerRate: number;
  satisfaction: number;
}

export interface ProductProfile {
  licenseShare: number;
  adoptionBias: number;
  sessionLift: number;
  tokensPerSession: number;
  valueBias: number;
  acceptanceBias: number;
  workflowBias: number;
  blockerBias: number;
}

export interface UsageRecord {
  snapshotDate: string;
  businessUnit: BusinessUnit;
  copilotId: CopilotId;
  copilotName: string;
  licensedUsers: number;
  activeUsers: number;
  adoptionRate: number;
  copilotSessions: number;
  totalTokens: number;
  tokensPerActiveUser: number;
  completedWorkflows: number;
  acceptedRecommendations: number;
  blockersResolved: number;
  acceptedOutputRate: number;
  satisfactionScore: number;
  tokenTrend: number;
  valueRealizationRate: number;
  costPerOutcomeIndex: number;
  portfolioStatus: PortfolioStatus;
}

export interface BatchRunRecord {
  runDate: string;
  status: string;
  startedAt: string;
  completedAt: string;
  recordsProcessed: number;
  sourceSummary: string;
  notes?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  focusArea: string;
  narrative: string;
  impact: string;
  owner: string;
  dueDate: string;
}

export interface ActionItem {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  status: ActionStatus;
  outcome: string;
  linkedRecommendationId: string;
}

export interface GlossaryEntry {
  term: string;
  definition: string;
  businessRule?: string;
  businessRuleBullets?: string[];
}

export interface MethodologyMetricRow {
  metric: string;
  measure: string;
  observability: string;
  decision: string;
}

export interface MethodologyPatternRow {
  pattern: string;
  interpretation: string;
  action: string;
}

export interface MatrixWatchlistRow {
  rank: number;
  businessUnit: BusinessUnit;
  copilotId: CopilotId;
  copilotName: string;
  costPerOutcomeIndex: number;
  adoptionRate: number;
  outcomeRate: number;
  totalTokens: number;
  recommendedAction: string;
}

export interface MatrixCellDetails {
  key: string;
  businessUnit: BusinessUnit;
  copilotId: CopilotId;
  copilotName: string;
  costPerOutcomeIndex: number;
  adoptionRate: number;
  valueRealizationRate: number;
  acceptedOutputRate: number;
  activeUsers: number;
  licensedUsers: number;
  totalTokens: number;
  completedWorkflows: number;
  tokenTrend: number;
  portfolioStatus: PortfolioStatus;
  recommendedAction: string;
  costBand: 'strong' | 'monitor' | 'watchlist' | 'cost-concern' | 'low-data';
}

export interface MetricFitRow {
  copilot: string;
  costPerUser: string;
  acceptedOutput: string;
  valueRealization: string;
  bestMetric: string;
}

export interface MatrixRow {
  businessUnit: BusinessUnit;
  avgIndex: number;
  bestCopilot: string;
  primaryRisk: string;
  cells: (UsageRecord | undefined)[];
}

export interface ProductComparison {
  id: CopilotId;
  name: string;
  shortName: string;
  lens: string;
  activeUsers: number;
  licensedUsers: number;
  adoptionRate: number;
  totalTokens: number;
  workflows: number;
  acceptedOutputRate: number;
  valueRealizationRate: number;
  primaryOutcomeRate: number;
  tokenTrend: number;
  highTokenLowValue: boolean;
  normalizedTokenUsage: number;
  costPerOutcomeIndex: number;
  status: PortfolioStatus;
}

export interface PrototypeSeedData {
  metrics: UsageRecord[];
  batchRuns: BatchRunRecord[];
  latestSnapshotDate: string;
}

// Used only for the status slider CSS variable trick
export type SliderStyle = CSSProperties;
