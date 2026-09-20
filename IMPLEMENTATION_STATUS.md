# Breeze — Implementation Status

## DONE

- Read the complete Prompt 1 source document and the five Prompt 0 project-memory files before editing.
- Read the complete Prompt 3 source document and the five project-memory files before editing.
- Read the complete Prompt 4 source document and the five project-memory files before editing.
- Read the complete Prompt 5 source document and the five project-memory files before editing.
- Read the complete Prompt 6 source document and the five project-memory files before editing.
- Finalized registration, production-authentication boundary, conditional onboarding, data-source/channel configuration, semantic mappings, journey/issue/escalation/churn configuration, validation/readiness, configuration lifecycle, sensitive-data boundary, and controlled demo configuration.
- Checked all required Prompt 6 edge cases and verified compatibility with Prompts 2–5 without implementing application code or schema changes.
- Finalized churn outcomes, cohorts, lookback/observation windows, feature extraction, repeat-contact, channel-switching, escalation, unresolved-issue, journey/drop-off, identity/data-quality, sufficiency, and association-boundary algorithms.
- Checked all 50 Prompt 5 edge cases and verified compatibility with Prompts 2–4 without implementing frontend, report, MCP, or database changes.
- Finalized journey creation/matching/progression/completion/abandonment/drop-off, complaint/topic normalization, issue grouping/reopening/human resolution, and structured/inferred escalation algorithms.
- Checked all 50 Prompt 4 edge cases and verified compatibility with Prompts 2 and 3 without changing the schema or implementing product code.
- Finalized the Prompt 3 ingestion, normalization, deduplication, identity, entity-link, audit, conflict, session-stitching, late-event, reprocessing, missing-data, latency, and company-isolation contract.
- Classified Prompt 3 ownership for deferred open questions, explicitly including Q7 → Prompt 9 and Q8 → Prompt 6.
- Assessed the relevant conceptual tables and recorded that no schema change or new table is required.
- Re-read Prompt 3 and checked all 30 mandated red-team scenarios against the contract.
- Updated the authoritative specification with the complete Prompt 1 product and UX contract.
- Updated the high-level architecture with organization, onboarding, dashboard, analytics, report, and chatbot relationships.
- Recorded Prompt 1 decisions about registration/onboarding, dashboard modes, and deterministic reporting/chat.
- Re-read Prompt 1 after the updates and audited the original 75 rules and Prompt 1 consistency checklist.
- Read the complete Prompt 0 source document.
- Audited the repository and both website prototypes.
- Identified frontend stacks, package managers/configuration, entry points, routes, styling, reusable components, branding, mock/static data, and API assumptions.
- Recorded the stable product constitution and 75 permanent rules in `BREEZE_SPEC.md`.
- Recorded the existing architecture baseline in `ARCHITECTURE.md`.
- Recorded Prompt 0 architectural decisions in `DECISIONS.md`.
- Created this phase/status record and the genuine-unknowns record.
- Corrected scoped legacy product naming in project metadata and documentation where applicable.

## IN PROGRESS

- Prompt 10 frontend application slice: landing, registration/login demo session, resumable onboarding, readiness, workspace navigation, connections, configuration, analytics, reports, and responsive states.

## NOT STARTED (intentionally deferred)

- Database implementation and migrations.
- Ingestion adapters, normalization, identity resolution, and entity links.
- Journey, issue grouping, escalation, churn, and analytics algorithms.
- MCP server/tool definitions and Gemini integration.
- Integrated company dashboard, report artifact generation, and chatbot.
- Complete landing/dashboard redesign and app consolidation.
- Authentication and production organization/membership model.
- Future self-service, external Voice of Customer, and advanced probabilistic matching.
- Final visual design and third-frontend consolidation.
- Full onboarding workflow and production account/authentication flows.
- Physical database types/indexes/constraints and migrations implementing this contract.
- Implementation of the finalized journey, issue, and escalation algorithms.
- Implementation of the finalized churn and analytics algorithms.
- Production authentication, onboarding workflow, and configuration UI implementation.

## PROMPT 7 COMPLETE (documentation-only)

