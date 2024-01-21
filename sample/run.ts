import * as negotiator from "../src/index";
import { sampleAgent } from "./agents/sample-agent";
import { topic as agent1Topic } from "./topic/dinner/agent1";
import { topic as agent2Topic } from "./topic/dinner/agent2";
import { topic as agent3Topic } from "./topic/dinner/agent3";

const channelName = "dinner";

const linearAgent = sampleAgent((progress) => 1.0 - progress);
const doubleAgent = sampleAgent((progress) => 1.0 - progress * 2);
const exponentialAgent = sampleAgent((progress) => 1.0 - progress ** 2);

negotiator.defineAgent({
	channelName: channelName,
	agentName: "linearAgent",
	topic: agent1Topic,
	actionFn: linearAgent,
});
negotiator.defineAgent({
	channelName: channelName,
	agentName: "doubleAgent",
	topic: agent2Topic,
	actionFn: doubleAgent,
});
negotiator.defineAgent({
	channelName: channelName,
	agentName: "exponentialAgent",
	topic: agent3Topic,
	actionFn: exponentialAgent,
});

const result = negotiator.negotiate({
	channelName,
	attemptsCount: 30,
	agentsCount: 3,
});

console.log(negotiator.toJSON(result));
