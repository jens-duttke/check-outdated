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

	for (let partIdx = 0; partIdx < Math.max(parts1.length, parts2.length); partIdx++) {
		if (parts1[partIdx] !== parts2[partIdx]) {
			if (parts1[partIdx]) { parts1[partIdx] = diffColorizers[0](parts1[partIdx]); }
			if (parts2[partIdx]) { parts2[partIdx] = diffColorizers[1](parts2[partIdx]); }
		}
		else {
			parts1[partIdx] = equalColorizers[0](parts1[partIdx]);
			parts2[partIdx] = equalColorizers[1](parts2[partIdx]);
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
 * @returns {'major' | 'minor' | 'patch' | 'prerelease' | 'build' | undefined} The type as `string`, or `undefined` on same version or invalid semver formats.
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

	if (parseInt(match1[1], 10) < parseInt(match2[1], 10)) {
		return 'major';
	}

	if (parseInt(match1[2], 10) < parseInt(match2[2], 10)) {
		return 'minor';
	}

	if (parseInt(match1[3], 10) < parseInt(match2[3], 10)) {
		return 'patch';
	}

	if (match2[4] === '-') {
		return 'prerelease';
	}

	if (match2[4] === '+') {
		return 'build';
	}

	return undefined;
}

module.exports = {
	semverDiff,
	semverDiffType
};
