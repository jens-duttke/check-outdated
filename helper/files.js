/**
 * @file File- and path-handling related functionality.
 */

const fs = require('fs');
const path = require('path');

/**
 * Structure of the package.json.
 *
 * @typedef {{
 *   homepage?: string;
 *   repository?: string | {
 *     type?: string;
 *     url?: string;
 *     directory?: string
 *   };
 *   author?: string | {
 *     name?: string;
 *     email?: string;
 *     url?: string
 *   };
 * }} PackageJSON
 */

/**
 * Returns the content of the package.json of a given dependency.
 *
 * @param {string} dependencyLocation - The folder where the dependency is located.
 * @returns {PackageJSON} Either the content of the package.json or an empty object.
 */
function getPackageJSON (dependencyLocation) {
	const filePath = path.join(getRelativeDependencyPath(dependencyLocation), 'package.json');

	try {
		return JSON.parse(fs.readFileSync(filePath, 'utf8'));
	}
	catch (ex) {
		return {};
	}
}

/**
 * Returns the file path to the CHANGELOG.md of a given dependency.
 *
 * @param {string} dependencyLocation - The folder where the dependency is located.
 * @returns {string | undefined} Either the file path or undefined, if the file does not exist.
 */
function getChangelogPath (dependencyLocation) {
	const filePath = path.join(getRelativeDependencyPath(dependencyLocation), 'CHANGELOG.md');

	try {
		if (fs.existsSync(filePath)) {
			return path.relative(process.cwd(), filePath).replace(/\\/gu, '/');
		}
	}
	catch (ex) { /* We ignore errors here */ }

	return undefined;
}

/**
 * Returns the relative path to dependency to the current working directory.
 *
 * @param {string} dependencyLocation - The folder where the dependency is located.
 * @returns {string} The path to a dependency.
 */
function getRelativeDependencyPath (dependencyLocation) {
	return path.relative(process.cwd(), dependencyLocation.replace(/^node_modules[\\/]/u, path.join(process.cwd(), 'node_modules/'))).replace(/\\/gu, '/');
}

module.exports = {
	getChangelogPath,
	getPackageJSON
};
