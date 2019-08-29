/* eslint-disable no-console, max-len, max-lines-per-function */

const assert = require('assert').strict;
const proxyquire = require('proxyquire').noPreserveCache();

/**
 * ANSI escape sequences for coloring terminal output
 */
const styles = {
	NONE: '\x1b[0;0m',
	UNDERLINE: '\x1b[4m',
	RED: '\x1b[0;31m',
	GREEN: '\x1b[0;32m',
	GRAY: '\x1b[0;0m\x1b[1;30m'
};

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
		expect('`stdout` should contain the correct response', () => assert.equal(stdout, '\u001b[0;31mError while gathering outdated dependencies:\u001b[0;0m\n\n\u001b[0;35mcode\u001b[0;0m TEST\n\u001b[0;35msummary\u001b[0;0m Test error\n'));
	});

	await test('should return without outdated dependency message', [], {}, (command, exitCode, stdout) => {
		expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false'));
		expect('`exitCode` should be `0`', () => assert.equal(exitCode, 0));
		expect('`stdout` should be `"All dependencies are up-to-date.\n"`', () => assert.equal(stdout, 'All dependencies are up-to-date.\n'));
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

		expect('`stdout` should contain the correct response', () => assert.equal(stdout, '10 outdated dependencies found:\n\n\u001b[4mPackage\u001b[0;0m             \u001b[4mCurrent\u001b[0;0m  \u001b[4mWanted\u001b[0;0m  \u001b[4mLatest\u001b[0;0m         \u001b[4mType\u001b[0;0m        \u001b[4mLocation\u001b[0;0m             \u001b[4mPackage Type\u001b[0;0m   \n\u001b[0;33mmodule-major\u001b[0;0m          \u001b[4m1\u001b[0;0m.\u001b[0;0m0\u001b[0;0m.\u001b[0;0m0\u001b[0;0m  \u001b[0;32m 1.0.0\u001b[0;0m          \u001b[4;35m2\u001b[0;35m.\u001b[0;35m0\u001b[0;35m.\u001b[0;35m0\u001b[0;0m  major\u001b[0;0m       node_modules/module\u001b[0;0m  dependencies\u001b[0;0m   \n\u001b[0;33mmodule-minor\u001b[0;0m          \u001b[0;0m1\u001b[0;0m.\u001b[4m0\u001b[0;0m.\u001b[0;0m0\u001b[0;0m  \u001b[0;32m 1.0.0\u001b[0;0m          \u001b[0;35m1\u001b[0;35m.\u001b[4;35m1\u001b[0;35m.\u001b[0;35m0\u001b[0;0m  minor\u001b[0;0m       node_modules/module\u001b[0;0m  dependencies\u001b[0;0m   \n\u001b[0;33mmodule-patch\u001b[0;0m          \u001b[0;0m1\u001b[0;0m.\u001b[0;0m0\u001b[0;0m.\u001b[4m0\u001b[0;0m  \u001b[0;32m 1.0.0\u001b[0;0m          \u001b[0;35m1\u001b[0;35m.\u001b[0;35m0\u001b[0;35m.\u001b[4;35m1\u001b[0;0m  patch\u001b[0;0m       node_modules/module\u001b[0;0m  dependencies\u001b[0;0m   \n\u001b[0;33mmodule-prerelease\u001b[0;0m     \u001b[0;0m1\u001b[0;0m.\u001b[0;0m0\u001b[0;0m.\u001b[0;0m0\u001b[0;0m  \u001b[0;32m 1.0.0\u001b[0;0m  \u001b[0;35m1\u001b[0;35m.\u001b[0;35m0\u001b[0;35m.\u001b[0;35m0\u001b[4;35m-\u001b[4;35malpha\u001b[4;35m.\u001b[4;35m1\u001b[0;0m  prerelease\u001b[0;0m  node_modules/module\u001b[0;0m  dependencies\u001b[0;0m   \n\u001b[0;33mmodule-build\u001b[0;0m          \u001b[0;0m1\u001b[0;0m.\u001b[0;0m0\u001b[0;0m.\u001b[4m0\u001b[0;0m  \u001b[0;32m 1.0.0\u001b[0;0m    \u001b[0;35m1\u001b[0;35m.\u001b[0;35m0\u001b[0;35m.\u001b[4;35m0+build\u001b[0;0m  build\u001b[0;0m       node_modules/module\u001b[0;0m  dependencies\u001b[0;0m   \n\u001b[0;33mmodule-sub-version\u001b[0;0m    \u001b[0;0m1\u001b[0;0m.\u001b[0;0m0\u001b[0;0m.\u001b[0;0m0\u001b[0;0m  \u001b[0;32m 1.0.0\u001b[0;0m        \u001b[0;35m1\u001b[0;35m.\u001b[0;35m0\u001b[0;35m.\u001b[0;35m0\u001b[4;35m.\u001b[4;35m1\u001b[0;0m  \u001b[0;0m            node_modules/module\u001b[0;0m  dependencies\u001b[0;0m   \n\u001b[0;33mmodule-revert\u001b[0;0m         \u001b[0;0m1\u001b[0;0m.\u001b[4m1\u001b[0;0m.\u001b[0;0m0\u001b[0;0m  \u001b[0;32m 1.1.0\u001b[0;0m          \u001b[0;35m1\u001b[0;35m.\u001b[4;35m0\u001b[0;35m.\u001b[0;35m0\u001b[0;0m  \u001b[0;0m            node_modules/module\u001b[0;0m  dependencies\u001b[0;0m   \n\u001b[0;33mmodule-non-semver\u001b[0;0m        \u001b[4mR1\u001b[0;0m  \u001b[0;32m    R1\u001b[0;0m             \u001b[4;35mR2\u001b[0;0m  \u001b[0;0m            node_modules/module\u001b[0;0m  dependencies\u001b[0;0m   \n\u001b[0;31mmodule-diff-wanted\u001b[0;0m    \u001b[0;0m1\u001b[0;0m.\u001b[4m0\u001b[0;0m.\u001b[0;0m0\u001b[0;0m  \u001b[0;32m 1.1.0\u001b[0;0m          \u001b[0;35m1\u001b[0;35m.\u001b[4;35m2\u001b[0;35m.\u001b[0;35m0\u001b[0;0m  minor\u001b[0;0m       node_modules/module\u001b[0;0m  dependencies\u001b[0;0m   \n\u001b[0;33mmodule-dev-major\u001b[0;0m      \u001b[4m1\u001b[0;0m.\u001b[0;0m0\u001b[0;0m.\u001b[0;0m0\u001b[0;0m  \u001b[0;32m 1.0.0\u001b[0;0m          \u001b[4;35m2\u001b[0;35m.\u001b[0;35m0\u001b[0;35m.\u001b[0;35m0\u001b[0;0m  major\u001b[0;0m       node_modules/module\u001b[0;0m  devDependencies\u001b[0;0m\n\n'));

		// For testing purpose: console.log(stdout);
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
	console.log(`${styles.GREEN}${sum.passed} passed${styles.NONE}`);
	if (sum.failed > 0) {
		console.log(`${styles.RED}${sum.failed} failed${styles.NONE}`);
	}
})();