- Read the complete Prompt 7 contract and the current project contract documents.
- Finalized the exact MCP tool surface, schemas, validation, authorization, tenant isolation, provenance, freshness, pagination, multi-tool behavior, prompt-injection boundary, Gemini configuration, failure semantics, and Prompt 8 report boundary.
- Checked Prompt 7 edge cases and consistency with Prompts 2–6.
- No application implementation started; Prompt 10 remains the first major implementation phase.

## PROMPT 8 COMPLETE (documentation-only)

- Read and reconciled the complete Prompt 8 contract against Prompts 2–7.
- Finalized default report contracts, metric formulas, configuration/validation, date semantics, sufficiency and error states, ReportRun lifecycle, immutable snapshots, history, artifacts, retention, provenance, freshness, and Gemini/MCP boundaries.
- Checked all 90 required report edge cases and preserved later-phase ownership.
- No application implementation or schema change started; Prompt 10 remains the first major implementation phase.

## PROMPT 9 COMPLETE (documentation-only)

- Read and reconciled the complete Prompt 9 product/UI/integration contract and the existing project structure.
- Finalized authentication, organization boundary, resumable onboarding, capability readiness, supported connection methods, mapping/validation, connection lifecycle, credential handling, information architecture, landing scope, responsive visual system, accessibility requirements, demo behavior, and future-feature boundaries.
- Checked the required authentication, onboarding, data, integration, analytics/report, and UI edge cases against Prompts 2–8.
- No application implementation, production code, database migration, or schema change started; Prompt 10 remains the first major implementation phase.

## PROMPT 10 IMPLEMENTATION (in progress)

- Added a working Vite/React workspace experience in `landing/src/components/Workspace.jsx`.
- Added client-side demo registration/session behavior, protected workspace entry, seven-step resumable onboarding, readiness states, and workspace surfaces for Overview, Customers, Data & Connections, Configuration, Analytics, and Reports.
- Added the `api` Node/Express backend foundation, frozen 21-table PostgreSQL migration, tenant-scoped auth/source/mapping/ingestion endpoints, signed webhook ingress, and configured SDK event ingress.
- Added responsive workspace styling and explicit available, unavailable, insufficient-data, empty, validation, and status treatments.
- Verified `npm run build` succeeds and the Vite dev server serves `/` and `/app` successfully.
- Database-backed account persistence, migration execution in the target environment, complete deterministic analytics/report/artifact services, and Gemini runtime integration remain outstanding implementation work; they are not represented as complete.

## CANONICAL RECOVERY AUDIT

The later implementation chain was not accepted as canonical completion. Findings:

- **Database — REWORK:** the migration names the canonical 21 tables; its dependency ordering was corrected so `Event` precedes `IdentityResolution`, but execution against a configured database remains unverified.
- **Backend — REWORK:** `api/src/server.js` is a partial service foundation, not the complete canonical backend.
- **Identity/events/journeys/issues/escalations/churn — REWORK:** the current API does not implement the finalized deterministic algorithms and is not authoritative.
- **Reports/artifacts — REWORK:** frontend presentation exists, but deterministic ReportRun execution, immutable snapshots, renderers, and retention are incomplete.
- **MCP — REMOVE/REWORK:** the generic `/api/mcp/:tool` dispatcher does not implement the exact Prompt 7 schemas/results.
- **Gemini — REMOVE/REWORK:** no canonical Gemini runtime is implemented.
- **Onboarding/frontend — KEEP/REWORK:** the React workspace is compatible presentation scaffolding but must consume canonical backend contracts.
- **Demo data — UNKNOWN:** browser-local values are not accepted as canonical demo data.
- **Tests — REWORK:** only build/syntax smoke checks exist; canonical integration and contract tests are absent.

Prompt 10 is invalid as a completed phase and must restart from the canonical Prompts 0–9 boundary.

## PROMPT 9.6 COMPLETE (documentation-only)

