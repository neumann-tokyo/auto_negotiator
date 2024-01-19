import * as assert from "node:assert";
import { test } from "node:test";
import { topic as agent1Topic } from "../sample/topic/dinner/agent1.js";
import { topic as agent2Topic } from "../sample/topic/dinner/agent2.js";
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
			topic: agent1Topic,
			actionFn: ({ data }) => {
				return {
					id: data.id,
					choices: [
						{
							issueName: "Staple food",
							item: {
								name: "Rice",
								evaluation: 3,
								normalizedEvaluation: 0.5,
							},
						},
						{
							issueName: "Main dish",
							item: {
								name: "Steak",
								evaluation: 3,
								normalizedEvaluation: 0.5,
							},
						},
					],
					concessionValue: 0.7654321,
					type: "offer",
				};
			},
		});

		defineAgent({
			channelName,
			agentName: "agent2",
			topic: agent2Topic,
			actionFn: ({ data }) => {
				return {
					id: data.id,
					choices: [
						{
							issueName: "Staple food",
							item: {
								name: "Rice",
								evaluation: 3,
								normalizedEvaluation: 0.5,
							},
						},
						{
							issueName: "Main dish",
							item: {
								name: "Chicken",
								evaluation: 3,
								normalizedEvaluation: 0.5,
							},
						},
					],
					concessionValue: 0.1234567,
					type: "offer",
				};
			},
		});

		const attempts = negotiate({ attemptsCount: 1, channelName });

		assert.deepEqual(attempts, [
			[
				{
					agentName: "agent1",
					choices: [
						{
							issueName: "Staple food",
							item: {
								name: "Rice",
								evaluation: 3,
								normalizedEvaluation: 0.5,
							},
						},
						{
							issueName: "Main dish",
							item: {
								name: "Steak",
								evaluation: 3,
								normalizedEvaluation: 0.5,
							},
						},
					],
					concessionValue: 0.7654321,
					type: "offer",
				},
				{
					agentName: "agent2",
					choices: [
						{
							issueName: "Staple food",
							item: {
								name: "Rice",
								evaluation: 3,
								normalizedEvaluation: 0.5,
							},
						},
						{
							issueName: "Main dish",
							item: {
								name: "Chicken",
								evaluation: 3,
								normalizedEvaluation: 0.5,
							},
						},
					],
					concessionValue: 0.1234567,
					type: "offer",
				},
			],
		]);

		const result = checkResult(attempts);
		assert.equal(result.isAgreed, false);
		assert.equal(result.id, 0);
		assert.deepEqual(result.result, [
			{
				agentName: "agent1",
				choices: [
					{
						issueName: "Staple food",
						item: {
							name: "Rice",
							evaluation: 3,
							normalizedEvaluation: 0.5,
						},
					},
					{
						issueName: "Main dish",
						item: {
							name: "Steak",
							evaluation: 3,
							normalizedEvaluation: 0.5,
						},
					},
				],
				concessionValue: 0.7654321,
				type: "offer",
			},
			{
				agentName: "agent2",
				choices: [
					{
						issueName: "Staple food",
						item: {
							name: "Rice",
							evaluation: 3,
							normalizedEvaluation: 0.5,
						},
					},
					{
						issueName: "Main dish",
						item: {
							name: "Chicken",
							evaluation: 3,
							normalizedEvaluation: 0.5,
						},
					},
				],
				concessionValue: 0.1234567,
				type: "offer",
			},
		]);
	});
});
