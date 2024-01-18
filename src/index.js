import * as diagnostics_channel from "node:diagnostics_channel";

// channelName: string
// onMessage: (status: object, name: string) => void
export function defineAgent({ channelName, onMessage }) {
	diagnostics_channel.subscribe(channelName, onMessage);
}

// attemptsCount: integer
// channelName: string
export function negotiate({ attemptsCount, channelName }) {
	const channel = diagnostics_channel.channel(channelName);
	const status = {};

	if (channel.hasSubscribers) {
		channel.publish(status);
	}

	return status;
}
