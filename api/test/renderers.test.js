import test from "node:test";
import assert from "node:assert/strict";
import { renderPdf, renderDocx } from "../src/services/renderers.js";
test("optional PDF/DOCX renderers fail explicitly without dependencies", () => { assert.throws(() => renderPdf({}), (error) => error.code === "UNAVAILABLE"); assert.throws(() => renderDocx({}), (error) => error.code === "UNAVAILABLE"); });
