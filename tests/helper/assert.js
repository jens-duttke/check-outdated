/**
 * @file Assertion methods.
 */

const assert = require('assert').strict;

/**
 * Assert that a string contains a specific word, considering word boundaries.
 *
 * @public
 * @param {string} str - The source string.
 * @param {string} word - A word which shall be part of the `str`.
 * @param {boolean} [ignoreEscapeSequences=true] - ANSI escape sequences for coloring in `str` shall be ignored.
 * @returns {void}
 * @throws {assert.AssertionError}
 */
function assertHasWord (str, word, ignoreEscapeSequences = true) {
	if (!hasWord(str, word, ignoreEscapeSequences)) {
		throw new assert.AssertionError({
			message: 'Input A expected to include word input B',
			actual: str,
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
 * @param {string} str - The source string.
 * @param {string} word - A word which shall not be part of `str`.
 * @param {boolean} [ignoreEscapeSequences=true] - ANSI escape sequences for coloring in `str` shall be ignored.
 * @returns {void}
 * @throws {assert.AssertionError}
 */
function assertNotHasWord (str, word, ignoreEscapeSequences = true) {
	if (hasWord(str, word, ignoreEscapeSequences)) {
		throw new assert.AssertionError({
			message: 'Input A expected to not include word input B',
			actual: str,
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
 * @param {string} str - The source string.
 * @param {string} word - A word which shall be part of `str`.
 * @param {boolean} ignoreEscapeSequences - ANSI escape sequences for coloring in `str` shall be ignored.
 * @returns {boolean} If `str` contains `word`, `true` is returned, otherwise `false`.
 */
function hasWord (str, word, ignoreEscapeSequences) {
	return new RegExp(`(^|[^A-Za-z0-9$-_])${escapeRegExp(word)}($|[^A-Za-z0-9$-_])`, 'um').test(ignoreEscapeSequences ? str.replace(/\x1b\[.+?m/gu, '') : str);
}

/**
 * Escape string to use it as part of a RegExp pattern.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
 *
 * @private
 * @param {string} str - The source string.
 * @returns {string} The escaped string.
 */
function escapeRegExp (str) {
	return str.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

module.exports = {
	assertHasWord,
	assertNotHasWord
};
