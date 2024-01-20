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
	discount_factor: number;
	reservation: number;
	issues: Array<Issue>;
};

export type NormalizedTopic = {
	name: string;
	description: string;
	discount_factor: number;
	reservation: number;
	issues: Array<NormalizedIssue>;
};

export enum AtemptType {
	Offer = "offer",
	Accept = "accept",
	Reject = "reject",
}

export type Attempt = {
	id: number;
	agentName: string;
	choices: Array<Choice>;
	concessionValue: number;
	type: AtemptType;
};

export type Status = Omit<Attempt, "id">;

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

export type ActionFnResponse = {
	id: number;
	choices: Array<Choice>;
	concessionValue: number;
	type: AtemptType;
	threshold?: number;
};

export type ActionFn = (params: ActionFnParams) => ActionFnResponse;

export type AgentResponse = {
	id: number;
	agentName: string;
	choices: Array<Choice>;
	concessionValue: number;
	type: AtemptType;
};

export type ChoicesWithThreshold = {
	threshold: number;
	choices: Array<Choice>;
};
