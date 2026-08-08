import { authenticated, entity, int, text, uuid } from '@microsoft/rayfin-core';

@entity()
@authenticated('*')
export class BatchRun {
  @uuid()
  id!: string;

  @text({ max: 32 })
  runDate!: string;

  @text({ max: 32 })
  status!: string;

  @text({ max: 40 })
  startedAt!: string;

  @text({ max: 40 })
  completedAt!: string;

  @int()
  recordsProcessed!: number;

  @text({ max: 280 })
  sourceSummary!: string;

  @text({ max: 400, optional: true })
  notes?: string;
}