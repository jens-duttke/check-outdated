/**
 * @file Aquires and prepares outdated dependencies.
 */

const childProcess = require('child_process');

/**
 * One dependency item, returned by `npm outdated --json`.
 *
 * @typedef {object} OutdatedDependency
 * @property {string} name
 * @property {string} current
 * @property {string} wanted
 * @property {string} latest
 * @property {string} location
 * @property {'dependencies' | 'devDependencies'} type
 * @property {string} [homepage]
 */

/**
 * Original npm-outdated object, returned by `npm outdated --json`.
 *
 * @typedef {{ [dependencyName: string]: OutdatedDependency; }} OutdatedDependencies
 */

/**
 * One dependency item, returned by `npm outdated --json`.
 *
 * @typedef {object} NpmOptions
 * @property {boolean} [global]
 * @property {number} [depth]
 */

/**
 * Calls `npm outdated` to retrieve information about the outdated dependencies.
 *
 * @public
 * @param {NpmOptions} options - Options which shall be appened to the `npm outdated` command-line call.
 * @returns {Promise<OutdatedDependencies>} The original object returned by `npm outdated --json`.
 */
function getOutdatedDependencies (options) {
	return new Promise((resolve, reject) => {
		childProcess.exec([
			'npm outdated',
			'--json',
			'--long',
			'--save false',
			(options.global ? '--global' : ''),
			(options.depth ? `--depth ${options.depth}` : '')
		].filter((item) => item).join(' '), (error, stdout) => {
			if (error && stdout.length === 0) {
				reject(error);

				return;
			}

			const response = parseResponse(stdout);

			if ('error' in response) {
				reject(response.error);

				return;
			}

			if (typeof response !== 'object' || response === null) {
				reject(new TypeError('npm did not respond with an object.'));
			}

			const errorMessages = validateMandatoryProps(Object.entries(response));

			if (errorMessages.length > 0) {
				reject(new Error(errorMessages.join('\n')));
			}

			prepareResponseObject(response);

			resolve(response);
		});
	});
}

/**
 * Returns an array with error messages if one or more entries in a dependency object is missing mandatory properties.
 *
 * @private
 * @param {[string, object][]} entries - Array with subarray containing key/value-pairs.
 * @returns {string[]} An array of error messages.
 */
function validateMandatoryProps (entries) {
	/** @type {string[]} */
	const messages = [];

	for (const [name, dependency] of entries) {
		const missingProperties = ['current', 'wanted', 'latest'].filter((propName) => !(propName in dependency));

		if (missingProperties.length > 0) {
			const propertyPluralisation = (missingProperties.length === 1 ? 'y' : 'ies');

			messages.push(`Missing propert${propertyPluralisation} "${missingProperties.join('", "')}" in response for dependency "${name}".`);
		}
	}

	return messages;
}

/**
 * Adds missing properties to the dependencies object.
 *
 * @private
 * @param {{ [dependencyName: string]: Partial<OutdatedDependency>; }} dependencies - The outdated dependency object
 * @returns {void}
 */
function prepareResponseObject (dependencies) {
	for (const name of Object.keys(dependencies)) {
		// Adding the name, makes it easier to work with the dependency object.
		dependencies[name].name = name;

		/*
			Sometimes, npn does returns an empty `location` string. So we add it.
			@todo We should try to resolve the path on the same way as npm do it
			@see path.relative(process.cwd(), require.resolve(name));
			@see module.path
		*/
		if (!dependencies[name].location) {
			dependencies[name].location = `node_modules/${name}`;
		}
	}
}

/**
 * Parse the stdout of `npm outdated --json` and convert it into an `object`.
 *
 * @private
 * @param {string} stdout - Response of `npm outdated --json`.
 * @returns {any} The parsed response, or an `object` containing an `error` property.
 */
function parseResponse (stdout) {
	try {
		const response = JSON.parse(stdout || '{}');

		if (typeof response !== 'object' || response === null) {
			throw new Error('Unexpected JSON response');
		}

		return response;
	}
	catch (error) {
		return {
			error: {
				message: error.message,
				stack: error.stack,
				source: stdout
			}
		};
	}
}

module.exports = getOutdatedDependencies;
