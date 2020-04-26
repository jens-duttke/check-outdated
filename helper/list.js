/**
 * @file Generates a list from an array with key/value-pairs.
 */

/**
 * Generates a list from an array with key/value-pairs.
 * If the `value` is multiline text, each line will be prefixed by the `key`.
 *
 * @example
 * code ELIFECYCLE
 * errno 0
 * message Some additional
 * message multiline text.
 * additionalInfo null
 *
 * @param {[string, any][]} entries - Array with subarray containing key/value-pairs.
 * @returns {string} A multiline string containing representing the array items.
 */
function generateKeyValueList (entries) {
	return entries.map(([key, value]) => (typeof value === 'string' ? value : JSON.stringify(value, null, '  ')).replace(/^/gmu, `$&${key} `)).join('\n');
}

module.exports = generateKeyValueList;
