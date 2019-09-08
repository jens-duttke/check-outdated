#!/usr/bin/env node

/**
 * @external NodeModule
 */

const childProcess = require('child_process');

const colorize = require('./colorize');
const pkg = require('./package.json');

if (require.main === /** @type {NodeModule} */(/** @type {any} */(module))) {
	process.title = pkg.name;

	(async () => {
		process.exit(await checkOutdated(process.argv.slice(2)));
	})();
}
else {
	module.exports = checkOutdated;
}

/**
 * The options based on the CLI arguments.
 *
 * @typedef {object} Options
 * @property {string[]} [ignorePackages]
 * @property {boolean} [ignoreDevDependencies]
 * @property {boolean} [ignorePreReleases]
 * @property {boolean} [global]
 * @property {number} [depth]
 */

/**
 * One dependency item, returned by `npm outdated --json`.
 *
 * @typedef {object} OutdatedDependency
 * @property {string} current
 * @property {string} wanted
 * @property {string} latest
 * @property {string} location
 * @property {'dependencies' | 'devDependencies'} type
 */

/**
 * Original npm-outdated object, returned by `npm outdated --json`.
 *
 * @typedef {{ [dependencyName: string]: OutdatedDependency; }} OutdatedDependencies
 */

/**
 * Array of outdated dependencies.
 *
 * @typedef {[string, OutdatedDependency][]} Dependencies
 */

/**
 * Table column setup for a tabularly visualization of data.
 *
 * @typedef {object} TableColumn
 * @property {string} text
 * @property {string} [style]
 * @property {boolean} [alignRight]
 */

/**
 * Array contains rows, contain columns, for a tabularly visualization of data.
 *
 * @typedef {(TableColumn | string)[][]} Table
 */

/**
 * The main functionality of the tool.
 *
 * @param {string[]} argv - Arguments given in the command line (`process.argv.slice(2)`).
 * @returns {Promise<number>} A number which shall used as process exit code.
 */
async function checkOutdated (argv) {
	try {
		const args = parseArgs(argv);

		if (typeof args === 'string') {
			process.stdout.write(args);

			return 1;
		}

		const outdatedDependencies = Object.entries(await getOutdatedDependencies(args));
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

		writeToStdout(filteredDependencies);
	}
	catch (error) {
		const out = generateKeyValueList(Object.getOwnPropertyNames(error).map((prop) => [colorize.magenta(prop), error[prop]]));

		process.stdout.write(`${colorize.red('Error while gathering outdated dependencies:')}\n\n${out}\n`);
	}

	return 1;
}

/**
 * Generates a list from an array with key/value-pairs.
 * If the `value` is multiline text, each line will be prefixed by the `key`.
 *
 * @example
 * code ELIFECYCLE
 * errno 0
 * message Some additional
 * message multiline text.
 * additionalInfo null
 *
 * @param {[string, any][]} entries - Array with subarray containing key/value-pairs.
 * @returns {string} A multiline string containing representing the array items.
 */
function generateKeyValueList (entries) {
	return entries.map(([key, value]) => (typeof value === 'string' ? value : JSON.stringify(value, null, '  ')).replace(/^/gmu, `$&${key} `)).join('\n');
}

/**
 * Parses the given `argv` array into an object with supported options.
 *
 * @param {string[]} argv - Arguments given in the command line (`process.argv.slice(2)`).
 * @returns {Options | string} Either a `Options` object or a `string` which should be returned to the user, if arguments cannot be parsed.
 */
