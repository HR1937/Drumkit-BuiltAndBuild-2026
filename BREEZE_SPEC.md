# Breeze — Product Specification and Constitution

This document is the stable project constitution for the PS-4 Cross-Channel Journey Stitching hackathon project, Breeze. It preserves the requirements from Prompt 0. Later phases may add implementation detail, but may not silently override this document.

## Product purpose

Breeze is a generic cross-channel customer journey stitching and analytics platform. Its conceptual flow is:

```text
Data Sources → Event Ingestion → Normalization → Identity Resolution
→ Business Entity Relationships → Customer Timeline → Journey Stitching
→ Issues / Complaints / Escalations → Analytics → Reports + Analyst Chatbot
```

The demonstration may use banking/cards, telecom, insurance, or e-commerce/retail examples. These are configuration domains, not separate hardcoded implementations. Companies configure their own entities, identifiers, event semantics, journeys, escalation information, churn definition, and issue grouping behavior.

## Three separate concepts

1. **Identity:** who an event belongs to (`Event → Customer`).
2. **Context:** which business object or journey an event relates to (`Event → Order`, loan application, policy, etc.).
3. **Issue grouping:** whether a complaint belongs to an existing issue episode or a new one.

These must not be collapsed into one generic AI matching system.

## Identity rules

- Never assume all channels use the same customer ID.
- Every source may have its own identifier.
- Internal `c_id` is the canonical customer identity.
- `IdentityMapping` stores source identifier → canonical customer relationships.
- `IdentityResolution` stores the decision made for each event.
- Every resolved identity must have an explainable method/evidence.
- Prefer deterministic evidence before probabilistic evidence.
- Never silently merge ambiguous identities.
- Ambiguous/unresolved events remain unresolved.
- Device ID is supporting evidence only, never primary identity proof.
- Session ID is useful for anonymous → authenticated session stitching.
- `call_id`, `order_id`, `policy_id`, etc. are not automatically customer identifiers. They are business/interactions references unless a relationship proves the customer.

Resolution hierarchy: direct canonical `c_id`, known source identifier mapping, known customer ↔ business entity relationship, authenticated/session relationship, secondary/probabilistic evidence, then ambiguous/unresolved. Direct canonical identity is strongest; weak evidence must never silently override stronger deterministic evidence. Every decision is auditable and the system must be able to say “unknown.”

## Generic business entities

Do not create universal domain tables such as Order, Policy, Claim, Account, Loan, Transaction, or Case. Use the generic `CustomerEntityLink` relationship so organizations can link customers to arbitrary entity types and identifiers. This relationship is also valid evidence for resolving an event’s identity.

## Events

Store meaningful business/journey events, not every mouse movement, scroll, animation, meaningless click, or low-value technical log. Preserve source identity, original `source_event_id` when available, `event_time`, `ingested_at`, processing time, channel/source context, event type, business entity reference, session reference, normalized attributes, and original payload where appropriate. `event_time` is distinct from ingestion time; late events retain their true event time. `c_id` may initially be NULL. Support `event_fingerprint` as a deduplication fallback when a source lacks a unique event ID. Do not persist `state_next`; state progression is derived from ordered events and configuration.

## Complaints and issues

A complaint is one customer contact/report. An issue is the underlying problem episode and can contain multiple complaints through relational relationships, never an array/list. A complaint must be associated with a customer before meaningful issue grouping. Normalize the topic first. Grouping considers customer, normalized topic, time gap, issue status, business entity context, and company-configured rules. The grouping window is not universal or hardcoded; a later occurrence may be a new episode. Employee confirmation owns issue resolution; store an optional resolution note. Do not implement automatic self-service recommendations in the MVP.

## Journeys

A journey is a configured business process/experience, not a permanent 24/7 customer state and not an automatic result of browsing. Journey definitions, stages, event mappings, completion conditions, anchors, and observation windows come from company configuration. Customers may have multiple journey instances, including multiple instances of one journey type anchored to different business entities. Drop-off requires configured sequence, expected progression, and an appropriate stage/journey timeout; absence of the next event alone is insufficient.

## Escalation

Prefer structured source data such as support level, transfers, supervisor transfers, flags, priority, or status. Escalation may occur in any channel and may link to an issue. If structured data is unavailable, conversation analysis may infer escalation, but source-confirmed and AI-inferred escalation must remain distinguishable. Inferred records require evidence, confidence, and detection method; AI inference is never equivalent to authoritative source data.

## Churn

The company defines churn. Breeze stores an actual source-provided churn outcome; last login alone is not churn. Analysis looks backward from actual churn and compares churned and retained cohorts using an explicit configurable lookback. It may examine unresolved issues, repeat contacts, escalations, resolution time, journey drop-offs, channel switching, and meaningful event patterns. Findings are associations supported by data, not unsupported causal claims. Preserve a source-provided churn reason distinctly from Breeze analysis. If churn data is unavailable, limit or disable the analysis rather than fabricate it.

## Company integration and onboarding

Breeze must not require direct database access or one ingestion method. Support APIs, webhooks, SDK/mobile events, batch CSV/JSON, scheduled feeds, SFTP-like feeds, Kafka, Azure Event Hubs, Pub/Sub, other streams, scheduled/pull APIs, and enterprise systems as applicable. Use semantic field mapping (`cust_no → customer_reference`, etc.), never hardcoded company field names. Optional capabilities are configured only when data exists; partial channel coverage is valid; missing data reduces analysis scope/confidence instead of breaking the platform.

Onboarding is for a non-technical representative and asks what they have and want to analyze: company basics; available channels; relevant connection method; identifiers; business relationships; configured journeys and stages; issue grouping; escalation capabilities when requested; and churn outcome/source/timestamp/reason when requested. The exact UI is later scope.

## Frozen conceptual database contract

The final conceptual database has exactly these 21 tables; PostgreSQL types, indexes, constraints, nullability, and cascade behavior belong to the dedicated database phase:

1. Company
2. DataSource
3. SourceFieldMapping
4. IngestionBatch
5. Customer
6. IdentityMapping
7. CustomerEntityLink
8. IdentityResolution
9. Event
10. JourneyDefinition
11. JourneyStageDefinition
12. JourneyEventMapping
13. JourneyInstance
14. JourneyInstanceStage
15. Issue
16. Complaint
17. Escalation
18. ChurnOutcome
19. IssueGroupingRule
20. ReportDefinition
21. ReportRun

No parallel database architecture may be introduced.

## Reporting and artifacts

Default reports must ultimately cover Customer Journey Overview, Drop-off Analysis, Escalation Analysis, Repeat Contact Analysis, Unresolved Issues, Churn-associated Experience Analysis, and Identity & Data Quality, using suitable KPI cards, tables, funnels, trends, breakdowns, and journey views. Analysts can eventually define reusable custom reports such as repeat contacts by channel over a chosen period. Generated artifacts are retained for approximately one month unless deleted earlier and use contextual filenames, never generic `report.pdf`/`analysis.pdf`/`output.pdf` names.

## Dashboard modes

The same Breeze data and analytics support two modes. **Detail Customer** supports employee investigation/resolution with identity, linked identifiers, timeline, issues, complaints, repeat contacts, journeys, escalations, churn context, operational signals, and a chatbot. **High Level** starts with customers analyzed, events processed, active journeys, unresolved issues, repeat contacts, escalations, churned customers, identity resolution rate, and processing latency, then reports, custom reports, history, and a chatbot. Neither mode should reduce concrete operational signals to vague sentiment.

## Gemini + MCP chatbot boundary

The chatbot uses Gemini API as the language model, but Gemini is not the analytics engine. The intended flow is Breeze chat UI → Gemini → narrowly scoped MCP tools → deterministic Breeze analytics/data → structured result → Gemini → human-readable answer. Gemini must not invent metrics. Final MCP tools are a later dedicated phase; do not invent them now or create an unrestricted `query_everything` tool.

## UI and product boundaries

The final product includes a public landing page, company dashboard, report experience, and chatbot experience. It must not look like generic AI SaaS: avoid excessive gradients, glowing AI effects, robots, sparkle icons, “AI magic” language, neon dashboards, and template-like AI interfaces. Orange may be retained/refined; blue is not automatically retained. Support light and dark themes eventually. Exact UI redesign is later scope.

Prompt 9 now defines the hackathon sign-up/login/session experience; password reset, email verification, OAuth/SSO, invitations, MFA, and full RBAC remain future extensions. The architecture remains compatible with Organization/User/Membership/Role, and Prompt 10 is the implementation boundary.

## Future scope — explicitly not implemented now

Do not implement employee-note-driven self-service recommendations, external Voice of Customer from public social sources, production authentication/organization management, or advanced probabilistic identity resolution. Deterministic resolution remains primary and black-box AI matching must not replace it.

## Prompt 9 — final user-facing product, onboarding, integration, and UI contract

Prompt 9 freezes the user experience only. Prompt 10 remains the first implementation phase; no application code, migrations, API adapters, webhook handlers, parsers, authentication code, renderer, MCP code, or UI components are created by this section.

### Authentication and organization boundary

The hackathon authentication approach uses Supabase Auth as the external email/password and session mechanism. Supabase owns password hashing, authenticated session persistence, and expiry/refresh. Breeze owns registration behavior, Company creation, provider-identity association, authorization, onboarding, server-derived tenant context, and tenant isolation. Breeze does not implement Argon2id hashing or a second custom session system. Supabase credentials/tokens and other secrets are never displayed or logged. Email verification, password reset, MFA, OAuth/SSO, invitations, production membership administration, and full RBAC are future extensions, not claims of current implementation.

Sign-up requires organization/company name, admin display name, email, password, and password confirmation. Email is normalized and unique within the authentication namespace; password policy is at least 12 characters with confirmation and server-side validation. Hackathon sign-up does not require email verification. Duplicate email returns a non-enumerating registration error; malformed/weak input returns field-level validation; failed registration creates no partial organization. Successful registration creates one Company and one initial organization-admin account/session, then redirects to onboarding, never directly to a “ready” dashboard.

Login requires email and password. Invalid credentials return one generic error without revealing whether the email exists. Successful login creates/rotates a session and redirects to the saved onboarding step or dashboard. Logout revokes the session and returns to the public landing page. Protected routes require a valid session and company context; unauthenticated deep links redirect to login with a safe return path. Expired/revoked sessions redirect to login and preserve no privileged page data. Authentication, organization identity, onboarding state, authorization, and capability readiness are separate concepts.

Company is the tenant/workspace identity. It has a required name, stable canonical company identifier, optional industry/context and timezone, and owns DataSources, mappings, configurations, reports, runs, and artifacts. The data model remains compatible with future User/Membership/Role administration; the hackathon supports one initial admin and a single controlled company context, with no requirement to build team management. Company identity is never supplied by Gemini or a free-form client field.

### Onboarding and readiness

Onboarding is a resumable seven-step workspace flow: (1) company information and timezone; (2) desired capabilities/use cases; (3) data source and connection method; (4) semantic field mapping; (5) journey, issue, escalation, churn, and optional entity configuration; (6) validation/sample preview; (7) completion/readiness. Each step saves draft state and can be revisited. Required questions are company name/timezone, at least one intended capability, one source or an explicit “configure later” choice, and enough mapping/configuration for the selected capability. Optional questions include industry, extra channels, historical depth, optional entity context, transcript availability, and optional churn reason.

Capabilities are shown as `AVAILABLE` (company says data exists), `CONFIGURED` (rules/mapping supplied), `READY` (validation and sufficiency pass), `INCOMPLETE` (required configuration missing), or `UNAVAILABLE` (company does not have/provide the capability). A company can enter the workspace with incomplete capabilities; readiness is per capability, not a binary account flag. Core readiness requires a valid company, at least one valid source or explicit demo context, a validated meaningful-event mapping, and a usable sample. Journey, issue, escalation, churn, reports, and chatbot analytics show their own readiness and never appear as fake zeroes. Changing a source/configuration invalidates only affected capabilities and marks them for revalidation.

The mapping screen shows source field, Breeze semantic field, required/optional/conditional status, sample values, mapping status, validation message, and whether the field is sensitive. Users select from configured semantic roles; they do not type arbitrary internal database columns. Missing required fields block that capability; missing optional fields produce warnings and reduced scope; unexpected fields are preserved but ignored until mapped. Preview uses a bounded sample, reports valid/invalid/duplicate/unresolved rows, timestamp/channel/type problems, and never claims full readiness from a preview alone.

