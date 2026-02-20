/**
 * @file The wrapper for a specific test suite.
 */

const colorize = require('./colorize');
const { stub } = require('./stub');

/** @typedef {import('../index').MockData} MockData */

/** @type {MockData | undefined} */
let mockData;

/**
 * Set the mocks used for simulating `fs` methods return values.
 *
 * @public
 * @param {MockData} newMockData - Mock data to stub native modules.
 */
function setMocks (newMockData) {
	mockData = newMockData;
}

/**
 * Create a test suite to test a specific "check-outdated" call.
 *
 * @public
 * @param {string} title - The title of the test suite.
 * @param {string[]} argv - Arguments which are used for the `check-outdated` call.
 * @param {any} dependencies - Mock of the `npm outdated --json` response.
 * @param {(command: string | undefined, exitCode: number, stdout: string) => void} expectedCallback - Callback with for the assertion functionality.
 * @param {{ [packageName: string]: { [version: string]: string } }} [npmTimeData] - Optional mock time data for npm view.
 * @returns {Promise<void>} The Promise is resolved with `void` as soon as the test suite is finished.
 */
async function test (title, argv, dependencies, expectedCallback, npmTimeData) {
	/* eslint-disable no-console -- console.log() is used to output the test results */
	console.log();
	console.log(`  ${JSON.stringify(argv)} ${title.replace(/\n/gu, String.raw`\n`).replace(/`(.+?)`/gu, colorize.underline('$1'))}`);
	console.log();
	/* eslint-enable no-console */

	let usedCommand;

	const checkOutdated = stub(mockData, dependencies, (command) => { usedCommand = command; }, npmTimeData);

	const unhookCapture = captureStdout();
	const exitCode = await checkOutdated(argv);
	const stdout = unhookCapture();

	expectedCallback(usedCommand, exitCode, stdout);
}

/**
 * Start capturing the output to process.stdout.
 *
 * @private
 * @returns {() => string} A callback function to stop the capturing, which returns the captured output as string.
 */
function captureStdout () {
	// eslint-disable-next-line @typescript-eslint/unbound-method -- We want to keep the `write` method as it is, without binding it
	const write = process.stdout.write;

	/** @type {string[]} */
	const data = [];

	process.stdout.write = (/** @type {string | Uint8Array} */ buffer) => {
		data.push(buffer.toString());

		return false;
	};

	return () => {
		process.stdout.write = write;

		return data.join('');
	};
}

module.exports = {
	setMocks,
	test
};
