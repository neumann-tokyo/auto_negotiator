import * as assert from "node:assert";
import { test } from "node:test";
import { negotiate } from "../src/index.js";

test("negotiate", () => {
	assert.deepEqual(negotiate({ attemptsCount: 1 }), {});
});
