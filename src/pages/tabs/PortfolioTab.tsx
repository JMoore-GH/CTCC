import { useState } from 'react';

import { ActionCard } from '@/components/ActionCard';
import type { ActionItem, ActionStatus } from '@/types';

interface PortfolioTabProps {
  actions: ActionItem[];
  newActionIds: string[];
  actionsStatusMessage: string | null;
  actionCounts: Record<ActionStatus, number>;
  onStatusChange: (id: string, status: ActionStatus) => void;
  onBlockedChange: (id: string, blocked: boolean) => void;
  onDueDateChange: (id: string, dueDate: string) => void;
}

export function PortfolioTab({
  actions,
  newActionIds,
  actionsStatusMessage,
  actionCounts,
  onStatusChange,
  onBlockedChange,
  onDueDateChange,
}: PortfolioTabProps) {
  const [actionSearch, setActionSearch] = useState('');

  const visibleActions = actionSearch.trim()
    ? actions.filter(
        (a) =>
          a.title.toLowerCase().includes(actionSearch.toLowerCase()) ||
          a.owner.toLowerCase().includes(actionSearch.toLowerCase())
      )
    : actions;

  return (
    <section className="grid gap-6">
      <div className="glass-panel p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Action tracker</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">
              Turn recommendations into accountable follow-through.
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            <span>{actionCounts['Not started']} queued</span>
            <span>{actionCounts['In progress']} active</span>
            <span>{actionCounts.Blocked} blocked</span>
            <span>{actionCounts.Done} done</span>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Search actions
            <input
              type="search"
              value={actionSearch}
              onChange={(e) => setActionSearch(e.target.value)}
              placeholder="Filter by title or owner…"
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-[#6ea8ff] focus:ring-2 focus:ring-[#6ea8ff]/25"
            />
          </label>
        </div>

        <div className="mt-5 space-y-3">
          {actionsStatusMessage && (
            <div className="rounded-lg border border-[#fbbf24]/35 bg-white/5 px-4 py-3 text-sm text-amber-200">
              {actionsStatusMessage}
            </div>
          )}
          {visibleActions.length === 0 && actionSearch.trim() && (
            <p className="py-4 text-center text-sm text-slate-400">
              No actions match &ldquo;{actionSearch}&rdquo;.
            </p>
          )}
          {visibleActions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              isNew={newActionIds.includes(action.id)}
              onStatusChange={onStatusChange}
              onBlockedChange={onBlockedChange}
              onDueDateChange={onDueDateChange}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