- Resolved authentication/session persistence without changing the canonical 21 domain tables: Supabase Auth is the selected persistent identity/session infrastructure; Breeze owns tenant association and authorization.
- Froze self-attested company verification and safe duplicate-admin-email behavior.
- Froze company-scoped ReportDefinition lifecycle, immutable ReportRun snapshots, artifact ownership/expiry, and provenance in existing JSONB fields.
- Reconfirmed exactly 13 read-only MCP tools and kept report operations outside MCP.
- Recorded Prompt 10 prerequisites, MVP/future scope, and dependency order.
- No application code, migration, table, service, route, UI, dependency, or Prompt 10 implementation was added by Prompt 9.6.
- Prompt 10 remains pending; pre-existing partial implementation remains non-canonical.

## PROMPT 9.6 BLOCKERS

- None. The four Prompt 9.5 human decisions are frozen; remaining work is Prompt 10 implementation.

## AUTHENTICATION DECISION CORRECTION

- Supabase Auth is the final external MVP authentication/session mechanism.
- Breeze does not implement Argon2id password hashing or a second custom session system.
- Breeze remains responsible for Company creation, provider-identity association, authorization, onboarding, server-derived tenant context, and tenant isolation.
- No authentication tables are added to the frozen 21-table business schema.

## PROMPT 10 IMPLEMENTATION UPDATE

### COMPLETE

- Corrected ReportRun foreign-key behavior to `ON DELETE SET NULL` and added migration `002_preserve_report_history.sql` so historical runs are not cascade-deleted.
- Migration runner now applies all numbered migrations transactionally.
- Removed Argon2id/in-memory authentication from the API path and added Supabase Auth REST integration for registration, login, logout, trusted user metadata, and server-derived company context.
- Replaced the generic MCP placeholder with the exact 13-tool allowlist and tenant-scoped deterministic handlers for currently supported stored data.
- Connected the workspace session check/logout to the backend API instead of treating browser state as business-data authority.
- Added `DATABASE_DESIGN.md` and `MCP_TOOLS.md` verification artifacts.
- Added tenant-scoped DataSource listing/detail/update/activate/disable APIs and mapping retrieval.
- Added ingestion batch lifecycle records, validation errors, fingerprint/source-event deduplication, mapped customer creation, and IdentityResolution records for deterministic source identifiers.
- Added tenant-scoped customer list/detail/timeline APIs and initial report definition/run/history APIs.
- Added database-backed handlers for the canonical MCP tools where the stored data supports the query.
- Added centralized period validation with UTC instants, half-open boundaries, 366-day limits, and deterministic summaries for journey, repeat-contact, unresolved-issue, and escalation analytics.
- Added deterministic JSON/CSV artifact generation helpers and one-month expiry metadata.
- Added Gemini API-key parsing and bounded retry/fallback manager with secret-safe behavior.
- Connected Overview loading/error states to the real analytics overview API.

### PARTIAL

- Source configuration, mappings, REST/webhook/SDK ingestion, basic event persistence, and overview analytics remain partial and require full normalization, identity, journey, issue, escalation, churn, report, artifact, and frontend-service completion.
- MCP handlers exist for the exact surface but several capabilities still return explicit `UNAVAILABLE`/`INSUFFICIENT_DATA` based on incomplete services; they are not represented as complete analytics.
- Backend remains Express/JavaScript; Bun/Hono/TypeScript/Drizzle migration is not complete because Bun and those runtime dependencies are unavailable locally.
- Report execution currently provides a persisted deterministic baseline snapshot, not the complete seven-report Prompt 8 formula/rendering/artifact contract.
- PDF/DOCX rendering and artifact storage/cleanup are not complete; JSON/CSV generation helpers are available.
- Customer, connections, analytics, and reports views still contain presentation fallback/demo sections beyond the connected Overview path.

### BLOCKED BY EXTERNAL CONFIGURATION

- PostgreSQL migration execution and schema verification: `DATABASE_URL` is not configured in this environment.
- Supabase end-to-end auth: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and service-role configuration are not configured.
- Gemini runtime/key fallback: Gemini credentials and runtime are not configured.

### NOT IMPLEMENTED

- Complete deterministic domain engines, all report/artifact behavior, complete MCP service contracts, Gemini chat, and full backend-connected customer/configuration/report UI.

## BLOCKED

- None.
- None for Prompt 3.
- None for Prompt 4.
