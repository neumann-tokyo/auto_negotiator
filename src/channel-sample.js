import * as diagnostics_channel from "node:diagnostics_channel";

const channelName = "my-channel";

export function subscribe({ id, fn }) {
	const onMessage = (data, _name) => {
		fn(id, data);
	};

	diagnostics_channel.subscribe(channelName, onMessage);
}

export function publish(data) {
	const channel = diagnostics_channel.channel(channelName);
	if (channel.hasSubscribers) {
		channel.publish(data);
	}
}
