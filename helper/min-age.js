/**
 * @file Filters outdated dependencies by minimum version age using npm registry timestamps.
 */

const childProcess = require('child_process');

/**
 * Version timestamps as returned by `npm view <package> time --json`.
 *
 * @typedef {{ [version: string]: string }} VersionTimestamps
 */

/**
 * @typedef {import('./dependencies').OutdatedDependency} OutdatedDependency
 */

/**
 * Result of applying the min-age filter.
 *
 * @typedef {object} MinAgeFilterResult
 * @property {OutdatedDependency[]} dependencies - Filtered and modified dependencies.
 * @property {string[]} warnings - Warning messages for packages where time data was unavailable.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Compares two semantic version strings numerically by major.minor.patch.
 * Pre-release versions (containing `-`) are considered lower than the same release version.
 *
 * @param {string} a - First version string.
 * @param {string} b - Second version string.
 * @returns {number} Negative if a < b, positive if a > b, 0 if equal or incomparable.
 */
function semverCompare (a, b) {
	const semverRegExp = /^(\d+)\.(\d+)\.(\d+)/u;

	const matchA = semverRegExp.exec(a);
	const matchB = semverRegExp.exec(b);

	if (matchA === null || matchB === null) {
		return 0;
	}

	for (let i = 1; i <= 3; i++) {
		const diff = Number.parseInt(matchA[i], 10) - Number.parseInt(matchB[i], 10);

		if (diff !== 0) {
			return diff;
		}
	}

	// Same major.minor.patch - pre-release is lower than release
	const aIsPrerelease = (a.length > /** @type {string} */(matchA[0]).length && a.charAt(/** @type {string} */(matchA[0]).length) === '-');
	const bIsPrerelease = (b.length > /** @type {string} */(matchB[0]).length && b.charAt(/** @type {string} */(matchB[0]).length) === '-');

	if (aIsPrerelease && !bIsPrerelease) {
		return -1;
	}

	if (!aIsPrerelease && bIsPrerelease) {
		return 1;
	}

	return 0;
}

/**
 * Fetches version timestamps from the npm registry for a given package.
 *
 * @param {string} packageName - The npm package name (may be scoped, e.g. `@scope/pkg`).
 * @returns {Promise<VersionTimestamps | null>} The version timestamps, or `null` if unavailable.
 */
async function fetchVersionTimestamps (packageName) {
	return new Promise((resolve) => {
		childProcess.exec(`npm view ${packageName} time --json`, (error, stdout) => {
			if (error || !stdout) {
				resolve(null);

				return;
			}

			try {
				const parsed = JSON.parse(stdout);

				if (typeof parsed !== 'object' || parsed === null) {
					resolve(null);

					return;
				}

				resolve(parsed);
			}
			catch {
				resolve(null);
			}
		});
	});
}

/**
 * Finds the highest version from a list of versions that meets the minimum age requirement.
 *
 * @param {VersionTimestamps} timestamps - Version timestamps from the registry.
 * @param {number} minAgeMs - Minimum age in milliseconds.
 * @param {number} now - Current timestamp in milliseconds.
 * @param {string} [maxVersion] - If provided, only consider versions <= this version.
 * @returns {string | undefined} The highest qualifying version, or `undefined` if none qualifies.
 */
function findBestQualifiedVersion (timestamps, minAgeMs, now, maxVersion) {
	const semverRegExp = /^\d+\.\d+\.\d+/u;

	const qualifiedVersions = Object.keys(timestamps)
		.filter((key) => semverRegExp.test(key))
		.filter((version) => {
			const publishDate = new Date(timestamps[version]).getTime();

			return (now - publishDate) >= minAgeMs;
		})
		.filter((version) => {
			if (maxVersion === undefined) {
				return true;
			}

			return (semverCompare(version, maxVersion) <= 0);
		})
		.sort(semverCompare);

	if (qualifiedVersions.length > 0) {
		return qualifiedVersions[qualifiedVersions.length - 1];
	}

	return undefined;
}

/**
 * Extracts the major and minor version numbers from a version string.
 *
 * @param {string} version - A semantic version string (e.g. "1.2.3").
 * @returns {{ major: number; minor: number } | null} The major and minor components, or `null` if parsing failed.
 */
function extractMajorMinor (version) {
	const match = (/^(\d+)\.(\d+)\./u).exec(version);

	if (match === null) {
		return null;
	}

	return {
		major: Number.parseInt(/** @type {string} */(match[1]), 10),
		minor: Number.parseInt(/** @type {string} */(match[2]), 10)
	};
}

/**
 * Finds the newest patch version within a specific major.minor line that meets the patch age requirement.
 *
 * @param {VersionTimestamps} timestamps - Version timestamps from the registry.
 * @param {{ major: number; minor: number }} majorMinor - The major and minor version to match.
 * @param {number} minAgePatchMs - Minimum patch age in milliseconds.
 * @param {number} now - Current timestamp in milliseconds.
 * @param {string} [maxVersion] - If provided, only consider versions <= this version.
 * @returns {string | undefined} The newest qualifying patch version, or `undefined` if none qualifies.
 */
