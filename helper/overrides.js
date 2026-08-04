/**
 * @file Checks version pins in the "overrides" (npm) and "resolutions" (Yarn) fields of the package.json for outdated versions.
 */

const childProcess = require('child_process');

const { getDependencyPackageJSON, parsePackageJSON, readFileCached } = require('./files');
const { isPrerelease, semverCompare } = require('./min-age');
const { semverInRange } = require('./semver');

/**
 * @typedef {import('./dependencies').OutdatedDependency} OutdatedDependency
 */

/**
 * A version pin, extracted from the "overrides" or "resolutions" field of the package.json.
 *
 * @typedef {object} VersionPin
 * @property {string} name - The name of the pinned package.
 * @property {string} resolvedName - The real package name, which differs from `name` for aliased pins (e.g. `"npm:real-pkg@1.0.0"`).
 * @property {string} specKey - The literal key in the package.json (e.g. the glob path of a Yarn resolution, or a version-qualified key like `"pkg@2.0.0"`).
 * @property {string} spec - The literal value in the package.json (e.g. `"1.0.0"` or `"npm:real-pkg@1.0.0"`).
 * @property {string} range - The version or version range used to determine the wanted version (equals `spec`, except for aliased pins).
 * @property {'overrides' | 'resolutions'} type - The package.json field the pin originates from.
 */

/**
 * Version information of a package, as returned by `npm view <package> dist-tags.latest versions --json`.
 *
 * @typedef {object} RegistryVersionInfo
 * @property {string} latest - The version tagged as "latest" in the registry.
 * @property {string[]} versions - All published versions.
 */

/**
 * Result of checking the version pins.
 *
 * @typedef {object} PinnedDependenciesResult
 * @property {OutdatedDependency[]} dependencies - Outdated version pins, in the shape of `npm outdated` dependencies.
 * @property {string[]} warnings - Warning messages for packages where version data was unavailable.
 */

// Version specifiers which can be checked against the registry: an optional caret/tilde, followed by a version whose minor/patch part may be a wildcard (e.g. "1.0.0", "^1.2", "~1.2.3", "1.2.x", "1.0.0-beta.1")
const CHECKABLE_RANGE_REGEXP = /^[\^~]?\d+(?:\.(?:\d+|x|\*))?(?:\.(?:\d+|x|\*))?(?:[+-].+)?$/u;

/**
 * Checks the version pins in the "overrides" and "resolutions" fields of the package.json for outdated versions.
 *
 * Pins which don't manage an own version number are skipped: references to other dependencies (e.g. `"$pkg"`),
 * wildcard specifiers (`"*"`) and non-registry specifiers (e.g. `git:`, `file:` or complex ranges).
 *
 * @public
 * @param {{ readonly global?: boolean; readonly ignoreResolutionDependencies?: boolean; }} options - The arguments which the user provided.
 * @returns {Promise<PinnedDependenciesResult>} Outdated version pins and warnings for packages where version data was unavailable.
 */
async function getOutdatedPinnedDependencies (options) {
	// Version pins in the local package.json don't apply to globally installed packages
	if (options.global || options.ignoreResolutionDependencies) {
		return { dependencies: [], warnings: [] };
	}

	const pins = extractVersionPins();

	/** @type {string[]} */
	const packageNames = [];

	for (const pin of pins) {
		if (!packageNames.includes(pin.resolvedName)) {
			packageNames.push(pin.resolvedName);
		}
	}

	const registryInfos = await Promise.all(packageNames.map(async (packageName) => ({
		packageName,
		info: await fetchRegistryVersionInfo(packageName)
	})));

	/** @type {{ [packageName: string]: RegistryVersionInfo | null; }} */
	const registryInfoByName = {};

	for (const { packageName, info } of registryInfos) {
		registryInfoByName[packageName] = info;
	}

	/** @type {OutdatedDependency[]} */
	const dependencies = [];

	/** @type {string[]} */
	const warnings = [];

	for (const pin of pins) {
		const registryInfo = registryInfoByName[pin.resolvedName];

		if (registryInfo === null) {
			const warning = `Could not retrieve version data for "${pin.resolvedName}". Ignoring the version pins of this package.`;

			if (!warnings.includes(warning)) {
				warnings.push(warning);
			}

			continue;
		}

		const dependency = createOutdatedDependency(pin, registryInfo);

		if (dependency !== undefined) {
			dependencies.push(dependency);
		}
	}

	return { dependencies, warnings };
}