### Connection model and lifecycle

The supported hackathon connection methods are REST API pull, signed webhooks, SDK/tracking event ingress, and CSV/JSON file import. A company may configure multiple DataSources and channels; DataSource delivery metadata remains distinct from event channel. Scheduled API sync and replay/recovery are configuration behaviors of REST sources. A distributable SDK package is not required, but configured web/mobile SDK clients may send signed events through the SDK ingress contract. Direct database/warehouse connections, SFTP/object storage, Kafka/Event Hubs/Pub/Sub, and integration-platform connectors remain future product directions; the landing page must label them as future or omit them.

For REST, onboarding asks base URL, authentication type (bearer/API key/OAuth credential reference), required endpoint/resource mappings, pagination style, rate limit guidance, incremental cursor or timestamp field, and historical retrieval range. Credentials are entered through protected secret handling and shown only masked. Connection testing validates response shape, authentication, pagination, timestamps, event semantics, and sample sufficiency; it does not expose response secrets.

For webhooks, Breeze provides a tenant-scoped endpoint and signing-secret setup instructions. The source must declare event types/payload mapping and signature scheme. Delivery is idempotent using Prompt 3 identifiers/fingerprints, preserves event time/order metadata, acknowledges only accepted envelopes, retries failures with bounded backoff, and exposes replay/recovery status. Missing ordering is handled by event-time processing; duplicate deliveries are safe retries.

For CSV/JSON import, the user uploads a supported structured file, receives size/encoding/schema validation, maps columns, previews bounded rows, and confirms import. Malformed rows are quarantined with row-level reasons; valid rows continue when partial import is allowed; missing required fields block the affected capability; duplicates follow Prompt 3 deduplication; unsupported formats, oversized files, invalid encoding, and all-invalid files fail safely. Re-upload creates a new ingestion attempt and does not silently overwrite history.

Connection states are `NOT_CONFIGURED`, `CONFIGURING`, `CREDENTIALS_MISSING`, `CONNECTING`, `CONNECTED`, `VALIDATING`, `VALIDATION_FAILED`, `PARTIALLY_VALID`, `READY`, `SYNCING`, `SYNC_FAILED`, `DISABLED`, and `CREDENTIALS_EXPIRED_OR_REVOKED`. The UI shows a plain-language status, last successful activity, next action, affected capabilities, and safe error details. API unavailability, timeout, rate limiting, malformed response, missing fields, schema drift, stale data, and credential expiry preserve existing data, mark the source/capabilities degraded, and provide retry/reconnect guidance; they do not erase historical events or fabricate readiness.

The UI may show source name, method, endpoint host where safe, selected authentication type, mapping status, sync/validation status, timestamps, row counts, warnings, and capability readiness. It must never show passwords, full tokens, API keys, webhook secrets, authorization headers, raw credential payloads, or unnecessary sensitive source data.

### Product scope and information architecture

Public navigation is logo, Product/How it works, Integrations, and Sign in; the primary landing CTA is `Connect your company` leading to registration. Authenticated navigation is a compact sidebar: Overview, Customers, Data & Connections, Configuration, Analytics, Reports, and Settings; the header contains company context, readiness indicator, help/chat entry, and account menu. Onboarding-only routes are registration continuation and `/onboarding/*`; configuration/readiness surfaces remain accessible after onboarding. Analytics/report routes are capability-dependent and show a configured, unavailable, insufficient, or unauthorized state rather than disappearing mysteriously.

The hackathon product includes: controlled email/password session flow; company registration; resumable onboarding; demo or REST/webhook/SDK/file source configuration contract; semantic mapping and validation preview; readiness dashboard; customer investigation; finalized journey/issue/escalation/churn/analytics views; seven reports, report history, and artifacts; and the Prompt 7 scoped analyst chatbot. It does not claim production SSO/MFA/team administration, a distributable SDK package, direct warehouse sync, SFTP/stream connectors, automated self-service, predictive churn, social listening, or arbitrary report/SQL execution.

Overview is the readiness-aware high-level workspace: selected period, capability status, key metrics, data freshness, recent report runs, and actionable warnings. Customers is the Detail Customer investigation surface: canonical identity/ambiguity, timeline, issues, journeys, escalations, churn context, and evidence-backed chatbot. Data & Connections lists sources, method, status, last sync, mapping/validation, and actions to test/reconnect/disable. Configuration groups capabilities into Journeys, Issues, Escalations, Churn, and company defaults; each shows configured rules, validation, and readiness. Analytics presents Prompt 5 outputs. Reports lists default/custom definitions, filters, run status, snapshots, download/artifact status, and history. Settings contains company profile, timezone, account/session controls, and masked connection management.

Every screen has explicit loading, empty, error, partial/degraded, unavailable, insufficient-data, not-configured, disabled, and unauthorized states where relevant. Configuration changes are auditable and require revalidation. No screen silently converts unavailable data to zero or treats a future feature as active.

### Landing page and visual system

The landing page contains: restrained hero (“See the customer journey clearly”), primary `Connect your company` CTA, secondary `Explore the demo`, a concise value proposition, a three-step “Connect → Understand → Act” explanation, capability cards for identity/journeys/issues/analytics/reports, a truthful connection-method section for REST/webhooks/file import, one or two product screenshots/mock representations, a clearly labeled “Coming later” strip only for enterprise integrations/authentication/team features, sign-in/register links, and a concise footer. It must not imply that future connectors or predictive automation work today.

The visual system is credible B2B: warm neutral surfaces, restrained orange accent for action/readiness, charcoal text, semantic green/amber/red/blue status colors, readable sans-serif typography, 4/8-point spacing rhythm, consistent cards/tables/forms, modest borders and shadows, no neon gradients, robots, sparkle/magic language, or decorative AI effects. Desktop uses a persistent sidebar and content canvas; tablet collapses the sidebar to a drawer and reduces multi-column grids; mobile uses a top bar/drawer, stacked cards, horizontal-scroll data tables with priority columns, and full-width forms/dialogs. Reports and configuration use progressive disclosure rather than dense simultaneous controls. Long names wrap safely; IDs use copy affordances; large datasets use pagination/virtualized boundaries, never unbounded rendering.

Accessibility and usability are required: keyboard-accessible navigation/dialogs, visible focus, semantic headings and controls, labels tied to inputs, inline and summary error messages, sufficient contrast, non-color-only status, readable minimum text sizing, clear destructive confirmations, and status changes announced or otherwise available to assistive technology. Loading does not block unrelated navigation; disabled actions explain why.

### Company-facing onboarding questions

Required: company name, timezone, admin name/email/password, intended capabilities, whether data is available now, source/method choice, authentication type, and sample/historical availability. Conditional: REST endpoint/pagination/incremental field; webhook event/signature details; file format/columns; journey stages/windows; issue topic/grouping rules; escalation fields/transcripts; churn source/type/timestamp/reason; business entity relationships. Optional: industry/context, extra channels, retention/history preference, descriptions, and future connector interest. Technical/admin-only: credentials, signing secrets, endpoint details, rate-limit expectations, schema samples, and reprocessing controls. Breeze does not ask for fields it cannot map to an established semantic or configuration capability.

### Edge-case behavior and demo

Registration/login/session errors remain generic and safe; abandoned onboarding resumes from the last saved step; skipped optional capabilities remain explicitly unavailable; required incomplete configuration blocks only its capability. Empty, malformed, duplicate, stale, future-dated, missing-field, inconsistent-time, partial-file, webhook-order, rate-limit, schema-drift, and credential cases surface actionable state without data fabrication. Analytics/reports preserve Prompt 8 zero/empty/missing/insufficient/unavailable distinctions, immutable historical runs, expired artifacts, partial failures, authorization, provenance, and freshness. Mobile, long names/fields/errors, large datasets, and all loading/empty/error/partial/disabled/not-configured/not-authorized states have the responsive behaviors above.

`Breeze Demo Retail` uses the same Company, DataSource, SourceFieldMapping, event, identity, journey, issue, escalation, churn, report, and MCP contracts. Demo context is a controlled configuration/data fixture, not a separate code path or hardcoded answer set. If its data lacks a capability or sample, the UI demonstrates the correct unavailable/insufficient state.

## Prompt 10 implementation status

The current implementation includes the `landing` Vite/React application shell and an `api` Node/Express service. The frontend calls server authentication APIs; the API includes the frozen 21-table PostgreSQL migration, tenant-scoped auth middleware, source/mapping endpoints, REST/event, signed webhook, and SDK ingress paths, overview analytics, and the exact Prompt 7 tool-name allowlist. Full database-backed account persistence, migration execution in the target environment, complete deterministic analytics/report/artifact services, and Gemini runtime integration remain active Prompt 10 work.

## Canonical recovery note

The repository’s post-Prompt-8 implementation work was audited under the recovery Prompt 9. The existing frontend and API are partial, reworkable material. They do not establish canonical Prompt 10 completion. Generic MCP output, browser-local demo authority, in-memory account persistence, and incomplete analytics/report/Gemini behavior remain non-authoritative until replaced by implementations of the Prompts 0–8 contracts.

## Permanent 75 non-negotiable rules

### Identity

1. Never assume all channels use the same customer ID.
2. Every source may have its own identifier.
3. Internal `c_id` is our canonical customer identity.
4. `IdentityMapping` stores source identifier → canonical customer relationships.
5. `IdentityResolution` stores the decision made for each event.
6. Every resolved identity must have an explainable method/evidence.
7. Prefer deterministic evidence before probabilistic evidence.
8. Never silently merge ambiguous identities.
9. Ambiguous/unresolved events remain unresolved.
10. Device ID is supporting evidence only, never primary identity proof.
11. Session ID is useful for anonymous → authenticated session stitching.
12. `call_id`, `order_id`, `policy_id`, etc. are not automatically customer identifiers. They are business/interactions references unless a relationship proves the customer.

### Events

13. Store meaningful business/journey events, not every meaningless click.
14. Preserve original source event identity.
15. Prevent duplicate ingestion using source/event identifiers.
16. Store `event_time` separately from `ingested_at`.
17. `c_id` may initially be NULL.
18. `state_next` is not stored because it is derived.
19. Channel is source context, not customer identity.
20. Business entity references should be preserved when available.

### Complaint / Issue

21. Complaint = individual customer contact/report.
22. Issue = underlying problem episode.
23. One issue can contain multiple complaints.
24. Never store complaint groups as arrays/lists.
25. Complaint does not need core `resolved_at`.
26. Issue owns the lifecycle resolution.
27. New complaint must first resolve to a customer.
28. Topic must be normalized before issue grouping.
29. Existing issues for that customer become candidates.
30. Calculate the time gap explicitly.
31. Compare time gap against a configurable issue grouping window.
32. Check issue status.
33. Use business entity context when available.
34. Same topic does not automatically mean same issue forever.
35. A later occurrence can create a new issue episode.
36. Never hardcode one universal “same complaint” time window for every domain.
37. If evidence is insufficient, create a new issue or leave grouping uncertain according to the defined confidence policy, rather than blindly merging.

### Journeys

38. A customer does not automatically have a 24×7 “journey.”
39. Random browsing/activity is not automatically a journey.
40. A journey represents a business process/experience the organization chooses to analyse.
41. Journey definitions come from company configuration.
42. Journey stages come from company configuration.
43. Do not hardcode banking/telecom/insurance/e-commerce stages into core logic.
44. Store journey definitions and stage definitions.
45. Generate a customer’s actual journey view from events when an employee requests it.
46. Do not create permanent journey rows for every customer activity unless there is a concrete reason.
47. A customer can have multiple distinct journeys.
48. Drop-off cannot be declared simply because the next event has not arrived.
49. Drop-off requires the configured journey sequence and an appropriate observation/completion window.
50. Journey stage mapping must be based on event semantics/configuration, not arbitrary AI guesses.

### Escalation

51. Prefer structured escalation information from the source.
52. Escalation can occur in any channel.
53. Escalation can be linked to an issue when an issue exists.
54. Conversation AI can infer escalation only when structured data is unavailable.
55. Inferred escalation must be marked as inferred and carry confidence/evidence.
56. Never treat AI inference as equivalent to a source-confirmed escalation.

### Churn

