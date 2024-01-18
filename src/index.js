import * as diagnostics_channel from "node:diagnostics_channel";

// channelName: string
// onMessage: ({
//   id: integer,
//   attempts: Array<{agentName: string, bid: double, type: "offer" | "accept" | "reject"}>,
//   responseChannelName: string
// },
// name: string) => void
export function defineAgent({ channelName, onMessage }) {
	diagnostics_channel.subscribe(channelName, onMessage);
}

// attemptsCount: integer
// channelName: string
export function negotiate({ attemptsCount, channelName }) {
	const responseChannelName = `${channelName}-response`;
	const channel = diagnostics_channel.channel(channelName);

	// attempts = [
	// 	[{agentName: "agent1", bid: 100, type: "offer"}, {agentName: "agent2", bid: 200, type: "accept"}]
	// ]
	const attempts = [[]];

	if (!channel.hasSubscribers) {
		throw new Error("No Agents");
	}

	// id: integer => 何度目かの思考であるかを示すid
	// bid: double => 提案値
	// agentName: string => エージェント名
	// type: "offer" | "accept" | "reject" => レスポンス種別
	const onResponseMessage = ({ id, bid, agentName, type }, _name) => {
		const idNumber = Number(id);
		if (attempts[idNumber] == null) {
			attempts[idNumber] = [];
		}

		const status = { agentName, bid, type };
		attempts[idNumber].push(status);
	};
	diagnostics_channel.subscribe(responseChannelName, onResponseMessage);

	for (let i = 0; i < attemptsCount; i++) {
		channel.publish({ id: i, attempts: attempts, responseChannelName });
	}

	return attempts;
}

export function checkResult(attempts) {
	for (let i = 0; i < attempts.length; i++) {
		const attempt = attempts[i];

		if (attempt.every((status) => status?.type === "accept")) {
			return { isAgreed: true, id: i, result: attempt };
		}
		if (attempt.some((status) => status?.type === "reject")) {
			return { isAgreed: false, id: i, result: attempt };
		}
	}

	return {
		isAgreed: false,
		id: attempts.length - 1,
		result: attempts[attempts.length - 1],
	};
}
