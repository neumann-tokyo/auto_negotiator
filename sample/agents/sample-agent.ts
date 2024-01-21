import * as types from "../../src/types";
import * as helper from "./helper";

export function sampleAgent({
	data: { id, attempts, attemptsCount },
	normalizedTopic,
}: types.ActionFnParams): types.ActionFnResponse {
	const currentAttempt = helper.currentAttempt({ id, attempts });
	const progress = helper.progress({ id, attemptsCount });
	const concessionValue = 1.0 - progress;
	const utility = helper.calculateUtility({
		normalizedTopic,
		id,
		attemptsCount,
	});

	for (const status of currentAttempt) {
		if (status.type === types.AtemptType.Offer) {
			const anotherConcessionValue = helper.choicesToConcessionValue({
				choices: status.choices,
				normalizedTopic,
			});

			if (concessionValue < anotherConcessionValue) {
				return {
					id,
					choices: status.choices,
					concessionValue: anotherConcessionValue,
					utility,
					type: types.AtemptType.Accept,
				};
			}
		}
	}

	const { choices } = helper.concessionValueToChoices({
		normalizedTopic,
		concessionValue,
	});
	return {
		id,
		choices,
		concessionValue,
		utility,
		type: types.AtemptType.Offer,
	};
}
