import * as types from "../../src/types";
import * as helper from "./helper";

// MEMO concessionValueではなく効用値(utility)で比較するように変更した
// たぶん sample-agent.ts のほうが誤り
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

		const { choices } = helper.concessionValueToChoices({
			normalizedTopic,
			concessionValue,
		});
		const utility = helper.calculateUtility({
			discountFactor: normalizedTopic.discountFactor,
			progress,
			choices,
		});

		for (const status of currentAttempt) {
			if (status.type === types.AtemptType.Offer) {
				const { utility: anotherUtility, myChoices } = helper.choicesToUtility({
					anotherChoices: status.choices,
					normalizedTopic,
					progress,
				});

				if (utility < anotherUtility) {
					const newUtility = helper.calculateUtility({
						discountFactor: normalizedTopic.discountFactor,
						progress,
						choices: myChoices,
					});

					return {
						id,
						choices: myChoices,
						concessionValue: anotherUtility,
						utility: newUtility,
						type: types.AtemptType.Accept,
					};
				}
			}
		}

		return {
			id,
			choices,
			concessionValue,
			utility,
			type: types.AtemptType.Offer,
		};
	};
