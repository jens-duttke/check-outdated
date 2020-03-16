/**
 * @file Different tests to verify everything works correctly.
 */

const assert = require('assert').strict;
const proxyquire = require('proxyquire').noPreserveCache();
const tty = require('tty');

let colorize = require('../colorize');

const isTerminal = tty.isatty(1);

if (!isTerminal) {
	colorize = colorize.disabled;
}

/** @type {import('../check-outdated').OutdatedDependencies} */
const DEFAULT_RESPONSE = {
	'module-major': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module',
		type: 'dependencies'
	},
	'module-minor': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '1.1.0',
		location: 'node_modules/module',
		type: 'dependencies'
	},
	'module-patch': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '1.0.1',
		location: 'node_modules/module',
		type: 'dependencies'
	},
	'module-prerelease': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '1.0.0-alpha.1',
		location: 'node_modules/module',
		type: 'dependencies'
	},
	'module-build': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '1.0.0+build',
		location: 'node_modules/module',
		type: 'dependencies'
	},
	'module-sub-version': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '1.0.0.1',
		location: 'node_modules/module',
		type: 'dependencies'
	},
	'module-revert': {
		current: '1.1.0',
		wanted: '1.1.0',
		latest: '1.0.0',
		location: 'node_modules/module',
		type: 'dependencies'
	},
	'module-non-semver': {
		current: 'R1',
		wanted: 'R1',
		latest: 'R2',
		location: 'node_modules/module',
		type: 'dependencies'
	},
	'module-git': {
		current: 'git',
		wanted: 'git',
		latest: 'git',
		location: 'node_modules/module',
		type: 'dependencies'
	},
	'module-linked': {
		current: 'linked',
		wanted: 'linked',
		latest: 'linked',
		location: 'node_modules/module',
		type: 'dependencies'
	},
	'module-remote': {
		current: 'remote',
		wanted: 'remote',
		latest: 'remote',
		location: 'node_modules/module',
		type: 'dependencies'
	},
	'module-diff-wanted': {
		current: '1.0.0',
		wanted: '1.1.0',
		latest: '1.2.0',
		location: 'node_modules/module',
		type: 'dependencies'
	},
	'module-dev-major': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module',
		type: 'devDependencies'
	}
};

const sum = {
	passed: 0,
	failed: 0
};

