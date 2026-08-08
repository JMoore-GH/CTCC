import {
  authenticated,
  decimal,
  entity,
  int,
  text,
  uuid,
} from '@microsoft/rayfin-core';

@entity()
@authenticated('*')
export class CopilotDailyMetric {
  @uuid()
  id!: string;

  @text({ max: 32 })
  snapshotDate!: string;

  @text({ max: 80 })
  businessUnit!: string;

  @text({ max: 40 })
  copilotId!: string;

  @text({ max: 120 })
  copilotName!: string;

  @int()
  licensedUsers!: number;

  @int()
  activeUsers!: number;

  @decimal()
  adoptionRate!: number;

  @int()
  copilotSessions!: number;

  @int()
  totalTokens!: number;

  @decimal()
  tokensPerActiveUser!: number;

  @int()
  completedWorkflows!: number;

  @int()
  acceptedRecommendations!: number;

  @decimal()
  acceptedOutputRate!: number;

  @int()
  blockersResolved!: number;

  @decimal()
  satisfactionScore!: number;

  @decimal()
  tokenTrend!: number;

  @decimal()
  valueRealizationRate!: number;

  @decimal()
  costPerOutcomeIndex!: number;

  @text({ max: 32 })
  portfolioStatus!: string;
}