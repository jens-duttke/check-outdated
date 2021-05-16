/**
 * @file Assertion methods.
 */

const assert = require('assert').strict;

/**
 * Assert that a string contains a specific word, considering word boundaries.
 *
 * @public
 * @param {string} string - The source string.
 * @param {string} word - A word which shall be part of the `str`.
 * @param {boolean} [ignoreEscapeSequences=true] - ANSI escape sequences for coloring in `str` shall be ignored.
 * @returns {void}
 * @throws {assert.AssertionError}
 */
function assertHasWord (string, word, ignoreEscapeSequences = true) {
	if (!hasWord(string, word, ignoreEscapeSequences)) {
		throw new assert.AssertionError({
			message: 'Input A expected to include word input B',
			actual: string,
			expected: word,
			operator: 'assertHasWord',
			stackStartFn: assertHasWord
		});
	}
}

/**
 * Assert that a string does not contains a specific word, considering word boundaries.
 *
 * @public
 * @param {string} string - The source string.
 * @param {string} word - A word which shall not be part of `str`.
 * @param {boolean} [ignoreEscapeSequences=true] - ANSI escape sequences for coloring in `str` shall be ignored.
 * @returns {void}
 * @throws {assert.AssertionError}
 */
function assertNotHasWord (string, word, ignoreEscapeSequences = true) {
	if (hasWord(string, word, ignoreEscapeSequences)) {
		throw new assert.AssertionError({
			message: 'Input A expected to not include word input B',
			actual: string,
			expected: word,
			operator: 'assertNotHasWord',
			stackStartFn: assertNotHasWord
		});
	}
}

/**
 * Returns true if the given string contains a specific word, considering word boundaries.
 *
 * @private
 * @param {string} string - The source string.
 * @param {string} word - A word which shall be part of `str`.
 * @param {boolean} ignoreEscapeSequences - ANSI escape sequences for coloring in `str` shall be ignored.
 * @returns {boolean} If `str` contains `word`, `true` is returned, otherwise `false`.
 */
function hasWord (string, word, ignoreEscapeSequences) {
	return new RegExp(`(^|[^A-Za-z0-9$-_])${escapeRegExp(word)}($|[^A-Za-z0-9$-_])`, 'um').test(ignoreEscapeSequences ? string.replace(/\u001B\[.+?m/gu, '') : string);
}

/**
 * Escape string to use it as part of a RegExp pattern.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
 *
 * @private
 * @param {string} string - The source string.
 * @returns {string} The escaped string.
 */
function escapeRegExp (string) {
	return string.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

module.exports = {
	assertHasWord,
	assertNotHasWord
};