57. Store actual churn outcome, not an invented “churn reason.”
58. Churn definition/outcome comes from the company/domain.
59. Last login alone does not equal churn.
60. Churn analysis uses historical customer experiences before churn.
61. Compare churned and retained cohorts.
62. Features can include unresolved issues, repeat contacts, escalations, resolution time, journey drop-offs, channel switching and other meaningful events.
63. Use an explicit lookback window.
64. Report associations with evidence, not unsupported causal claims.
65. If source provides an actual recorded churn reason, preserve it as source data and distinguish it from our inferred analysis.

### Company integration

66. Do not require database access.
67. Do not assume one ingestion method.
68. Support multiple connection mechanisms.
69. Ask companies about available capabilities/data, not our internal implementation.
70. Use semantic field mapping.
71. Never require a field merely because our code happens to use that field.
72. Optional capabilities should only be configured when the company has the corresponding data.
73. The platform should work with partial channel coverage.
74. Missing data should reduce the scope/confidence of an analysis, not break the entire platform.
75. The onboarding experience must remain understandable to a non-technical company representative.

## Prompt 1 product contract

### Product identity and value

Breeze is a cross-channel customer journey stitching, identity resolution, issue investigation, and journey analytics platform. It connects different channels to resolved customer identity, unified meaningful events, business context, customer journeys, issues/complaints/escalations, experience analytics, reports, and investigation. It is not merely an AI chatbot, CRM, support system, generic BI dashboard, or event logging platform; AI is a supporting capability and structured data is the source of product value.

### Product questions

Breeze answers: who an interaction belongs to; what the customer was trying to accomplish and how they progressed; where configured journeys drop off; where escalation/transfer/higher support occurred; what problems repeat; which issues remain open; which customers repeatedly contact about related problems; whether customers switch channels because an issue was unresolved; which experiences are associated with later churn; and how confidently/quickly incoming data is connected and processed.

### Users and responsibilities

- **Company/Organization:** owns the Breeze workspace and configures sources, channels, identifiers, semantic mappings, business-entity relationships, journeys/stages, issue grouping, escalation fields, churn definition, and analytical capabilities.
- **Operational/Support Employee:** primarily uses Detail Customer to investigate identity, history, reported problems, existing issues, journey, escalation, post-escalation outcome, resolution status, and recorded resolution.
- **Analyst/Manager:** primarily uses High-Level mode to investigate patterns in drop-off, repeat contacts, escalations, unresolved issues, churn-associated experience, identity quality, processing speed, and selected periods. MVP does not add artificial role complexity.

### Organization, registration, and onboarding

Breeze is ultimately organization-level: Company/Organization → Admin account → company registration → company onboarding/configuration → workspace → employees/analysts → dashboard. Registration creates the organization/account context. Onboarding configures how Breeze understands the organization's data and business. Future onboarding conditionally gathers company information, domain, channels, sources, connection methods, identifiers, semantic field mappings, entity relationships, journeys/stages/windows, issue grouping, escalation availability, churn definition/source, and optional capabilities. The full onboarding workflow is later scope. MVP does not require production authentication, password reset, OAuth, verification, RBAC, or invitations, but future architecture must support them.

### Dashboard modes

Dashboard contains **Detail Customer** and **High-Level** views over the same data. Detail Customer eventually shows canonical identity, relevant source identifiers/mappings and appropriate resolution confidence without unnecessary internals; a meaningful chronological timeline; current/previous issues, topics, status, last contact, and resolution; complaint history with time/channel/issue; journey instances and progress; escalation context with source/inferred distinction; deterministic repeat-contact signals; actual churn context only when available; and employee action **Mark as Resolved** with optional “How was this issue resolved?” note. High-Level begins with only calculable metrics: customers analyzed, events processed, active/completed/dropped-off journeys, open/unresolved issues, repeat contacts, escalations, churned customers, identity resolution/ambiguous/unresolved rates, duplicate event rate where available, and processing latency. Metrics unavailable from configured data must be marked unavailable/limited, never shown as unsupported zeroes.

### Default analytical areas

Prompt 8 supersedes the earlier planning note below: exact report formulas, configuration, execution, and artifact behavior are finalized in the Prompt 8 contract appended at the end of this document.

The seven product-level report areas are Customer Journey Overview, Drop-off Analysis, Escalation Analysis, Repeat Contact Analysis, Unresolved Issues, Churn-associated Experience Analysis, and Identity & Data Quality. Their exact formulas belong to later phases. The journey overview covers started/active/completed/dropped-off instances, stage progression, meaningful time/progression, configured journey and period breakdowns, and drill-down to customer/journey instances. Drop-off covers journey, stage, affected instances, rate, period/trend, and supported channel/segment breakdowns, subject to configured algorithms. Escalation covers totals/rate, channel, support level, issue/topic, trend, and source-confirmed versus inferred; required source fields must be configured and absent fields make metrics limited/unavailable. Repeat Contact uses the Issue model and event context to distinguish repeated same/related problems from unrelated interactions and can show frequency, topic, channel switching, time between contacts, and high-contact customers. Unresolved Issue analysis shows open issues, age, topic, affected customers, last contact, escalation context, and journey context where relevant; inactivity does not resolve an issue. Churn-associated analysis compares actual churned and retained cohorts, uses an explicit lookback, respects available data, communicates association rather than causation, and is unavailable without a churn source. Identity & Data Quality covers resolved/ambiguous/unresolved events, rates, duplicates, latency, source quality, missing fields, and ingestion failures where applicable.

### Custom reports, history, and artifacts

Analysts may ask structured questions such as repeat contacts by channel over a period or journey-stage drop-off among customers who later churned. Breeze converts requests into reusable report definitions containing, as applicable, name, description, type/configuration, filters, date range, dimensions, metrics, saved configuration, and rerun capability. Results come from deterministic analytics; an LLM may interpret or explain but may not invent statistics. Report history distinguishes definition, run, status, execution time, parameters, and generated result/artifact; failed runs are not successful reports. Persistent artifacts may be PDF or DOC/DOCX depending on later implementation, use contextual filenames, and are retained approximately one month unless deleted earlier.

### Chatbot contract

The chatbot is an analytical investigation interface for Breeze data, not a general-purpose chatbot. It supports customer-specific questions in Detail Customer and cross-customer questions in High-Level. It must use actual structured results, distinguish facts from interpretations, communicate missing data and uncertainty, respect company/workspace boundaries, avoid arbitrary database access, and combine multiple scoped results when a question requires issues + contacts + churn, for example. Gemini is the language/reasoning layer; the source of truth is deterministic Breeze analytics behind later-approved MCP tools. Final MCP contracts are deferred.

### Missing, empty, and trust behavior

Partial coverage is first-class: website-only data produces website insights without invented mobile/call data; absent transcripts disable transcript analysis; absent churn disables/limits churn analysis; absent structured escalation fields limits escalation metrics; absent entity relationships lowers identity coverage; ambiguous identities remain ambiguous; no configured journeys means no invented journeys; no issue data means no fake issue metrics; and no data for a selected period produces a meaningful empty state. Do not show zero unless supported by data. Important conclusions expose traceable evidence and distinguish deterministic/source-confirmed information from inference, including identity method/evidence/confidence and inferred escalation evidence/confidence.

### Deterministic boundary and timeline distinction

Identity mappings, deduplication, entity links, journey definitions/mappings/progression/drop-off rules, issue lifecycle/grouping, source-confirmed escalation, churn outcomes, and analytics calculations remain deterministic/configuration-driven. AI may assist with text normalization, topic extraction, sentiment, transcript understanding, inferred escalation when structured data is unavailable, natural-language report requests, explanations, and chat interaction. A timeline is a chronological sequence of meaningful events; a journey is a configured business process derived from relevant events. Channel transitions and evidence-backed proactive signals such as repeat issues, aging unresolved issues, switching, repeated escalation, stuck stages, failed attempts, and pre-churn contacts should be surfaced without presenting vague AI predictions as facts.

### Prompt 1 MVP and future boundary

The eventual MVP product scope includes organization context, source configuration, ingestion/normalization, identity resolution, entity relationships, timeline, journey configuration/stitching, issue/complaint grouping, escalation and churn outcome handling, deterministic analytics, both dashboard modes, default/custom reports, report history/artifacts, Gemini analyst chat through MCP, identity/data quality, and employee resolution notes. Prompt 1 freezes these requirements but does not implement them. Explicitly out of scope remain public social ingestion, automated self-service recommendations, full production authentication/RBAC, advanced probabilistic graph learning, arbitrary SQL or unrestricted agents, unrelated CRM, marketing automation, and unnecessary engagement automation.

### Product/UI constraints for later phases

The interface communicates operations, journeys, analytics, and investigation rather than generic AI SaaS. Avoid excessive blue/purple gradients, glow, robots/magic imagery, sparkle iconography, and “AI-powered” everywhere. Orange may be refined; blue is not automatically retained. Use a distinctive font if useful; support light and dark themes, responsive behavior, and explicit empty/error/loading/ambiguous/unresolved states. `landing/` and `dashboard/` remain starting-point drafts; do not create a third duplicate frontend.

## Prompt 4 — final journey, issue, lifecycle, and escalation algorithms

Prompt 4 freezes the deterministic behavior below. It uses the existing journey, issue, complaint, escalation, event, customer, entity-link, and rule concepts; it introduces no domain-specific engines and no new universal business-entity tables. Prompt 3 identity resolution is the only identity algorithm. A downstream object may be customer-associated only when the source Event has a permitted `RESOLVED` identity; `AMBIGUOUS` and `UNRESOLVED` events remain retained events but cannot create customer-specific complaints, issues, journey instances, or escalations.

### Configured journeys and lifecycle

`JourneyDefinition` is a company-configured business process, not a lifetime customer journey, browsing timeline, app session, or automatically inferred process. `JourneyStageDefinition` supplies `stage_key`, name, order, `required`, and optional `dropoff_timeout_minutes`. `JourneyEventMapping` maps normalized event semantics to `START`, `STAGE`, `COMPLETION`, or `ABANDONMENT`, optionally to a configured stage. No stage key, start, completion, or membership is invented by AI.

An event creates a `JourneyInstance` only when an active configured mapping marks it `START` and the event identity is resolved. First apply Prompt 3 event deduplication. A retry creates no second instance. For a new start, match by the same JourneyDefinition and customer, then by configured business-entity anchor (`business_entity_type` and `business_entity_id`), then by the journey's explicit instance-matching rule. A distinct entity creates a distinct instance. If no entity exists and simultaneous instances are allowed, the definition must provide an explicit deterministic discriminator; otherwise the new start is retained in the timeline and marked as an instance-match ambiguity rather than silently merged. A journey with no START event has no instance.

An event is attached to at most one journey instance by default. Multiple attachment is allowed only when the configuration explicitly says the event applies to multiple contexts. Customer identity alone never attaches an event to every active instance. Journey A/LA1, Journey A/LA2, and Journey B/O900 remain separate when their definition/entity context differs.

### Stage progression and ordering

For each mapped stage event, select the applicable instance, order all relevant events by `event_time` with a deterministic event-ID tie-breaker, and evaluate the expected stage. A qualifying event creates or updates `JourneyInstanceStage`; `first_event_id` and first event time are retained, while `last_event_id` and last qualifying event time advance only when the event qualifies. Stage status is derived, never fabricated by a later event.

Optional stages may be `SKIPPED` when a later qualifying stage is reached. Required stages cannot be skipped: a later event remains a valid timeline event but cannot complete the missing required stage or falsely advance completion. Out-of-order events are stored with their original event time; they do not create fake events. Recompute the affected instance from its complete event history so a late earlier stage may establish progression and timestamps, or may leave a later stage pending if its required evidence is still absent. Events not mapped to a journey remain only in the global timeline.

Completion occurs only when the configured completion condition is satisfied: a mapped `COMPLETION` event, a configured final stage, or another explicit condition. `JourneyInstance.status = COMPLETED` and `ended_at` use the qualifying business `event_time`. Abandonment occurs only on a configured `ABANDONMENT` event and is distinct from drop-off. If completion and abandonment conflict, order them by business event time; at equal time use the configured mapping precedence, otherwise preserve the conflict and do not silently choose. A later event does not reopen a completed or abandoned instance unless the definition explicitly permits it.

### Drop-off and recovery

A stage is eligible for drop-off only when an instance exists, the stage has qualifying evidence, a next required progression is expected, a stage/journey observation window is configured, the next progression is absent through the threshold, and no completion, abandonment, or other valid progression supersedes it. The timeout begins at the last qualifying event time for the relevant reached stage; if the stage has no qualifying event it cannot time out. Stage-specific `dropoff_timeout_minutes` overrides any journey-level fallback. Comparison is half-open: progression at exactly `completed_at + timeout` is on time and prevents drop-off; eligibility begins only when `event_time > deadline` and the evaluation clock has passed the deadline. Processing delay never changes the deadline.

