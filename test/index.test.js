import * as assert from "node:assert";
import { test } from "node:test";
import main from "../src/index.js";

test("should return hello world", () => {
	assert.equal(main(), "hello world");
});
