# Breeze — Decisions

## Decision: Breeze is the canonical product name

Reason: The project constitution names the product Breeze; legacy NexJour references are implementation residue.

Alternatives considered: Retaining NexJour or inventing a new name.

Impact: Future UI, metadata, documentation, routes, artifacts, and copy should use Breeze consistently.

Status: Accepted.

## Decision: Preserve two frontend prototypes during Prompt 0

Reason: Prompt 0 asks for an audit and context lock, not a complete redesign or premature product integration. Both prototypes contain useful components.

Alternatives considered: Rewriting into one generic application immediately.

Impact: `landing/` and `dashboard/` remain separate until a later approved implementation phase chooses the integration boundary.

Status: Accepted.

## Decision: Use the frozen 21-table conceptual contract

Reason: The database relationships are intentionally designed and must be implemented in the dedicated database phase.

Alternatives considered: Domain-specific tables or a generic replacement schema.

Impact: `CustomerEntityLink`, auditable identity resolution, and all other named tables remain mandatory.

Status: Accepted.

## Decision: MVP excludes major product systems

Reason: Prompt 0 explicitly prohibits full database, identity resolution, journey algorithms, churn analytics, MCP server, Gemini chatbot, full dashboard, landing redesign, authentication, and future features.

Alternatives considered: Building a thin or speculative version now.

Impact: Prompt 0 only audits, records, renames obvious legacy branding, and prepares project memory.

Status: Accepted.

## Decision: Deterministic and auditable analytics boundaries

Reason: Identity, context, issue grouping, churn, and Gemini responsibilities are intentionally separate.

Alternatives considered: One black-box AI matcher/analytics engine.

Impact: Later implementations must preserve evidence, uncertainty, source-vs-inferred distinctions, and deterministic analytics behind MCP tools.

Status: Accepted.

## Decision: Product contract separates registration from onboarding

Reason: Registration creates an organization/account context; onboarding configures data, mappings, business relationships, journeys, issue rules, escalation capabilities, and churn semantics.

Alternatives considered: Treating registration as full setup or exposing implementation/schema questions directly to company users.

Impact: Later flows must preserve a company-owned workspace and a non-technical, conditional onboarding experience without requiring production authentication in the hackathon MVP.

Status: Accepted in Prompt 1.

## Decision: Prompt 9.6 finalizes authentication without changing the 21 tables

Supabase Auth provides persistent email/password identity and sessions because the frozen domain model has no account/session tables. Breeze owns registration, Company creation, trusted tenant association, authorization, onboarding, and domain access. The server derives tenant context from validated provider state; frontend company identifiers are ignored. No auth tables are added. Status: Accepted in Prompt 9.6; implementation pending Prompt 10.

## Decision: Prompt 9.6 freezes self-attested company verification

Company name is a non-unique display label and generated `company_id` is the tenant key. Personal email, duplicate company names, and technically unverifiable names are allowed. Duplicate admin email receives a safe account-exists/registration-unavailable response. Email/domain/manual verification and enterprise identity controls are future scope. Status: Accepted in Prompt 9.6.

## Decision: Prompt 9.6 freezes company-scoped custom reports

ReportDefinition is reusable company-owned configuration; save-without-run and run-without-save are valid. Every execution creates a new immutable ReportRun snapshot. Edit affects only the current definition; delete does not delete history; duplicate names are allowed; artifacts belong to ReportRun and expire independently. Existing JSONB fields carry configuration version/provenance. No new report table is added. Status: Accepted in Prompt 9.6.

## Decision: Prompt 9.6 freezes the MCP report boundary

The MCP contract is exactly the 13 Prompt 7 read-only tools. Report CRUD, execution, history, and artifacts remain authenticated application services. Gemini cannot mutate state, query SQL, or calculate authoritative analytics. Status: Accepted in Prompt 9.6.

## Prompt 7 decisions

- MCP exposes only the frozen narrow, read-only business tools in `BREEZE_SPEC.md`; generic SQL and arbitrary database querying are forbidden.
- Deterministic Breeze services are authoritative for identity, cohorts, counts, rates, and state. Gemini is limited to intent interpretation, tool selection, and evidence-backed narration.
- Tenant isolation, authorization, bounded pagination, provenance/freshness, prompt-injection resistance, and explicit empty/insufficient/unavailable/error states are mandatory server boundaries.
- The approved model configuration is the stable `gemini-2.5-flash` model with server-side credentials and bounded tool-calling/runtime limits; implementation remains Prompt 10.
- Report formulas, configuration, snapshots, artifacts, and report history remain owned by Prompt 8; no later-phase ownership is moved into Prompt 7.

## Prompt 8 decisions

