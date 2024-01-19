import * as helper from "../../helper.js";

export function sampleAgent(
	{
		data: { id, attempts, attemptsCount, responseChannelName },
		topic,
		normalizedTopic,
	},
	_name,
) {
	const currentAttempt = helper.currentAttempt({ id, attempts });
	const progress = helper.progress({ id, attemptsCount });
	const concessionValue = 1.0 - progress;

	// currentAttempt に他の agent の status がはいっている
	const hasOtherAgentOffer =
		currentAttempt != null && currentAttempt.length > 0;

	if (!hasOtherAgentOffer) {
		for (const status of currentAttempt) {
			if (status.type === "offer") {
				const anotherConcessionValue = helper.choicesToConcessionValue({
					choices: status.choices,
				});

				if (concessionValue < anotherConcessionValue) {
					return {
						id,
						choices: status.choices,
						concessionValue: anotherConcessionValue,
						type: "accept",
					};
				}
			}
		}
	}

	const choices = helper.concessionValueToChoices({
		normalizedTopic,
		concessionValue,
	});
	return {
		id,
		choices,
		concessionValue,
		type: "offer",
	};
	// return {
	// 	id: data.id,
	// 	choices: ["a1", "b2"],
	// 	concessionValue: 0.7654321,
	// 	type: "offer",
	// };
}

// Choices: {
// 	issueName: string,
// 	item: {
// 		name: string,
// 		evalution: integer,
//     normalizedTopic: double
// 	}
// }
