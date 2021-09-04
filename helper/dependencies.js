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
 * @property {'dependencies' | 'devDependencies'} [type]
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
async function getOutdatedDependencies (options) {
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

			resolve(prepareResponseObject(response));
		});
	});
}

/**
 * Compare function used with `Array.sort()` to sort outdated dependencies by their name.
 *
 * @public
 * @param {OutdatedDependency} firstDependency - First dependency objects.
 * @param {OutdatedDependency} secondDependency - Second dependency objects.
 * @returns {-1 | 0 | 1} - Defines the sorting order.
 */
function compareByName (firstDependency, secondDependency) {
	if (firstDependency.name < secondDependency.name) {
		return -1;
	}
	else if (firstDependency.name > secondDependency.name) {
		return 1;
	}

	return 0;
}

/**
 * Compare function used with `Array.sort()` to sort outdated dependencies primary by their type, secondary by their name.
 *
 * @public
 * @param {OutdatedDependency} firstDependency - First dependency objects.
 * @param {OutdatedDependency} secondDependency - Second dependency objects.
 * @returns {-1 | 0 | 1} - Defines the sorting order.
 */
function compareByType (firstDependency, secondDependency) {
	const first = `${(firstDependency.type === 'dependencies' ? 'A' : 'B')}${firstDependency.name}`;
	const second = `${(secondDependency.type === 'dependencies' ? 'A' : 'B')}${secondDependency.name}`;

	if (first < second) {
		return -1;
	}
	else if (first > second) {
		return 1;
	}

	return 0;
}

/**
 * Adds missing properties to the dependencies object.
 *
 * @private
 * @param {{ readonly [dependencyName: string]: Partial<OutdatedDependency>; }} dependencies - The partial filled outdated dependency object.
 * @returns {{ [dependencyName: string]: OutdatedDependency; }} The enriched outdated dependency object.
 */
function prepareResponseObject (dependencies) {
	/** @type {{ [dependencyName: string]: OutdatedDependency; }} */
	const outdatedDependencies = {};

	for (const [name, dependency] of Object.entries(dependencies)) {
		// Adding the name, makes it easier to work with the dependency object.
		const outdatedDependency = {
			...dependency,
			name
		};

		for (const propertyName of ['current', 'wanted', 'latest', 'type']) {
			if (!(propertyName in outdatedDependency)) {
				outdatedDependency[propertyName] = '';
			}
		}

		/**
		 * Sometimes, npm returns an empty `location` string. So we add it.
		 *
		 * @todo We should try to resolve the path on the same way as npm is doing it.
		 *
		 * @see path.relative(process.cwd(), require.resolve(name));
		 * @see module.path
		 */
		if (!outdatedDependency.location) {
			outdatedDependency.location = `node_modules/${name}`;
		}

		outdatedDependencies[name] = /** @type {OutdatedDependency} */(outdatedDependency);
	}

	return outdatedDependencies;
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
		if (error instanceof Error) {
			return {
				error: {
					message: error.message,
					stack: error.stack,
					source: stdout
				}
			};
		}

		return {
			message: (typeof error === 'string' ? error : 'Unknown error'),
			source: stdout
		};
	}
}

module.exports = {
	getOutdatedDependencies,
	compareByName,
	compareByType
};