(async () => {
	await test('should show help', ['-h'], {}, (command, exitCode, stdout) => {
		expect('`command` should be `undefined`', () => assert.equal(command, undefined));
		expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
		expect('`stdout` should contain `"Arguments:"`', () => assertHasWord(stdout, 'Arguments:'));
	});

	await test('should show help', ['--help'], {}, (command, exitCode, stdout) => {
		expect('`command` should be `undefined`', () => assert.equal(command, undefined));
		expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
		expect('`stdout` should contain `"Arguments:"`', () => assertHasWord(stdout, 'Arguments:'));
	});

	await test('should catch npm error', [], { error: { code: 'TEST', summary: 'Test error' } }, (command, exitCode, stdout) => {
		expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false'));
		expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
		expect('`stdout` should contain the correct response', () => assert.equal(stdout, '\u001b[31mError while gathering outdated dependencies:\u001b[39m\n\n\u001b[35mcode\u001b[39m TEST\n\u001b[35msummary\u001b[39m Test error\n'));
	});

	await test('should catch JSON.parse() error', [], '{ "Incomplete JSON response', (command, exitCode, stdout) => {
		expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false'));
		expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
		expect('`stdout` should contain `"Error while gathering outdated dependencies:"`', () => assertHasWord(stdout, 'Error while gathering outdated dependencies:'));
		expect('`stdout` should contain `"Unexpected end of JSON input"`', () => assertHasWord(stdout, 'Unexpected end of JSON input'));
		expect('`stdout` should contain `"{ "Incomplete JSON response"`', () => assertHasWord(stdout, '{ "Incomplete JSON response'));
	});

	await test('should throw "Unexpected JSON response" error for string response', [], '"string"', (command, exitCode, stdout) => {
		expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false'));
		expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
		expect('`stdout` should contain `"Error while gathering outdated dependencies:"`', () => assertHasWord(stdout, 'Error while gathering outdated dependencies:'));
		expect('`stdout` should contain `"Unexpected JSON response"`', () => assertHasWord(stdout, 'Unexpected JSON response'));
		expect('`stdout` should contain `""string""`', () => assertHasWord(stdout, '"string"'));
	});

	await test('should catch "Unexpected JSON response" error for null response', [], 'null', (command, exitCode, stdout) => {
		expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false'));
		expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
		expect('`stdout` should contain `"Error while gathering outdated dependencies:"`', () => assertHasWord(stdout, 'Error while gathering outdated dependencies:'));
		expect('`stdout` should contain `"Unexpected JSON response"`', () => assertHasWord(stdout, 'Unexpected JSON response'));
		expect('`stdout` should contain `null`', () => assertHasWord(stdout, 'null'));
	});

	await test('should return without outdated dependency message for empty response', [], '', (command, exitCode, stdout) => {
		expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false'));
		expect('`exitCode` should be `0`', () => assert.equal(exitCode, 0));
		expect('`stdout` should be `"All dependencies are up-to-date.\n"`', () => assert.equal(stdout, 'All dependencies are up-to-date.\n'));
	});

	await test('should return without outdated dependency message for empty object response', [], {}, (command, exitCode, stdout) => {
		expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false'));
		expect('`exitCode` should be `0`', () => assert.equal(exitCode, 0));
		expect('`stdout` should be `"All dependencies are up-to-date.\n"`', () => assert.equal(stdout, 'All dependencies are up-to-date.\n'));
	});

	await test('should return with missing properties message', [], { 'missing-properties': {} }, (command, exitCode, stdout) => {
		expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false'));
		expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
		expect('`stdout` should contain `"Missing properties "current", "wanted", "latest" in response for dependency "missing-properties"."`', () => assertHasWord(stdout, 'Missing properties "current", "wanted", "latest" in response for dependency "missing-properties".'));
	});

	await test('should return with outdated dependency message', [], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false'));
		expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
		expect('`stdout` should contain `"10 outdated dependencies found:"`', () => assertHasWord(stdout, '10 outdated dependencies found:'));

		expect('`stdout` should contain `"module-major"`', () => assertHasWord(stdout, 'module-major'));
		expect('`stdout` should contain `"module-minor"`', () => assertHasWord(stdout, 'module-minor'));
		expect('`stdout` should contain `"module-patch"`', () => assertHasWord(stdout, 'module-patch'));
		expect('`stdout` should contain `"module-prerelease"`', () => assertHasWord(stdout, 'module-prerelease'));
		expect('`stdout` should contain `"module-build"`', () => assertHasWord(stdout, 'module-build'));
		expect('`stdout` should contain `"module-sub-version"`', () => assertHasWord(stdout, 'module-sub-version'));
		expect('`stdout` should contain `"module-revert"`', () => assertHasWord(stdout, 'module-revert'));
		expect('`stdout` should contain `"module-non-semver"`', () => assertHasWord(stdout, 'module-non-semver'));
		expect('`stdout` should contain `"module-diff-wanted"`', () => assertHasWord(stdout, 'module-diff-wanted'));
		expect('`stdout` should contain `"module-dev-major"`', () => assertHasWord(stdout, 'module-dev-major'));

		expect('`stdout` should contain the correct response', () => assert.equal(stdout, '10 outdated dependencies found:\n\n\u001b[4mPackage\u001b[24m             \u001b[4mCurrent\u001b[24m  \u001b[4mWanted\u001b[24m         \u001b[4mLatest\u001b[24m  \u001b[4mType\u001b[24m        \u001b[4mLocation\u001b[24m             \u001b[4mPackage Type\u001b[24m   \n\u001b[33mmodule-major\u001b[39m          \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module  dependencies   \n\u001b[33mmodule-minor\u001b[39m          1.\u001b[4m0\u001b[24m.0   \u001b[32m1.0.0\u001b[39m          \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35;4m1\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  minor       node_modules/module  dependencies   \n\u001b[33mmodule-patch\u001b[39m          1.0.\u001b[4m0\u001b[24m   \u001b[32m1.0.0\u001b[39m          \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35;4m1\u001b[39;24m  patch       node_modules/module  dependencies   \n\u001b[33mmodule-prerelease\u001b[39m     1.0.0   \u001b[32m1.0.0\u001b[39m  \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35;4m-\u001b[39;24m\u001b[35;4malpha\u001b[39;24m\u001b[35;4m.\u001b[39;24m\u001b[35;4m1\u001b[39;24m  prerelease  node_modules/module  dependencies   \n\u001b[33mmodule-build\u001b[39m          1.0.0   \u001b[32m1.0.0\u001b[39m    \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35;4m+\u001b[39;24m\u001b[35;4mbuild\u001b[39;24m  build       node_modules/module  dependencies   \n\u001b[33mmodule-sub-version\u001b[39m    1.0.0   \u001b[32m1.0.0\u001b[39m        \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35;4m.\u001b[39;24m\u001b[35;4m1\u001b[39;24m              node_modules/module  dependencies   \n\u001b[33mmodule-revert\u001b[39m         1.\u001b[4m1\u001b[24m.0   \u001b[32m1.1.0\u001b[39m          \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35;4m0\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m              node_modules/module  dependencies   \n\u001b[33mmodule-non-semver\u001b[39m        \u001b[4mR1\u001b[24m      \u001b[32mR1\u001b[39m             \u001b[35;4mR2\u001b[39;24m              node_modules/module  dependencies   \n\u001b[31mmodule-diff-wanted\u001b[39m    1.\u001b[4m0\u001b[24m.0   \u001b[32m1.1.0\u001b[39m          \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  minor       node_modules/module  dependencies   \n\u001b[33mmodule-dev-major\u001b[39m      \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module  devDependencies\n\n'));

		// For testing purpose: console.log(stdout);
	});

	await test('should return with outdated dependency message, ignoring pre-releases', ['--unknown-argument'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		expect('`command` should be `undefined`', () => assert.equal(command, undefined));
		expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
		expect('`stdout` should contain `"Unknown argument: --unknown-argument"`', () => assertHasWord(stdout, 'Unknown argument: --unknown-argument'));
	});

	await test('should return with outdated dependency message, ignoring pre-releases', ['--unknown-argument1', '--unknown-argument2'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		expect('`command` should be `undefined`', () => assert.equal(command, undefined));
		expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
		expect('`stdout` should contain `"Unknown arguments: --unknown-argument1, --unknown-argument2"`', () => assertHasWord(stdout, 'Unknown arguments: --unknown-argument1, --unknown-argument2'));
	});

	await test('should return with outdated dependency message, ignoring pre-releases', ['--ignore-pre-releases'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false'));
		expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
		expect('`stdout` should contain `"9 outdated dependencies found:"`', () => assertHasWord(stdout, '9 outdated dependencies found:'));

		expect('`stdout` should not contain `"module-prerelease"`', () => assertNotHasWord(stdout, 'module-prerelease'));
	});

	await test('should return with outdated non-dev-dependency message, ignoring dev-dependencies', ['--ignore-dev-dependencies'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false'));
		expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
		expect('`stdout` should contain `"9 outdated dependencies found:"`', () => assertHasWord(stdout, '9 outdated dependencies found:'));

		expect('`stdout` should not contain `"module-dev-major"`', () => assertNotHasWord(stdout, 'module-dev-major'));
	});

	await test('should return with outdated dependency message, ignoring package `"module-major"` and `"module-minor"`', ['--ignore-packages', 'module-major,module-minor'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false'));
		expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
		expect('`stdout` should contain `"8 outdated dependencies found:"`', () => assertHasWord(stdout, '8 outdated dependencies found:'));

		expect('`stdout` should not contain `"module-major"`', () => assertNotHasWord(stdout, 'module-major'));
		expect('`stdout` should not contain `"module-minor"`', () => assertNotHasWord(stdout, 'module-minor'));
	});

	await test('should return with the help indicating an argument problem', ['--ignore-packages'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		expect('`command` should be `undefined`', () => assert.equal(command, undefined));
		expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
		expect('`stdout` should contain `"Invalid value of --ignore-packages"`', () => assertHasWord(stdout, 'Invalid value of --ignore-packages'));
	});

	await test('should return with outdated dependency message', ['--global'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false --global'));
		expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
		expect('`stdout` should contain `"10 outdated dependencies found:"`', () => assertHasWord(stdout, '10 outdated dependencies found:'));
	});

	// @todo Improve this test by adding modules with deeper node_modules-structure
	await test('should return with outdated dependency message', ['--depth', '10'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false --depth 10'));
		expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
		expect('`stdout` should contain `"10 outdated dependencies found:"`', () => assertHasWord(stdout, '10 outdated dependencies found:'));
	});

	await test('should return with the help indicating an argument problem', ['--depth', 'INVALID'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		expect('`command` should be `undefined`', () => assert.equal(command, undefined));
		expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
		expect('`stdout` should contain `"Invalid value of --depth"`', () => assertHasWord(stdout, 'Invalid value of --depth'));
	});

	await test('should return with outdated dependency message if all options are activated', ['--ignore-pre-releases', '--ignore-dev-dependencies', '--ignore-packages', 'module-major,module-minor', '--global', '--depth', '10'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false --global --depth 10'));
		expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
		expect('`stdout` should contain `"6 outdated dependencies found:"`', () => assertHasWord(stdout, '6 outdated dependencies found:'));

		expect('`stdout` should not contain `"module-major"`', () => assertNotHasWord(stdout, 'module-major'));
		expect('`stdout` should not contain `"module-minor"`', () => assertNotHasWord(stdout, 'module-minor'));
		expect('`stdout` should not contain `"module-prerelease"`', () => assertNotHasWord(stdout, 'module-prerelease'));
		expect('`stdout` should not contain `"module-dev-major"`', () => assertNotHasWord(stdout, 'module-dev-major'));
	});

	console.log();
	console.log(colorize.green(`${sum.passed} passed`));
	if (sum.failed > 0) {
		console.log(colorize.red(`${sum.failed} failed`));

		process.exitCode = 1;
	}
	console.log();
})();

