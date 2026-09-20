import test from "node:test";
import assert from "node:assert/strict";
import { association, safeRate, sufficiency, STATUSES, journeySummary, repeatContactSummary, unresolvedSummary, escalationSummary } from "../src/services/analytics.js";

test("safeRate never divides by zero", () => { assert.equal(safeRate(2, 0), null); assert.equal(safeRate(0, 4), 0); });
test("small cohorts are insufficient", () => { assert.equal(sufficiency({ eligible: 1, minimum: 2 }), STATUSES.INSUFFICIENT_DATA); assert.equal(sufficiency({ eligible: 0 }), STATUSES.EMPTY); assert.equal(sufficiency({ configured: false }), STATUSES.UNAVAILABLE); });
test("association omits relative difference for zero comparison prevalence", () => { const result = association([{ churned: true }], [{ churned: false }], (x) => x.churned); assert.equal(result.comparison_prevalence, 0); assert.equal(result.relative_difference, null); });
test("domain summaries are deterministic and preserve zero rates", () => { assert.deepEqual(journeySummary([{ status: "COMPLETED" }, { status: "ACTIVE" }]), { status: "AVAILABLE", eligible: 2, completed: 1, dropped_off: 0, completion_rate: 0.5, dropoff_rate: 0, provenance: { source: "journey_instance" } }); assert.equal(repeatContactSummary([{ c_id: "a" }, { c_id: "a" }, { c_id: "b" }]).repeat_customers, 1); assert.equal(unresolvedSummary([{ c_id: "a", status: "RESOLVED" }]).unresolved_rate, 0); assert.equal(escalationSummary([{ c_id: "a", detection_method: "STRUCTURED" }]).structured, 1); });