Drop-off is a recomputed derived state, not a source fact. A qualifying late event before or after an eligibility evaluation causes the instance to be recomputed from all event history; the stage is restored from drop-off if progression is valid, and completion/abandonment takes precedence when their source conditions are met. Earlier drop-off evaluations remain audit history, but the current derived status reflects complete history. A configured explicit completion or abandonment does not silently reopen because of a later ordinary event.

### Complaints and topic normalization

A Complaint is one individual customer contact/report, created only from a meaningful source event with `RESOLVED` identity. An ambiguous or unresolved complaint-shaped event remains a retained event with its identity decision and may be reprocessed later; it does not become a customer Complaint. A Complaint is never an array inside Issue and is not itself the underlying problem episode.

Normalize `core_topic` before grouping with this precedence: (1) trusted mapped structured topic/category, (2) company-configured taxonomy/mapping, (3) text/transcript/manual normalization when structured topic is absent, (4) insufficient/unknown topic when no reliable classification exists. Equivalent wording is collapsed only when the configured taxonomy/evidence supports it; the engine has no banking-only topic list and does not create arbitrary spelling topics. AI may assist with unstructured classification, but the output is evidence with method/confidence and is not unquestionable truth. Missing text/topic remains insufficient and is never a fabricated precise topic.

### Issue grouping and candidate selection

For a resolved Complaint: find same-customer candidates, prefer active/open/recent Issues, compare normalized topic, compare entity context, calculate `absolute(complaint.reported_at - candidate.last_contact_at)` using business event times, and apply the active company `IssueGroupingRule` (`time_window_minutes`, `same_customer_required`, `same_topic_required`, `same_business_entity_preferred`). No universal time window exists. A same entity is a strong preference; same customer/topic may group without entity when the rule permits and entity is unavailable. Same topic with a different entity does not automatically group. Different topic does not group unless an explicit configured taxonomy rule says it is equivalent.

Candidate precedence is: same customer, same topic, same entity when available, lifecycle status, then smallest non-negative/absolute time gap; ties are resolved by the most recent qualifying contact timestamp and stable Issue identifier. If equally valid candidates remain, do not merge or choose arbitrarily: create a new Issue with an auditable `GROUPING_UNCERTAIN`/insufficient-confidence decision according to the configured policy. A future/invalid complaint timestamp cannot be grouped by time and creates a new issue or remains pending according to validation policy; it never uses ingestion time as a substitute.

Issue statuses are `OPEN`, `IN_PROGRESS`, `ESCALATED`, `RESOLVED`, and `REOPENED`. A resolved Issue is eligible for reopening only when the new Complaint clearly represents continuation under the same customer/topic/entity and the configured reopening/grouping window. Within the window, set `REOPENED`; outside it, create a new Issue even for the same topic. Preserve original `created_at`, prior `resolved_at`, prior resolution evidence, and all complaints. A subsequent employee resolution sets `RESOLVED` with a new current resolution timestamp and note; no IssueHistory table is introduced. If the physical Prompt 2 Issue contract lacks the already-required optional resolution-note field, that is a database-phase column compatibility correction, not a new table or a Prompt 4 algorithm change.

Only an employee action **Mark as Resolved** changes an issue to `RESOLVED`. Silence, improved sentiment, an AI conclusion, unrelated events, journey completion, or escalation never resolves it. A missing resolution note is valid; a provided note is stored. AI cannot reopen or resolve an issue.

### Escalation

Escalation is separate from complaint, issue, severity, churn, sentiment, and journey state. It is detected in this precedence: explicit source escalation event/flag; configured upward support-level transition; configured supervisor/escalation-team transfer; other explicitly mapped escalation semantics. An ordinary transfer or high priority is not escalation unless the company mapping says so. Structured detection creates one Escalation occurrence linked to the source Event, with available `from_level`, `to_level`, reason, event time, issue link if safe, deterministic detection method, and deterministic/high confidence. Missing levels remain null.

If structured escalation data is unavailable and transcript/text exists, AI-assisted inference may create an Escalation only when evidence indicates an actual escalation transition/state, such as transfer to a supervisor or escalation team. It must use `detection_method = INFERRED`, a reproducible inference method, explicit confidence, evidence excerpt/summary, and source event. Strong evidence above the configured inference threshold may be recorded as inferred; weak phrases such as frustration, urgency, or “please help” alone do not create a confident escalation. Below threshold or ambiguous evidence produces no escalation record or a clearly non-confirmed analysis result, never source-confirmed escalation.

Escalation deduplication uses the Prompt 3 source event identity/fingerprint plus occurrence identity. Retrying, transcript reprocessing, or analytics recomputation cannot create a duplicate occurrence. Two separately evidenced escalation transitions in one interaction may create two records. An escalation with no safely resolved issue leaves `issue_id = NULL`; no issue is manufactured for attachment. An escalation does not create a journey, and a drop-off does not imply escalation. Escalation may occur inside or outside a journey and may coexist with complaint and issue context. Structured source facts always outrank inferred evidence; inference never becomes source-confirmed and escalation history is not deleted when an issue resolves.

### Data insufficiency and AI boundary

No business entity permits configured fallback rules only where explicitly allowed; no journey start or complete mapping means no corresponding instance/progression; absent complaint text leaves topic insufficient; absent transcript disables transcript inference; absent escalation fields limits structured analysis; incomplete stage mappings limit journey analysis. No missing business meaning is fabricated. All source facts remain distinct from derived journey/issue states. AI may assist topic normalization and transcript escalation inference only; it may not decide identity, journey creation/membership/stages/drop-off, grouping, issue resolution, or unsupported escalation. Prompt 5 churn/analytics formulas, Prompt 7 Gemini/MCP contracts, Prompt 8 reports/artifacts, Prompt 6 configuration collection, and Prompt 9 user-facing product/UI contracts are finalized; Prompt 10 remains implementation scope.

### Prompt 4 database compatibility

The existing JourneyDefinition, JourneyStageDefinition, JourneyEventMapping, JourneyInstance, JourneyInstanceStage, Issue, Complaint, Escalation, Event, Customer, CustomerEntityLink, and IssueGroupingRule concepts represent this contract. Generic entity links remain the only business relationship layer; no Order/Policy/Claim/Account/Transaction/Case/Loan tables and no IssueHistory table are added. Historical source facts and lifecycle audit metadata must be preserved using the frozen Issue/Escalation/Instance concepts and the physical fields selected by the completed database phase. No new table or conceptual schema change is required.

## Prompt 5 — final churn and analytics algorithms

Prompt 5 freezes deterministic analytical behavior over the existing 21-table contract. It does not add tables, define report presentation/artifacts, define MCP/Gemini tools, or implement UI. Source facts remain distinct from derived metrics and interpretations. Results may report association, never causation, unless a later approved methodology genuinely establishes causal identification.

### Configuration and churn outcomes

Company configuration supplies churn definition/source/type mapping, analysis period, lookback duration, retained-observation duration, Prompt 4 mappings/windows, optional thresholds, timezone, and filters. Breeze fixes cohort, timestamp, deduplication, counting, denominator, null, sufficiency, and provenance rules. ChurnOutcome is created only from a valid configured structured churn source/mechanism; inactivity, no login, disappearance, sentiment, and LLM guesses never create churn. A missing definition/source makes churn analysis `UNAVAILABLE`, not zero.

Prompt 3 deduplication applies to churn deliveries. Identical retries are one outcome; conflicting reuse of an identifier is auditable and excluded from an unambiguous anchor. Distinct valid outcomes are preserved and ordered by `churn_timestamp`; reactivation does not erase earlier churn. A customer is counted once per cohort and uses the earliest valid outcome in the requested period. Unorderable conflicting timestamps exclude that customer from churn anchoring with `INSUFFICIENT_DATA`.

### Time and cohorts

All business timestamps use the company analysis timezone and half-open periods `[start, end)`. Churn lookback for anchor `T` and duration `L` is `[T-L, T)`, including the lower boundary and excluding `T`; event time is used, not ingestion time. Invalid timestamps are excluded and flagged; future events are not shifted.

The churned cohort is distinct customers with a valid, non-conflicting ChurnOutcome in the requested period and configured filters. Duplicates count once; multiple valid outcomes use the earliest anchor. The retained cohort is not everyone without a churn row: a customer needs at least one eligible meaningful resolved event before period end, full observation through `period_end + configured_retention_observation_window`, and no valid churn through that observation end. Insufficient history, incomplete feeds, disappeared customers, unresolved-only data, and conflicting outcomes are `UNKNOWN` and excluded. Churned wins if bad source data makes a customer appear in both groups.

### Feature definitions

Features are computed per churn anchor `T`, or the matched retained reference end, over `[T-L,T)`. Only deduplicated meaningful events with resolved identity qualify; ambiguous/unresolved records are excluded from customer features but remain data-quality inputs. Nulls are omitted, not converted to zero; unavailable sources yield `UNAVAILABLE`.

- Meaningful contacts: count configured contact/complaint/support-contact events, one event per contact.
- Repeat contact: customer has at least two qualifying contacts in the configured repeat window or analysis period.
- Same-issue repeat: distinct Complaints linked to one Issue, requiring at least two contacts.
- Topic repeat: contacts sharing a configured normalized topic within applicable Issue rules; unknown topics never match.
- Unresolved issues: distinct Issues with `OPEN`, `IN_PROGRESS`, `ESCALATED`, or `REOPENED` at the anchor/reference.
- Unresolved age: anchor/reference minus Issue `created_at`; invalid dates are unavailable.
- Escalations: deduplicated occurrences, separately by `STRUCTURED` and `INFERRED`.
- Escalated issues: distinct Issues with a qualifying escalation.
- Journey starts/completions/drop-offs: distinct finalized JourneyInstances, never raw event counts.
- Drop-off stage: distinct dropped-off instances attributed to the finalized configured stage.
- Completion rate: completed eligible instances / started eligible instances.
- Resolution time: valid employee-resolved Issue `resolved_at - created_at`.
- Reopened issues: distinct Issues entering `REOPENED` in the window.
- Unresolved duration: anchor/reference minus `created_at` for Issues unresolved then.
- Channels used: distinct non-null channels in event-time order.
- Channel switches: transitions between consecutive eligible events after collapsing consecutive equal channels.
- Cross-channel same-issue contacts: same-Issue contact transitions with different non-null channels.

Each feature records source tables/events, eligibility, timestamp, window, counting unit, deduplication, null treatment, unresolved treatment, and level (customer, issue, journey, or event) in the structured result.

### Repeat contacts and channel switching

A contact is a configured meaningful contact/complaint/support event; page views, telemetry, retries, and non-contact events do not count. Repeat contact means at least two contacts for a resolved customer; same-issue repeat additionally requires the same Issue. Different issues still contribute to customer contact frequency. Topic similarity alone is not an Issue link. For switching, order eligible events by event time and stable event ID, collapse consecutive equal non-null channels, and count each adjacent different-channel pair: `WEB → CALL → WEB` is two; `WEB → WEB → WEB` is zero. Missing channels neither create nor bridge switches. Customer-wide is default; issue/journey scopes require their links. Distinct channel count is separate.

### Escalation and unresolved-issue analytics

Consume Prompt 4 escalation facts without redefining detection. Count occurrences, distinct customers, and distinct Issues; escalation rate is escalated eligible customers / all eligible resolved customers, undefined for a zero denominator. Breakdowns preserve `STRUCTURED` versus `INFERRED`, confidence, and missing-field status; no escalation source is not zero.

At evaluation time `E`, unresolved means Issue status `OPEN`, `IN_PROGRESS`, `ESCALATED`, or `REOPENED`; `RESOLVED` is not unresolved. Age is `E - created_at`. Reopened Issues are unresolved in their reopened state while historical resolution remains preserved. An Issue resolved before churn is not unresolved at churn. Missing dates make age unavailable, not zero; Complaint resolution is never used.

### Journey and data-quality analytics