- The seven default reports and their formulas reuse Prompts 4–5 deterministic states; reports never redefine journey, issue, escalation, churn, or analytics semantics.
- ReportDefinition stores reusable configuration; every execution creates an immutable ReportRun with exact parameters and result_snapshot. Reruns never overwrite historical runs, and late data affects only new runs.
- Custom reports are constrained to allow-listed report types, metrics, dimensions, filters, periods, and scopes. Arbitrary SQL, arbitrary code, and generic analysis tools are forbidden.
- Empty, measured zero, missing, not-applicable, insufficient, unavailable, and error states remain distinct, with explicit denominators and provenance.
- PDF, DOCX, CSV, and JSON are the supported artifact formats. Artifact filenames are contextual and artifacts expire exactly one UTC month after creation; expiration does not delete report history.
- Server-side tenant context and authorization govern definitions, runs, history, and artifacts. Gemini may translate and explain but cannot fabricate, bypass validation, or claim an artifact exists prematurely.

## Prompt 9 decisions

- Authentication uses Supabase Auth for external email/password identity, password hashing, session persistence, and expiry/refresh. Breeze owns registration behavior, Company creation, provider-identity association, authorization, onboarding, and tenant isolation. Breeze does not implement Argon2id hashing or a second custom session system; verification, SSO, MFA, reset, invitations, and team administration remain future extensions.
- Registration creates a Company and initial admin context, then always enters resumable onboarding. Authentication, organization identity, onboarding completion, authorization, and capability readiness remain separate.
- The hackathon supports REST pull, signed webhooks, configured SDK/tracking event ingress, and CSV/JSON imports. A distributable SDK package, direct database/warehouse connections, SFTP/object storage, streaming buses, and integration platforms are future scope and must not be advertised as active.
- Onboarding is capability-based and resumable. Required mappings/configuration block only affected capabilities; optional gaps are warnings; readiness requires validated data/configuration and never means merely “account created.”
- The authenticated product hierarchy is Overview, Customers, Data & Connections, Configuration, Analytics, Reports, and Settings, with explicit unavailable/insufficient/empty/error states and a responsive B2B visual system.
- `Breeze Demo Retail` uses the same generic contracts and data paths as a real company; it is not a hardcoded product mode. Prompt 10 remains the implementation boundary.

## Prompt 10 implementation decisions recorded

- The existing `landing` Vite application is the current integrated frontend shell; the prior `dashboard` prototype remains available as reference until backend-backed report surfaces are integrated.
- The first executable slice uses local browser state only for demo registration/session/onboarding continuity. It does not substitute for the finalized server-side authentication, PostgreSQL, tenant enforcement, ingestion, analytics, report, artifact, or MCP contracts.
- Build verification uses the existing landing package and does not add future integrations or new database tables.

## Canonical recovery decision

The post-Prompt-8 implementation chain is retained only where demonstrably compatible. The React shell and backend/migration scaffolding remain reworkable material; generic MCP output, browser-local demo authority, in-memory account persistence, and any claim of Prompt 10 completion are rejected as non-canonical. Prompt 9 is a recovery/specification phase, and canonical Prompt 10 must restart after its contract is finalized.
- SDK scope is the configured signed event ingress endpoint required by the existing semantic-ingestion contract; a separate client SDK package is not required.

## Decision: Prompt 4 uses separate deterministic projections

Reason: A single event may be a journey event, complaint, escalation, several of these, or none; identity, journey, issue, and escalation are distinct decisions.

Alternatives considered: One AI classifier controlling all downstream context.

Impact: Each projection consumes resolved Events and its own configuration, preserves source facts, and recomputes derived state independently.

Status: Accepted in Prompt 4.

## Decision: Prompt 5 uses explicit churn cohorts and observation rules

Reason: A missing churn record does not prove retention, and historical experience must be anchored to an actual configured churn outcome.

Alternatives considered: Treating all non-churn records as retained, using inactivity as churn, or inspecting lifetime history without a window.

Impact: Churned customers use valid anchors and `[T-L, T)` lookbacks; retained customers require sufficient post-period observation; unknown customers are excluded from cohort comparisons.

Status: Accepted in Prompt 5.

## Decision: Prompt 6 separates registration from conditional onboarding

Reason: Registration establishes organization/account context; onboarding asks only about the company's actual channels, data interfaces, mappings, and analysis capabilities.

Alternatives considered: One giant technical form, mandatory direct database access, or requiring every channel/capability.

Impact: Companies can be ready for available capabilities while churn, journeys, transcripts, or escalation remain explicitly unavailable. No onboarding/auth tables are added to the MVP schema.

Status: Accepted in Prompt 6.

## Decision: Channels and DataSources are distinct configuration concepts

Reason: One system can deliver multiple interaction channels and one channel can have multiple delivery interfaces.

Alternatives considered: One source per channel or hardcoded source types.

Impact: DataSource captures delivery/source metadata and SourceFieldMapping; channel remains event context. Direct production database access is not required.

Status: Accepted in Prompt 6.

## Decision: Prompt 6 uses capability-specific readiness and a generic demo preset

Reason: Partial channel coverage and unavailable optional data must not block core use, and the demonstration must exercise the same contracts as real companies.

Alternatives considered: All-or-nothing onboarding or demo-only processing branches.

Impact: `NOT_STARTED`, `IN_PROGRESS`, and `READY` are conceptual states; `Breeze Demo Retail` is ordinary configuration, not a separate engine.

