import type { ReactNode } from 'react';

const BILL_WIDTH = 26;
const BILL_HEIGHT = 15;

export function DollarBill({ fraction = 1 }: { fraction?: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: `${BILL_WIDTH * fraction}px`,
        height: `${BILL_HEIGHT}px`,
        overflow: 'hidden',
        verticalAlign: 'middle',
      }}
    >
      <svg
        width={BILL_WIDTH}
        height={BILL_HEIGHT}
        viewBox="0 0 26 15"
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <rect x="0" y="0" width="26" height="15" fill="#8aa593" stroke="#6f8a78" strokeWidth="1" />
        <ellipse cx="13" cy="7.5" rx="4" ry="4" fill="#9cb7a4" stroke="#d5e2d8" strokeWidth="0.6" />
        <text
          x="13"
          y="10.4"
          textAnchor="middle"
          fontSize="7"
          fontWeight="700"
          fill="#f0f5f1"
          fontFamily="system-ui, sans-serif"
        >
          $
        </text>
      </svg>
    </span>
  );
}

export function DollarBills({ value }: { value: number }) {
  const full = Math.max(0, Math.floor(value));
  const fraction = value - full;
  const bills: ReactNode[] = [];
  for (let index = 0; index < full; index += 1) {
    bills.push(<DollarBill key={`full-${index}`} />);
  }
  if (fraction >= 0.05) {
    bills.push(<DollarBill key="fraction" fraction={fraction} />);
  }
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`Approximately $${value.toFixed(2)} cost per outcome`}
    >
      {bills}
    </span>
  );
}