function findBestPatchInLine (timestamps, majorMinor, minAgePatchMs, now, maxVersion) {
	const semverRegExp = /^(\d+)\.(\d+)\.(\d+)/u;

	const patchVersions = Object.keys(timestamps)
		.filter((key) => {
			const match = semverRegExp.exec(key);

			if (match === null) {
				return false;
			}

			return (Number.parseInt(/** @type {string} */(match[1]), 10) === majorMinor.major && Number.parseInt(/** @type {string} */(match[2]), 10) === majorMinor.minor);
		})
		.filter((version) => {
			const publishDate = new Date(timestamps[version]).getTime();

			return (now - publishDate) >= minAgePatchMs;
		})
		.filter((version) => {
			if (maxVersion === undefined) {
				return true;
			}

			return (semverCompare(version, maxVersion) <= 0);
		})
		.sort(semverCompare);

	if (patchVersions.length > 0) {
		return patchVersions[patchVersions.length - 1];
	}

	return undefined;
}

/**
 * Applies the minimum age filter to a list of outdated dependencies.
 *
 * Uses a two-step version selection process:
 * 1. Determines the highest Major.Minor line where at least one version satisfies `--min-age`.
 * 2. Within that Major.Minor line, selects the newest patch that satisfies `--min-age-patch` (default 0).
 *
 * This ensures that bug-fix patches within a qualifying release line are recommended even if they are very recent,
 * since patches typically carry low risk and fix known issues.
 *
 * If timestamp data cannot be fetched (e.g. private registry), the dependency is kept unmodified (fallback).
 *
 * @param {OutdatedDependency[]} dependencies - Array of outdated dependencies.
 * @param {number} minAgeDays - Minimum age in days for determining the qualifying Major.Minor line.
 * @param {number} [minAgePatchDays=0] - Minimum age in days for patches within the qualifying line.
 * @returns {Promise<MinAgeFilterResult>} Filtered dependencies and any warnings.
 */
async function applyMinAgeFilter (dependencies, minAgeDays, minAgePatchDays = 0) {
	const now = Date.now();
	const minAgeMs = minAgeDays * MS_PER_DAY;
	const minAgePatchMs = minAgePatchDays * MS_PER_DAY;

	/** @type {string[]} */
	const warnings = [];

	const results = await Promise.all(dependencies.map(async (dependency) => {
		const timestamps = await fetchVersionTimestamps(dependency.resolvedName);

		if (timestamps === null) {
			// Fallback: cannot fetch timestamps, show dependency without age filter
			warnings.push(`Could not retrieve time data for "${dependency.resolvedName}". Showing without age filter.`);

			return dependency;
		}

		// Step 1: Find the highest version that satisfies --min-age (determines the Major.Minor line)
		const bestByAge = findBestQualifiedVersion(timestamps, minAgeMs, now);

		if (bestByAge === undefined) {
			// No version qualifies at all
			return null;
		}

		// Step 2: Within that Major.Minor line, find the newest patch that satisfies --min-age-patch
		let bestLatest = bestByAge;
		const majorMinor = extractMajorMinor(bestByAge);

		if (majorMinor !== null) {
			const bestPatch = findBestPatchInLine(timestamps, majorMinor, minAgePatchMs, now);

			if (bestPatch !== undefined) {
				bestLatest = bestPatch;
			}
		}

		// If the best version is not newer than current, no update available
		if (dependency.current !== '' && semverCompare(bestLatest, dependency.current) <= 0) {
			return null;
		}

		/** @type {OutdatedDependency} */
		const newDependency = { ...dependency, latest: bestLatest };

		// Also filter wanted using the same two-step logic
		if (dependency.wanted !== '' && dependency.wanted !== dependency.current) {
			const wantedTimestamp = timestamps[dependency.wanted];

			if (wantedTimestamp && (now - new Date(wantedTimestamp).getTime()) < minAgeMs) {
				const bestWantedByAge = findBestQualifiedVersion(timestamps, minAgeMs, now, dependency.wanted);

				if (bestWantedByAge !== undefined) {
					let bestWanted = bestWantedByAge;
					const wantedMajorMinor = extractMajorMinor(bestWantedByAge);

					if (wantedMajorMinor !== null) {
						const bestWantedPatch = findBestPatchInLine(timestamps, wantedMajorMinor, minAgePatchMs, now, dependency.wanted);

						if (bestWantedPatch !== undefined) {
							bestWanted = bestWantedPatch;
						}
					}

					if (dependency.current === '' || semverCompare(bestWanted, dependency.current) > 0) {
						newDependency.wanted = bestWanted;
					}
					else {
						newDependency.wanted = dependency.current;
					}
				}
				else {
					newDependency.wanted = dependency.current;
				}
			}
		}

		return newDependency;
	}));

	return {
		dependencies: /** @type {OutdatedDependency[]} */(results.filter((dependency) => dependency !== null)),
		warnings
	};
}

module.exports = {
	applyMinAgeFilter,
	semverCompare,
	findBestQualifiedVersion
};
