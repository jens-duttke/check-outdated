/**
 * @file Helper functionality to work with regular expressions.
 */

/**
 * Escape strings for use in regular expressions.
 *
 * @public
 * @param {string} string - The input string.
 * @param {RegExp} regexp - The regular expression used for the search.
 * @returns {[number, number]} The first value represents the line, the second value the column.
 */
function getRegExpPosition (string, regexp) {
	let pos = string.search(regexp);

	if (pos !== -1) {
		const lines = string.split('\n');
		let line;
		let count = 0;

		for (line = 0; line < lines.length; line++) {
			const lineLength = lines[line].length;

			if (count + lineLength >= pos) {
				break;
			}

			count += lineLength;

			// Fix to compensate line break
			pos--;
		}

		if (line < lines.length) {
			return [
				line + 1,
				(pos - count) + 1
			];
		}
	}

	return [0, 0];
}

/**
 * Escape strings for use in regular expressions.
 *
 * @public
 * @param {string} string - The input string.
 * @returns {string} The escaped output string.
 */
function escapeRegExp (string) {
	return string.replace(/([[\\^$.|?*+()])/gu, '\\$1');
}

module.exports = {
	getRegExpPosition,
	escapeRegExp
};
