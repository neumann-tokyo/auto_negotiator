import * as diagnostics_channel from "node:diagnostics_channel";
import { AtemptType } from "./enums.js";
import type * as types from "./types.js";

export function normalizeTopic(topic: types.Topic): types.NormalizedTopic {
	const totalWeight = topic.issues.reduce((t, issue) => t + issue.weight, 0);
	const newIssues = topic.issues.map((issue) => {
		const totalEvaluation = issue.items.reduce(
			(t, item) => t + item.evaluation,
			0.0,
		);
		const normalizedWeight = issue.weight / totalWeight;
		const newItems = issue.items.map((item) => {
			return {
				...item,
				normalizedEvaluation:
					(item.evaluation * normalizedWeight) / totalEvaluation,
			};
		});

		return {
			...issue,
			normalizedWeight,
			items: newItems,
		};
	});

	return {
		...topic,
		issues: newIssues,
	};
}

export function defineAgent({
	channelName,
	agentName,
	topic,
	actionFn,
}: {
	channelName: string;
	agentName: string;
	topic: types.Topic;
	actionFn: types.ActionFn;
}): void {
	const normalizedTopic = normalizeTopic(topic);
	const onMessage = (data: types.AgentInput, _name: string): void => {
		const responseChannel = diagnostics_channel.channel(
			data.responseChannelName,
		);
		const response: types.ActionFnResponse = actionFn({
			data,
			topic,
			normalizedTopic,
		});
		responseChannel.publish({ ...response, agentName });
	};

	diagnostics_channel.subscribe(
		channelName,
		onMessage as diagnostics_channel.ChannelListener,
	);
}

export function negotiate({
	channelName,
	attemptsCount,
	agentsCount,
}: {
	channelName: string;
	attemptsCount: number;
	agentsCount: number;
}): types.NegotiateResult {
	const responseChannelName = `${channelName}-response`;
	const channel = diagnostics_channel.channel(channelName);
	const result: types.NegotiateResult = {
		isAgreed: false,
		id: 0,
		attemptsCount: 1,
		conclusion: [],
		allAttempts: [],
	};

	if (!channel.hasSubscribers) {
		throw new Error("No Agents");
	}

	const attempts: Array<Array<types.Attempt>> = [
		...Array(attemptsCount).keys(),
	].map(() => []);

	const onResponseMessage = (
		newAttempt: types.Attempt,
		_name: string,
	): void => {
		const id = newAttempt.id;
		if (attempts[id] == null) {
			attempts[id] = [];
		}

		attempts[id].push(newAttempt);
	};
	diagnostics_channel.subscribe(
		responseChannelName,
		onResponseMessage as diagnostics_channel.ChannelListener,
	);

	for (let i = 0; i < attemptsCount; i++) {
		channel.publish({
			id: i,
			attempts: attempts,
			attemptsCount,
			responseChannelName,
		});
	}

	result.allAttempts = attempts.filter((attempt) => attempt.length !== 0);

	const agreedAttempt = attempts.find((attempt) => {
		const acceptedStatuses = attempt.filter(
			(status) => status.type === AtemptType.Accept,
		);
		const offeredStatuses = attempt.filter(
			(status) => status.type === AtemptType.Offer,
		);

		return (
			acceptedStatuses.length === agentsCount - 1 &&
			offeredStatuses.length === 1
		);
	});
	if (agreedAttempt == null) {
		result.isAgreed = false;
		result.id = attemptsCount - 1;
		result.attemptsCount = attemptsCount;
		result.conclusion = attempts[attemptsCount - 1];
	} else {
		// TODO 合意できたときの合意した回以降の値はどうするべきか？
		result.isAgreed = true;
		result.id = agreedAttempt[0].id;
		result.attemptsCount = agreedAttempt[0].id + 1;
		result.conclusion = agreedAttempt;
	}

	return result;
}

export function toJSON(a: unknown): unknown {
	return JSON.stringify(a, null, 4);
}
