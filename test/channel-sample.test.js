import * as assert from "node:assert";
import { test } from "node:test";
import { publish, subscribe } from "../src/channel-sample.js";

test("channel sample", () => {
	subscribe({
		id: 1,
		fn: (id, data) => {
			assert.equal(id, 1);
			assert.deepEqual(data, { hi: "hi", aaa: 1 });
		},
	});
	subscribe({
		id: 2,
		fn: (id, data) => {
			assert.equal(id, 2);
			assert.deepEqual(data, { hi: "hi", aaa: 1 });
		},
	});

	publish({ hi: "hi", aaa: 1 });
});
