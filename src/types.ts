import { AtemptType } from "./enums.js";

export type Item = {
	name: string;
	evaluation: number;
};

export type NormalizedItem = {
	name: string;
	evaluation: number;
	normalizedEvaluation: number;
};

export type Issue = {
	name: string;
	weight: number;
	items: Array<Item>;
};

export type NormalizedIssue = {
	name: string;
	weight: number;
	items: Array<NormalizedItem>;
};

export type Choice = {
	issueName: string;
	item: NormalizedItem;
};

export type Topic = {
	name: string;
	description: string;
	discountFactor: number;
	reservation: number;
	issues: Array<Issue>;
};

export type NormalizedTopic = {
	name: string;
	description: string;
	discountFactor: number;
	reservation: number;
	issues: Array<NormalizedIssue>;
};

export type Attempt = {
	id: number;
	agentName: string;
	choices: Array<Choice>;
	concessionValue: number;
	utility?: number;
	type: AtemptType;
};

export type AgentInput = {
	id: number;
	attempts: Array<Array<Attempt>>;
	attemptsCount: number;
	responseChannelName: string;
};

export type ActionFnParams = {
	data: AgentInput;
	topic: Topic;
	normalizedTopic: NormalizedTopic;
};

export type ActionFnResponse = Omit<Attempt, "agentName">;

export type ActionFn = (params: ActionFnParams) => ActionFnResponse;

export type ChoicesWithThreshold = {
	threshold: number;
	choices: Array<Choice>;
};

export type NegotiateResult = {
	isAgreed: boolean;
	id: number;
	attemptsCount: number;
	conclusion: Array<Attempt>;
	allAttempts: Array<Array<Attempt>>;
};
