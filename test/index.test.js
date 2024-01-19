import * as assert from "node:assert";
import { test } from "node:test";
import { checkResult, defineAgent, negotiate } from "../src/index.js";

test("negotiate", (t) => {
	// t.test("when no agents", () => {
	// 	const channelName = "test-no-agents";

	// 	assert.throws(() => {
	// 		negotiate({ attemptsCount: 1, channelName });
	// 	}, Error);
	// });

	t.test("attempts count 1", () => {
		const channelName = "test1";

		defineAgent({
			channelName,
			agentName: "agent1",
			topic: {},
			actionFn: ({ data, topic }) => {
				return {
					id: data.id,
					bid: 100.1,
					type: "offer",
				};
			},
		});

		defineAgent({
			channelName,
			topic: {},
			agentName: "agent2",
			actionFn: ({ data, topic }) => {
				return {
					id: data.id,
					bid: 95.1,
					type: "offer",
				};
			},
		});

		const attempts = negotiate({ attemptsCount: 1, channelName });

		assert.deepEqual(attempts, [
			[
				{ agentName: "agent1", bid: 100.1, type: "offer" },
				{ agentName: "agent2", bid: 95.1, type: "offer" },
			],
		]);

		const result = checkResult(attempts);
		assert.equal(result.isAgreed, false);
		assert.equal(result.id, 0);
		assert.deepEqual(result.result, [
			{ agentName: "agent1", bid: 100.1, type: "offer" },
			{ agentName: "agent2", bid: 95.1, type: "offer" },
		]);
	});
});
