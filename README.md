# Copilot Token Command Center (CTCC)

Rayfin-powered executive command center for Copilot operations.
CTCC provides a single view of adoption, token efficiency, value realization, AI recommendations, and action tracking.

## Screenshots

Screenshots for hackathon reviewers belong in [`docs/screenshots`](docs/screenshots).

Recommended captures:

- Overview page with boardroom summary, KPI band, and recommended next action
- Insights page with Business Unit Cost-to-Outcome Matrix and Top Watchlist
- Actions page with the action tracker
- Data Agent chat answering a token/watchlist question
- Summary page with a generated executive brief

## Getting started

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## Project structure

```text
├── rayfin/
│   ├── rayfin.yml               # Fabric service configuration (auth + data + static hosting)
│   └── data/
│       ├── BatchRun.ts          # Simulated weekly batch-close metadata
│       ├── CopilotDailyMetric.ts# Weekly Copilot metric snapshots by unit and product
│       ├── CtccAction.ts        # Rayfin entity for per-user tracked actions
│       └── schema.ts            # CTCC schema registration
├── src/
│   ├── main.tsx            # Entry point + Rayfin client bootstrap
│   ├── App.tsx             # Routes and auth gate
│   ├── hooks/
│   │   └── AuthContext.tsx # React context wrapping the auth helpers
│   ├── components/
│   │   └── AuthPage.tsx    # Sign-in UI
│   ├── pages/
│   │   └── HomePage.tsx    # CTCC dashboard + recommendations + action tracker
│   └── services/
│       ├── IAuthService.ts        # Auth service contract + AuthUser type
│       ├── MockAuthService.ts     # Local-dev impl (email/password)
│       ├── RayfinAuthService.ts   # Production impl (Fabric brokered auth)
│       ├── rayfinClient.ts        # Typed Rayfin client singleton
│       └── bootstrap.ts           # Reads env, picks the right auth service
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Deploy app to Fabric and start local dev server |
| `npm run build` | Production build |
| `npm run build:fabric` | Build for Fabric deployment (entrypoint for `rayfin up staticapp deploy`) |
| `npm run lint` | Lint with ESLint |
| `npm run test` | Run unit tests with Vitest |
| `npm run rayfin:up` | Deploy app to Fabric (no local dev server) |

## Data behavior

- CTCC persists prototype data in Rayfin SQL using three entities:
	- `BatchRun` for weekly batch-close metadata (status, timestamps, records processed, source summary).
	- `CopilotDailyMetric` for weekly business-unit/product KPI snapshots.
	- `CtccAction` for per-user recommendation actions.
- On app load, CTCC reads `BatchRun` and `CopilotDailyMetric` from Rayfin Data.
- If no weekly metrics exist, CTCC seeds deterministic prototype history from Friday `2026-01-16` through Friday `2026-07-24`:
	- 8 business units (`Sales`, `Finance`, `Engineering`, `Customer Success`, `Marketing`, `Operations`, `HR`, `Legal`)
	- 5 copilots (`Microsoft 365 Copilot`, `GitHub Copilot`, `Copilot Studio`, `Power BI / Fabric Copilot`, `Microsoft Security Copilot`)
	- 40 `CopilotDailyMetric` rows per week (one per business unit × copilot)
	- 1 completed `BatchRun` per week
- The latest week-ending snapshot is selected by default in the dashboard freshness panel.
- Seed data intentionally includes realistic trend patterns:
	- gradual adoption growth in most segments
	- occasional negative token/outcome trend pockets
	- periodic high-token / moderate-outcome behavior in Engineering and Operations
	- `Accepted Output Rate` as the primary outcome rate for GitHub Copilot
	- `Value Realization Rate` as the primary outcome rate for all other copilots
- If Rayfin Data is unavailable, CTCC falls back to deterministic in-memory snapshots and shows a warning banner.
- `CtccAction` access remains row-level secured with `claims.sub == user_id`.

Production would replace this seed process with a weekly or scheduled ingestion pattern that pulls from Copilot usage reports, application telemetry, workflow systems, and business outcome sources before the boardroom dashboard refreshes.
