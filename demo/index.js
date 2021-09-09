/**
 * @file Create a demo result for the `screenshot.png`
 */

const { stub } = require('../tests/helper/stub');

const mockData = /** @type {import('../tests/index').MockData} */(require('./mock-data.json'));

const checkOutdated = stub(mockData, mockData.defaultResponse);

/** @type {string[]} */
const argv = [];

void (async () => {
	// eslint-disable-next-line no-console -- Add some spacing for the screenshot
	console.log();

	await checkOutdated(argv);

	// eslint-disable-next-line no-console -- Add some spacing for the screenshot
	console.log();
})();
