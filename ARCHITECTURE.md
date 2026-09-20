# Breeze — Architecture Baseline

## Prompt 0 baseline

The repository currently contains two independent frontend applications rather than one integrated product:

### `landing/`

- React 19, Vite 8, ES modules.
- Tailwind CSS 4 through `@tailwindcss/vite`.
- `react-router-dom` 7, `framer-motion`, `lucide-react`.
- Entry point: `src/main.jsx`; routes in `src/App.jsx`.
- Routes: `/`, `/register`, `/login`, `/dashboard`.
- Theme state is handled by `src/hooks/useTheme.js`, using `data-theme` and local storage.
- Components include navigation, hero, feature showcase, how-it-works, pricing, FAQ, footer, login, registration, and a mock dashboard.
- No backend/API integration was found; forms log data and navigation is mock/local.

### `dashboard/`

- Separate React 18, Vite 5, ES module application.
- `react-router-dom` 6, `lucide-react`, `recharts`.
- Entry point: `src/main.jsx`; routes in `src/App.jsx`.
- Routes: `/`, `/overall`, `/channel`, `/customer`.
- Shared components include `Navbar`, `ReportCard`, `MetricCard`, `FunnelChart`, `SwitchingFlow`, and `DownloadButton`.
- Pages include report landing, overall report, channel report, and individual customer report.
- Styling is a single `src/index.css` with DM Sans/Playfair Display, orange accents, static layout rules, responsive and print media queries.
- No backend/API integration or data loading was found; report content is static/mock data.

## Target conceptual architecture

```text
Configured company sources
  → ingestion adapters/batches
  → semantic field mapping + normalization
  → canonical events (preserving raw payload and source identity)
  → auditable identity resolution
  → generic CustomerEntityLink context
  → customer timeline
  → configured journey instances/stages
  → complaints/issues/escalations
  → source-defined churn outcomes and cohort analysis
  → deterministic analytics
  → reports/artifacts and Gemini-backed MCP analyst chat
```

The conceptual database contract is the exact 21-table list in `BREEZE_SPEC.md`. No domain-specific universal entity tables and no parallel database architecture are permitted.

## Product-level component relationships frozen in Prompt 1

```text
Organization + configuration
  ├─ sources, channels, semantic mappings, identifiers, entity links
  ├─ journey definitions/stages/event mappings/windows
  ├─ issue grouping rules, escalation capabilities, churn definition
  ↓
Ingestion + normalization + auditable identity resolution
  ↓
Meaningful event timeline + generic business context
  ├─ configured journey instances/stages
  ├─ complaints → issue episodes → employee resolution
  ├─ source-confirmed/inferred escalations
  └─ actual churn outcomes
  ↓
Deterministic analytics + data-quality signals
  ├─ Detail Customer investigation
  ├─ High-Level analysis
  ├─ default/custom reports, runs, history, artifacts
  └─ Gemini chat through later-scoped MCP tools
```

Registration creates organization/account context; onboarding configures the organization's data/business semantics; the workspace then exposes the two dashboard modes. These are product relationships, not a finalized implementation schema. Missing/partial data must flow as explicit unavailable, limited, ambiguous, or empty states rather than fabricated values. Gemini may interpret structured results but never bypasses deterministic analytics or receives arbitrary database access.

## Scope boundary

Prompt 1 freezes behavior and user-facing expectations only. PostgreSQL schema details, migrations, algorithms, MCP contracts, Gemini integration, report calculations, artifact implementation, authentication, and final UI remain later phases.

## Prompt 3 processing architecture

```text
Supported source delivery
  → Company/DataSource validation + IngestionBatch tracking
  → raw payload preservation
  → SourceFieldMapping semantic normalization
  → timestamp/meaningful-event validation
  → deterministic deduplication
  → ordered identity resolution
  → generic CustomerEntityLink resolution
  → Event + IdentityResolution audit write
  → idempotent derived-context recomputation
  → downstream analytics
```

The pipeline is company-scoped at every read/write. `event_time`, `ingested_at`, and `processed_at` are distinct. Invalid records are quarantined; valid events may remain unresolved with nullable `c_id`. Duplicate retries do not re-run downstream effects. Late events trigger deterministic recomputation of affected derived windows while raw/canonical/audit history remains authoritative. No schema change or new table is required by Prompt 3.

## UI evolution baseline

The two current applications are reusable visual/structural prototypes, not a final architecture. Future phases should decide whether to consolidate them, preserving useful report components and the landing theme system where appropriate. Prompt 0 does not perform that redesign or integration.

## Prompt 4 deterministic derived-context architecture

```text
Resolved meaningful Event
  ├─ configured START → JourneyInstance matching
  │    └─ ordered mapped stages → completion / abandonment / drop-off recomputation
  ├─ complaint semantic → topic normalization → Issue candidate evaluation
  │    └─ grouping / reopen / employee resolution
  └─ structured escalation → source-confirmed Escalation
       └─ transcript fallback → thresholded INFERRED Escalation
```

