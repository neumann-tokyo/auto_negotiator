import * as helper from "../../src/helper";
import * as types from "../../src/types";

export function sampleAgent(
	{
		data: { id, attempts, attemptsCount, responseChannelName },
		topic,
		normalizedTopic,
	}: types.ActionFnParams,
	_name: string,
): types.ActionFnResponse {
	const currentAttempt = helper.currentAttempt({ id, attempts });
	const progress = helper.progress({ id, attemptsCount });
	const concessionValue = 1.0 - progress;

	// currentAttempt に他の agent の status がはいっている
	const hasOtherAgentOffer =
		currentAttempt != null && currentAttempt.length > 0;

	if (!hasOtherAgentOffer) {
		for (const status of currentAttempt) {
			if (status.type === types.AtemptType.Offer) {
				const anotherConcessionValue = helper.choicesToConcessionValue({
					choices: status.choices,
				});

				if (concessionValue < anotherConcessionValue) {
					return {
						choices: status.choices,
						concessionValue: anotherConcessionValue,
						type: types.AtemptType.Accept,
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
		choices,
		concessionValue,
		type: types.AtemptType.Offer,
	};
}