function parseArgs (argv) {
	const args = {};

	const unsupportedArgs = argv.filter((arg) => arg.startsWith('-') && ![
		'--help', '-h',
		'--ignore-packages',
		'--depth',
		'--ignore-pre-releases',
		'--ignore-dev-dependencies',
		'--global'
	].includes(arg));

	if (unsupportedArgs.length > 0) {
		return help(`Unknown argument${(unsupportedArgs.length > 1 ? 's' : '')}: ${unsupportedArgs.join(', ')}`);
	}

	if (argv.includes('--help') || argv.includes('-h')) {
		return help();
	}

	const ignorePackagesIdx = argv.indexOf('--ignore-packages');
	if (ignorePackagesIdx !== -1) {
		args.ignorePackages = (argv[ignorePackagesIdx + 1] || '').split(',');

		if (args.ignorePackages.length === 1 && (args.ignorePackages[0] === '' || args.ignorePackages[0].startsWith('-'))) {
			return help('Invalid value of --ignore-packages');
		}
	}

	const depthIdx = argv.indexOf('--depth');
	if (depthIdx !== -1) {
		args.depth = parseInt(argv[depthIdx + 1], 10);

		if (!Number.isFinite(args.depth)) {
			return help('Invalid value of --depth');
		}
	}

	if (argv.includes('--ignore-pre-releases')) {
		args.ignorePreReleases = true;
	}

	if (argv.includes('--ignore-dev-dependencies')) {
		args.ignoreDevDependencies = true;
	}

	if (argv.includes('--global')) {
		args.global = true;
	}

	return args;
}

/**
 * Returns the help text of the CLI tool.
 *
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
 * Calls `npm outdated` to retrieve information about the outdated dependencies.
 *
 * @param {Options} options - Options which shall be appened to the `npm outdated` command-line call.
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

			resolve(response);
		});
	});
}

/**
 * Parse the stdout of `npm outdated --json` and convert it into an `object`.
 *
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

/**
 * Filters dependencies by the given filter `options`.
 *
 * @param {Dependencies} dependencies - Array of dependency objects which shall be filtered.
 * @param {Options} options - Options to configure the filtering.
 * @returns {Dependencies} Array with of the filtered dependency objects.
 */
function getFilteredDependencies (dependencies, options) {
	let filteredDependencies = dependencies
		.filter(([, dependency]) => !['git', 'linked', 'remote'].includes(dependency.latest));

	if (options.ignorePackages) {
		const ignorePackages = options.ignorePackages;

		filteredDependencies = filteredDependencies.filter(([name]) => !ignorePackages.includes(name));
	}
	if (options.ignoreDevDependencies) {
		filteredDependencies = filteredDependencies.filter(([, dependency]) => dependency.type !== 'devDependencies');
	}
	if (options.ignorePreReleases) {
		filteredDependencies = filteredDependencies.filter(([, dependency]) => !dependency.current.includes('-') && !dependency.latest.includes('-'));
	}

	return filteredDependencies;
}

/**
 * Show the version information of outdated dependencies in a styled way on the terminal (stdout).
 *
 * @param {Dependencies} dependencies - Array of dependency objects, which shall be formatted and shown in the terminal.
 * @returns {void}
 */
function writeToStdout (dependencies) {
	/** @type {Table} */
	const table = [
		[
			colorize.underline('Package'),
			{
				text: colorize.underline('Current'),
				alignRight: true
			},
			{
				text: colorize.underline('Wanted'),
				alignRight: true
			},
			{
				text: colorize.underline('Latest'),
				alignRight: true
			},
			colorize.underline('Type'),
			colorize.underline('Location'),
			colorize.underline('Package Type')
		]
	];

	for (const [name, dependency] of dependencies) {
		const [current, latest] = semverDiff(
			[dependency.current, dependency.latest],
			[colorize, colorize.magenta],
			[colorize.underline, colorize.magenta.underline]
		);

		table.push([
			(dependency.current === dependency.wanted ? colorize.yellow(name) : colorize.red(name)),
			{
				text: current,
				alignRight: true
			},
			{
				text: colorize.green(dependency.wanted),
				alignRight: true
			},
			{
				text: latest,
				alignRight: true
			},
			semverDiffType(dependency.current, dependency.latest) || '',
			dependency.location.replace(/\\/gu, '/') || `node_modules/${name}`,
			dependency.type
		]);
	}

	process.stdout.write(`${prettifyTable(table)}\n\n`);
}

