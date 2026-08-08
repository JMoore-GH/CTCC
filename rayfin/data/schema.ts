import { BatchRun } from './BatchRun.js';
import { CopilotDailyMetric } from './CopilotDailyMetric.js';
import { CtccAction } from './CtccAction.js';

export type CTCCSchema = {
	BatchRun: BatchRun;
	CopilotDailyMetric: CopilotDailyMetric;
	CtccAction: CtccAction;
};

export const schema = [BatchRun, CopilotDailyMetric, CtccAction];
