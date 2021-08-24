/**
 * @file The expectation handers.
 */

const assert = require('assert').strict;
const fs = require('fs');

const { assertHasWord, assertNotHasWord } = require('./assert');
const colorize = require('./colorize');

const expectVarFileCache = {};

const sum = {
	passed: 0,
	failed: 0
};

/**
 * Returns the sum of the test `passed` and `failed`.
 *
 * @public
 * @returns {{ passed: number; failed: number; }} Object with the sum of the test `passed` and `failed.
 */
function getExpectResult () {
	return sum;
}

/**
 * Handle a specific test.
 *
 * @public
 * @param {string} message - The message which shall be shown if an assertion fails.
 * @param {() => void | never} assertion - A function which throws an error to indicate that an assertion fails.
 */
function expect (message, assertion) {
	const styledMessage = message.replace(/\n/gu, '\\n').replace(/`(.+?)`/gu, colorize.underline('$1'));

	/* eslint-disable no-console -- console.log() is used to output the test results */

	try {
		assertion();
	}
	catch (error) {
		const errorType = (error instanceof assert.AssertionError ? 'Test failed' : 'Error in code');

		console.log(`    ${colorize.red(`× ${styledMessage}`)}`);
		console.log();
		console.log(`      ${colorize.gray(`${errorType}: ${error.message.trim().replace(/\n/gu, '\n      ')}`)}`);
		console.log();

		if (error instanceof assert.AssertionError) {
			if (typeof error.expected === 'string' && typeof error.actual === 'string') {
				console.log(`      ${colorize.red(`- ${error.expected.replace(/\n/gu, '\n      ')}`)}`);
				console.log(`      ${colorize.green(`+ ${error.actual.replace(/\n/gu, '\n      ')}`)}`);
				console.log();
			}
		}

		console.log(`      ${colorize.gray((new Error('dummy').stack || '').split('\n').slice(2, 3).join('').trim())}`);
		console.log();

		sum.failed++;

		return;
	}

	console.log(`    ${colorize.green('√')} ${colorize.gray(styledMessage)}`);

	/* eslint-enable no-console */

	sum.passed++;
}

/**
 * Assert that only the specified number of dependencies is affected by a test suite.
 *
 * @public
 * @param {string} stdout - The process output.
 * @param {{ [name: string]: Partial<import('../../helper/dependencies').OutdatedDependency>; }} dependencies - The dependencies object.
 * @param {number} noOfAffectedDependencies - Number of dependencies which are effected by the test suite.
 * @returns {void}
 */
function expectNoOfAffectedDependencies (stdout, dependencies, noOfAffectedDependencies) {
	const dependencyValues = Object.values(dependencies);
	const noOfDepsLeft = dependencyValues.filter(({ latest }) => !latest || !['git', 'linked', 'remote'].includes(latest)).length - noOfAffectedDependencies;

	expect(
		`\`stdout\` should contain \`"${noOfDepsLeft} outdated dependencies found:"\``,
		() => assertHasWord(stdout, `${noOfDepsLeft} outdated dependencies found:`)
	);
}

/**
 * Assert that a variable matches a value.
 *
 * @public
 * @param {any} variable - The variable containing the actual value.
 * @param {any} value - The expected value.
 */
function expectVariableToEqual (variable, value) {
	expect(`\`${getFirstArgument()}\` should be \`${JSON.stringify(value)}\``, () => assert.equal(variable, value));
}

/**
 * Assert that a variable contains a word.
 *
 * @public
 * @param {any} variable - The variable containing the actual value.
 * @param {any} value - The expected value.
 * @param {boolean} [ignoreEscapeSequences=true] - ANSI escape sequences for coloring in `str` shall be ignored.
 */
function expectVariableToHaveWord (variable, value, ignoreEscapeSequences) {
	expect(
		`\`${getFirstArgument()}\` should contain ${(!ignoreEscapeSequences ? 'styled ' : '')}\`${JSON.stringify(value)}\``,
		() => assertHasWord(variable, value, ignoreEscapeSequences)
	);
}

/**
 * Assert that a variable does not contains a word.
 *
 * @public
 * @param {any} variable - The variable containing the actual value.
 * @param {any} value - The expected value.
 * @param {boolean} [ignoreEscapeSequences=true] - ANSI escape sequences for coloring in `str` shall be ignored.
 */
function expectVariableNotToHaveWord (variable, value, ignoreEscapeSequences = true) {
	expect(
		`\`${getFirstArgument()}\` should not contain ${(!ignoreEscapeSequences ? 'styled ' : '')}\`${JSON.stringify(value)}\``,
		() => assertNotHasWord(variable, value, ignoreEscapeSequences)
	);
}

/**
 * Determine the first arguments of a function call from source code.
 *
 * This code does some tricky code analysis to find the variable name.
 *
 * @private
 * @returns {string} Either the first argument or in red colored "[unknown argument]".
 */
function getFirstArgument () {
	const match = (/^\s+at\s(.+?):(\d+):(\d+)$/u).exec((new Error('dummy').stack || '').split('\n')[3]);

	if (match !== null) {
		const [, file, line, col] = match;

		let fileContent;

		if (file in expectVarFileCache) {
			fileContent = expectVarFileCache[file];
		}
		else {
			fileContent = fs.readFileSync(file, 'utf8').split('\n');

			expectVarFileCache[file] = fileContent;
		}

		const codeFromLine = fileContent.slice(Number.parseInt(line, 10) - 1).join(' ');
		const code = codeFromLine.substr(Number.parseInt(col, 10) - 1, codeFromLine.indexOf(';', Number.parseInt(col, 10)));

		const firstArgumentMatch = (/\(([^,)]+)/u).exec(code);

		if (firstArgumentMatch !== null) {
			return firstArgumentMatch[1].trim();
		}
	}

	return colorize.red('[unknown argument]');
}

module.exports = {
	getExpectResult,
	expect,
	expectNoOfAffectedDependencies,
	expectVarToEqual: expectVariableToEqual,
	expectVarToHaveWord: expectVariableToHaveWord,
	expectVarNotToHaveWord: expectVariableNotToHaveWord
};
