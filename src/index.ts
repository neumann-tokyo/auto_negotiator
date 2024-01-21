import * as diagnostics_channel from "node:diagnostics_channel";
import * as types from "./types";

export function normalizeTopic(topic: types.Topic): types.NormalizedTopic {
	const newIssues = topic.issues.map((issue) => {
		const totalEvaluation = issue.items.reduce(
			(t, item) => t + item.evaluation,
			0.0,
		);
		const newItems = issue.items.map((item) => {
			return {
				...item,
				normalizedEvaluation:
					(item.evaluation * issue.weight) / totalEvaluation,
			};
		});

		return {
			...issue,
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

function checkFinish({
	attempt,
	agentsCount,
}: { attempt: Array<types.Status>; agentsCount: number }): {
	isAgreed: boolean;
	finish: boolean;
} {
	if (attempt.some((status) => status.type === types.AtemptType.Reject)) {
		return { isAgreed: false, finish: true };
	}

	const acceptedStatuses = attempt.filter(
		(status) => status.type === types.AtemptType.Accept,
	);
	const offeredStatuses = attempt.filter(
		(status) => status.type === types.AtemptType.Offer,
	);

	if (
		acceptedStatuses.length === agentsCount - 1 &&
		offeredStatuses.length === 1
	) {
		return { isAgreed: true, finish: true };
	}

	return { isAgreed: false, finish: false };
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
	let finishFlag = false;
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

	const attempts: Array<Array<types.Status>> = [
		...Array(attemptsCount).keys(),
	].map(() => []);

	const onResponseMessage = (
		{ id, ...status }: types.AgentResponse,
		_name: string,
	): void => {
		if (attempts[id] == null) {
			attempts[id] = [];
		}

		attempts[id].push(status as types.Status);

		const { isAgreed, finish } = checkFinish({
			attempt: attempts[id],
			agentsCount,
		});
		if (finish) {
			finishFlag = true;
			result.isAgreed = isAgreed;
			result.id = id;
			result.attemptsCount = id + 1;
			result.conclusion = attempts[id];
		}
	};
	diagnostics_channel.subscribe(
		responseChannelName,
		onResponseMessage as diagnostics_channel.ChannelListener,
	);

	for (let i = 0; i < attemptsCount; i++) {
		if (finishFlag) {
			break;
		}

		channel.publish({
			id: i,
			attempts: attempts,
			attemptsCount,
			responseChannelName,
		});
	}

	if (!finishFlag) {
		result.isAgreed = false;
		result.id = attempts.length - 1;
		result.attemptsCount = attempts.length;
		result.conclusion = attempts[attempts.length - 1];
	}

	result.allAttempts = attempts.filter((attempt) => attempt.length !== 0);

	return result;
}

// last turn: 0.12                       // 全Turn数のうちの何%か
// agreement bid: [0, 0]                 // 取得する item の index (issueの数だけある)
// parato distance: 0.29015362           // パレート距離 (これが何かは調べる)
// nash distance: 0.33603564             // ナッシュ距離 (これが何かは調べる)
// LinearAgent : 0.7585775750291838      // LinearAgent の 納得度？
// ConsederAgent : 0.5057183833527892    // ConsederAgent の 納得度？

// TODO ↑の LinearAgent の値は consessionValue をそのまま出しているわけではないので、実装する
