import test from "node:test";
import assert from "node:assert/strict";
import { CANONICAL_TOOLS, orchestrateToolCall, validateToolCall } from "../src/services/orchestration.js";
test("MCP surface is exactly 13 tools", () => { assert.equal(CANONICAL_TOOLS.length, 13); assert.equal(new Set(CANONICAL_TOOLS).size, 13); assert.throws(() => validateToolCall({ name: "run_sql", arguments: {} }), /Unsupported/); });
test("orchestration validates then invokes only approved tools", async () => { const result = await orchestrateToolCall({ call: { name: "get_data_quality", arguments: { limit: 10 } }, invoke: async (name, args) => ({ name, args, status: "EMPTY" }) }); assert.deepEqual(result.result, { name: "get_data_quality", args: { limit: 10 }, status: "EMPTY" }); });
