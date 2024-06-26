import type { Topic } from "../../../src/types";

export const topic: Topic = {
	name: "Dinner",
	description: "What should we have dinner?",
	discountFactor: 0.1,
	reservation: 0.3,
	issues: [
		{
			name: "Staple food",
			weight: 9,
			items: [
				{
					name: "Rice",
					evaluation: 4,
				},
				{
					name: "Noodles",
					evaluation: 5,
				},
				{
					name: "Bread",
					evaluation: 1,
				},
			],
		},
		{
			name: "Main dish",
			weight: 1,
			items: [
				{
					name: "Steak",
					evaluation: 5,
				},
				{
					name: "Fish",
					evaluation: 4,
				},
				{
					name: "Chicken",
					evaluation: 1,
				},
			],
		},
	],
};
