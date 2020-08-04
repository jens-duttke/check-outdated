#!/usr/bin/env node

/**
 * @file The CLI entry point.
 */

/**
 * @external NodeModule
 */

const parseArgs = require('./helper/args');
const colorize = require('./helper/colorize');
const getOutdatedDependencies = require('./helper/dependencies');
const { getChangelogPath, getDependencyPackageJSON, getParentPackageJSONPath, readFile } = require('./helper/files');
const generateKeyValueList = require('./helper/list');
const { getRegExpPosition, escapeRegExp } = require('./helper/regexp');
const { semverDiff, semverDiffType } = require('./helper/semver');
const prettifyTable = require('./helper/table');
const { getNpmJSLink, getPackageAuthor, getPackageHomepage, getPackageRepository } = require('./helper/urls');

const pkg = require('./package.json');

/**
 * @typedef {import('./helper/dependencies').NpmOptions} NpmOptions
 * @typedef {import('./helper/dependencies').OutdatedDependencies} OutdatedDependencies
 * @typedef {import('./helper/dependencies').OutdatedDependency} OutdatedDependency
 * @typedef {import('./helper/files').PackageJSON} PackageJSON
 * @typedef {import('./helper/table').Table} Table
 * @typedef {import('./helper/table').TableColumn} TableColumn
 * @typedef {import('./helper/args').AvailableArguments} AvailableArguments
 */

/**
 * The options based on the CLI arguments.
 *
 * @typedef {object} CheckOutdatedOptions
 * @property {string[]} [ignorePackages]
 * @property {boolean} [ignoreDevDependencies]
 * @property {boolean} [ignorePreReleases]
 * @property {string[]} [columns]
 */

/** @typedef {CheckOutdatedOptions & NpmOptions} Options */

/**
 * Array of outdated dependencies.
 *
 * @typedef {OutdatedDependency[]} Dependencies
 */

/**
 * The details change can be used to share data between columns.
 * For example, if the first column reads the package.json, the next column can rely of this data, without to aquire it again.
 *
 * @typedef {object} DependencyDetailsCache
 * @property {[string, string]} [semverDiff]
 * @property {PackageJSON} [packageJSON]
 */

const DEFAULT_COLUMNS = ['name', 'current', 'wanted', 'latest', 'type', 'location', 'packageType', 'reference', 'changes'];

/**
 * @typedef {object} Column
 * @property {TableColumn | string} caption;
 * @property {(dependency: OutdatedDependency, detailsCache: DependencyDetailsCache) => Promise<TableColumn | string>} getValue
 */

/** @type {{ [filePath: string]: string }} */
const packageJsonCache = {};

/** @type {{ readonly [columnName: string]: Column; }} */
const AVAILABLE_COLUMNS = {
	name: {
		caption: colorize.underline('Package'),
		getValue: async (dependency) => (dependency.current === dependency.wanted ? colorize.yellow(dependency.name) : colorize.red(dependency.name))
	},
	current: {
		caption: {
			text: colorize.underline('Current'),
			alignRight: true
		},
		getValue: async (dependency, detailsCache) => {
			if (dependency.current === '') {
				return {
					text: colorize.gray('unknown'),
					alignRight: true
				};
			}

			detailsCache.semverDiff = detailsCache.semverDiff || semverDiff(
				[dependency.current, dependency.latest],
				[colorize, colorize.magenta],
				[colorize.underline, colorize.magenta.underline]
			);

			return {
				text: detailsCache.semverDiff[0],
				alignRight: true
			};
		}
	},
	wanted: {
		caption: {
			text: colorize.underline('Wanted'),
			alignRight: true
		},
		getValue: async (dependency) => ({
			text: colorize.green(dependency.wanted),
			alignRight: true
		})
	},
	latest: {
		caption: {
			text: colorize.underline('Latest'),
			alignRight: true
		},
		getValue: async (dependency, detailsCache) => {
			detailsCache.semverDiff = detailsCache.semverDiff || semverDiff(
				[dependency.current, dependency.latest],
				[colorize, colorize.magenta],
				[colorize.underline, colorize.magenta.underline]
			);

			return {
				text: detailsCache.semverDiff[1],
				alignRight: true
			};
		}
	},
	type: {
		caption: colorize.underline('Type'),
		getValue: async (dependency) => (semverDiffType(dependency.current, dependency.latest) || '')
	},
	location: {
		caption: colorize.underline('Location'),
		getValue: async (dependency) => dependency.location
	},
	packageType: {
		caption: colorize.underline('Package Type'),
		getValue: async (dependency) => dependency.type
	},
	reference: {
		caption: colorize.underline('Reference'),
		getValue: async (dependency) => {
			const filePath = getParentPackageJSONPath(dependency.location);
			let fileContent = packageJsonCache[filePath] || readFile(filePath);

			if (fileContent !== undefined) {
				fileContent = fileContent.replace(/\r\n|\r/gu, '\n');

				if (packageJsonCache[filePath] === undefined) {
					packageJsonCache[filePath] = fileContent;
				}

				const needle = new RegExp(`"${escapeRegExp(dependency.name)}"[^:]*:[^"]*"[^"]*"`, 'u');
				const [line, column] = getRegExpPosition(fileContent, needle);

				if (line && column) {
					return `${filePath}:${line}:${column}`;
				}
			}

			return colorize.gray('-');
		}
	},
	changes: {
		caption: colorize.underline('Changes'),
		getValue: async (dependency, detailsCache) => {
			detailsCache.packageJSON = detailsCache.packageJSON || getDependencyPackageJSON(dependency.location);

			return (
				await getPackageRepository(detailsCache.packageJSON, true) ||
				getPackageHomepage(detailsCache.packageJSON) ||
				getNpmJSLink(dependency.name)
			);
		}
	},
	changesPreferLocal: {
		caption: colorize.underline('Changes'),
		getValue: async (dependency, detailsCache) => {
			const changelogFile = getChangelogPath(dependency.location);

			if (changelogFile) {
				return changelogFile;
			}

			detailsCache.packageJSON = detailsCache.packageJSON || getDependencyPackageJSON(dependency.location);

			return (
				await getPackageRepository(detailsCache.packageJSON, true) ||
				getPackageHomepage(detailsCache.packageJSON) ||
				getNpmJSLink(dependency.name)
			);
		}
	},
	homepage: {
		caption: colorize.underline('Homepage'),
		getValue: async (dependency, detailsCache) => {
			detailsCache.packageJSON = detailsCache.packageJSON || getDependencyPackageJSON(dependency.location);

			return (
				dependency.homepage ||
				getPackageHomepage(detailsCache.packageJSON) ||
				await getPackageRepository(detailsCache.packageJSON) ||
				getPackageAuthor(detailsCache.packageJSON) ||
				getNpmJSLink(dependency.name)
			);
		}
	},
	npmjs: {
		caption: colorize.underline('npmjs.com'),
		getValue: async (dependency) => getNpmJSLink(dependency.name)
	}
};

