import test from "node:test";
import assert from "node:assert/strict";
import { REPORT_TYPES, validateReportParameters } from "../src/services/reports.js";
test("all seven reports are allow-listed", () => { assert.equal(REPORT_TYPES.length, 7); for (const report_type of REPORT_TYPES) assert.equal(validateReportParameters({ report_type }).report_type, report_type); });
test("report parameters reject invalid periods", () => { assert.throws(() => validateReportParameters({ report_type: REPORT_TYPES[0], date_range: { start: "2025-02-01", end: "2025-01-01" } }), /Invalid/); assert.throws(() => validateReportParameters({ report_type: REPORT_TYPES[0], date_range: { start: "2020-01-01", end: "2022-01-01" } }), /366/); });
