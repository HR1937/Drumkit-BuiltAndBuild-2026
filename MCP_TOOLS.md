# Breeze MCP Tools — Prompt 10 Verification Checkpoint

Status: SPECIFIED — NOT YET IMPLEMENTED. The current API does not provide the canonical MCP runtime. This document defines the exact bounded surface; it does not create tools or routes.

## Boundary

There are exactly 13 read-only semantic tools. They serve both customer/support investigation and analyst/business-analysis questions. They never expose SQL, arbitrary database access, filesystem access, code execution, report mutation, artifact mutation, or unrestricted analysis.

Every request receives authenticated server-derived tenant context. Client/Gemini `company_id` is never authority. Every response contains `status`, tenant-safe period/timezone, `generated_at`, freshness/data/config/formula versions, provenance, and applicable sample sizes/denominators. Default page limit is 100; hard maximum is 500. Ordering is deterministic; cursor pagination is stable.

## Exact tool contracts

| Tool | Input | Output | Data/service |
|---|---|---|---|
| `get_customer_profile` | `customer_ref` required | canonical customer, source identifiers, identity status/evidence, provenance | Customer + IdentityMapping + IdentityResolution |
| `get_customer_timeline` | `customer_ref`, optional `[start,end)`, cursor, limit | chronological meaningful events with time/type/channel/source/entity/journey/issue links | Event and deterministic timeline service |
| `get_customer_issues` | `customer_ref`, optional status/topic/period/page | issues, lifecycle timestamps, resolution notes, escalation links | Issue + Complaint + Escalation |
| `get_customer_journeys` | `customer_ref`, optional journey/period/page | instances, finalized status, ordered stages, supporting events, drop-off/completion | JourneyDefinition/Stage/Instance services |
| `get_customer_escalations` | `customer_ref`, optional period/issue/journey/channel filters | escalation records, STRUCTURED/INFERRED method, confidence, evidence | Escalation service |
| `analyze_journey` | period, journey/config id, dimensions, bounded page | started/completed/dropped-off counts, denominators, rates, sufficiency | deterministic journey analytics |
| `analyze_dropoffs` | period, journey id, stage/channel dimensions | finalized stage drop-off counts/rates and eligible denominators | deterministic drop-off analytics |
| `analyze_repeat_contacts` | period, optional issue/topic/channel dimensions and thresholds | customer/contact counts, customer-wide repeats, same-issue repeats, rates | deterministic contact analytics |
| `analyze_unresolved_issues` | period and status/topic/channel dimensions | issue/customer counts, ages, status/topic dimensions, sufficiency | deterministic issue analytics |
| `analyze_escalations` | period, channel/topic/journey dimensions, method filter | counts/rates, structured/inferred split, confidence and samples | deterministic escalation analytics |
| `analyze_churn_associations` | period, lookback/observation/config ids, feature dimensions | cohort definitions, feature values, differences, samples, association status | deterministic churn analytics |
| `analyze_identity_resolution` | period and source/channel dimensions | resolved/ambiguous/unresolved counts/rates, eligible denominator, duplicates | identity-quality service |
| `get_data_quality` | period, source dimensions, metric set | duplicate/invalid/missing counts, processing latency statistics, provenance | ingestion/event/identity quality service |

## Validation and result states

Inputs reject malformed UUIDs, reversed or invalid periods, unsupported dimensions/metrics/statuses, unknown configuration identifiers, excessive limits, and unauthorized customer/entity references. Customer tools return `NOT_FOUND` for zero matches and `AMBIGUOUS` for multiple matches; they never guess. Analytics return `AVAILABLE`, `EMPTY`, `INSUFFICIENT_DATA`, `UNAVAILABLE`, or `ERROR`. Missing data is never converted to zero; denominator zero is `NOT_APPLICABLE`. Errors are structured as `INVALID_INPUT`, `UNAUTHORIZED`, `NOT_FOUND`, `AMBIGUOUS`, `UNAVAILABLE`, `INSUFFICIENT_DATA`, `CONFIGURATION_ERROR`, or `INTERNAL_ERROR` without SQL, secrets, or cross-tenant information.

## Tenant, limits, and forbidden behavior

Authorization occurs before service execution. All queries are tenant-scoped and customer references are resolved inside that tenant. Raw payloads and sensitive credentials are excluded unless a specific safe provenance field requires them. Tools cannot mutate Company, Customer, Event, Issue, Journey, Escalation, ChurnOutcome, ReportDefinition, ReportRun, or artifacts. Gemini cannot supply tenant authority, execute SQL, calculate authoritative metrics, resolve identity, decide domain state, fabricate missing evidence, or turn association into causation.

## Customer/support use cases

Support questions such as “what happened to this customer?”, “what issues are open?”, “what journeys did they enter?”, “was there an escalation?”, and “did they contact us about this issue before?” compose the five customer tools plus bounded repeat-contact analysis. Results are evidence-backed and chronological.

## Analyst/business-analysis use cases

Analyst questions such as “which journey drops off?”, “are escalations associated with churn?”, “where are unresolved issues concentrated?”, “how often do customers switch/repeat across channels?”, and “how reliable is our data?” compose the eight analytics/data-quality tools. Dimensions, periods, filters, limits, and formulas are allow-listed and deterministic; broad questions are answered by bounded tool composition, never arbitrary querying.

## Current repository verification

The current repository contains only partial backend scaffolding and a disabled/noncanonical generic MCP placeholder. Therefore all 13 tools are currently **SPECIFIED — NOT YET IMPLEMENTED**. No MCP tool should be reported as working until its validation, authorization, deterministic service, PostgreSQL query path, provenance, pagination, and error behavior are tested.