/** @type {AvailableArguments} */
const AVAILABLE_ARGUMENTS = {
	'--help': () => help(),
	'-h': () => help(),
	'--ignore-packages': (value) => {
		const ignorePackages = value.split(',');

		if (ignorePackages.length === 1 && (ignorePackages[0] === '' || ignorePackages[0].startsWith('-'))) {
			return help('Invalid value of --ignore-packages');
		}

		return { ignorePackages };
	},
	'--columns': (value) => {
		const columns = value.split(',');
		const availableColumnsNames = Object.keys(AVAILABLE_COLUMNS);

		if (columns.length === 1 && (columns[0] === '' || columns[0].startsWith('-'))) {
			return help('Invalid value of --columns');
		}

		const invalidColumn = columns.find((name) => !availableColumnsNames.includes(name));
		if (invalidColumn) {
			return help(`Invalid column name "${invalidColumn}" in --columns\nAvailable columns are:\n${availableColumnsNames.join(', ')}`);
		}

		return { columns };
	},
	'--depth': (value) => {
		const depth = parseInt(value, 10);

		if (!Number.isFinite(depth)) {
			return help('Invalid value of --depth');
		}

		return { depth };
	},
	'--ignore-pre-releases': {
		ignorePreReleases: true
	},
	'--ignore-dev-dependencies': {
		ignoreDevDependencies: true
	},
	'--global': {
		global: true
	}
};

if (require.main === /** @type {NodeModule} */(/** @type {any} */(module))) {
	process.title = pkg.name;

	void (async () => {
		process.exit(await checkOutdated(process.argv.slice(2)));
	})();
}
else {
	module.exports = checkOutdated;
}

/**
 * The main functionality of the tool.
 *
 * @public
 * @param {string[]} argv - Arguments given in the command line (`process.argv.slice(2)`).
 * @returns {Promise<number>} A number which shall used as process exit code.
 */
async function checkOutdated (argv) {
	/** @type {Options | string} */
	let args;

	try {
		args = /** @type {Options | string} */(parseArgs(argv, AVAILABLE_ARGUMENTS));
	}
	catch ({ message }) {
		args = help(message);
	}

	if (typeof args === 'string') {
		process.stdout.write(args);

		return 1;
	}

	try {
		const outdatedDependencies = Object.values(await getOutdatedDependencies(args));
		const filteredDependencies = getFilteredDependencies(outdatedDependencies, args);

		if (filteredDependencies.length === 0) {
			process.stdout.write('All dependencies are up-to-date.\n');

			return 0;
		}

		if (filteredDependencies.length === 1) {
			process.stdout.write('1 outdated dependency found:\n\n');
		}
		else {
			process.stdout.write(`${filteredDependencies.length} outdated dependencies found:\n\n`);
		}

		const visibleColumns = (args.columns === undefined || args.columns.length === 0 ? DEFAULT_COLUMNS : args.columns);

		await writeOutdatedDependenciesToStdout(visibleColumns, filteredDependencies);

		writeUnnecessaryIgnoredPackagesToStdout(filteredDependencies, args);
	}
	catch (error) {
		const out = generateKeyValueList(Object.getOwnPropertyNames(error).map((prop) => [colorize.magenta(prop), error[prop]]));

		process.stdout.write(`${colorize.red('Error while gathering outdated dependencies:')}\n\n${out}\n`);
	}

	return 1;
}

