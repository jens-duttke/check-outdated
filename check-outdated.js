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
 * ANSI escape sequences for coloring terminal output
 */
const styles = {
	NONE: '\x1b[0;0m',
	UNDERLINE: '\x1b[4m',
	RED: '\x1b[0;31m',
	GREEN: '\x1b[0;32m',
	YELLOW: '\x1b[0;33m',
	MAGENTA: '\x1b[0;35m',
	UNDERLINE_MAGENTA: '\x1b[4;35m'
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
			{ style: styles.UNDERLINE, text: 'Type' },
			{ style: styles.UNDERLINE, text: 'Location' },
			{ style: styles.UNDERLINE, text: 'Package Type' }
		]
	];

	for (const [name, dependency] of dependencies) {
		const [current, latest] = semverDiff(
			[dependency.current, dependency.latest],
			[styles.NONE, styles.MAGENTA],
			[styles.UNDERLINE, styles.UNDERLINE_MAGENTA]
		);

		table.push([
			{
				text: name,
				style: (dependency.current === dependency.wanted ? styles.YELLOW : styles.RED)
			},
			{
				text: current,
				alignRight: true
			},
			{
				text: dependency.wanted,
				style: styles.GREEN,
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
 * Colorize differences between two semantic version numbers
 *
 * @param {[string, string]} versions
 * @param {[string, string]} equalStyles
 * @param {[string, string]} diffStyles
 * @returns {[string, string]}
 */
function semverDiff (versions, equalStyles, diffStyles) {
	const splitRegExp = /([.-])/u;
	const parts1 = versions[0].split(splitRegExp);
	const parts2 = versions[1].split(splitRegExp);

	for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
		if (parts1[i] !== parts2[i]) {
			if (parts1[i]) { parts1[i] = `${diffStyles[0]}${parts1[i]}`; }
			if (parts2[i]) { parts2[i] = `${diffStyles[1]}${parts2[i]}`; }
		}
		else {
			parts1[i] = `${equalStyles[0]}${parts1[i]}`;
			parts2[i] = `${equalStyles[1]}${parts2[i]}`;
		}
	}

	return [parts1.join(''), parts2.join('')];
}

/**
 * Returns the type of the difference between two semantic version numbers
 *
 * @param {string} v1
 * @param {string} v2
 * @returns {'major' | 'minor' | 'patch' | 'prerelease' | 'build' | undefined}
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
				out.push(' '.repeat(colWidths[col] - plainLength(text)));
			}

			out.push(`${text}${styles.NONE}`);

			if (!alignRight) {
				out.push(' '.repeat(colWidths[col] - plainLength(text)));
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
 * @returns {number[]}
 */
function colWidthReducer (widths, row) {
	return row.map((col, colIndex) => Math.max(plainLength(typeof col === 'object' ? col.text : col), widths[colIndex] || 0));
}

/**
 * Get the length of a string without ANSI escape sequences for coloring
 *
 * @param {string} str
 * @returns {number}
 */
function plainLength (str) {
	return str.replace(/\x1b\[.+?m\]?/gu, '').length;
}
