/**
 * @file File- and path-handling related functionality.
 */

const fs = require('fs');
const path = require('path');

/**
 * Structure of the package.json.
 *
 * @typedef {{
 *   readonly name?: string;
 *   readonly version?: string;
 *   readonly homepage?: string;
 *   readonly repository?: string | {
 *     readonly type?: string;
 *     readonly url?: string;
 *     readonly directory?: string
 *   };
 *   readonly author?: string | {
 *     readonly name?: string;
 *     readonly email?: string;
 *     readonly url?: string
 *   };
 * }} PackageJSON
 */

/**
 * Returns the content of the package.json of a given dependency.
 *
 * @public
 * @param {string} dependencyLocation - The folder where the dependency is located.
 * @returns {PackageJSON} Either the content of the package.json or an empty object.
 */
function getDependencyPackageJSON (dependencyLocation) {
	const filePath = path.join(getRelativeDependencyPath(dependencyLocation), 'package.json');
	const fileContent = readFile(filePath);

	if (fileContent !== undefined) {
		const json = parsePackageJSON(fileContent);

		// JSON.parse() returns scalars, null and arrays without throwing, but callers dereference properties of the result
		if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
			return json;
		}
	}

	return {};
}

/**
 * Parses the content of a package.json, tolerating invalid content.
 *
 * @public
 * @param {string} fileContent - The content of a package.json.
 * @returns {any} The parsed content, or `undefined` if the content is not valid JSON.
 */
function parsePackageJSON (fileContent) {
	try {
		return JSON.parse(fileContent);
	}
	catch { /* Do nothing here, but return undefined in the next step */ }

	return undefined;
}

/**
 * Returns the path to the package.json of the parent package of a given dependency.
 *
 * @public
 * @param {string} dependencyLocation - The folder where the dependency is located.
 * @returns {string} Either the path to the package.json, or an empty string if the location has no "node_modules" ancestor.
 */
function getParentPackageJSONPath (dependencyLocation) {
	let filePath = path.resolve(process.cwd(), getRelativeDependencyPath(dependencyLocation));

	while (path.basename(filePath) !== 'node_modules') {
		const parentPath = path.dirname(filePath);

		// path.dirname() stabilizes at the filesystem root (it never returns an empty string), so without this guard, a location without a "node_modules" ancestor would loop forever
		if (parentPath === filePath) {
			return '';
		}

		filePath = parentPath;
	}

	return path.join(path.dirname(filePath), 'package.json');
}

/**
 * Returns the file path to the CHANGELOG.md of a given dependency.
 *
 * @public
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
	catch { /* We ignore errors here */ }

	return undefined;
}

/**
 * Returns the content of a file.
 *
 * @public
 * @param {string} filePath - The path/file name.
 * @returns {string | undefined} The content of the file or `undefined`, if an error occurs.
 */
function readFile (filePath) {
	try {
		return fs.readFileSync(filePath, 'utf8');
	}
	catch { /* Do nothing here, but return undefined in the next step */ }

	return undefined;
}

/** @type {{ [filePath: string]: string | undefined }} */
let fileCache = {};

/**
 * Clears the file cache, so that subsequent reads return fresh content.
 *
 * @public
 * @returns {void}
 */
function clearFileCache () {
	fileCache = {};
}

/**
 * Returns the content of a file, cached across multiple reads of the same file.
 *
 * @public
 * @param {string} filePath - The path/file name.
 * @returns {string | undefined} The content of the file with normalized line endings, or `undefined` if an error occurs.
 */
function readFileCached (filePath) {
	if (!(filePath in fileCache)) {
		const fileContent = readFile(filePath);

		fileCache[filePath] = (fileContent === undefined ? undefined : fileContent.replace(/\r\n|\r/gu, '\n'));
	}

	return fileCache[filePath];
}

/**
 * Returns the relative path to dependency to the current working directory.
 *
 * @private
 * @param {string} dependencyLocation - The folder where the dependency is located.
 * @returns {string} The path to a dependency.
 */
function getRelativeDependencyPath (dependencyLocation) {
	// The replacer function ensures that the path is used literally, since `$`-sequences are special in a replacement string
	return path.relative(process.cwd(), dependencyLocation.replace(/^node_modules[\\/]/u, () => path.join(process.cwd(), 'node_modules/'))).replace(/\\/gu, '/');
}

module.exports = {
	clearFileCache,
	getChangelogPath,
	getDependencyPackageJSON,
	getParentPackageJSONPath,
	parsePackageJSON,
	readFile,
	readFileCached
};