/**
 * Handle a specific test.
 *
 * @param {string} message - The message which shall be shown if an assertion fails.
 * @param {() => void | never} assertion - A function which throws an error to indicate that an assertion fails.
 */
function expect (message, assertion) {
	const styledMessage = message.replace(/\n/gu, '\\n').replace(/`(.+?)`/gu, colorize.underline('$1'));

	try {
		assertion();
	}
	catch (error) {
		const errorType = (error instanceof assert.AssertionError ? 'Test failed' : 'Error in code');

		console.log(`    ${colorize.red(`× ${styledMessage}`)}`);
		console.log();
		console.log(`      ${colorize.gray(`- ${errorType} ${error.message.replace(/\n/gu, '\n      ')}`)}`);
		console.log();
		console.log(`      ${colorize.gray((Error().stack || '').split('\n').slice(2, 3).join('').trim())}`);
		console.log();

		sum.failed++;

		return;
	}

	console.log(`    ${colorize.green('√')} ${colorize.gray(styledMessage)}`);

	sum.passed++;
}

/**
 * Assert that a string contains a specific word, considering word boundaries.
 *
 * @param {string} str - The source string.
 * @param {string} word - A word which shall be part of the `str`.
 * @returns {void}
 * @throws {assert.AssertionError}
 */
