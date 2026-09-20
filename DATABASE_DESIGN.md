# Breeze Database Design — Prompt 10 Verification Checkpoint

Status: SPECIFIED — NOT YET IMPLEMENTED/VERIFIED. This document records the physical PostgreSQL representation required by the frozen contract and audits the current migration. It does not add tables or change the schema.

## Frozen boundary

The business schema contains exactly 21 tables: `company`, `data_source`, `source_field_mapping`, `ingestion_batch`, `customer`, `identity_mapping`, `customer_entity_link`, `event`, `identity_resolution`, `journey_definition`, `journey_stage_definition`, `journey_event_mapping`, `journey_instance`, `journey_instance_stage`, `issue`, `complaint`, `escalation`, `churn_outcome`, `issue_grouping_rule`, `report_definition`, and `report_run`.

Supabase Auth is external. No User, Admin, Account, Session, Membership, Role, Permission, or equivalent authentication table belongs in PostgreSQL.

## Physical representation audit

The current `api/migrations/001_initial.sql` contains one PostgreSQL table for each of the 21 required concepts, uses UUID primary keys, `timestamptz` for instants, JSONB for configuration/attributes/raw payload/evidence, foreign keys, and several tenant-scoped uniqueness rules/indexes. Its dependency order places `event` before `identity_resolution`.

| Table | Required stored responsibility | Current migration status |
|---|---|---|
| company | tenant identity, name, timezone, industry | Present |
| data_source | company source, method, status, safe credential reference/config | Present; secrets must remain external/masked |
| source_field_mapping | source-to-semantic mapping and validation | Present |
| ingestion_batch | batch lifecycle, counts, errors | Present |
| customer | canonical customer identity | Present |
| identity_mapping | scoped source identifiers, validity, confidence | Present |
| customer_entity_link | generic customer/business-entity context | Present |
| event | canonical event, source identity, fingerprint, time, channel, context, raw payload | Present |
| identity_resolution | latest auditable resolution status/method/confidence/evidence | Present |
| journey_definition | configured journey | Present |
| journey_stage_definition | ordered required/optional stages and timeout | Present |
| journey_event_mapping | event-to-stage mapping/conditions | Present |
| journey_instance | customer/entity journey lifecycle and drop-off | Present |
| journey_instance_stage | per-stage state/timestamps | Present |
| issue | underlying issue lifecycle and resolution note | Present |
| complaint | individual contact/report linked to issue/customer/event | Present |
| escalation | structured/inferred escalation provenance/evidence | Present |
| churn_outcome | configured churn facts, source, time, reason | Present |
| issue_grouping_rule | company issue-grouping configuration | Present |
| report_definition | company-scoped reusable report configuration | Present |
| report_run | immutable run parameters/result/artifact reference/status | Present, but lifecycle constraints need verification |

## Required relationship and constraint checks

Every company-owned read/write must filter by `company_id`. Source, customer, event, issue, journey, churn, report, and run references must be validated against the same company in application transactions. Required checks include UUID/FK validity, non-null required semantic fields, unique `(company_id,name)` where specified, source-event idempotency, deterministic fingerprint handling, valid statuses, timestamp ordering, JSONB shape validation, and bounded report configuration.

The current migration is not yet accepted as verified because it has not been run against a clean configured PostgreSQL database. Prompt 10 must also verify composite tenant-safe foreign-key behavior, required indexes for all high-volume tenant/time lookups, event fingerprint conflict handling, report-run immutability, and historical-run preservation. In particular, `report_run.report_id ON DELETE CASCADE` must be reconciled with the finalized rule that deleting a ReportDefinition does not delete historical runs; this is a documented implementation blocker, not a silent schema change.

## Migration/transaction requirements

Migration execution must be transactional and repeatable from an empty database, with `pgcrypto` available for UUID generation. Seed data must use the same services/models as normal ingestion. Ingestion, identity resolution, domain recomputation, report execution, and artifact-reference updates require explicit transaction boundaries and tenant checks. UTC instants are stored in `timestamptz`; company timezone is used only to resolve user-facing periods.

## Verification status

Database design: SPECIFIED. Current migration: PARTIAL / NOT YET VERIFIED. PostgreSQL execution, constraint tests, tenant-isolation tests, report-delete/history behavior, and complete index audit remain Prompt 10 work. No table was added by this checkpoint.
