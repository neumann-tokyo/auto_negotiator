import * as assert from "node:assert";
import { test } from "node:test";
import { topic as agent1Topic } from "../sample/topic/dinner/agent1";
import { topic as agent2Topic } from "../sample/topic/dinner/agent2";
import { defineAgent, negotiate } from "../src/index";
import * as types from "../src/types";

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
			actionFn: ({ data }: types.ActionFnParams): types.ActionFnResponse => {
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
					type: types.AtemptType.Offer,
				};
			},
		});

		defineAgent({
			channelName,
			agentName: "agent2",
			topic: agent2Topic,
			actionFn: ({ data }: types.ActionFnParams): types.ActionFnResponse => {
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
					type: types.AtemptType.Offer,
				};
			},
		});

		const result = negotiate({
			channelName,
			attemptsCount: 1,
			agentsCount: 2,
		});

		assert.deepEqual(result.conclusion, [
			{
				id: 0,
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
				id: 0,
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
