export function MetricCard({
  label,
  value,
  detail,
  eyebrow,
}: {
  label: string;
  value: string;
  detail: string;
  eyebrow?: string;
}) {
  return (
    <div className="metric-card glass-panel">
      {eyebrow && (
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
          {eyebrow}
        </p>
      )}
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
        {value}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-300">{label}</p>
      <p className="mt-3 text-sm leading-6 text-slate-400">{detail}</p>
    </div>
  );
}
