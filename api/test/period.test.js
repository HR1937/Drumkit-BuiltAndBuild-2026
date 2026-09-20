import test from "node:test";
import assert from "node:assert/strict";
import { resolvePeriod, inPeriod } from "../src/services/period.js";
test("period uses half-open boundaries", () => { const p = resolvePeriod({ start: "2025-01-01T00:00:00Z", end: "2025-01-02T00:00:00Z" }); assert.equal(inPeriod("2025-01-01T00:00:00Z", p), true); assert.equal(inPeriod("2025-01-02T00:00:00Z", p), false); });
test("period rejects reversed and oversized ranges", () => { assert.throws(() => resolvePeriod({ start: "2025-01-02", end: "2025-01-01" }), /Invalid/); assert.throws(() => resolvePeriod({ start: "2020-01-01", end: "2022-01-01" }), /366/); });
