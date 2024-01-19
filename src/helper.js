// agent から使う便利関数を定義しておく

export function currentAttempt({ id, attempts }) {
	return attempts[id];
}

export function progress({ id, attemptsCount }) {
	return id / attemptsCount;
}

export function choicesToConcessionValue({ choices }) {
	return choices.reduce(
		(concessionValue, choice) => concessionValue + choice.normalizedEvaluation,
		0.0,
	);
}

export function concessionValueToChoices({
	normalizedTopic,
	concessionValue,
}) {}
