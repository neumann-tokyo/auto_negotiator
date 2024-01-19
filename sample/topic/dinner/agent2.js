export const topic = {
	name: "Dinner",
	description: "What should we have dinner?",
	discount_factor: 0.1,
	reservation: 0.3,
	issues: [
		{
			name: "Staple food",
			weight: 0.5,
			items: [
				{
					name: "Rice",
					evaluation: 3,
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
			weight: 0.5,
			items: [
				{
					name: "Steak",
					evaluation: 1,
				},
				{
					name: "Fish",
					evaluation: 2,
				},
				{
					name: "Chicken",
					evaluation: 3,
				},
			],
		},
	],
};
