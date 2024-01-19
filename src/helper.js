// agent から使う便利関数を定義しておく

export function currentAttempt({ id, attempts }) {
	const idNumber = Number(id);
	return attempts[idNumber];
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

// choices: issue毎の選択肢の配列
function calculateThreshold({ choices }) {
	const total = choices.reduce(
		(t, choice) => t + choice.normalizedEvaluation,
		0.0,
	);

	return total + 0.001;
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

function randomChoiceFromIssue(issue) {
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
}) {
	const choicesWithThreshold = [...Array(maxAttempts).keys()].reduce(
		(maxChoicesWithThreshold) => {
			if (maxChoicesWithThreshold.isOverConcessionValue) {
				return maxChoicesWithThreshold;
			}

			const choices = normalizedTopic.issues.map((issue) =>
				randomChoiceFromIssue(issue),
			);
			const threshold = calculateThreshold({ choices });
			const newChoicesWithThreshold = {
				threshold,
				choices,
				isOverConcessionValue: false,
			};

			// concessionValue より大きい threshold が出たら、それで決定
			if (concessionValue <= threshold) {
				return {
					...newChoicesWithThreshold,
					isOverConcessionValue: true,
				};
			}

			// threshold が最大になる choices を探す
			if (maxChoicesWithThreshold.thread < newChoicesWithThreshold.threshold) {
				return newChoicesWithThreshold;
			}

			return maxChoicesWithThreshold;
		},
	);

	return choicesWithThreshold.choices;
}