Consume finalized Prompt 4 states. Started = distinct eligible instances with configured starts in period; completed = finalized `COMPLETED` instances with completion in period; dropped-off = finalized `DROPPED_OFF` instances with derived drop-off in period; active = started by evaluation time and neither completed, abandoned, nor dropped off. Completion rate = completed / started; drop-off rate = dropped-off / started; both undefined if started is zero. Stage drop-off uses finalized timeout stage and instance counts, never raw missing-event counts.

For valid meaningful non-quarantined canonical events, excluding duplicate retries, resolved rate = resolved / eligible events; ambiguous rate = ambiguous / eligible; unresolved rate = unresolved / eligible. Duplicate rate = duplicate submissions/conflicts / received submissions with available classification. Missing denominators yield `UNAVAILABLE`. Processing latency is `processed_at - ingested_at`; average, median, and configured percentiles use valid non-negative observations only, with missing/negative timestamps counted as data-quality exceptions.

### Association, sufficiency, and output

Every feature result includes cohort definitions, sample size, observed/missing counts, count, prevalence or mean/median where valid, difference, valid relative difference, provenance, and status. Binary prevalence is feature-positive / cohort size; relative difference is omitted for zero comparison prevalence. Descriptive counts can be `AVAILABLE` with one customer. Comparative association requires both cohorts to have at least 5 distinct eligible customers and at least 5 observed feature values by default; this conservative minimum is explicit and configurable, never silently lowered. Cohorts of 1–4, zero comparison members, zero denominators, incomplete observation, missing feature source, or tiny apparent associations return `INSUFFICIENT_DATA`. `UNAVAILABLE` means required source/configuration is absent; `INSUFFICIENT_DATA` means it exists but observation/sample is inadequate; `AVAILABLE` means required data and denominator exist. A true measured zero is distinct from both.

For identical data, configuration, period, and parameters, results are identical. Structured outputs contain status, period/timezone, dimensions, counts, rates, feature values, sample sizes, provenance, and association measurements. AI cannot create churn outcomes, choose cohorts, calculate authoritative numbers, change rules, make missing data zero, or turn association into causation. Prompt 7 owns MCP/Gemini, Prompt 8 owns reports/artifacts, and Prompt 6 owns configuration collection.

### Prompt 5 database compatibility

Existing Company, DataSource, Event, Customer, ChurnOutcome, Issue, Complaint, Escalation, JourneyDefinition, JourneyInstance, JourneyInstanceStage, and related tables contain the required source facts/configuration. Derived features and cohorts are computed or materialized as implementation details; no Analytics, Feature, Cohort, Metric, Statistics, or CustomerAnalytics table is introduced. No schema change is required.

## Prompt 6 — company registration, onboarding, and configuration contract

Prompt 6 freezes company-facing configuration behavior only. It does not implement application code, production authentication, database redesign, MCP/Gemini, reports/artifacts, or final UI. Prompt 3 remains authoritative for ingestion/identity, Prompt 4 for runtime journey/issue/escalation algorithms, and Prompt 5 for churn/analytics.

### Registration and production account concept

Registration creates the organization/account context and initial admin relationship; it does not configure every data capability. The production concept is `Organization → Admin account → Registration → Onboarding/configuration → Workspace → Employees/analysts → Dashboard`, with conceptual Organization/User/Membership/Role authorization. These conceptual production objects do not add tables to the current 21-table MVP schema. Production later may include sign-in, invitations, permissions, password reset, OAuth/SSO, email verification, MFA, and session management, but none is implemented or finalized here.

The hackathon MVP uses an explicitly controlled/mock company context. The mock context is a demonstration configuration, not the permanent account architecture and never a hardcoded branch in core processing. Registration should collect company name, domain/business type, admin/contact information, and selected business context/capabilities. Duplicate registration is rejected or idempotently resumes the existing organization based on a later authentication implementation; it must not create two organization contexts for the same canonical registration identity. Abandoned onboarding remains `IN_PROGRESS` and can resume; it is not treated as `READY`.

### Onboarding states and conditional flow

Conceptual onboarding states are `NOT_STARTED`, `IN_PROGRESS`, and `READY`; implementation representation is deferred to the database/application phase and does not add an onboarding table. The flow is:

```text
registration → company profile → capabilities/channels → sources/connections
→ semantic mappings → entity/identity capability → journeys
→ issue topics/grouping → escalation → churn/retention
→ validation/sample preview → READY for configured capabilities
```

Only questions relevant to selected capabilities are shown. A company may finish with partial coverage: core ingestion can be ready while journey, churn, transcript, or escalation analysis is `UNAVAILABLE`/limited. Onboarding never asks for database schema, indexes, ORM/framework, Kafka partitioning, or other implementation details. Business-friendly questions precede technical connection details.

### Channels, sources, and supported connection methods

Channel means where the customer interaction happened (`WEB`, `MOBILE_APP`, `CALL_CENTER`, `IN_PERSON`, or configured value). DataSource means the interface/system delivering records (CRM API, support webhook, Kafka stream, CSV export, mobile SDK, etc.); one source can contain multiple channels and one channel can have multiple sources. Supported conceptual connection categories are REST/event API, webhooks, optional web/mobile SDK or tracking, configured event streams such as Kafka/Azure Event Hubs/Google Pub/Sub/equivalents, CSV/JSON batch files, scheduled/file-transfer ingestion, pull APIs/scheduled connectors, and structured offline/physical feeds. Direct PostgreSQL/MySQL/SQL Server production access is not required; database exports may be delivered as files.

For each DataSource, onboarding captures source name, channel/context (possibly multiple), source type, connection method, active/inactive state, expected format, delivery schedule/stream details where relevant, credentials/configuration reference, and SourceFieldMapping entries. API keys, access tokens, webhook secrets, and connector credentials are sensitive: never expose them in ordinary logs or dashboard responses. Secret storage is an implementation concern for Prompt 10, but the boundary is mandatory.

### Semantic field mapping and capability declaration

Source fields are never hardcoded. The semantic vocabulary includes `customer_reference`, `account_reference`, `order_reference`, `policy_reference`, `claim_reference`, `case_reference`, `loan_application_reference`, `session_reference`, `event_reference`, `event_time`, `channel`, `event_type`, `business_entity_type`, `business_entity_reference`, `topic`, `complaint_text`, `escalation_indicator`, `support_level`, `agent_reference`, plus configured source-specific identifiers and transcript/transfer/reason fields. Mapping is stored through SourceFieldMapping and preserves source field names.

Roles are classified per source as:

- **Required for a selected capability:** event_time and event_type for meaningful event processing; a usable channel when channel analytics is requested; a customer reference, authenticated relationship, or explicit declaration of unavailable identity for identity coverage.
- **Optional:** account/order/policy/claim/case/loan/transaction references, session, agent, reason, topic, complaint text, transcript, and other context.
- **Conditionally required:** churn field/event/timestamp when churn is enabled; journey start/stage/completion mappings when a journey is configured; structured escalation fields when structured escalation is selected; topic/text when complaint/topic analysis is selected; entity type/reference when entity-anchored matching is selected.

Onboarding explicitly declares capability availability as `YES`, `NO`, or `PARTIAL` for customer identity, business entities, sessions, journeys, complaint text/topics, structured escalation, transcripts, and churn. Unavailable is not zero. Different source identifiers can map to the same canonical customer through Prompt 3; the company does not manually assign c_ids to every event. Entity relationships use CustomerEntityLink, never Order/Policy/Claim/Loan/Case tables.

### Conditional source questions

Selecting call-center data conditionally asks for interaction ID, customer reference, timestamp, agent/team, support level, transfer information, escalation flag, transcript availability, outcome, and structured topic. Selecting complaint/text capability maps fields such as complaint text, message, case description, call transcript, or chat transcript and optionally a trusted structured topic. If transcripts do not exist, transcript inference is unavailable. Escalation configuration asks which fields/events truly mean escalation; priority or ordinary transfer is not assumed to be escalation. If structured fields are absent but transcripts exist, Prompt 4's thresholded inferred escalation may later apply.

### Journey configuration contract

The company creates a JourneyDefinition with valid name, description, active state, business-entity anchor where applicable, completion/abandonment semantics, and default behavior. Each stage supplies unique stage key, name, deterministic order, required/optional state, and optional timeout. Journey event mappings map configured source-normalized event types to exactly the intended `START`, `STAGE`, `COMPLETION`, or `ABANDONMENT` role and valid stage. A journey may have no configured instance until a START event occurs.

Validation rejects empty/duplicate names where uniqueness is required, duplicate stage keys, non-deterministic order, mappings to unknown event types/stages, ambiguous START mappings, invalid completion/abandonment mappings, and negative/invalid timeouts. Invalid definitions cannot silently enter analytics. Prompt 4 determines runtime matching/progression/drop-off; Prompt 6 determines how the company supplies the configuration.

### Issue configuration contract

The company may provide a custom issue taxonomy or use a documented preset suggestion, but taxonomy remains company-owned and generic. The company configures the existing IssueGroupingRule: time window, same-customer requirement, same-topic requirement, and business-entity preference. The business question is phrased as “How long should Breeze consider similar contacts part of the same issue?” rather than exposing implementation terminology alone. Employee resolution and optional resolution notes remain mandatory runtime behavior; onboarding never configures AI resolution or self-service recommendations.

### Escalation configuration contract

The company explicitly selects available structured semantics: escalation flag, upward support-level transition, supervisor transfer, escalation team, escalation reason, or configured escalation classification. It maps the relevant source fields/events and declares whether each is authoritative. Priority and ordinary transfer are not escalation unless explicitly defined. If structured escalation is unavailable, transcript capability may be declared for Prompt 4 inference; if no transcript exists, that inference is unavailable. Prompt 6 collects semantics; Prompt 4 owns detection, thresholds, provenance, and deduplication.

### Churn and retention configuration contract

The company identifies the actual churn source/event/field, configured churn type, churn timestamp, optional source-provided reason, source/reference, and retention/observation semantics needed by Prompt 5. Examples are suggestions only (`customer_status = CHURNED`, subscription cancelled, account closed, membership terminated). If no valid churn source is available, the company may explicitly select “Churn data currently unavailable”; Breeze still supports journey, issue, escalation, repeat-contact, and other analytics while churn analysis is `UNAVAILABLE`. Prompt 5 owns cohort/lookback formulas; Prompt 6 collects the values it allows to be configured.

### Validation, test connection, and preview

Onboarding has a conceptual validation/test step that separately checks connection/configuration validity and data usability: source is reachable/readable, mapped fields exist, timestamps parse, required semantics are present, samples process through Prompt 3, and meaningful events can be recognized. “Connection succeeded” alone is not readiness. A safe sample preview shows source field → semantic role (for example `cust_no → customer_reference`, `event_ts → event_time`, `action → event_type`) while minimizing sensitive raw values. Invalid mappings, missing required fields, unknown event mappings, and impossible timestamps produce actionable errors; optional missing fields produce explicit unavailable capability.

Readiness is capability-specific. A company can be `READY` for core website ingestion while churn, journey, transcript, or structured escalation analysis is unavailable. Selected website/mobile/call-center/physical sources do not require all other channels. A selected churn capability cannot be ready without churn definition/source; a selected journey needs valid stages/mappings; structured escalation needs mapped evidence; complaint analysis needs topic/text/structured contact semantics. The whole organization is not blocked by an optional feature that lacks data.

### Configuration lifecycle and recovery

Adding a source/journey/mapping is new configuration and is validated before activation. Editing one is modified configuration and is versioned for future processing. Disabling a source/journey makes it inactive for new processing/analytics while preserving historical source facts and audit records. Connection failures mark the source/test failed and are retryable; invalid mappings or missing required fields are configuration errors; unknown event types follow Prompt 3 meaningful-event rules. A changed mapping, journey, or churn configuration does not silently delete or rewrite historical events/outcomes; reprocessing follows Prompt 3's raw-payload/idempotency/audit contract and Prompt 4/5 recomputation rules. If a churn source becomes unavailable, future churn analytics becomes `UNAVAILABLE`; existing recorded ChurnOutcome history remains intact. Invalidating a journey definition limits future analysis but does not erase historical instances.

### Controlled demo configuration

The demo uses one complete controlled company preset, `Breeze Demo Retail`, represented as ordinary Company/DataSource/configuration—not a separate architecture. It demonstrates the generic concepts with:

