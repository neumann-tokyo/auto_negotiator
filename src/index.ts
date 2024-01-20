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

// attemptsCount: integer
// channelName: string
export function negotiate({
	attemptsCount,
	channelName,
}: {
	attemptsCount: number;
	channelName: string;
}) {
	const responseChannelName = `${channelName}-response`;
	const channel = diagnostics_channel.channel(channelName);

	if (!channel.hasSubscribers) {
		throw new Error("No Agents");
	}

	const attempts: Array<Array<types.Status>> = [
		...Array(attemptsCount).keys(),
	].map(() => []);

	// id: integer => 何度目かの思考であるかを示すid
	// agentName: string => エージェント名
	// choices: Array<string> => 提案する選択肢
	// concessionValue: double => 提案の納得度(効用値)
	// type: "offer" | "accept" | "reject" => レスポンス種別
	const onResponseMessage = (
		{ id, ...status }: types.AgentResponse,
		_name: string,
	): void => {
		if (attempts[id] == null) {
			attempts[id] = [];
		}

		attempts[id].push(status);
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

	return attempts;
}

export function checkResult(attempts: Array<Array<types.Status>>) {
	for (let i = 0; i < attempts.length; i++) {
		const attempt = attempts[i];

		if (attempt.some((status) => status.type === types.AtemptType.Reject)) {
			return { isAgreed: false, id: i, result: attempt };
		}

		const acceptedStatuses = attempt.filter(
			(status) => status.type === types.AtemptType.Accept,
		);
		const offeredStatuses = attempt.filter(
			(status) => status.type === types.AtemptType.Offer,
		);

		if (
			acceptedStatuses.length === attempt.length - 1 &&
			offeredStatuses.length === 1
		) {
			return { isAgreed: true, id: i, result: attempt };
		}
	}

	return {
		isAgreed: false,
		id: attempts.length - 1,
		result: attempts[attempts.length - 1],
	};
}

// last turn: 0.12                       // 全Turn数のうちの何%か
// agreement bid: [0, 0]                 // 取得する item の index (issueの数だけある)
// parato distance: 0.29015362           // パレート距離 (これが何かは調べる)
// nash distance: 0.33603564             // ナッシュ距離 (これが何かは調べる)
// LinearAgent : 0.7585775750291838      // LinearAgent の 納得度？
// ConsederAgent : 0.5057183833527892    // ConsederAgent の 納得度？

// TODO ↑の LinearAgent の値は consessionValue をそのまま出しているわけではないので、実装する
