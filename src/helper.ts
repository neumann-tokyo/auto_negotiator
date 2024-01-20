// agent から使う便利関数を定義しておく
import * as types from "./types";

export function currentAttempt({
	id,
	attempts,
}: {
	id: number;
	attempts: Array<Array<types.Status>>;
}): Array<types.Status> {
	return attempts[id];
}

export function progress({
	id,
	attemptsCount,
}: { id: number; attemptsCount: number }): number {
	return id / attemptsCount;
}

export function choicesToConcessionValue({
	choices,
}: { choices: Array<types.Choice> }) {
	return choices.reduce(
		(concessionValue: number, choice: types.Choice): number =>
			concessionValue + choice.item.normalizedEvaluation,
		0.0,
	);
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
