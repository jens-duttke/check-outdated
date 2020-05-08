/**
 * @file Grouping of related test cases.
 */

const colorize = require('./colorize');

/**
 * Wrapper to group related test cases.
 *
 * @public
 * @param {string} title - The title of the group of tests.
 * @param {() => Promise<void>} tests - The function which contains the different test suites.
 * @returns {Promise<void>} The Promise is resolved with `void` as soon as all test suites are finished.
 */
async function describe (title, tests) {
	console.log();
	console.log(`${colorize.cyan(title.replace(/`(.+?)`/gu, colorize.underline('$1')))}`);
	console.log();

	await tests();
}

module.exports = {
	describe
};
