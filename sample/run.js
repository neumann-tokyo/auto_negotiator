import * as negotiator from "../src/index.js";
import { sampleAgent } from "./agents/sample-agent.js";
import { topic as agent1Topic } from "./topic/dinner/agent1.js";
import { topic as agent2Topic } from "./topic/dinner/agent2.js";
import { topic as agent3Topic } from "./topic/dinner/agent3.js";

const channelName = "dinner";

negotiator.defineAgent({
	channelName: channelName,
	agentName: "agent1",
	topic: agent1Topic,
	actionFn: sampleAgent,
});
negotiator.defineAgent({
	channelName: channelName,
	agentName: "agent2",
	topic: agent2Topic,
	actionFn: sampleAgent,
});
negotiator.defineAgent({
	channelName: channelName,
	agentName: "agent3",
	topic: agent3Topic,
	actionFn: sampleAgent,
});

const attempts = negotiator.negotiate({ attemptsCount: 30, channelName });
const result = negotiator.checkResult(attempts);

console.log(attempts);
console.log("------------------");
console.log(result);
