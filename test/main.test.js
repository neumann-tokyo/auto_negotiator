import * as assert from "node:assert";
import { test } from "node:test";
import main from "../src/main.js";

test("should return hello world", () => {
	assert.equal(main(), "hello world");
});
