import { prettyPrint } from "../src/helper";
import * as negotiator from "../src/index";
import { sampleAgent } from "./agents/sample-agent";
import { topic as agent1Topic } from "./topic/dinner/agent1";
import { topic as agent2Topic } from "./topic/dinner/agent2";
import { topic as agent3Topic } from "./topic/dinner/agent3";

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
prettyPrint(result);
