import { Topic } from "../../../src/types";

export const topic: Topic = {
	name: "Dinner",
	description: "What should we have dinner?",
	discountFactor: 0.1,
	reservation: 0.3,
	issues: [
		{
			name: "Staple food",
			weight: 0.3,
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
			weight: 0.7,
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
