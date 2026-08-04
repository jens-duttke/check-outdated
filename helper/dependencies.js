/**
 * @file Acquires and prepares outdated dependencies.
 */

const childProcess = require('child_process');

// The default `maxBuffer` of child_process.exec() is 200 KiB on Node.js 10, which large `npm outdated` responses can exceed
const MAX_RESPONSE_SIZE = 64 * 1024 * 1024;

// Instead of a version, `npm outdated` reports these sentinels for dependencies which are not installed from the registry
const NON_REGISTRY_VERSIONS = ['git', 'linked', 'remote'];

/**
 * One dependency item, returned by `npm outdated --json`.
 *
 * @typedef {object} OutdatedDependency
 * @property {string} name
 * @property {string} resolvedName
 * @property {string} current
 * @property {string} wanted
 * @property {string} latest
 * @property {string} location
 * @property {'dependencies' | 'devDependencies' | 'peerDependencies' | 'overrides' | 'resolutions'} [type]
 * @property {string} [homepage]
 * @property {string} [specKey] - The literal key in the package.json; only set for "overrides"/"resolutions" entries (e.g. the glob path of a Yarn resolution).
 * @property {string} [spec] - The literal value in the package.json; only set for "overrides"/"resolutions" entries.
 */

/**
 * The outdated dependencies of the `npm outdated --json` response, in the order in which npm reported them.
 *
 * @typedef {OutdatedDependency[]} OutdatedDependencies
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
 * @param {NpmOptions} options - Options which shall be appended to the `npm outdated` command-line call.
 * @returns {Promise<OutdatedDependencies>} The outdated dependencies of the `npm outdated --json` response.
 */
async function getOutdatedDependencies (options) {
	return new Promise((resolve, reject) => {
		childProcess.exec([
			'npm outdated',
			'--json',
			'--long',
			'--save false',
			(options.global ? '--global' : ''),
			(options.depth !== undefined ? `--depth ${options.depth}` : '')
		].filter((item) => item).join(' '), { maxBuffer: MAX_RESPONSE_SIZE }, (error, stdout) => {
			if (error && stdout.length === 0) {
				// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- `error` is a real `Error` instance at runtime, but @types/node types `ExecException` as `Omit<NodeJS.ErrnoException, "code">`, which drops the `Error` base type
				reject(error);

				return;
			}

			// If `maxBuffer` is exceeded, the child process is killed and `stdout` is truncated but non-empty, so the empty-stdout gate above does not fire
			if (error && error.message.includes('maxBuffer')) {
				reject(new Error(`The npm response exceeds the maximum buffer size of ${MAX_RESPONSE_SIZE / (1024 * 1024)} MiB.`));

				return;
			}

			const response = parseResponse(stdout);

			// Unreachable today (parseResponse always returns a non-null object), but the guard must run before the "in" operator below, which throws for primitives
			if (typeof response !== 'object' || response === null) {
				reject(new TypeError('npm did not respond with an object.'));

				return;
			}

			if ('error' in response && !isOutdatedDependency(response.error)) {
				// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- @todo The error object could be wrapped in a custom error with additional properties
				reject(response.error);

				return;
			}

			resolve(prepareResponse(response));
		});
	});
}

/**
 * Compare function used with `Array.sort()` to sort outdated dependencies primary by their name, secondary by their location.
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

	// The same package can be reported once per workspace, so the name alone is not a unique criterion, and `Array.prototype.sort()` is not stable on Node.js 10
	if (firstDependency.location < secondDependency.location) {
		return -1;
	}
	else if (firstDependency.location > secondDependency.location) {
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
	// Package types sort alphabetically ("dependencies" first), dependencies without a type sort last
	const firstType = (firstDependency.type || '\uFFFF');
	const secondType = (secondDependency.type || '\uFFFF');

	if (firstType < secondType) {
		return -1;
	}
	else if (firstType > secondType) {
		return 1;
	}

	return compareByName(firstDependency, secondDependency);
}

/**
 * Depending on the `preferWanted` option, either the `wanted` or the `latest` property of a dependency is returned.
 *
 * @public
 * @param {OutdatedDependency} dependency - A specific outdated dependency.
 * @param {{ readonly preferWanted?: boolean; }} options - The arguments which the user provided.
 * @returns {string} Either `wanted` or `latest`
 */
