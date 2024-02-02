# Auto Negotiator

## install

```
npm install auto_negotiator
```

## Usage

In order to run auto_negotiator, you need to define `Agent` having `Topic`.

`Topic` is like this:

```typescript
import type { Topic } from "auto_negotiator/types";

export const topic: Topic = {
  name: "Dinner",
  description: "What should we have dinner?",
  discountFactor: 0.1,
  reservation: 0.3,
  issues: [
    {
      name: "Staple food",
      weight: 3,
      items: [
        {
          name: "Rice",
          evaluation: 7,
        },
        {
          name: "Noodles",
          evaluation: 2,
        },
        {
          name: "Bread",
          evaluation: 1,
        },
      ],
    },
    {
      name: "Main dish",
      weight: 7,
      items: [
        {
          name: "Steak",
          evaluation: 1,
        },
        {
          name: "Fish",
          evaluation: 1,
        },
        {
          name: "Chicken",
          evaluation: 8,
        },
      ],
    },
  ],
};
```

This `Topic` has information about dinner. This agent wants to prioritize the
main dish over the staple food, because the weights are `Staple food: 3`,
`Main dish: 7`. In the staple food, the agent want to prioritize rice the most
among staple foods.

You have to create topics in the same format for each agent.

After that, you can create an `Agent`.

`Agent` need to have `actionFn`, which is called by each attempt. `actionFn` is
a function getting the next arguments:

```typescript
{
  data: {
    id: number;
    attempts: Array<Array<Attempt>>;
    attemptsCount: number;
    responseChannelName: string;
  }
  topic: Topic;
  normalizedTopic: NormalizedTopic;
}
```

And it returns an object of the next format:

```typescript
{
	id: number;
	choices: Array<Choice>;
	concessionValue: number;
	utility?: number;
	type: AtemptType;
}
```

If you want to know more details, please look
[types.ts](https://github.com/neumann-tokyo/auto_negotiator/blob/main/src/types.ts)

In the `actionFn`, you need to define a logic to compare utilities in order to
give an opinion about the `Topic`. This example is here:
[sample-agent.ts](https://github.com/neumann-tokyo/auto_negotiator/blob/main/src/sample-agent.ts)
You can define `actionFn` by `sampleAgent` by defining only `concessionValueFn`.

After that, you can run the negotiation for automatically by `negotiate`
function.

I show you the total example:

```typescript
import * as negotiator from "auto_negotiator";
import { sampleAgent } from "auto_negotiator/sample-agent";
import { topic as agent1Topic } from "./dinner/agent1.js";
import { topic as agent2Topic } from "./dinner/agent2.js";
import { topic as agent3Topic } from "./dinner/agent3.js";

// channelName is a value required for agents to communicate with each other,
// and can be set to any string.
const channelName = "dinner";

// `concessionValueFn` is a function that returns a value that changes from 1.0
// to 0.0 based on progress, which is a variable that increases from 0.0 to 1.0
// and indicates the overall progress.
const linearAgent = sampleAgent((progress) => 1.0 - progress);
const randomAgent = sampleAgent((_progress) => Math.random());
const exponentialAgent = sampleAgent((progress) => 1.0 - progress ** 0.5);

negotiator.defineAgent({
  channelName: channelName,
  agentName: "linearAgent",
  topic: agent1Topic,
  actionFn: linearAgent,
});
negotiator.defineAgent({
  channelName: channelName,
  agentName: "randomAgent",
  topic: agent2Topic,
  actionFn: randomAgent,
});
negotiator.defineAgent({
  channelName: channelName,
  agentName: "exponentialAgent",
  topic: agent3Topic,
  actionFn: exponentialAgent,
});

const result = negotiator.negotiate({
  channelName,
  attemptsCount: 100,
  agentsCount: 3,
});

console.log(negotiator.toJSON(result));
```

The result of this program is here:
[sample/result.json](https://github.com/neumann-tokyo/auto_negotiator/blob/main/sample/result.json).
