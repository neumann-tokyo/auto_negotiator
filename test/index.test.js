import * as assert from "node:assert";
import { mock, test } from "node:test";
import { defineAgent, negotiate } from "../src/index.js";

test("negotiate", () => {
	const channelName = "test";

	const agent1 = mock.fn((status, _name) => {});
	defineAgent({
		channelName,
		onMessage: agent1,
	});

	negotiate({ attemptsCount: 1, channelName });

	assert.equal(agent1.mock.calls.length, 1);
	assert.deepEqual(agent1.mock.calls[0].arguments, [{}, channelName]);
});