function getWantedOrLatest (dependency, options) {
	if (options.preferWanted) {
		return dependency.wanted;
	}

	return dependency.latest;
}

/**
 * Adds missing properties to the dependencies of the response and flattens them into an array.
 *
 * Since npm 10.9.0, the value of a property is an array of dependency objects, if the same package is reported multiple times,
 * which happens in monorepos where several workspaces depend on the same package.
 *
 * @private
 * @param {{ readonly [dependencyName: string]: Partial<OutdatedDependency> | Partial<OutdatedDependency>[]; }} dependencies - The partial filled outdated dependency object.
 * @returns {OutdatedDependencies} The enriched outdated dependencies.
 */
function prepareResponse (dependencies) {
	/** @type {OutdatedDependencies} */
	const outdatedDependencies = [];

	/** @type {Set<string>} */
	const knownDependencies = new Set();

	for (const [name, dependency] of Object.entries(dependencies)) {
		// npm reports aliased dependencies (e.g. "alias": "npm:real-pkg@1.0.0") as "alias:real-pkg@1.0.0".
		// The version part is optional, since aliases can be defined without a version (e.g. "alias": "npm:real-pkg").
		// We normalize the name to the alias and store the real package name (without version) separately.
		const [, aliasName = name, resolvedName = aliasName] = ((/^([^:]+)(?::(.+?)(?:@[^@]+)?)?$/u).exec(name) || []);

		for (const item of (Array.isArray(dependency) ? dependency : [dependency])) {
			const outdatedDependency = prepareDependency(item, aliasName, resolvedName);

			/**
			 * npm reports one entry per dependent, while a row of the output represents one installed package.
			 * Therefore entries which are equal in everything this tool shows are reported once, instead of once per dependent workspace.
			 */
			const identifier = JSON.stringify([outdatedDependency.name, outdatedDependency.current, outdatedDependency.wanted, outdatedDependency.latest, outdatedDependency.location, outdatedDependency.type]);

			if (knownDependencies.has(identifier)) {
				continue;
			}

			knownDependencies.add(identifier);

			outdatedDependencies.push(outdatedDependency);
		}
	}

	return outdatedDependencies;
}

/**
 * Adds missing properties to one dependency object of the response.
 *
 * @private
 * @param {Partial<OutdatedDependency>} dependency - The partial filled outdated dependency object.
 * @param {string} name - The name of the dependency, which is the alias name for aliased dependencies.
 * @param {string} resolvedName - The real package name of an aliased dependency, otherwise equal to `name`.
 * @returns {OutdatedDependency} The enriched outdated dependency object.
 */
function prepareDependency (dependency, name, resolvedName) {
	// Adding the name, makes it easier to work with the dependency object.
	const outdatedDependency = {
		...dependency,
		name,
		resolvedName
	};

	outdatedDependency.current = (outdatedDependency.current || '');
	outdatedDependency.wanted = (outdatedDependency.wanted || '');
	outdatedDependency.latest = (outdatedDependency.latest || '');

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

	return /** @type {OutdatedDependency} */(outdatedDependency);
}

/**
 * Checks if a value has the shape of an outdated dependency record.
 *
 * `npm outdated --json` keys its result object by dependency name, while npm's error reporting uses a top-level `error` key
 * (an object with `code`, `summary` and `detail`). So for a dependency which is literally named "error", the key alone is
 * not sufficient to distinguish both cases.
 *
 * @private
 * @param {any} value - The value of a top-level property of the `npm outdated --json` response.
 * @returns {boolean} `true` if `value` looks like an outdated dependency record, `false` if it looks like an error report.
 */
function isOutdatedDependency (value) {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	// Since npm 10.9.0, the value is an array of dependency objects, if the same package is reported multiple times
	if (Array.isArray(value)) {
		return value.every((item) => isOutdatedDependency(item));
	}

	return ('current' in value || 'wanted' in value || 'latest' in value || 'location' in value);
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

		// Unreachable today (the try block only throws Error instances), but the branch is required for type narrowing and must use the same error envelope
		return {
			error: {
				message: (typeof error === 'string' ? error : 'Unknown error'),
				source: stdout
			}
		};
	}
}

module.exports = {
	NON_REGISTRY_VERSIONS,
	getOutdatedDependencies,
	getWantedOrLatest,
	compareByName,
	compareByType
};
