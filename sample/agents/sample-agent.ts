import * as types from "../../src/types";
import * as helper from "./helper";

export const sampleAgent =
	(concessionValueFn: (progress: number) => number) =>
	({
		data: { id, attempts, attemptsCount },
		normalizedTopic,
	}: types.ActionFnParams): types.ActionFnResponse => {
		const currentAttempt = helper.currentAttempt({ id, attempts });
		const progress = helper.progress({ id, attemptsCount });
		// const concessionValue = 1.0 - progress;
		const concessionValue = concessionValueFn(progress);

		for (const status of currentAttempt) {
			if (status.type === types.AtemptType.Offer) {
				const { concessionValue: anotherConcessionValue, myChoices } =
					helper.choicesToConcessionValue({
						anotherChoices: status.choices,
						normalizedTopic,
					});

				if (concessionValue < anotherConcessionValue) {
					const utility = helper.calculateUtility({
						discountFactor: normalizedTopic.discountFactor,
						progress,
						choices: myChoices,
					});

					return {
						id,
						choices: myChoices,
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
		const utility = helper.calculateUtility({
			discountFactor: normalizedTopic.discountFactor,
			progress,
			choices,
		});
		return {
			id,
			choices,
			concessionValue,
			utility,
			type: types.AtemptType.Offer,
		};
	};