Status: Accepted in Prompt 6.

## Decision: Analytics distinguish unavailable, insufficient, and measured zero

Reason: Missing source capability, inadequate observation/sample size, and a real zero are materially different facts.

Alternatives considered: Returning zero for missing data or presenting tiny cohorts as confident findings.

Impact: Structured results carry sufficiency status, denominators, sample sizes, missing reasons, and provenance. Comparative association uses the documented minimum cohort size by default.

Status: Accepted in Prompt 5.

## Decision: Prompt 5 analytics are association-only

Reason: Cohort feature differences do not establish causal effects.

Alternatives considered: Causal language from descriptive comparisons or LLM interpretation.

Impact: Results use association wording and never claim causation without a later approved causal methodology; deterministic backend values remain authoritative.

Status: Accepted in Prompt 5.

## Decision: Drop-off and issue grouping are configured temporal derivations

Reason: Absence of a next event and same-topic similarity alone are unsafe. Configured stage windows, issue windows, lifecycle status, entity context, event time, and explicit evidence are required.

Alternatives considered: Global timeouts, permanent topic/customer issues, or inactivity-based resolution.

Impact: Late events can restore/recompute derived state; employees alone resolve issues; ambiguous candidates do not silently merge.

Status: Accepted in Prompt 4.

## Decision: Structured escalation outranks inference

Reason: Source-confirmed escalation is authoritative; transcript inference is useful only when structured data is unavailable and evidence passes a configured threshold.

Alternatives considered: Treating sentiment, priority, ordinary transfers, or all AI output as escalation.

Impact: Escalation records preserve method, confidence, evidence, source event, and issue link only when safe; no new escalation or issue is fabricated from weak signals.

Status: Accepted in Prompt 4.

## Decision: Prompt 3 freezes one deterministic event-processing contract

Reason: Implementers must not invent behavior between ingestion and downstream analytics. A single ordered pipeline preserves raw input, normalizes semantic roles, deduplicates, resolves identity/entity context, audits decisions, and supports safe reprocessing.

Alternatives considered: LLM-first matching, source-specific domain pipelines, or deferring conflict/late-event behavior.

Impact: The complete lifecycle, fingerprint canonicalization, status/method/confidence semantics, conflict handling, missing-data behavior, latency definitions, and reprocessing rules are authoritative in `BREEZE_SPEC.md`.

Status: Accepted in Prompt 3.

## Decision: No Prompt 3 schema change

Reason: The frozen conceptual tables already represent company/source scope, batches, mappings, canonical events/raw payload, entity links, and identity-resolution audit. Physical types/indexes/constraints remain implementation detail for the database phase.

Alternatives considered: Adding conflict, quarantine, session, or business-entity tables for convenience.

Impact: Implementations must use the existing 21-table contract and represent conflict/quarantine/reprocessing details through existing table concepts and audit/error metadata; a later database phase must provide the physical fields and indexes required by this contract.

Status: Accepted in Prompt 3.

## Decision: Ambiguity is a valid terminal processing result

Reason: Silent merges are unsafe, and deterministic evidence must outrank weak evidence.

Alternatives considered: Choosing the newest mapping, device-based assignment, or LLM arbitration.

Impact: Conflicts remain `AMBIGUOUS` with candidates/evidence; insufficient evidence remains `UNRESOLVED` with nullable `c_id`; only explicit stronger hierarchy evidence can resolve a conflict.

Status: Accepted in Prompt 3.

## Decision: Prompt 3 finalizes session-before-entity precedence

Reason: Prompt 3 explicitly freezes the ordered hierarchy as direct canonical ID, source mapping, configured authenticated/session relationship, business-entity relationship, then secondary evidence. Prompt 0 described the same evidence classes conceptually but did not freeze their implementation order.

Alternatives considered: Treating the earlier conceptual ordering as final or allowing each source adapter to choose precedence.

Impact: All implementations use the Prompt 3 order consistently; entity context remains a separate auditable resolution step and never becomes an arbitrary identity guess.

Status: Accepted in Prompt 3.

## Decision: Two dashboard modes share one evidence-backed data foundation

Reason: Support employees need customer investigation while analysts/managers need cross-customer patterns; both must use the same deterministic Breeze data.

Alternatives considered: Separate products, separate data models, or a chatbot-first interface.

Impact: Detail Customer and High-Level are distinct views, with explicit missing/ambiguous/unavailable states and no unsupported metrics.

Status: Accepted in Prompt 1.

## Decision: Reports and chatbot remain deterministic-data products

Reason: Reports, custom report definitions, history, artifacts, and chat answers must be traceable to structured Breeze analytics. Gemini is an interpretation layer, not the source of metrics.

Alternatives considered: Free-form AI answers, arbitrary SQL/database access, or static report-only experiences.

Impact: Later MCP design must support scoped, composable analytical tools, workspace boundaries, evidence, uncertainty, and missing-data communication.

Status: Accepted in Prompt 1.