- Web event API (`WEB`) mapping `user_id → customer_reference`, `order_no → order_reference`, `event_ts → event_time`, `action → event_type`.
- Mobile SDK source (`MOBILE_APP`) mapping `member_id → customer_reference`, `session_key → session_reference`, and the same event semantics.
- Support/CRM webhook (`CALL_CENTER`) mapping `customer_no → customer_reference`, `case_num → case_reference`, `interaction_time → event_time`, `category → topic`, `transferred_supervisor → escalation_indicator`, and optional transcript.
- Batch JSON relationship/churn feed mapping entity type/reference to CustomerEntityLink and a configured actual churn event/type/timestamp/reason.
- A configured generic journey such as “Order Fulfillment” with START, stages, completion, abandonment, and stage timeouts; a configurable issue taxonomy/grouping window; structured escalation semantics; and sample churn/retention observation settings.

The preset includes multiple source identifiers that resolve to one customer, multiple channels, meaningful payment/order/support events, an order-to-customer link, a complaint repeated into one Issue, a structured escalation, a churn outcome, and analytics inputs. It exercises the same Prompt 2–5 contracts and can be modified or replaced by another company preset. No demo-only conditional code is permitted.

### Security, privacy, and no-silent-assumption rules

Every important choice is explicit company input, safe default, documented preset, or unavailable state. Breeze never silently assumes customer ID format, churn meaning, escalation semantics, journey stages, issue window, channel/source availability, or entity relationships. Sensitive connection values are redacted from logs/responses. Historical facts are retained through configuration changes. Future scope remains self-service recommendations, public voice-of-customer, advanced probabilistic identity resolution, and full production authentication/authorization; none is implemented in Prompt 6.

## Prompt 3 — final event ingestion and identity-processing contract

This section is the implementable behavioral contract for the pipeline. It is generic across all configured domains and does not create domain-specific identity systems.

### Semantic roles and supported ingestion

Sources map arbitrary field names to semantic roles such as `customer_reference`, `account_reference`, `order_reference`, `policy_reference`, `claim_reference`, `case_reference`, `transaction_reference`, `session_reference`, `event_time`, `channel`, and `event_type` through `SourceFieldMapping`. Supported ingress includes REST/event APIs, webhooks, SDK/tracking events when configured, batch JSON, batch CSV, scheduled file feeds, configured event streams, and structured offline/physical-channel feeds. Direct company database access is never required.

Each accepted submission has `company_id`, `source_id`, source type/channel, received/ingested timestamp, a batch or delivery identifier where applicable, and the original payload. API/webhook/SDK submissions are individually validated and may be retried; files are tracked by `IngestionBatch` and each row/record is processed independently; streams use configured partition/offset metadata; offline feeds retain their source event times. A malformed envelope or record is rejected/quarantined with an auditable error and does not enter downstream analytics. A valid record with unresolved identity is retained. Retries are safe because deduplication is performed before downstream effects. Batch or delivery status is `RECEIVED`, `PROCESSING`, `COMPLETED`, `COMPLETED_WITH_ERRORS`, or `FAILED`; transient infrastructure failures retry with bounded exponential backoff and idempotency, while deterministic validation failures do not retry until corrected/reprocessed.

### Source and company isolation

Every event must resolve to exactly one configured `DataSource`, whose company must match the submission company. A caller-provided or connector-bound `company_id` and `source_id` are validated together; unknown, inactive, mismatched, or cross-company combinations are rejected/quarantined before normalization. Every lookup and write is scoped by `company_id` and `source_id` as applicable. Company A events can never query or resolve against Company B's Customer, IdentityMapping, CustomerEntityLink, Issue, Journey, or ChurnOutcome. No global unscoped identifiers are assumed, even before production authentication exists.

### Canonical processing order

The only canonical order is:

1. Receive the event/submission.
2. Identify and validate company/source.
3. Validate the envelope and preserve the exact raw payload.
4. Apply semantic `SourceFieldMapping`.
5. Normalize timestamps and canonical fields.
6. Validate meaningful-event and semantic requirements.
7. Deduplicate using the rules below.
8. Resolve customer identity using the ordered hierarchy.
9. Resolve generic business-entity relationship context.
10. Store or update the normalized Event.
11. Store the IdentityResolution audit decision.
12. Schedule/update downstream derived context without treating this event as a new duplicate.
13. Set processing timestamps/status and expose valid events to journey/issue/escalation analytics.

Invalid or duplicate records do not proceed as new valid events. A valid event with `c_id = NULL` remains in Event with an `UNRESOLVED` or `AMBIGUOUS` IdentityResolution record.

### Normalization and timestamp rules

Normalization copies the source payload unchanged to `raw_payload` and maps configured semantic values into `company_id`, `source_id`, `source_event_id`, `event_fingerprint`, `c_id`, `session_id`, `channel`, `event_type`, `business_entity_type`, `business_entity_id`, `event_time`, `attributes`, `ingested_at`, and `processed_at` where available. Missing source values remain SQL NULL; no placeholder such as `unknown`, `N/A`, or `anonymous` is invented. `c_id` is never populated by normalization alone.

All timestamps are stored as instants with timezone. An offset or named timezone in the source is honored and normalized to the canonical instant. A timezone-less source timestamp uses the configured DataSource/company timezone, recorded in processing metadata. A missing timezone configuration makes the timestamp invalid rather than guessing. Impossible, unparsable, or out-of-range timestamps are quarantined with a validation error. Missing `event_time` is invalid for journey/timeline processing; the raw record remains in the batch/quarantine record for correction. Missing `event_type` is invalid unless the source mapping provides a deterministic configured default; missing `channel` is nullable when the source cannot provide it. Unknown semantic fields are preserved under raw payload/attributes but do not become canonical fields without mapping.

Only source-configured meaningful events enter the canonical Event stream. Mouse movement, scrolls, animations, keystrokes, heartbeats, and low-value telemetry are ignored or quarantined according to source configuration; the examples in this specification are not an exhaustive hardcoded allow-list.

### Deterministic deduplication

First preference is the tuple `(company_id, source_id, source_event_id)` when the source declares that identifier reliable and unique. The same tuple with byte/canonical-payload-equivalent content is the same event and is recorded as a duplicate retry. The same tuple with different content is a `DUPLICATE_IDENTIFIER_CONFLICT`: the original canonical event is never overwritten, the conflicting raw payload is retained in the batch/error audit, and no downstream identity or business effects are applied.

When no reliable `source_event_id` exists, `event_fingerprint` is SHA-256 over a deterministic UTF-8 canonical serialization of: company scope, source scope, normalized event type, normalized event time instant, normalized channel (or explicit JSON null), session reference (or null), business entity type/id (or null), and the normalized semantic attributes excluding ingestion/processing timestamps and derived identity fields. Field names are sorted lexicographically at every object level; arrays preserve source order; null values are explicit; strings are Unicode-normalized, trimmed only where the field mapping declares whitespace-insensitive semantics, and otherwise preserved; numbers use canonical JSON number representation; timestamps use UTC ISO-8601 with fixed precision; serialization is compact UTF-8 JSON. The source/company scope is included so identical payloads from different sources are not conflated. The fingerprint never uses processing time, arrival order, customer ID, or mutable derived values.

An identical fingerprint is a duplicate retry even if the raw serialization formatting differs after normalization. A matching fingerprint with materially different normalized payload is a `FINGERPRINT_PAYLOAD_CONFLICT`: retain both raw submissions, preserve the first canonical event, record the conflict, and do not silently merge or overwrite. Repeated delivery after successful processing and transport retries follow the same idempotent path. The same customer may have many legitimate identical event types at different event times or with different business/session context; customer ID alone is never a deduplication key. High-volume repeats are handled by the same indexed keys/fingerprint policy, not by collapsing legitimate occurrences.

### Final identity hierarchy

Identity asks only “which customer does this event belong to?” and is separate from issue grouping and journey classification.

1. **Direct canonical ID:** a valid canonical Breeze `c_id` resolves with method `DIRECT_CANONICAL_ID` and confidence `1.00`.
2. **Source identifier mapping:** look up `(company_id, source_id, identifier_type, identifier_value)` in active, temporally valid `IdentityMapping`. Exactly one valid mapping resolves with `SOURCE_IDENTIFIER_MAPPING` and confidence `1.00`.
3. **Session/authenticated relationship:** use a source-configured authenticated relationship, never a session ID by itself. A valid explicit relationship resolves with `SESSION_RELATIONSHIP`; anonymous events are eligible for retroactive attachment only under the session rule below.
4. **Business entity relationship:** look up `(company_id, business_entity_type, business_entity_id)` via `CustomerEntityLink`. Exactly one valid, temporally applicable link resolves with `BUSINESS_ENTITY_RELATIONSHIP` and deterministic/high configured confidence.
5. **Secondary evidence:** only configured reliable attributes may produce `SECONDARY_EVIDENCE`. It requires a documented scoring basis and threshold; below threshold or multiple candidates means `AMBIGUOUS` or `UNRESOLVED`, never a guess. AI/LLM is not a primary resolver and events are not sent to Gemini for matching.

Direct canonical evidence outranks every lower step. A lower step cannot override a valid stronger step. Device ID, IP, timing, and arbitrary session reuse are contextual evidence only and cannot independently create identity.

### Mapping and entity-link behavior

IdentityMapping is scoped to company/source/identifier type/value, has `valid_from`, optional `valid_to`, active/revoked state, confidence, method, and evidence. Active records must not map one identifier simultaneously to multiple customers except an explicitly modeled historical/version interval that does not overlap. Revoked or temporally invalid mappings do not participate in current processing; historical reprocessing uses the mapping valid at the event's applicable time only when that historical mode is explicitly requested. Conflicting mappings are surfaced as data-quality conflicts, never silently repaired.

CustomerEntityLink is the only generic relationship layer for order/account/policy/claim/case/loan/transaction or any organization-defined entity. No universal business entity table is introduced. No link means continue to the next identity step or remain unresolved. One valid link resolves. Multiple valid links, conflicting links, expired links, or a missing entity ID produce ambiguity/unresolved evidence and never select an arbitrary customer. An entity link is not itself a customer identifier; it is contextual relationship evidence.

### Anonymous-to-authenticated stitching

Anonymous events may be retroactively associated only when the source explicitly establishes that a session (or source-defined anonymous identity scope) became authenticated as a mapped identifier/customer. For example, `S900 + authenticated W721 → C1001` can attach eligible events in S900. Eligibility is limited to the same company/source, the same session scope, and the source-configured session lifetime/time window; events outside that window remain unresolved. Same device, IP, or similar timing alone never qualifies. The original event, raw payload, prior unresolved decision, new relationship evidence, and reprocessing timestamp remain auditable; the event is not duplicated.

### Conflict, ambiguity, confidence, and audit

Every accepted event gets exactly one latest auditable IdentityResolution decision with `RESOLVED`, `AMBIGUOUS`, or `UNRESOLVED` status. Methods are `DIRECT_CANONICAL_ID`, `SOURCE_IDENTIFIER_MAPPING`, `SESSION_RELATIONSHIP`, `BUSINESS_ENTITY_RELATIONSHIP`, `SECONDARY_EVIDENCE`, `UNRESOLVED`, or `CONFLICT`; vague `AI_MATCH` is forbidden. Evidence is structured, human-readable JSON containing inputs, candidates, matched customer if any, source/entity/session, validity interval, and reason. Deterministic confidence is fixed/declared (direct and unique source mapping `1.00`; valid entity/session relationship uses its configured deterministic confidence); probabilistic confidence is a reproducible score with threshold and feature basis, never a fabricated certainty.

If valid evidence conflicts—such as W721 mapping to C1001 and C2002—the event is `AMBIGUOUS` with method `CONFLICT` unless a stronger valid hierarchy step resolves it. Store all candidates, conflicting identifiers/mappings, evidence, confidence/threshold information, and decision timestamp. Never overwrite the existing mapping because a later event disagrees. An event with no sufficient evidence is `UNRESOLVED` with `c_id = NULL`.

### Late events and derived processing

`event_time` is business chronology; `ingested_at` is platform receipt time; `processed_at` is the time the canonical processing attempt completed, whether resolved or unresolved. Valid late events are accepted. Timelines, journey ordering, issue context, and analytics use event time, not arrival order. Late events mark affected customer/source/journey/issue aggregate windows dirty and enqueue deterministic recomputation; canonical Event and historical audit records remain authoritative. No late event is rejected merely for age, though retention/configuration limits are explicit validation failures if configured.

### Reprocessing and idempotency

