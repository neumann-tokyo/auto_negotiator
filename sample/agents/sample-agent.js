// const utilitySpaceXmlPath = "src/sample-domain/Atlas3/triangularFight_util1.xml";

export function sampleAgent(
	{ data: { id, attempts, attemptsCount, responseChannelName }, topic },
	_name,
) {
	const currentAttempt = attempts[id];
	const responseChannel = diagnostics_channel.channel(responseChannelName);

	const progress = id / attemptsCount;
	const sourceBid = 1.0 - progress;

	// return {
	// 	id,
	// 	bid: 100.1,
	// 	agentName: "agent1",
	// 	type: "offer",
	// }
}