/**
 * Extracts all checkable version pins from the "overrides" and "resolutions" fields of the package.json in the current working directory.
 *
 * @private
 * @returns {VersionPin[]} The extracted version pins.
 */
function extractVersionPins () {
	/** @type {VersionPin[]} */
	const pins = [];

	const packageJSONContent = readFileCached('package.json');

	if (packageJSONContent === undefined) {
		return pins;
	}

	const json = parsePackageJSON(packageJSONContent);

	if (typeof json !== 'object' || json === null) {
		return pins;
	}

	if (typeof json.overrides === 'object' && json.overrides !== null) {
		collectOverridePins(json.overrides, undefined, pins);
	}

	if (typeof json.resolutions === 'object' && json.resolutions !== null) {
		for (const [key, value] of Object.entries(json.resolutions)) {
			addVersionPin(pins, getResolutionPackageName(key), key, value, 'resolutions');
		}
	}

	return pins;
}

/**
 * Recursively collects version pins from an npm "overrides" object.
 *
 * @private
 * @param {{ [key: string]: any; }} overrides - The "overrides" object, or a nested override object within it.
 * @param {string | undefined} parentName - The package name of the surrounding override object, used to resolve `"."` keys.
 * @param {VersionPin[]} pins - The array to which found version pins are added.
 * @returns {void}
 */
function collectOverridePins (overrides, parentName, pins) {
	for (const [key, value] of Object.entries(overrides)) {
		// A "." key pins the version of the package of the surrounding override object itself
		const name = (key === '.' ? parentName : stripVersionQualifier(key));

		if (typeof value === 'string') {
			addVersionPin(pins, name, key, value, 'overrides');
		}
		else if (typeof value === 'object' && value !== null) {
			collectOverridePins(value, name, pins);
		}
	}
}

/**
 * Validates a single version pin and adds it to the given array.
 *
 * @private
 * @param {VersionPin[]} pins - The array to which the version pin is added.
 * @param {string | undefined} name - The name of the pinned package.
 * @param {string} specKey - The literal key in the package.json.
 * @param {any} spec - The literal value in the package.json.
 * @param {'overrides' | 'resolutions'} type - The package.json field the pin originates from.
 * @returns {void}
 */
function addVersionPin (pins, name, specKey, spec, type) {
	if (name === undefined || typeof spec !== 'string') {
		return;
	}

	let resolvedName = name;
	let range = spec;

	// Aliased pins (e.g. "npm:real-pkg@1.0.0") pin the version of another registry package
	const aliasMatch = (/^npm:(.+)@([^@]+)$/u).exec(spec);

	if (aliasMatch !== null) {
		resolvedName = aliasMatch[1];
		range = aliasMatch[2];
	}

	// References to other dependencies (e.g. "$pkg") don't manage an own version number
	if (range.startsWith('$')) {
		return;
	}

	// A wildcard specifier accepts any version, so it can never be outdated
	if (range === '*' || range === 'x') {
		return;
	}

	// Non-registry specifiers (e.g. git:, file:, https:) and complex ranges (e.g. ">=1.2.3 <2") cannot be checked
	if (!CHECKABLE_RANGE_REGEXP.test(range)) {
		return;
	}

	// The same package can be pinned to the same version at multiple positions (e.g. below different packages); one entry is sufficient
	if (pins.some((pin) => (pin.name === name && pin.spec === spec && pin.type === type))) {
		return;
	}

	pins.push({ name, resolvedName, specKey, spec, range, type });
}

/**
 * Removes the version qualifier from an npm "overrides" key (e.g. `"pkg@2.0.0"` or `"@scope/pkg@^2"`).
 *
 * @private
 * @param {string} key - A key of an npm "overrides" object.
 * @returns {string} The package name without the version qualifier.
 */
function stripVersionQualifier (key) {
	const match = (/^(@?[^@]+)/u).exec(key);

	if (match === null) {
		return key;
	}

	return match[1];
}

