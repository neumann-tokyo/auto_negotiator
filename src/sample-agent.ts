import { AtemptType } from "./enums.js";
import * as helper from "./helper.js";
import type * as types from "./types.js";

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
			if (status.type === AtemptType.Offer) {
				const { utility: anotherUtility, myChoices } =
					helper.calculateUtilityFromAnotherChoices({
						anotherChoices: status.choices,
						normalizedTopic,
						progress,
					});

				if (utility < anotherUtility) {
					return {
						id,
						choices: myChoices,
						concessionValue: concessionValue,
						utility: anotherUtility,
						type: AtemptType.Accept,
					};
				}
			}
		}

		return {
			id,
			choices,
			concessionValue,
			utility,
			type: AtemptType.Offer,
		};
	};
