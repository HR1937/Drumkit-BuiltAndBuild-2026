import test from "node:test";
import assert from "node:assert/strict";
import { evaluateJourney, resolveIdentity, structuredChurnOutcome } from "../src/services/domain.js";
test("identity resolution never guesses conflicts", () => { assert.equal(resolveIdentity({ mappings: [{ customerId: "a" }, { customerId: "b" }] }).status, "AMBIGUOUS"); assert.equal(resolveIdentity({}).status, "UNRESOLVED"); assert.equal(resolveIdentity({ canonicalId: "a" }).method, "DIRECT_CANONICAL_ID"); });
test("journey evaluation is event-time ordered and configured", () => { const result = evaluateJourney({ definition: { startEventType: "START", stages: [{ stageKey: "one", ordinal: 1, required: true, eventTypes: ["ONE"] }] }, events: [{ event_id: "2", event_type: "ONE", event_time: "2025-01-01T02:00:00Z" }, { event_id: "1", event_type: "START", event_time: "2025-01-01T01:00:00Z" }] }); assert.equal(result.instances[0].status, "COMPLETED"); });
test("churn requires structured source evidence", () => { assert.equal(structuredChurnOutcome({ customerId: "c" }), null); assert.equal(structuredChurnOutcome({ customerId: "c", churnTimestamp: "2025-01-01", source: "subscription" }).source, "subscription"); });