/**
 * Returns the help text of the CLI tool.
 *
 * @private
 * @param {string[]} additionalLines - Additional text (error messages etc.) which shall be shown after the help.
 * @returns {string} Multiline text containing the whole help text.
 */
function help (...additionalLines) {
	return [
		`${pkg.name} v${pkg.version} - ${pkg.description}`,
		'Usage: [--ignore-pre-releases] [--ignore-dev-dependencies] [--ignore-packages <comma-separated-list-of-package-names>] [--global] [--depth <number>]',
		'',
		'Arguments:',
		prettifyTable([
			[
				'--help, -h',
				'Show this help'
			],
			[
				'--ignore-pre-releases',
				'Don\'t recommend to update to the latest version, if it contains a hyphen (e.g. "2.1.0-alpha", "2.1.0-beta", "2.1.0-rc.1")'
			],
			[
				'--ignore-dev-dependencies',
				'Do not warn if devDependencies are outdated.'
			],
			[
				'--ignore-packages <comma-separated-list-of-package-names>',
				'Ignore the listed packages, even if they are outdated'
			],
			[
				'--columns <comma-separated-list-of-columns>',
				'Defines which columns should be shown in which order.'
			],
			[
				// Follow-up line for '--columns' description
				'',
				`Possible values: ${Object.keys(AVAILABLE_COLUMNS).join(',')}`
			],
			[
				'--global',
				'Check packages in the global install prefix instead of in the current project (equal to the npm outdated-option)'
			],
			[
				'--depth <number>',
				'Max depth for checking dependency tree (equal to the npm outdated-option)'
			]
		]),
		...(Array.isArray(additionalLines) ? [''].concat(additionalLines) : []),
		''
	].join('\n');
}

/**
 * Filters dependencies by the given filter `options`.
 *
 * @private
 * @param {Dependencies} dependencies - Array of dependency objects which shall be filtered.
 * @param {Options} options - Options to configure the filtering.
 * @returns {Dependencies} Array with of the filtered dependency objects.
 */
function getFilteredDependencies (dependencies, options) {
	let filteredDependencies = dependencies.filter((dependency) => !['git', 'linked', 'remote'].includes(dependency.latest));

	if (options.ignorePackages) {
		const ignore = options.ignorePackages;

		filteredDependencies = filteredDependencies.filter(({ name, latest }) => !ignore.includes(name) && !ignore.includes(`${name}@${latest}`));
	}
	if (options.ignoreDevDependencies) {
		filteredDependencies = filteredDependencies.filter(({ type }) => type !== 'devDependencies');
	}
	if (options.ignorePreReleases) {
		filteredDependencies = filteredDependencies.filter(({ current, latest }) => !current.includes('-') && !latest.includes('-'));
	}

	return filteredDependencies;
}

/**
 * Show the version information of outdated dependencies in a styled way on the terminal (stdout).
 *
 * @private
 * @param {string[]} visibleColumns - The columns which should be shown in the given order.
 * @param {Dependencies} dependencies - Array of dependency objects, which shall be formatted and shown in the terminal.
 * @returns {Promise<void>}
 */
async function writeOutdatedDependenciesToStdout (visibleColumns, dependencies) {
	/** @type {((string | TableColumn)[] | Promise<(string | TableColumn)[]>)[]} */
	const table = [
		visibleColumns.map((columnName) => AVAILABLE_COLUMNS[columnName].caption)
	];

	for (const dependency of dependencies) {
		table.push((async () => {
			/** @type {DependencyDetailsCache} */
			const dependencyDetailsCache = {};

			return Promise.all(visibleColumns.map(async (columnName) => AVAILABLE_COLUMNS[columnName].getValue(dependency, dependencyDetailsCache)));
		})());
	}

	process.stdout.write(`${prettifyTable(await Promise.all(table))}\n\n`);
}

/**
 * Show information about packages which are ignored by `--ignore-packages` with version number, but where the `latest` version differs.
 *
 * Example:
 * Current "module" version: 1.0.0
 * Latest "module" version: 1.0.2
 * --ignore-packages module@1.0.1
 * In this case, the ignore-statement has no effect, because version 1.0.1 is outdated. That means, the ignore-statement can be removed.
 *
 * @private
 * @param {Dependencies} filteredDependencies - Array of dependency objects, which will be shown in the terminal.
 * @param {Options} options - The arguments which the user provided
 * @returns {void}
 */
function writeUnnecessaryIgnoredPackagesToStdout (filteredDependencies, options) {
	const packageVersionRegExp = /^(.+?)@(.*)$/u;

	if (!options.ignorePackages) {
		return;
	}

	for (const ignoredPackage of options.ignorePackages) {
		const match = packageVersionRegExp.exec(ignoredPackage);

		if (match !== null) {
			const dependency = filteredDependencies.find(({ name }) => name === match[1]);

			if (dependency) {
				process.stdout.write(`The --ignore-packages filter "${ignoredPackage}" has no effect, the latest version is ${dependency.latest}.\n\n`);
			}
		}
	}
}