Reprocessing reads preserved raw payload plus the mapping/configuration version selected for the run, then repeats normalization, deduplication, identity, and entity resolution deterministically. It updates the same canonical event and latest derived decision rather than creating duplicate Event, IdentityMapping, Complaint, JourneyInstance, or Issue records. Mapping/configuration changes may change the latest resolution or derived context; prior IdentityResolution decisions, conflicts, raw submissions, and processing runs remain immutable audit history. Source corrections use the explicit source-event conflict/correction path and never silently overwrite history. Downstream recomputation is keyed to the same event/business occurrence and is idempotent.

### Missing and partial data

No customer identifier, session, business entity, or mapping is not an ingestion failure by itself; retain a valid meaningful event with nullable fields and an auditable unresolved decision. Missing channel is nullable only where configured; missing event type or event timestamp is quarantined unless a deterministic source default exists. Malformed payloads are quarantined; unknown event types are retained only if configured meaningful, otherwise excluded from canonical events. Missing CustomerEntityLink or transcript reduces scope/confidence; it does not fabricate a relationship or inference. Website/support-only feeds remain useful. Churn is unavailable without actual churn data, and empty periods show an explicit empty state rather than unsupported zeroes.

### Latency and performance

`ingestion_latency = ingested_at - source_receipt_or_event_arrival_time` when source receipt is available; `processing_latency = processed_at - ingested_at`. `processed_at` means the canonical event has completed validation, normalization, deduplication, identity/entity decision, audit write, and status update—not that all later reports have recomputed. API/webhook/stream sources target near-real-time processing under operational configuration; the exact service-level target is deployment configuration, not a false universal claim. Dashboard processing latency uses processing latency from successfully processed canonical events over the selected period, with sample size and unavailable status when timestamps are insufficient. Derived aggregates may be used for performance, but Event and audit records remain authoritative.

### Database compatibility assessment

The existing conceptual 21-table contract supports this behavior: DataSource and Company provide tenancy/source scope; SourceFieldMapping provides semantic normalization; IngestionBatch provides submission/batch tracking; Event stores canonical fields, raw payload, fingerprint, timestamps, nullable `c_id`, and context; IdentityMapping, CustomerEntityLink, and IdentityResolution provide the required identity/entity/audit concepts; downstream tables consume valid events. Prompt 3 therefore requires **no schema change and no new table**. Physical column names/types/indexes, JSONB shapes, and constraints remain the dedicated database implementation work, but they must implement this contract. No contradiction requiring an architectural change was found.

## Prompt 7 — final MCP and Gemini analyst contract

Prompt 7 freezes the read-only analyst boundary. The flow is **chat UI → Gemini → narrow MCP business tools → deterministic Breeze services/data → structured result → Gemini answer**. Gemini is an interpreter and tool selector; it is never the source of truth for identity, cohorts, counts, rates, timestamps, or state. MCP tools do not expose SQL, arbitrary filters, raw database access, or generic query execution.

### Frozen MCP tool surface

The exact read-only tools are: `get_customer_profile`, `get_customer_timeline`, `get_customer_issues`, `get_customer_journeys`, `get_customer_escalations`, `analyze_journey`, `analyze_dropoffs`, `analyze_repeat_contacts`, `analyze_unresolved_issues`, `analyze_escalations`, `analyze_churn_associations`, `analyze_identity_resolution`, and `get_data_quality`. No write tool is exposed to Gemini.

Every tool accepts the server-derived tenant context, an optional analysis period `[start,end)`, and an explicit timezone where applicable. Customer tools accept a canonical `c_id` or a typed external customer reference; they never accept an untrusted `company_id` as tenant authority. Customer references must resolve to exactly one customer in the current tenant. Zero matches returns `NOT_FOUND`; multiple matches returns `AMBIGUOUS`; the tool never guesses. Analytics tools accept only declared configuration identifiers, dimensions, filters, pagination cursor, and bounded limits. Default limit is 100 and hard maximum is 500. Ordering and cursors are deterministic.

The conceptual tool contract is:

| Tool | Purpose | Read/write | Inputs and validation | Authorization | Structured output | Empty/error behavior | Evidence, freshness, example |
|---|---|---|---|---|---|---|---|
| `get_customer_profile` | Canonical customer and identity-quality summary | Read | `customer_ref` required; typed, tenant-scoped, unique | Tenant membership plus customer-read permission | `status`, customer identity, identifiers, identity status, provenance | `NOT_FOUND`/`AMBIGUOUS`; no identity is inferred | Source identifiers and latest resolution; current as of `generated_at`; valid canonical/external ref, invalid missing ref |
| `get_customer_timeline` | Meaningful chronological events | Read | customer ref, optional `[start,end)`, limit/cursor | Tenant plus customer-read | events with event time, type, channel, issue/journey links, identity status | `EMPTY` when valid customer has no eligible events; invalid range is `INVALID_INPUT` | Event-time ordering, source/event provenance, generated freshness; invalid reversed range rejected |
| `get_customer_issues` | Issue lifecycle and links | Read | customer ref, optional status/topic/period, bounded page | Tenant plus customer-read | issues, status, opened/resolved/reopened timestamps, escalation links, provenance | `EMPTY` if none; unavailable lifecycle data is explicit, not zero | Prompt 4 lifecycle source and recomputation timestamp; valid status filter only |
| `get_customer_journeys` | Journey instances and finalized stages | Read | customer ref, optional journey/period/page | Tenant plus customer-read | instances, status, stages, timestamps, drop-off stage, provenance | `EMPTY` if none; absent journey configuration is `UNAVAILABLE` | Prompt 4 finalized state and config version; unknown journey id rejected |
| `get_customer_escalations` | Structured/inferred escalations | Read | customer ref, optional period, issue/journey/channel filters | Tenant plus customer-read | escalation records, method (`STRUCTURED`/`INFERRED`), confidence, source links | `EMPTY` means no eligible records; missing escalation feed is `UNAVAILABLE` | Original event/issue evidence and derived-at; invalid confidence/filter rejected |
| `analyze_journey` | Counts/rates by journey and optional stage | Read | period, journey/config id, dimensions, bounded page | Tenant plus analytics-read | started, completed, dropped off, denominator, completion/drop-off rates, sufficiency | `UNAVAILABLE` absent definition; `INSUFFICIENT_DATA` inadequate observations | Prompt 4 instance states, formula/config version, period/timezone; no raw-event substitution |
| `analyze_dropoffs` | Stage drop-off distribution | Read | period, journey id, optional stage/channel dimensions | Tenant plus analytics-read | eligible instances, drop-offs by finalized stage, denominators/rates | Explicit unavailable/insufficient status; no journey is not zero | Finalized stage provenance and recomputation freshness; unknown journey rejected |
| `analyze_repeat_contacts` | Repeat contact and same-issue contact metrics | Read | period, optional issue/topic/channel dimensions, threshold config | Tenant plus analytics-read | customers, meaningful contacts, repeat counts, same-issue counts, rates, samples | Missing contact data `UNAVAILABLE`; no qualifying rows `EMPTY`, not missing-data zero | Event/contact ids, dedup and identity status, config version; unsupported dimension rejected |
| `analyze_unresolved_issues` | Open/reopened issue burden and age | Read | period, topic/status/channel dimensions | Tenant plus analytics-read | issue/customer counts, age summary, status/topic dimensions, denominators | Missing issue lifecycle `UNAVAILABLE`; no eligible issues `EMPTY` | Issue lifecycle timestamps and formula version; invalid age/range rejected |
| `analyze_escalations` | Escalation counts/rates by dimensions and provenance | Read | period, channel/topic/journey dimensions, method filter | Tenant plus analytics-read | counts, rates, structured/inferred split, confidence summary, samples | Missing escalation source `UNAVAILABLE`; valid no-events `EMPTY` | Escalation evidence and detection method; unsupported method rejected |
| `analyze_churn_associations` | Compare valid churned and observed comparison cohorts | Read | period, lookback/config ids, feature and dimensions | Tenant plus analytics-read | cohort definitions, feature values, counts/rates, differences, sample sizes, sufficiency | Missing churn source or comparison cohort `UNAVAILABLE`/`INSUFFICIENT_DATA`; never zero | Churn outcomes, feature provenance, formula/config version, recomputation freshness; invalid feature rejected |
| `analyze_identity_resolution` | Resolution quality by source/period | Read | period, source/channel dimensions, bounded page | Tenant plus data-quality-read | resolved, ambiguous, unresolved, eligible denominator, rates, duplicates | No eligible events `EMPTY`; missing audit data `UNAVAILABLE` | IdentityResolution/Event evidence and processing freshness; invalid source rejected |
| `get_data_quality` | Ingestion, duplicate, timestamp, and processing quality | Read | period, source dimensions, optional metric set | Tenant plus data-quality-read | eligible/duplicate counts, invalid/missing timestamps, latency average/median/p95 when supported, statuses | Missing timestamps are unavailable for that latency statistic, not zero | IngestionBatch/Event timestamps and formula version; invalid metric rejected |

All outputs include `status` (`AVAILABLE`, `EMPTY`, `INSUFFICIENT_DATA`, `UNAVAILABLE`, or `ERROR`), tenant-safe scope, period/timezone, deterministic ordering, `generated_at`, data/config/formula versions, sample sizes and denominators where applicable, and `provenance` containing source tables/events, identity status, deduplication treatment, and recomputation/freshness metadata. `null` means unavailable or not applicable only when the field contract says so; missing data is never converted to zero. Common errors are `INVALID_INPUT`, `UNAUTHORIZED`, `NOT_FOUND`, `AMBIGUOUS`, `UNAVAILABLE`, `INSUFFICIENT_DATA`, `CONFIGURATION_ERROR`, and `INTERNAL_ERROR`, with a safe code/message and no SQL or secrets.

### Gemini boundary and runtime configuration

The server calls Google Gemini using the stable `gemini-2.5-flash` model, server-side `GEMINI_API_KEY`, temperature `0.2`, maximum output 4096 tokens, function calling and structured tool arguments enabled, no code execution, arbitrary SQL, or external grounding, a 30-second timeout, and one bounded transient retry. The system instruction says to answer only from tool results, identify unavailable/insufficient data, preserve association-versus-causation language, cite the returned evidence/provenance, and ask for a narrower question when required inputs are missing.

Customer complaints, transcripts, notes, issue text, and resolution text are untrusted content. They may be quoted or summarized as data but are never instructions, tool definitions, authorization, tenant context, or policy overrides. Gemini must not invent churn, cohorts, metrics, identity, issues, escalations, or missing data; calculate authoritative statistics from raw text; alter deterministic results; decide that missing means zero; or claim that an association caused churn. Tool selection and all arithmetic remain deterministic backend behavior.

The server derives tenant and user authorization context and checks it on every tool call. A multi-tool answer may call at most eight tools and three dependent rounds; independent calls are bounded and deterministically merged. If one call fails, successful results remain labeled, the answer states the failed scope, and Gemini does not fill the gap. Stale results are not silently reused: each result carries freshness and configuration versions, and a conversation turn may use only results fetched for the current authorized context. Rate limits, request size limits, audit logging, secret handling, and redaction are server policy; raw prompts and tool outputs are not trusted as authorization.

Prompt 8 owns report formulas/configuration, report snapshots, artifact formats, retention, and report history. Prompt 7 freezes no report-generation or artifact-write tool. Prompt 10 remains the first production implementation phase; this section changes no schema and adds no database table.

### Deterministic request handling and end-to-end examples

Natural-language dates are resolved by the server using the authenticated company timezone into explicit `[start,end)` instants; missing or ambiguous dates require clarification, and invalid ranges are rejected. Event-time drives business answers; ingestion/processing time is used only for freshness and latency. Boundary events at `start` are included and events at `end` are excluded. Late recomputed states require a fresh tool call. Customer-level output excludes unnecessary raw payloads and caps pages at 100 by default/500 maximum.

The required flows are frozen as follows: (A) “What happened with C1001's payment issue?” selects profile, issues, timeline, and—if needed—escalations; tools return scoped facts and Gemini summarizes without inventing links. (B) “Has this customer reported this issue before?” selects issues and repeat-contact analysis, distinguishing same-issue from customer-wide repeats. (C) “Which journey has the highest drop-off?” selects `analyze_dropoffs` and reports finalized instance denominators. (D) “Are unresolved issues associated with churn?” selects unresolved-issue and churn-association analytics and uses association language only. (E) “What happened after the previous escalation?” chains escalations → issue/timeline with the escalation timestamp as a deterministic filter. (F) Unsupported sentiment/prediction/private-data requests receive a controlled unsupported or unauthorized response. (G) Prompt-injection text in a transcript is returned only as untrusted content. (H) Insufficient results preserve `INSUFFICIENT_DATA`. (I) Ambiguous identity returns candidates-safe ambiguity for user selection. (J) A failed dependent tool yields only safe partial evidence and an explicit unavailable scope.

