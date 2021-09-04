/**
 * @file Aquires and prepares outdated dependencies.
 */

const { getDependencyOutdatedInfo, getDependencyList } = require('./npm');

/** @typedef {import('./npm').NpmOptions} NpmOptions */
/** @typedef {import('./npm').OutdatedDependency} OutdatedDependency */
/** @typedef {import('./npm').OutdatedDependencies} OutdatedDependencies */

/**
 * Calls `npm outdated` to retrieve information about the outdated dependencies.
 *
 * @public
 * @param {NpmOptions} options - Options which shall be appened to the `npm outdated` command-line call.
 * @returns {Promise<OutdatedDependencies>} The original object returned by `npm outdated --json`.
 */
async function getOutdatedDependencies (options) {
	const dependencyList = await getDependencyList(options);

	if (!dependencyList.dependencies) {
		return {};
	}

	const dependencyNames = Object.keys(dependencyList.dependencies);

	const dependencyOutdatedInfo = Object.assign({}, ...(await promiseAllSettled(dependencyNames.map(async (dependencyName) => getDependencyOutdatedInfo(dependencyName))))
		.filter(({ status }) => status === 'fulfilled')
		// @ts-expect-error -- That's a TypeScript problem, if status is 'fulfilled', `value` always exist.
		.map(({ value }) => value));

	return dependencyOutdatedInfo;
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
 * Polyfill for `Promise.allSettled` which is requires at least Node.js 12.9.0.
 *
 * @param {Promise<any>[]} promises - Array of promises
 * @returns {Promise<({ status: 'fulfilled'; value: any; } | { status: 'rejected'; reason: any; })[]>} promise
 */
async function promiseAllSettled (promises) {
	return Promise.all(promises.map(async (promise) => promise
		.then((value) => ({
			status: /** @type {'fulfilled'} */('fulfilled'),
			value
		}))
		.catch((error) => ({
			status: /** @type {'rejected'} */('rejected'),
			reason: error
		}))));
}

module.exports = {
	getOutdatedDependencies,
	compareByName,
	compareByType
};
