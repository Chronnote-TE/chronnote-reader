import { FluentBundle, FluentResource } from '@fluent/bundle';

import zotero from '../locales/en-US/zotero.ftl';
import reader from '../locales/en-US/reader.ftl';
import custom from '../locales/en-US/custom.ftl';

export let bundle = new FluentBundle('en-US', {
	functions: {
		PLATFORM: () => 'web',
	},
});

bundle.addResource(new FluentResource(zotero));
bundle.addResource(new FluentResource(reader));
bundle.addResource(new FluentResource(custom));

export function getLocalizedString(key, args = {}) {
	const message = bundle.getMessage(key);
	if (message && message.value) {
		return bundle.formatPattern(message.value, args);
	} else {
		// Attempt to resolve keys that use dot notation by converting to hyphenated IDs
		if (key.includes('.')) {
			const altKey = key.replace(/\./g, '-');
			const altMessage = bundle.getMessage(altKey);
			if (altMessage && altMessage.value) {
				return bundle.formatPattern(altMessage.value, args);
			}
		}
		console.warn(`Localization key '${key}' not found`);
		return key;
	}
}
