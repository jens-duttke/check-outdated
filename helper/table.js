/**
 * @file Converts a two-dimensional array into an styled table with aligned columns.
 */

/**
 * Table column setup for a tabularly visualization of data.
 *
 * @typedef {object} TableColumn
 * @property {string} text
 * @property {string} [style]
 * @property {boolean} [alignRight]
 */

/**
 * Array contains rows, contain columns, for a tabularly visualization of data.
 *
 * @typedef {(string | (TableColumn | string)[])[]} Table
 */

/**
 * Converts a two-dimensional array into an styled table with aligned columns.
 *
 * @public
 * @param {Table} table - Two-dimensional array which shall be shown in a table with aligned columns.
 * @returns {string} Multiline string containing the table.
 */
function prettifyTable (table) {
	const out = [];

	// eslint-disable-next-line unicorn/no-array-reduce -- Let's keep the `reduce()` here, to keep the code simple.
	const colWidths = table.reduce(colWidthReducer, []);

	for (let row = 0; row < table.length; row++) {
		if (row > 0) {
			out.push('\n');
		}

		if (typeof table[row] === 'string') {
			out.push(table[row]);
		}
		else {
			for (let col = 0; col < table[row].length; col++) {
				const content = table[row][col];
				const { text, alignRight = false } = (typeof content === 'object' ? content : { text: content });

				if (col > 0) {
					out.push('  ');
				}

				if (alignRight) {
					out.push(' '.repeat(colWidths[col] - plainLength(text)));
				}

				out.push(text);

				if (!alignRight) {
					out.push(' '.repeat(colWidths[col] - plainLength(text)));
				}
			}
		}
	}

	return out.join('');
}

/**
 * Used as `Array.reduce()` callback function to find the longest string per column in a `Table`.
 *
 * @private
 * @param {readonly number[]} widths - `Array.reduce()` accumulator, which is filled with the maximal text lengths per column.
 * @param {(string | readonly (string | TableColumn)[])} row - A single row containing the columns of a `Table`.
 * @returns {readonly number[]} Updated version of `widths` containing the new maximal text lengths, considering the current `row`.
 */
function colWidthReducer (widths, row) {
	if (typeof row === 'string') {
		return widths;
	}

	return row.map((col, colIndex) => Math.max(plainLength(typeof col === 'object' ? col.text : col), widths[colIndex] || 0));
}

/**
 * Get the length of a string without ANSI escape sequences for coloring.
 *
 * @private
 * @param {string} string - Input string containing ANSI escape sequences for coloring.
 * @returns {number} The text length of `str` without the ANSI escape sequences.
 */
function plainLength (string) {
	return string.replace(/\u001B\[.+?m/gu, '').length;
}

module.exports = prettifyTable;
