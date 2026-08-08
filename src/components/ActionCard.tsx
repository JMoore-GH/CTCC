import type { ActionItem, ActionStatus } from '@/types';
import {
  getSliderIndex,
  getStatusFromSliderIndex,
  getStatusSliderStyle,
  getStatusTone,
} from '@/utils';

interface ActionCardProps {
  action: ActionItem;
  isNew?: boolean;
  onStatusChange: (id: string, status: ActionStatus) => void;
  onBlockedChange: (id: string, blocked: boolean) => void;
  onDueDateChange: (id: string, dueDate: string) => void;
}

export function ActionCard({
  action,
  isNew = false,
  onStatusChange,
  onBlockedChange,
  onDueDateChange,
}: ActionCardProps) {
  return (
    <article className="action-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-50">
            {action.title}
            {isNew && <span className="ctcc-new-badge">New</span>}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{action.outcome}</p>
        </div>
        <span className={getStatusTone(action.status)}>{action.status}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-400">
          <span>{action.owner} · due</span>
          <input
            type="date"
            value={action.dueDate}
            onChange={(e) => onDueDateChange(action.id, e.target.value)}
            className="ctcc-date-input rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-slate-100 outline-none transition focus:border-[#6ea8ff] focus:ring-2 focus:ring-[#6ea8ff]/25"
            aria-label={`Set due date for ${action.title}`}
          />
        </label>
        <div className="flex w-full flex-wrap items-end justify-end gap-4 md:w-auto">
          <label className="min-w-64 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Status
            <input
              type="range"
              min={0}
              max={2}
              step={1}
              value={getSliderIndex(action.status)}
              onChange={(e) =>
                onStatusChange(action.id, getStatusFromSliderIndex(Number(e.target.value)))
              }
              style={getStatusSliderStyle(action.status)}
              className="ctcc-status-slider mt-2 w-full"
              aria-label={`Set status for ${action.title}`}
            />
            <div className="mt-1 flex justify-between text-[10px] font-medium tracking-[0.08em] text-slate-500">
              <span>Not started</span>
              <span>In progress</span>
              <span>Done</span>
            </div>
          </label>
          <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
            <input
              type="checkbox"
              checked={action.status === 'Blocked'}
              disabled={action.status === 'Done'}
              onChange={(e) => onBlockedChange(action.id, e.target.checked)}
              aria-label={`Toggle blocker for ${action.title}`}
            />
            Blocker
          </label>
        </div>
      </div>
    </article>
  );
}