function assertHasWord (str, word) {
	if (!hasWord(str, word)) {
		throw new assert.AssertionError({
			message: 'Input A expected to include word input B',
			actual: str,
			expected: word,
			operator: 'assertHasWord',
			stackStartFn: assertHasWord
		});
	}
}

/**
 * Assert that a string does not contains a specific word, considering word boundaries.
 *
 * @param {string} str - The source string.
 * @param {string} word - A word which shall not be part of `str`.
 * @returns {void}
 * @throws {assert.AssertionError}
 */
function assertNotHasWord (str, word) {
	if (hasWord(str, word)) {
		throw new assert.AssertionError({
			message: 'Input A expected to not include word input B',
			actual: str,
			expected: word,
			operator: 'assertNotHasWord',
			stackStartFn: assertNotHasWord
		});
	}
}

/**
 * Returns true if the given string contains a specific word, considering word boundaries.
 *
 * ANSI escape sequences for coloring in `str` are ignored.
 *
 * @param {string} str - The source string.
 * @param {string} word - A word which shall be part of `str`.
 * @returns {boolean} If `str` contains `word`, `true` is returned, otherwise `false`.
 */
function hasWord (str, word) {
	return new RegExp(`(^|[^A-Za-z0-9$-_])${escapeRegExp(word)}($|[^A-Za-z0-9$-_])`, 'um').test(str.replace(/\x1b\[.+?m/gu, ''));
}

/**
 * Escape string to use it as part of a RegExp pattern.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
 *
 * @param {string} str - The source string.
 * @returns {string} The escaped string.
 */
function escapeRegExp (str) {
	return str.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

/**
 * Create a test suite to test a specific "check-outdated" call.
 *
 * @param {string} title - The title of the test suite.
 * @param {string[]} argv - Arguments which are used for the `check-outdated` call.
 * @param {any} dependencies - Mock of the `npm outdated --json` response.
 * @param {(command: string | undefined, exitCode: number, stdout: string) => void} expectedCallback - Callback with for the assertion functionality.
 * @returns {Promise<void>} The Promise is resolved with `void` as soon as the test suite is finished.
 */
async function test (title, argv, dependencies, expectedCallback) {
	const styledTitle = title.replace(/\n/gu, '\\n').replace(/`(.+?)`/gu, colorize.underline('$1'));

	console.log();
	console.log(`  ${JSON.stringify(argv)} ${styledTitle}`);
	console.log();

	let usedCommand;

	/** @type {import('../check-outdated')} */
	const checkOutdated = proxyquire('../check-outdated', {
		child_process: {
			/**
			 * Mock of the child_process.exec() function, which is used by `check-outdated` to call `npm outdated`.
			 *
			 * @param {string} command - The command to run.
			 * @param {(error: Error | null, stdout: string, stderr: string) => void} callback - Called with the output when process terminates.
			 * @returns {void}
			 */
			exec (command, callback) {
				usedCommand = command;

				callback(null, (typeof dependencies === 'string' ? dependencies : JSON.stringify(dependencies)), '');
			}
		}
	});

	const unhookCapture = captureStdout();

	const exitCode = await checkOutdated(argv);

	const stdout = unhookCapture();

	expectedCallback(usedCommand, exitCode, stdout);
}

/**
 * Start capturing the output to process.stdout.
 *
 * @returns {() => string} A callback function to stop the capturing, which returns the captured output as string.
 */
function captureStdout () {
	const write = process.stdout.write;

	/** @type {string[]} */
	const data = [];

	process.stdout.write = (/** @type {string | Uint8Array} */ buffer) => {
		data.push(buffer.toString());

		return false;
	};

	return () => {
		process.stdout.write = write;

		return data.join('');
	};
}
