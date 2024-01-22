import * as helper from "../../src/helper";
import * as types from "../../src/types";

// MEMO もともとの Python のコードを再現したもの https://github.com/TomoyaFukui/Jupiter
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
				const { utility: anotherUtility, myChoices } =
					helper.calculateUtilityFromAnotherChoices({
						anotherChoices: status.choices,
						normalizedTopic,
					});

				if (concessionValue < anotherUtility) {
					const utility = helper.calculateUtility({
						discountFactor: normalizedTopic.discountFactor,
						progress,
						choices: myChoices,
					});

					return {
						id,
						choices: myChoices,
						concessionValue: anotherUtility,
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
