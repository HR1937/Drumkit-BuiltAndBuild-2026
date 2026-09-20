import test from "node:test";
import assert from "node:assert/strict";
import { artifactFilename, safeSlug, toCsv } from "../src/services/artifacts.js";
test("artifact names are safe and exclude customer identifiers", () => { const name = artifactFilename("Acme & Co", "IDENTITY_DATA_QUALITY", "run-1", "json", new Date("2025-01-01T00:00:00Z")); assert.equal(name, "breeze-acme-co-IDENTITY_DATA_QUALITY-run-1-20250101T000000Z.json"); assert.equal(safeSlug("Hello/World"), "hello-world"); });
test("CSV output is deterministic", () => { assert.equal(toCsv({ rows: [{ b: 2, a: 1 }] }), "a,b\n\"1\",\"2\"\n"); });
