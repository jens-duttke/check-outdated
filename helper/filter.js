/**
 * @file Filters outdated dependencies based on the given options.
 */

const { NON_REGISTRY_VERSIONS, getWantedOrLatest } = require('./dependencies');
const { getParentPackageJSONPath, isLinkedDependency, parsePackageJSON, readFileCached } = require('./files');
const { isPrerelease } = require('./min-age');
const { semverDiffType, semverInRange } = require('./semver');

/**
 * @typedef {import('./dependencies').OutdatedDependency} OutdatedDependency
 */

/**
 * Options which influence the filtering.
 *
 * @typedef {object} FilterOptions
 * @property {string[]} [ignorePackages]
 * @property {boolean} [ignoreDevDependencies]
 * @property {boolean} [ignoreLinkedPackages]
 * @property {boolean} [ignorePreReleases]
 * @property {boolean} [preferWanted]
 * @property {string[]} [types]
 */

/**
 * Filters dependencies by the given filter `options`.
 *
 * @public
 * @param {OutdatedDependency[]} dependencies - Array of dependency objects which shall be filtered.
 * @param {FilterOptions} options - Options to configure the filtering.
 * @returns {OutdatedDependency[]} Array with of the filtered dependency objects.
 */
function getFilteredDependencies (dependencies, options) {
	let filteredDependencies = dependencies.filter((dependency) => {
		if (NON_REGISTRY_VERSIONS.includes(getWantedOrLatest(dependency, options))) {
			return false;
		}

		// Ignore this dependency if package.json specifies "*" as the version, meaning any version is acceptable
		if (dependency.type) {
			const packageJSONContent = readFileCached(getParentPackageJSONPath(dependency.location));

			if (packageJSONContent) {
				const json = parsePackageJSON(packageJSONContent);
				const section = ((json !== undefined && dependency.type in json) ? json[dependency.type] : undefined);
				const versionString = ((section && typeof section === 'object') ? section[dependency.name] : undefined);

				// Unwrap the range part of an aliased version specifier (e.g. "npm:pkg@*")
				const aliasMatch = ((typeof versionString === 'string') ? (/^npm:.+@([^@]+)$/u).exec(versionString) : null);

				if ((aliasMatch !== null ? aliasMatch[1] : versionString) === '*') {
					return false;
				}
			}
		}

		return true;
	});

	if (options.ignorePackages) {
		const ignorePackages = options.ignorePackages;
		const packageVersionRegExp = /^(.+?)@(.*)$/u;

		filteredDependencies = filteredDependencies.filter((dependency) => {
			for (const ignoredPackage of ignorePackages) {
				const match = packageVersionRegExp.exec(ignoredPackage);

				if (match === null) {
					if (ignoredPackage === dependency.name) {
						return false;
					}
				}
				else {
					if (match[1] === dependency.name) {
						if (semverInRange(getWantedOrLatest(dependency, options), match[2])) {
							return false;
						}
					}
				}
			}

			return true;
		});
	}

	if (options.ignoreDevDependencies) {
		filteredDependencies = filteredDependencies.filter(({ type }) => (
			type !== 'devDependencies'
		));
	}

	if (options.ignorePreReleases) {
		filteredDependencies = filteredDependencies.filter((dependency) => !isPrerelease(getWantedOrLatest(dependency, options)));
	}

	// The check accesses the file system, therefore it runs after the filters which only look at the dependency data
	if (options.ignoreLinkedPackages) {
		filteredDependencies = filteredDependencies.filter((dependency) => !isLinkedDependency(dependency.location));
	}

	if (options.preferWanted) {
		filteredDependencies = filteredDependencies.filter(({ current, wanted }) => current !== wanted);
	}

	if (options.types) {
		filteredDependencies = filteredDependencies.filter((dependency) => (options.types && options.types.includes(semverDiffType(dependency.current, getWantedOrLatest(dependency, options)) || '')));
	}

	return filteredDependencies;
}

module.exports = {
	getFilteredDependencies
};
