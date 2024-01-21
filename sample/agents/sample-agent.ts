import * as types from "../../src/types";
import * as helper from "./helper";

export function sampleAgent({
	data: { id, attempts, attemptsCount },
	normalizedTopic,
}: types.ActionFnParams): types.ActionFnResponse {
	const currentAttempt = helper.currentAttempt({ id, attempts });
	const progress = helper.progress({ id, attemptsCount });
	const concessionValue = 1.0 - progress;

	for (const status of currentAttempt) {
		if (status.type === types.AtemptType.Offer) {
			const anotherConcessionValue = helper.choicesToConcessionValue({
				choices: status.choices,
				normalizedTopic,
			});

			// console.log("concessionValue: ", concessionValue);
			// console.log("anotherConcessionValue: ", anotherConcessionValue);

			if (concessionValue < anotherConcessionValue) {
				return {
					id,
					choices: status.choices,
					concessionValue: anotherConcessionValue,
					type: types.AtemptType.Accept,
				};
			}
		}
	}

	const { choices, threshold } = helper.concessionValueToChoices({
		normalizedTopic,
		concessionValue,
	});
	return {
		id,
		choices,
		concessionValue,
		// threshold,
		type: types.AtemptType.Offer,
	};
}