/**
 * Colorize differences in parts of two semantic version numbers.
 *
 * @param {[string, string]} versions - Version numbers to compare.
 * @param {[colorize.ColorizeProperty, colorize.ColorizeProperty]} equalColorizers - Styles for the first and second version number, for equal parts.
 * @param {[colorize.ColorizeProperty, colorize.ColorizeProperty]} diffColorizers - Styles for the first and second version number, for unequal parts.
 * @returns {[string, string]} The colorized version numbers, in the same order as the input `versions` array.
 */
function semverDiff (versions, equalColorizers, diffColorizers) {
	const splitRegExp = /([.+-])/u;
	const parts1 = versions[0].split(splitRegExp);
	const parts2 = versions[1].split(splitRegExp);

	for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
		if (parts1[i] !== parts2[i]) {
			if (parts1[i]) { parts1[i] = diffColorizers[0](parts1[i]); }
			if (parts2[i]) { parts2[i] = diffColorizers[1](parts2[i]); }
		}
		else {
			parts1[i] = equalColorizers[0](parts1[i]);
			parts2[i] = equalColorizers[1](parts2[i]);
		}
	}

	return [parts1.join(''), parts2.join('')];
}

/**
 * Returns the type of the difference between two semantic version numbers.
 *
 * @param {string} v1 - First version.
 * @param {string} v2 - Second version.
 * @returns {'major' | 'minor' | 'patch' | 'prerelease' | 'build' | undefined} The type as `string`, or `undefined` on invalid semver formats.
 */
function semverDiffType (v1, v2) {
	if (v1 === v2) {
		return undefined;
	}

	const semverRegExp = /^(\d+).(\d+).(\d+).*?(?:([-+]).+)?$/u;

	const match1 = v1.match(semverRegExp);

	if (match1 === null) {
		return undefined;
	}

	const match2 = v2.match(semverRegExp);

	if (match2 === null) {
		return undefined;
	}

	if (parseInt(match1[1], 10) < parseInt(match2[1], 10)) {
		return 'major';
	}

	if (parseInt(match1[2], 10) < parseInt(match2[2], 10)) {
		return 'minor';
	}

	if (parseInt(match1[3], 10) < parseInt(match2[3], 10)) {
		return 'patch';
	}

	if (match2[4] === '-') {
		return 'prerelease';
	}

	if (match2[4] === '+') {
		return 'build';
	}

	return undefined;
}

/**
 * Converts a two-dimensional array into an styled table with aligned columns.
 *
 * @param {Table} table - Two-dimentational array which shall be shown in a table with aligned columns.
 * @returns {string} Multiline string containing the table.
 */
function prettifyTable (table) {
	const out = [];

	const colWidths = table.reduce(colWidthReducer, []);

	for (let row = 0; row < table.length; row++) {
		if (row > 0) {
			out.push('\n');
		}

		for (let col = 0; col < table[row].length; col++) {
			const content = table[row][col];
			const { text, alignRight = false } = (typeof content === 'object' ? content : { text: content });

			if (col > 0) {
				out.push('  ');
			}

			if (alignRight) {
				out.push(' '.repeat(colWidths[col] - plainLength(text)));
			}

			out.push(text);

			if (!alignRight) {
				out.push(' '.repeat(colWidths[col] - plainLength(text)));
			}
		}
	}

	return out.join('');
}

/**
 * Used as `Array.reduce()` callback function to find the longest string per column in a `Table`.
 *
 * @param {number[]} widths - `Array.reduce()` accumulator, which is filled with the maximal text lengths per column.
 * @param {(string | TableColumn)[]} row - A single row containg the columns of a `Table`.
 * @returns {number[]} Updated version of `widths` containing the new maximal text lengths, considering the current `row`.
 */
function colWidthReducer (widths, row) {
	return row.map((col, colIndex) => Math.max(plainLength(typeof col === 'object' ? col.text : col), widths[colIndex] || 0));
}

/**
 * Get the length of a string without ANSI escape sequences for coloring.
 *
 * @param {string} str - Input string containg ANSI escape sequences for coloring.
 * @returns {number} The text length of `str` without the ANSI escape sequences.
 */
function plainLength (str) {
	return str.replace(/\x1b\[.+?m/gu, '').length;
}
