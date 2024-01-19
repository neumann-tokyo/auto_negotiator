import * as diagnostics_channel from "node:diagnostics_channel";

// channelName: string
// actionFn: ({
//   data: {
// 		id: integer,
// 		attempts: Array<{
// 			agentName: string,
// 			bid: double,
// 			type: "offer" | "accept" | "reject"}>,
// 		attemptsCount: integer,
// 		responseChannelName: string
// 	},
// 	topic: {
//    name: string,
// 		description: string,
// 		discount_factor: double,
// 		reservation: double,
// 		issues: Array<{
// 			name: string,
// 			weight: double,
// 			items: Array<{
// 				name: string,
// 				evaluation: double,
// 			}>
// 		}>,
// 	}
// },) => {
// 	id: integer,
// 	bid: double,
// 	agentName: string,
// 	type: "offer" | "accept" | "reject",
// }
export function defineAgent({ channelName, topic, actionFn }) {
	const onMessage = (data, _name) => {
		const responseChannel = diagnostics_channel.channel(
			data.responseChannelName,
		);
		const response = actionFn({ data, topic });
		responseChannel.publish(response);
	};

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
		channel.publish({
			id: i,
			attempts: attempts,
			attemptsCount,
			responseChannelName,
		});
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

// TODO negotiation の結果として次を知りたいので attempts から
//      下記のフォーマットに変換する関数も必要
//      次のフォーマットは attempt 1回毎に出力できる
//
// last turn: 0.12                       // 全Turn数のうちの何%か
// agreement bid: [0, 0]                 // 取得する item の index (issueの数だけある)
// parato distance: 0.29015362           // パレート距離 (これが何かは調べる)
// nash distance: 0.33603564             // ナッシュ距離 (これが何かは調べる)
// LinearAgent : 0.7585775750291838      // LinearAgent の 納得度？
// ConsederAgent : 0.5057183833527892    // ConsederAgent の 納得度？