/**
 * Returns the package name of a Yarn "resolutions" key, which may be prefixed with a glob path (e.g. `"d2/left-pad"` or a globstar path).
 *
 * @private
 * @param {string} key - A key of a Yarn "resolutions" object.
 * @returns {string | undefined} The package name, or `undefined` if the key does not end with a package name.
 */
function getResolutionPackageName (key) {
	const segments = key.split('/');
	const lastSegment = segments[segments.length - 1];

	// Scoped package names consist of two segments (e.g. the last two segments of a glob path like "c/globstar/@scope/pkg")
	if (segments.length > 1 && segments[segments.length - 2].startsWith('@')) {
		return `${segments[segments.length - 2]}/${lastSegment}`;
	}

	if (lastSegment === '' || lastSegment === '*' || lastSegment === '**' || lastSegment.startsWith('@')) {
		return undefined;
	}

	return lastSegment;
}

/**
 * Fetches the latest version and the list of all published versions from the npm registry for a given package.
 *
 * @private
 * @param {string} packageName - The npm package name (may be scoped, e.g. `@scope/pkg`).
 * @returns {Promise<RegistryVersionInfo | null>} The version information, or `null` if unavailable.
 */
async function fetchRegistryVersionInfo (packageName) {
	return new Promise((resolve) => {
		childProcess.exec(`npm view ${packageName} dist-tags.latest versions --json`, (error, stdout) => {
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

				const latest = parsed['dist-tags.latest'];

				// For packages with exactly one published version, `npm view` returns the version list as a plain string instead of an array
				const versions = (typeof parsed.versions === 'string' ? [parsed.versions] : parsed.versions);

				if (typeof latest !== 'string' || !Array.isArray(versions)) {
					resolve(null);

					return;
				}

				resolve({
					latest,
					versions: versions.filter((version) => typeof version === 'string')
				});
			}
			catch {
				resolve(null);
			}
		});
	});
}

/**
 * Creates an outdated dependency object for a version pin, in the shape of an `npm outdated` dependency.
 *
 * @private
 * @param {VersionPin} pin - The version pin to check.
 * @param {RegistryVersionInfo} registryInfo - The version information of the pinned package from the npm registry.
 * @returns {OutdatedDependency | undefined} The outdated dependency object, or `undefined` if the pin is up-to-date.
 */
function createOutdatedDependency (pin, registryInfo) {
	const packageJSONVersion = getDependencyPackageJSON(`node_modules/${pin.name}`).version;
	const current = (typeof packageJSONVersion === 'string' ? packageJSONVersion : '');
	const wanted = getWantedVersion(pin, registryInfo);
	const latest = registryInfo.latest;

	// The pin is up-to-date if it resolves to the latest version, and the installed version (if any) matches it as well
	if (wanted === latest && (current === '' || current === wanted)) {
		return undefined;
	}

	return {
		name: pin.name,
		resolvedName: pin.resolvedName,
		current,
		wanted,
		latest,
		location: `node_modules/${pin.name}`,
		type: pin.type,
		specKey: pin.specKey,
		spec: pin.spec
	};
}

/**
 * Determines the highest published version which satisfies the version range of a pin.
 *
 * @private
 * @param {VersionPin} pin - The version pin whose range shall be satisfied.
 * @param {RegistryVersionInfo} registryInfo - The version information of the pinned package from the npm registry.
 * @returns {string} The wanted version, or an empty string if no published version satisfies the range.
 */
function getWantedVersion (pin, registryInfo) {
	const matchingVersions = registryInfo.versions
		// Pre-release versions never satisfy a range, unless the range is exactly that pre-release version
		.filter((version) => (!isPrerelease(version) || version === pin.range))
		.filter((version) => semverInRange(version, pin.range))
		// Versions with equal precedence (e.g. differing only in build metadata) are tie-broken deterministically, so that the plain version sorts last and wins (Node.js 10 does not guarantee a stable sort)
		.sort((versionA, versionB) => (semverCompare(versionA, versionB) || (versionA < versionB ? 1 : -1)));

	if (matchingVersions.length > 0) {
		return matchingVersions[matchingVersions.length - 1];
	}

	// An exactly pinned version which is not (or no longer) in the registry version list is used as-is
	if ((/^\d+\.\d+\.\d+/u).test(pin.range)) {
		return pin.range;
	}

	return '';
}

module.exports = {
	getOutdatedPinnedDependencies
};
