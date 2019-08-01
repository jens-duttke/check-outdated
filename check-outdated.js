#!/usr/bin/env node

const childProcess = require('child_process');
const pkg = require('./package.json');

/**
 * @typedef {object} CLIArguments
 * @property {string[]} [ignorePackages]
 * @property {boolean} [ignoreDevDependencies]
 * @property {boolean} [ignorePreReleases]
 * @property {boolean} [global]
 * @property {number} [depth]
 */

/**
 * @typedef {object} OutdatedDependency
 * @property {string} current
 * @property {string} wanted
 * @property {string} latest
 * @property {string} location
 * @property {'dependencies' | 'devDependencies'} type
*/

/**
 * @typedef {object} TableColumn
 * @property {string} text
 * @property {string} [style]
 * @property {boolean} [alignRight]
 */

/**
 * @typedef {(TableColumn | string)[][]} Table
 */

/**
 * ANSI Escape sequences for coloring terminal output
 */
const styles = {
	NONE: '\x1b[0;0m',
	UNDERLINE: '\x1b[4m',
	RED: '\x1b[0;31m',
	GREEN: '\x1b[0;32m',
	YELLOW: '\x1b[0;33m',
	MAGENTA: '\x1b[0;35m'
};

// @ts-ignore
if (require.main === module) {
	process.title = pkg.name;

	(async () => {
		process.exit(await checkOutdated(parseArgs(process.argv.slice(2))));
	})();
}
else {
	module.exports = checkOutdated;
}

/**
 * The main functionality of the tool
 *
 * @param {CLIArguments | string} args
 * @returns {Promise<number>} A number which shall be the process exit code
 */
async function checkOutdated (args) {
	if (typeof args === 'string') {
		process.stdout.write(args);

		return 0;
	}

	const outdatedDependencies = await getOutdatedDependencies(args);

	let filteredDependencies = Object.entries(outdatedDependencies)
		.filter(([, dependency]) => !['git', 'linked', 'remote'].includes(dependency.latest));

	if (args.ignorePackages) {
		filteredDependencies = filteredDependencies.filter(([name]) => !args.ignorePackages.includes(name));
	}
	if (args.ignoreDevDependencies) {
		filteredDependencies = filteredDependencies.filter(([, dependency]) => dependency.type !== 'devDependencies');
	}
	if (args.ignorePreReleases) {
		filteredDependencies = filteredDependencies.filter(([, dependency]) => !dependency.current.includes('-') && !dependency.latest.includes('-'));
	}

	if (filteredDependencies.length === 0) {
		return 0;
	}

	writeToStdout(filteredDependencies);

	return 1;
}

/**
 * Parses the given `argv` array into an object with supported options.
 *
 * @param {string[]} argv
 * @returns {CLIArguments | string} Either a `CLIArguments` object or a `string` if arguments cannot be parsed.
 */
function parseArgs (argv) {
	const args = {};

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
 * Returns the help text of the CLI tool
 *
 * @param {string[]} additionalLines
 * @returns {string}
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
		...additionalLines
	].join('\n');
}

/**
 * Calls `npm outdated` to retrieve information about the outdated dependencies.
 *
 * @param {CLIArguments} options
 * @returns {Promise<OutdatedDependency[]>}
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

			resolve(JSON.parse(stdout || '{}'));
		});
	});
}

/**
 * Show the version information of outdated dependencies in a styled way on the terminal (stdout)
 *
 * @param {[string, OutdatedDependency][]} dependencies
 * @returns {void}
 */
function writeToStdout (dependencies) {
	/** @type {Table} */
	const table = [
		[
			{ style: styles.UNDERLINE, text: 'Package' },
			{ style: styles.UNDERLINE, text: 'Current' },
			{ style: styles.UNDERLINE, text: 'Wanted' },
			{ style: styles.UNDERLINE, text: 'Latest' },
			{ style: styles.UNDERLINE, text: 'Location' },
			{ style: styles.UNDERLINE, text: 'Package Type' }
		]
	];

	for (const [name, dependency] of dependencies) {
		table.push([
			{
				text: name,
				style: (dependency.current === dependency.wanted ? styles.YELLOW : styles.RED)
			},
			{
				text: dependency.current,
				alignRight: true
			},
			{
				text: dependency.wanted,
				style: styles.GREEN,
				alignRight: true
			},
			{
				text: dependency.latest,
				style: styles.MAGENTA,
				alignRight: true
			},
			dependency.location.replace(/\\/gu, '/') || `node_modules/${name}`,
			dependency.type
		]);
	}

	process.stdout.write(`${prettifyTable(table)}\n`);
}

/**
 * Converts a two-dimensional array into an styled table with aligned columns
 *
 * @param {Table} table
 * @returns {string}
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
			const { text, style = '', alignRight = false } = (typeof content === 'object' ? content : { text: content });

			if (col > 0) {
				out.push('  ');
			}

			if (style) {
				out.push(style);
			}

			if (alignRight) {
				out.push(' '.repeat(colWidths[col] - text.length));
			}

			out.push(`${text}${styles.NONE}`);

			if (!alignRight) {
				out.push(' '.repeat(colWidths[col] - text.length));
			}
		}
	}

	return out.join('');
}

/**
 * Used as reducer callback function to find the longest string per column in a `Table`.
 *
 * @param {number[]} widths
 * @param {(string | TableColumn)[]} row
 */
function colWidthReducer (widths, row) {
	return row.map((col, colIndex) => Math.max((typeof col === 'object' ? col.text : col).length, widths[colIndex] || 0));
}