### Failure, security, and edge-case verification

Gemini outage leaves dashboard and analytics usable; MCP outage returns controlled chat failure; database outage and tool timeout return safe errors; invalid arguments are rejected before execution; arbitrary SQL, cross-tenant access, mutation requests, and invented statistics are denied. Duplicate, unresolved, late, missing-channel, missing-entity, and boundary events follow Prompt 3. Issue, journey, escalation, churn, cohort, identity-quality, missing-data, zero-result, large-result, and causal-language cases follow Prompts 4–6 and the statuses above. The full Prompt 7 required edge-case list (identity/customer, timeline, issues, journeys, escalations, churn, analytics, Gemini/tooling, multi-tool, stale-context, unsupported, mutation, and invented-statistics scenarios) was checked; every case has deterministic behavior. No report, UI, auth, migration, MCP server, or Gemini application implementation was started.

## Prompt 8 — final reports, configuration, runs, and artifacts contract

Reports are deterministic analytics products: `ReportDefinition → validated parameters → deterministic analytics → structured result → optional renderer → ReportRun/result_snapshot/artifact_reference`. Gemini may translate natural language, ask clarification, and explain results; it may not calculate, redefine, fabricate, bypass validation, query SQL, or claim a report/artifact exists without a successful run.

The seven and only seven default report types are `CUSTOMER_JOURNEY_OVERVIEW`, `DROPOFF_ANALYSIS`, `ESCALATION_ANALYSIS`, `REPEAT_CONTACT_ANALYSIS`, `UNRESOLVED_ISSUES`, `CHURN_ASSOCIATED_EXPERIENCE`, and `IDENTITY_DATA_QUALITY`. ReportDefinition configuration stores reusable type, allowed metrics/dimensions/filters, defaults, and description. ReportRun parameters store the exact validated execution parameters; result_snapshot stores the complete structured result, metadata, status, errors, and provenance; artifact_reference stores optional format, run linkage, filename, storage reference, created/expiry times, and status. No report-specific table is added.

Run lifecycle is `REQUESTED → RUNNING → COMPLETED` or `FAILED`. A run is created before execution with parameters and `started_at`; completion writes the deterministic snapshot and `completed_at`. Failures write safe error state and `completed_at`; optional artifact failure does not change analytics success to failure. Reruns create new ReportRun rows; completed runs and snapshots are immutable. Late data affects future runs only. Snapshots contain schema/version, report type, run id, parameters, period/timezone, metrics/rows, status, samples/denominators, sufficiency/missing-data states, generated time, `data_as_of`, processing lag, formula/config versions, provenance, limitations, and artifact metadata.

Experience metrics use `event_time` or finalized domain timestamps; `ingested_at` and `processed_at` are used only for ingestion/processing metrics and freshness. Dates resolve in the authenticated company timezone, are stored/compared as UTC instants, and use `[start,end)` boundaries. Same-day filters mean the complete local calendar day. Invalid, reversed, or future ranges are rejected; a missing range uses the documented configured default only when otherwise unambiguous. DST is resolved by the timezone library. Limits are: 366-day period, 3 dimensions, 20 metrics, 10,000 rows/customers, 30-second execution, and 25 MB artifact. Null grouping is preserved as null; grouping/order is deterministic and high-cardinality is bounded.

Report states are distinct: `AVAILABLE`, `EMPTY`, `INSUFFICIENT_DATA`, `UNAVAILABLE`, and `ERROR`. `EMPTY` is successful execution with no matches; zero is a valid measured numeric zero; missing, null, unresolved, ambiguous, and not-applicable remain distinct. Denominator zero yields `NOT_APPLICABLE`, never `0%`. Prompt 5 sufficiency rules apply unchanged: counts may remain visible while unsupported rates/associations are insufficient. Every metric defines name, formula, numerator, denominator, population, timestamp, dimensions, filters, rounding/unit, null/zero/sufficiency behavior, and provenance.

| Report | Purpose | Inputs | Metrics | Dimensions | Filters | Sufficiency | Output | Artifact |
|---|---|---|---|---|---|---|---|---|
| `CUSTOMER_JOURNEY_OVERVIEW` | Summarize finalized journey instances | period, timezone, optional journey | started, active, completed, abandoned, dropped-off, completion/abandonment/drop-off rates, stage reach/completion | journey, stage, channel, period | journey/stage/channel/source/entity | Prompt 4 eligible instances | counts, rates, stage rows, provenance | PDF/DOCX/CSV/JSON |
| `DROPOFF_ANALYSIS` | Analyze finalized drop-off stages | period, timezone, journey | eligible, reached, completed, dropped-off, rate | journey, stage, channel, period | journey/stage/channel/source | finalized instance/stage observations | stage rows and denominators | PDF/DOCX/CSV/JSON |
| `ESCALATION_ANALYSIS` | Analyze escalation burden and provenance | period, timezone | totals, customer/issue rates where valid, structured/inferred counts | channel, topic, journey/stage, method | channel/topic/journey/method/source | escalation capability and denominator | counts, rates, confidence/evidence | PDF/DOCX/CSV/JSON |
| `REPEAT_CONTACT_ANALYSIS` | Measure meaningful repeat contacts | period, timezone, thresholds | contacts, repeat customers/contacts, same-issue repeats, rates | topic, channel, journey, period | topic/channel/issue/journey/source | Prompt 5 contact and identity rules | counts, rates, dimensions | PDF/DOCX/CSV/JSON |
| `UNRESOLVED_ISSUES` | Show current unresolved Issue burden | as-of/period, timezone | issue/customer counts, ages, last contact, escalation state | status, topic, channel, journey/entity, age bucket | status/topic/channel/journey/source | Issue lifecycle available | issue rows/counts and limitations | PDF/DOCX/CSV/JSON |
| `CHURN_ASSOCIATED_EXPERIENCE` | Compare configured churn cohorts | period, lookback/observation | cohort sizes, feature values, differences/associations | feature, channel, topic, journey, cohort | configured churn/features | Prompt 5 cohort/sufficiency rules | cohorts, samples, association state | PDF/DOCX/CSV/JSON |
| `IDENTITY_DATA_QUALITY` | Expose event and processing quality | period, timezone, source | resolved/ambiguous/unresolved, duplicates, invalid/missing fields, late events, latency | source, channel, method, period | source/channel/status/type | valid denominator/timestamps | counts, rates, latency, quality states | PDF/DOCX/CSV/JSON |

Metric formulas are inherited exactly from Prompts 4–5: journey completion is completed eligible instances / eligible instances; journey drop-off is dropped-off eligible instances / eligible instances; stage drop-off uses Prompt 4’s finalized dropped-off stage and eligible reached population; escalation rate uses its declared eligible customer/issue denominator; repeat-contact metrics keep customer-wide repeat separate from same-Issue repeat; unresolved includes `OPEN`, `IN_PROGRESS`, `ESCALATED`, and `REOPENED` and excludes `RESOLVED`; churn, cohort, identity, duplicate, and latency formulas are Prompt 5 definitions. No report independently redefines a domain state or uses raw-event counts as a substitute.

The structured configuration is `report_type` (required enum), `date_range` (required unless a documented default applies), `timezone` (optional company default), allow-listed `filters`, `dimensions` (max 3), `metrics` (max 20), allow-listed `sort`, bounded `limit`, optional supported `comparison_period`, tenant-validated customer/entity scope, and optional `artifact_format`. Custom reports compose only supported report types, metrics, dimensions, filters, and periods; arbitrary SQL/code and generic `run_any_analysis` are forbidden. Unsupported types/metrics/dimensions/combinations, malformed JSON, duplicate names, invalid values, unauthorized scope, excessive ranges/cardinality, and conflicting filters fail before execution with Prompt 7 error categories. Natural-language requests are converted to configuration, validated, executed, and explained; material ambiguity requires clarification.

Reports are tenant-scoped. Server-side authenticated company context is authoritative; Gemini cannot supply it. Conceptual report-create, run, history, and artifact permissions apply without inventing a new RBAC system. Unauthorized cross-company references return `UNAUTHORIZED` or `NOT_FOUND` without leakage. Report history shows name/type/run time/status/parameters/result and artifact availability; reruns do not alter old history.

Supported artifacts are PDF, DOCX, CSV, and JSON. PDF/DOCX contain title, company context, period, generated time, summary, key metrics, tables, sufficiency/limitations, and provenance; narrative is optional and clearly labeled. CSV is UTF-8 with headers, deterministic row order, typed columns, and null cells; JSON contains metadata plus structured rows. Filenames are `breeze-{safe-company-slug}-{report-type}-{run-id}-{yyyyMMddTHHmmssZ}.{ext}`; unsafe characters become hyphens and customer identifiers are excluded. Artifacts are retained exactly one month from `created_at` in UTC; expiration removes/unlinks bytes but never deletes ReportRun or snapshot, and regeneration creates a new artifact. Renderer/storage/unsupported-format/stale-reference/expired/access failures remain separate artifact failures from analytics success.

Every run records initiating context, tenant, definition, parameters, timestamps, status, artifact outcome, failure category, freshness, formula/config versions, and provenance. Report text is untrusted data for Gemini, and prompt injection is never executed. The controlled `Breeze Demo Retail` configuration uses these definitions and exposes proper available/empty/insufficient/unavailable states without hardcoded answers. Prompt 9 owns presentation; Prompt 10 owns implementation. No schema change or new table is required.

## Prompt 9.6 — final decision freeze before Prompt 10

Prompt 9.6 resolves the four readiness-audit decisions without changing the canonical 21-table domain model. These decisions supersede earlier planning language wherever an earlier section described the same topic as deferred.

### Authentication and sessions

The MVP uses Supabase Auth for persistent email/password identity and sessions because the frozen domain model has no account/session tables. Breeze owns registration, Company creation, trusted company association, onboarding, readiness, authorization, and tenant checks; no User, Admin, Membership, Role, or Session table is added. The provider persists identity, password hash, and session/refresh state. Trusted provider metadata carries `company_id` and the MVP admin role. The server validates the provider session/JWT and derives tenant context from trusted claims. Logout revokes the provider session; expiry follows provider policy. Frontend `company_id` is ignored for authorization. Cross-company access is rejected without leakage. Duplicate admin email returns a safe account-exists/registration-unavailable error. Password hashes, tokens, source secrets, and webhook secrets are never returned or logged. Company verification is self-attested; names are non-unique labels and generated `company_id` is the tenant key. Email/domain/manual verification, invitations, password reset, MFA, SSO, and enterprise RBAC are future scope.

### Custom reports and MCP boundary

`ReportDefinition` is reusable company-scoped configuration; duplicate names are allowed. Save without run and run without save are valid. Each execution creates a new immutable `ReportRun` snapshot containing validated parameters, configuration version/provenance, deterministic result, status, and freshness. Editing affects only the current definition; deletion never deletes history; artifacts belong to ReportRun and expire independently. Existing JSONB fields carry provenance; no new report table is added. MCP contains exactly the 13 Prompt 7 read-only tools and no report CRUD, history, artifact, SQL, or generic database tool. Report operations remain authenticated application services; Gemini may propose/explain configurations but deterministic backend validation is mandatory.

### Prompt 10 scope freeze

Prompt 10 implements PostgreSQL/pooling and migration verification, provider-backed auth/tenant middleware, REST pull, signed webhooks, SDK/tracking event ingress, CSV/JSON import, normalization, deduplication, identity/entity resolution, deterministic algorithms, analytics, reports/snapshots/renderers/retention, exact MCP/Gemini, and frontend integration. Timelines, journey/drop-off, repeat contacts, channel switching, churn features/cohorts, dashboard/report metrics, and quality metrics are derived from the 21 tables. Social/public sources, outreach/automation, predictive or AI-authoritative decisions, advanced identity resolution, SSO/MFA/invitations/password reset/full RBAC, direct database/warehouse/SFTP/object-storage/streaming connectors, arbitrary SQL/generic MCP, and a distributable SDK package remain future scope; SDK event ingress is MVP. This section is documentation-only.