/**
 * Handle a specific test.
 *
 * @param {string} message
 * @param {function} assertion
 */
function expect (message, assertion) {
	try {
		assertion();
	}
	catch (error) {
		const styledMessage = message.replace(/\n/gu, '\\n').replace(/`(.+?)`/gu, `${styles.UNDERLINE}$1${styles.RED}`);
		const errorType = (error instanceof assert.AssertionError ? 'Test failed' : 'Error in code');

		console.error(`    ${styles.RED}× ${styledMessage}${styles.NONE}`);
		console.error();
		console.error(`      ${styles.GRAY}- ${errorType} ${error.message.replace(/\n/gu, '\n      ')}${styles.NONE}`);
		console.error();
		console.error(`      ${styles.GRAY}${(Error().stack || '').split('\n').slice(2, 3).join('').trim()}${styles.NONE}`);
		console.error();

		sum.failed++;

		return;
	}

	const styledMessage = message.replace(/\n/gu, '\\n').replace(/`(.+?)`/gu, `${styles.UNDERLINE}$1${styles.GRAY}`);

	console.log(`    ${styles.GREEN}√${styles.GRAY} ${styledMessage}${styles.NONE}`);

	sum.passed++;
}

/**
 * Assert that a string contains a specific word.
 *
 * @param {string} str
 * @param {string} word
 * @returns {void | never}
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
 * Assert that a string does not contains a specific word.
 *
 * @param {string} str
 * @param {string} word
 * @returns {void | never}
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
 * Returns true if the given string contains a specific word.
 *
 * ANSI escape sequences for coloring in `str` are ignored.
 *
 * @param {string} str
 * @param {string} word
 * @returns {boolean}
 */
function hasWord (str, word) {
	return new RegExp(`(^|[^A-Za-z0-9$-_])${word}($|[^A-Za-z0-9$-_])`, 'um').test(str.replace(/\x1b\[.+?m/gu, ''));
}

/**
 * Create a test suite to test a specific call "check-outdated" call.
 *
 * @param {string} title
 * @param {string[]} argv
 * @param {object} dependencies
 * @param {(command: string | undefined, exitCode: number, stdout: string) => void} expectedCallback
 * @returns {Promise<void>}
 */
async function test (title, argv, dependencies, expectedCallback) {
	const styledTitle = title.replace(/\n/gu, '\\n').replace(/`(.+?)`/gu, `${styles.UNDERLINE}$1${styles.NONE}`);

	console.log();
	console.log(`  ${JSON.stringify(argv)} ${styledTitle}`);
	console.log();

	let usedCommand;

	const checkOutdated = proxyquire('../check-outdated', {
		// eslint-disable-next-line @typescript-eslint/camelcase
		child_process: {
			/**
			 * Mock of the child_process.exec() function, which is used by `check-outdated` to call `npm outdated`.
			 *
			 * @param {string} command
			 * @param {(error: Error | null, stdout: string, stderr: string) => void} callback
			 */
			exec (command, callback) {
				usedCommand = command;

				callback(null, JSON.stringify(dependencies), '');
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
 * Returns a callback function to stop the capturing, which returns the captured output as string.
 *
 * @returns {() => string}
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
