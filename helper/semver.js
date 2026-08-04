/**
 * @file Different functionality to work with semantic version numbers.
 */

/** @typedef {import('./colorize').ColorizeProperty} ColorizeProperty */

/**
 * Colorize differences in parts of two semantic version numbers.
 *
 * @public
 * @param {readonly [string, string]} versions - Version numbers to compare.
 * @param {readonly [ColorizeProperty, ColorizeProperty]} equalColorizers - Styles for the first and second version number, for equal parts.
 * @param {readonly [ColorizeProperty, ColorizeProperty]} diffColorizers - Styles for the first and second version number, for unequal parts.
 * @returns {[string, string]} The colorized version numbers, in the same order as the input `versions` array.
 */
function semverDiff (versions, equalColorizers, diffColorizers) {
	const splitRegExp = /([.+-])/u;
	const parts1 = versions[0].split(splitRegExp);
	const parts2 = versions[1].split(splitRegExp);

	for (let partIndex = 0; partIndex < Math.max(parts1.length, parts2.length); partIndex++) {
		if (parts1[partIndex] !== parts2[partIndex]) {
			if (parts1[partIndex]) { parts1[partIndex] = diffColorizers[0](parts1[partIndex]); }
			if (parts2[partIndex]) { parts2[partIndex] = diffColorizers[1](parts2[partIndex]); }
		}
		else {
			parts1[partIndex] = equalColorizers[0](parts1[partIndex]);
			parts2[partIndex] = equalColorizers[1](parts2[partIndex]);
		}
	}

	return [parts1.join(''), parts2.join('')];
}

/**
 * Returns the type of the difference between two semantic version numbers.
 *
 * @public
 * @param {string} v1 - First version.
 * @param {string} v2 - Second version.
 * @returns {'major' | 'minor' | 'patch' | 'prerelease' | 'build' | 'reverted' | undefined} The type as `string`, or `undefined` on same version or invalid semver formats.
 */
function semverDiffType (v1, v2) {
	if (v1 === v2) {
		return undefined;
	}

	const semverRegExp = /^(\d+).(\d+).(\d+).*?(?:([-+]).+)?$/u;

	const match1 = semverRegExp.exec(v1);

	if (match1 === null) {
		return undefined;
	}

	const match2 = semverRegExp.exec(v2);

	if (match2 === null) {
		return undefined;
	}

	if (Number.parseInt(match2[1], 10) > Number.parseInt(match1[1], 10)) {
		return 'major';
	}

	if (Number.parseInt(match2[1], 10) < Number.parseInt(match1[1], 10)) {
		return 'reverted';
	}

	if (Number.parseInt(match2[2], 10) > Number.parseInt(match1[2], 10)) {
		return 'minor';
	}

	if (Number.parseInt(match2[2], 10) < Number.parseInt(match1[2], 10)) {
		return 'reverted';
	}

	if (Number.parseInt(match2[3], 10) > Number.parseInt(match1[3], 10)) {
		return 'patch';
	}

	if (Number.parseInt(match2[3], 10) < Number.parseInt(match1[3], 10)) {
		return 'reverted';
	}

	// The pre-release or build marker of either version makes the difference (e.g. "1.0.0-beta.1" to "1.0.0" is a prerelease update)
	if (match2[4] === '-' || match1[4] === '-') {
		return 'prerelease';
	}

	if (match2[4] === '+' || match1[4] === '+') {
		return 'build';
	}

	return undefined;
}

/**
 * Checks if a semver range pattern matches to a specific version.
 *
 * @public
 * @param {string} version - The version to check
 * @param {string} pattern - A semver range pattern
 * @returns {boolean} `true` if the range pattern matches, otherwise `false`.
 */
function semverInRange (version, pattern) {
	const semverRangeRegExp = /^([\^~])?(?:(\d+|\*|x)?(?:\.(\d+|\*|x))?(?:\.(\d+|\*|x))?)?$/u;

	/** @type {(string | undefined)[] | null} */
	const match = semverRangeRegExp.exec(pattern);

	if (match === null) {
		return (version === pattern);
	}

	if (match[2] === '*' || match[2] === 'x') {
		return true;
	}

	const splitRegExp = /[.+-]/u;
	const parts = version.split(splitRegExp);

	if (match[1] === '^') {
		return caretRangeMatches(parts, match);
	}

	if (match[3] === '*' || match[3] === 'x') {
		return (parts[0] === match[2]);
	}

	if (match[1] === '~') {
		return (parts[0] === match[2] && (match[3] === undefined || parts[1] === match[3]) && (match[4] === undefined || Number.parseInt(parts[2], 10) >= Number.parseInt(match[4], 10)));
	}

	if (match[4] === '*' || match[4] === 'x') {
		return (parts[0] === match[2] && parts[1] === match[3]);
	}

	if (match[3] === undefined) {
		return (parts[0] === match[2]);
	}

	if (match[4] === undefined) {
		return (parts[0] === match[2] && parts[1] === match[3]);
	}

	return (version === pattern);
}

/**
 * Checks if a caret range pattern matches a specific version.
 *
 * A caret range allows changes that do not modify the left-most non-zero element (e.g. `^2.3.4` means `>=2.3.4 <3.0.0`, `^0.2.3` means `>=0.2.3 <0.3.0`, `^0.0.3` means `0.0.3`).
 *
 * @private
 * @param {string[]} parts - The parts of the version to check (`[major, minor, patch, ...]`).
 * @param {(string | undefined)[]} match - The matches of `semverRangeRegExp` for the range pattern.
 * @returns {boolean} `true` if the caret range matches, otherwise `false`.
 */
function caretRangeMatches (parts, match) {
	if (parts[0] !== match[2]) {
		return false;
	}

	if (match[3] === undefined || ['*', 'x'].includes(match[3])) {
		return true;
	}

	// For major version zero, the caret narrows to the minor line (^0.2.3 means >=0.2.3 <0.3.0)
	if (match[2] === '0') {
		if (parts[1] !== match[3]) {
			return false;
		}

		if (match[4] === undefined || ['*', 'x'].includes(match[4])) {
			return true;
		}

		// For major and minor version zero, the caret only matches the exact version (^0.0.3 means 0.0.3)
		if (match[3] === '0') {
			return (parts[2] === match[4]);
		}

		return (Number.parseInt(parts[2], 10) >= Number.parseInt(match[4], 10));
	}

	if (parts[1] !== match[3]) {
		return (Number.parseInt(parts[1], 10) > Number.parseInt(match[3], 10));
	}

	if (match[4] === undefined || ['*', 'x'].includes(match[4])) {
		return true;
	}

	return (Number.parseInt(parts[2], 10) >= Number.parseInt(match[4], 10));
}

module.exports = {
	semverDiff,
	semverDiffType,
	semverInRange
};
