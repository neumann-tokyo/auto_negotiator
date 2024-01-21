// agent から使う便利関数を定義しておく
import * as types from "../../src/types";

export function currentAttempt({
	id,
	attempts,
}: {
	id: number;
	attempts: Array<Array<types.Attempt>>;
}): Array<types.Attempt> {
	return attempts[id];
}

export function progress({
	id,
	attemptsCount,
}: { id: number; attemptsCount: number }): number {
	return id / attemptsCount;
}

export function choicesToUtility({
	anotherChoices,
	normalizedTopic,
}: {
	anotherChoices: Array<types.Choice>;
	normalizedTopic: types.NormalizedTopic;
}): { utility: number; myChoices: Array<types.Choice> } {
	const myChoices: Array<types.Choice> = [];

	const utility = anotherChoices.reduce(
		(utility: number, choice: types.Choice): number => {
			const issue = normalizedTopic.issues.find(
				(issue) => issue.name === choice.issueName,
			);
			if (issue == null) {
				throw new Error(
					`issue "${choice.issueName}" is not found in topic "${normalizedTopic.name}"`,
				);
			}

			const myChoiceItem: types.NormalizedItem | undefined = issue.items.find(
				(item) => item.name === choice.item.name,
			);

			if (myChoiceItem == null) {
				throw new Error(
					`item name "${choice.item.name}" is not found in topic "${normalizedTopic.name}"`,
				);
			}

			myChoices.push({
				issueName: issue.name,
				item: myChoiceItem,
			});

			return utility + myChoiceItem.normalizedEvaluation;
		},
		0.0,
	);

	return { utility, myChoices };
}

// choices: issue毎の選択肢の配列
function calculateThreshold({
	choices,
}: { choices: Array<types.Choice> }): number {
	const total = choices.reduce(
		(t: number, choice: types.Choice): number =>
			t + choice.item.normalizedEvaluation,
		0.0,
	);

	return total + 0.001;
}

function getRandomInt(max: number): number {
	return Math.floor(Math.random() * max);
}

function randomChoiceFromIssue(issue: types.NormalizedIssue): types.Choice {
	const choicedIndex = getRandomInt(issue.items.length);
	const item = issue.items[choicedIndex];

	return {
		issueName: issue.name,
		item,
	};
}

// issues の normalizedEvaluation の合計値 + 0.001 をしきい値として、それが concession_value 以上になる choice の組み合わせをランダムに選んで作る
export function concessionValueToChoices({
	normalizedTopic,
	concessionValue,
	maxAttempts = 100,
}: {
	normalizedTopic: types.NormalizedTopic;
	concessionValue: number;
	maxAttempts?: number;
}): types.ChoicesWithThreshold {
	let maxChoicesWithThreshold: types.ChoicesWithThreshold | undefined;

	for (let i = 0; i < maxAttempts; i++) {
		const choices = normalizedTopic.issues.map((issue) =>
			randomChoiceFromIssue(issue),
		);
		const newChoicesWithThreshold = {
			threshold: calculateThreshold({ choices }),
			choices,
		};

		if (concessionValue <= newChoicesWithThreshold.threshold) {
			maxChoicesWithThreshold = newChoicesWithThreshold;
			break;
		}

		if (maxChoicesWithThreshold == null) {
			maxChoicesWithThreshold = newChoicesWithThreshold;
			continue;
		}

		if (maxChoicesWithThreshold.threshold < newChoicesWithThreshold.threshold) {
			maxChoicesWithThreshold = newChoicesWithThreshold;
		}
	}

	if (maxChoicesWithThreshold == null) {
		throw new Error("maxChoicesWithThreshold is undefined");
	}

	return maxChoicesWithThreshold;
}

export function calculateUtility({
	discountFactor,
	progress,
	choices,
}: {
	discountFactor: number;
	progress: number;
	choices: Array<types.Choice>;
}): number {
	const total = choices.reduce((t: number, choice: types.Choice): number => {
		return t + choice.item.normalizedEvaluation * discountFactor ** progress;
	}, 0.0);

	return total;
}
