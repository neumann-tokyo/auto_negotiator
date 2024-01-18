import * as diagnostics_channel from "node:diagnostics_channel";

const utilitySpaceXmlPath =
	"src/sample-domain/Atlas3/triangularFight_util1.xml";

export function sampleAgent(
	{ id, attempts, attemptsCount, responseChannelName },
	_name,
) {
	const currentAttempt = attempts[id];
	const responseChannel = diagnostics_channel.channel(responseChannelName);

	const progress = id / attemptsCount;
	const sourceBid = 1.0 - progress;

	// responseChannel.publish({
	// 	id,
	// 	bid: 100.1,
	// 	agentName: "agent1",
	// 	type: "offer",
	// });
}

// negotiation の結果として次を知りたい
// last turn: 0.12                       // 全Turn数のうちの何%か
// agreement bid: [0, 0]                 // 取得する item の index (issueの数だけある)
// parato distance: 0.29015362           // パレート距離 (これが何かは調べる)
// nash distance: 0.33603564             // ナッシュ距離 (これが何かは調べる)
// LinearAgent : 0.7585775750291838      // LinearAgent の 納得度？
// ConsederAgent : 0.5057183833527892    // ConsederAgent の 納得度？
