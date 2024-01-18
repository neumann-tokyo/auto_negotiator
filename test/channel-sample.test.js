import * as assert from "node:assert";
import { mock, test } from "node:test";
import { publish, subscribe } from "../src/channel-sample.js";

test("channel sample", () => {
	const agent1 = mock.fn((id, data) => {});
	subscribe({
		id: 1,
		fn: agent1,
	});

	const agent2 = mock.fn((id, data) => {});
	subscribe({
		id: 2,
		fn: agent2,
	});

	publish({ hi: "hi", aaa: 1 });
	publish({ aaa: 2 });

	assert.equal(agent1.mock.calls.length, 2);
	assert.deepEqual(agent1.mock.calls[0].arguments, [1, { hi: "hi", aaa: 1 }]);
	assert.deepEqual(agent1.mock.calls[1].arguments, [1, { aaa: 2 }]);

	assert.equal(agent2.mock.calls.length, 2);
	assert.deepEqual(agent2.mock.calls[0].arguments, [2, { hi: "hi", aaa: 1 }]);
	assert.deepEqual(agent2.mock.calls[1].arguments, [2, { aaa: 2 }]);
});
