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
 * @returns {'major' | 'minor' | 'patch' | 'prerelease' | 'build' | 'revert' | undefined} The type as `string`, or `undefined` on same version or invalid semver formats.
 */
function semverDiffType (v1, v2) {
	if (v1 === v2) {
		return;
	}

	const semverRegExp = /^(\d+).(\d+).(\d+).*?(?:([-+]).+)?$/u;

	const match1 = semverRegExp.exec(v1);

	if (match1 === null) {
		return;
	}

	const match2 = semverRegExp.exec(v2);

	if (match2 === null) {
		return;
	}

	if (Number.parseInt(match2[1], 10) > Number.parseInt(match1[1], 10)) {
		return 'major';
	}

	if (Number.parseInt(match2[1], 10) < Number.parseInt(match1[1], 10)) {
		return 'revert';
	}

	if (Number.parseInt(match2[2], 10) > Number.parseInt(match1[2], 10)) {
		return 'minor';
	}

	if (Number.parseInt(match2[2], 10) < Number.parseInt(match1[2], 10)) {
		return 'revert';
	}

	if (Number.parseInt(match2[3], 10) > Number.parseInt(match1[3], 10)) {
		return 'patch';
	}

	if (Number.parseInt(match2[3], 10) < Number.parseInt(match1[3], 10)) {
		return 'revert';
	}

	if (match2[4] === '-') {
		return 'prerelease';
	}

	if (match2[4] === '+') {
		return 'build';
	}

	return;
}

module.exports = {
	semverDiff,
	semverDiffType
};