Journey, issue, and escalation are separate projections of the same event. All projections require Prompt 3 identity permission, use event time, preserve source facts, and recompute derived state after late events or configuration changes. Company configuration supplies meanings, mappings, windows, thresholds, and fallbacks; the engine supplies generic precedence and audit behavior. Prompt 4 adds no tables or domain-specific services.

## Prompt 5 deterministic analytics architecture

```text
Canonical source facts
  ├─ ChurnOutcome + observation rules → churned/retained/unknown cohorts
  ├─ Event + Complaint + Issue → contact/repeat/unresolved features
  ├─ Escalation → structured/inferred provenance-preserving features
  ├─ JourneyInstance/Stage → starts/completions/drop-offs
  ├─ Event channels → distinct-channel and transition features
  └─ Event/IdentityResolution/IngestionBatch timestamps → data-quality metrics
        ↓
Deterministic feature extraction → cohort comparison → sufficiency status
        ↓
Structured analytics result for later reports/MCP
```

Business timestamps drive experience metrics; ingestion/processing timestamps drive latency metrics. Late Prompt 3/4 recomputation invalidates affected feature windows. `AVAILABLE`, `INSUFFICIENT_DATA`, and `UNAVAILABLE` remain distinct. No analytics-specific table or domain module is introduced.

## Prompt 6 organization configuration architecture

```text
Registration / controlled company context
  → organization profile + capability declaration
  → channels distinct from DataSources
  → connection method + sensitive credential reference
  → SourceFieldMapping + sample validation
  → identity/entity capability
  → configured journeys, issue taxonomy/rules, escalation semantics, churn source
  → capability-specific readiness: NOT_STARTED / IN_PROGRESS / READY
```

Onboarding is conditional and business-oriented. It configures existing Company, DataSource, SourceFieldMapping, journey, issue-rule, entity-link, and churn structures; it does not add onboarding/auth/configuration tables. Production Organization/User/Membership/Role is conceptual and later implementation scope. The controlled demo uses the same generic configuration path as a real company.

## Prompt 7 MCP/Gemini architecture

```text
User → chat UI → Gemini analyst → narrow read-only MCP business tools
     → deterministic Breeze services/data → structured result → Gemini answer
```

Gemini selects tools and explains returned results; it cannot query SQL, access the database directly, mutate records, resolve identity, or calculate authoritative analytics. Tenant and authorization context are derived server-side for every call. Tool results carry status, period/timezone, denominators, sample sizes, provenance, formula/configuration versions, and freshness. Prompt-injected text from customer data is treated as untrusted content. Prompt 7 freezes no report/artifact tool; Prompt 8 owns that boundary, and Prompt 10 is the first production implementation phase.

## Prompt 8 report and artifact architecture

```text
ReportDefinition → validated parameters → deterministic analytics
  → structured result snapshot → optional PDF/DOCX/CSV/JSON renderer
  → ReportRun + artifact reference → dashboard/download/MCP
```

ReportDefinition is reusable configuration; ReportRun is an immutable execution snapshot. Late data affects new runs, never completed snapshots. Artifacts expire after one UTC month while report history remains. Reports are tenant-scoped, Gemini cannot invent values or bypass validation, and no report-specific table is added.

## Prompt 9 user-facing architecture

```text
Public landing → registration/login → authenticated Company workspace
  → resumable onboarding → sources/mappings/configuration → capability readiness
  → Overview / Customers / Data & Connections / Configuration / Analytics / Reports
```

The hackathon uses Supabase Auth for external email/password identity and sessions, one initial company admin, and a future-compatible organization boundary. Breeze owns Company creation, provider-identity association, authorization, onboarding, and tenant isolation. REST pull, signed webhooks, SDK/tracking event ingress, and CSV/JSON import are the supported connection paths; a distributable SDK package, warehouse, SFTP/object storage, and enterprise streams remain future scope. Capability readiness is per configured capability, not a false all-or-nothing account state. Prompt 9 owns information architecture and visual direction; Prompt 10 owns all implementation.

## Canonical recovery boundary

The existing `api/` service and React workspace are partial implementation material, not proof of canonical completion. The API must be reworked so domain operations consume finalized deterministic services, the MCP surface implements exact Prompt 7 contracts rather than a generic dispatcher, and browser-local state cannot serve as production authority. Canonical Prompt 10 remains pending.

## Prompt 9.6 final implementation contract

The 21 domain tables remain unchanged. Supabase Auth is the selected external infrastructure for persistent email/password identity and sessions because the frozen domain model has no account/session tables. Breeze owns Company creation, trusted provider-to-company association, authorization, onboarding, and domain access. Protected requests derive `company_id` only from validated server session/provider state; client-supplied tenant identifiers are never authoritative. ReportDefinition is company-scoped; ReportRun is the immutable execution boundary; existing JSONB fields carry configuration/result/provenance versions; artifacts expire independently. MCP remains exactly the 13 Prompt 7 read-only tools, with report operations in normal authenticated backend services. Prompt 10 must implement the full dependency chain from PostgreSQL/auth through ingestion, deterministic analytics, reports/artifacts, MCP/Gemini, and frontend integration.
