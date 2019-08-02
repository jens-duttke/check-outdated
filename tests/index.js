/* eslint-disable no-console, max-len, max-lines-per-function */

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
		assert('`command` should be `undefined`', command === undefined);
		assert('`exitCode` should be `1`', exitCode === 1);
		assert('`stdout` should contain `"Arguments:"`', stdout.includes('Arguments:'));
	});

	await test('should show help', ['--help'], {}, (command, exitCode, stdout) => {
		assert('`command` should be `undefined`', command === undefined);
		assert('`exitCode` should be `1`', exitCode === 1);
		assert('`stdout` should contain `"Arguments:"`', stdout.includes('Arguments:'));
	});

	await test('should catch npm error', [], { error: { code: 'TEST', summary: 'Test error' } }, (command, exitCode, stdout) => {
		assert('`command` should be `"npm outdated --json --long --save false"`', command === 'npm outdated --json --long --save false');
		assert('`exitCode` should be `1`', exitCode === 1);
		assert('`stdout` should contain the correct response', stdout === '\u001b[0;31mError while gathering outdated dependencies:\u001b[0;0m\n\n\u001b[0;35mcode\u001b[0;0m TEST\n\u001b[0;35msummary\u001b[0;0m Test error\n');
	});

	await test('should return without outdated dependency message', [], {}, (command, exitCode, stdout) => {
		assert('`command` should be `"npm outdated --json --long --save false"`', command === 'npm outdated --json --long --save false');
		assert('`exitCode` should be `0`', exitCode === 0);
		assert('`stdout` should be `"All dependencies are up-to-date.\n"`', stdout === 'All dependencies are up-to-date.\n');
	});

	await test('should return with outdated dependency message', [], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		assert('`command` should be `"npm outdated --json --long --save false"`', command === 'npm outdated --json --long --save false');
		assert('`exitCode` should be `1`', exitCode === 1);
		assert('`stdout` should contain `"10 outdated dependencies found:"`', stdout.includes('10 outdated dependencies found:'));

		assert('`stdout` should contain `"module-major"`', stdout.includes('module-major'));
		assert('`stdout` should contain `"module-minor"`', stdout.includes('module-minor'));
		assert('`stdout` should contain `"module-patch"`', stdout.includes('module-patch'));
		assert('`stdout` should contain `"module-prerelease"`', stdout.includes('module-prerelease'));
		assert('`stdout` should contain `"module-build"`', stdout.includes('module-build'));
		assert('`stdout` should contain `"module-sub-version"`', stdout.includes('module-sub-version'));
		assert('`stdout` should contain `"module-revert"`', stdout.includes('module-revert'));
		assert('`stdout` should contain `"module-non-semver"`', stdout.includes('module-non-semver'));
		assert('`stdout` should contain `"module-diff-wanted"`', stdout.includes('module-diff-wanted'));
		assert('`stdout` should contain `"module-dev-major"`', stdout.includes('module-dev-major'));

		assert('`stdout` should contain the correct response', stdout === '10 outdated dependencies found:\n\n\u001b[4mPackage\u001b[0;0m             \u001b[4mCurrent\u001b[0;0m  \u001b[4mWanted\u001b[0;0m  \u001b[4mLatest\u001b[0;0m         \u001b[4mType\u001b[0;0m        \u001b[4mLocation\u001b[0;0m             \u001b[4mPackage Type\u001b[0;0m   \n\u001b[0;33mmodule-major\u001b[0;0m          \u001b[4m1\u001b[0;0m.\u001b[0;0m0\u001b[0;0m.\u001b[0;0m0\u001b[0;0m  \u001b[0;32m 1.0.0\u001b[0;0m          \u001b[4;35m2\u001b[0;35m.\u001b[0;35m0\u001b[0;35m.\u001b[0;35m0\u001b[0;0m  major\u001b[0;0m       node_modules/module\u001b[0;0m  dependencies\u001b[0;0m   \n\u001b[0;33mmodule-minor\u001b[0;0m          \u001b[0;0m1\u001b[0;0m.\u001b[4m0\u001b[0;0m.\u001b[0;0m0\u001b[0;0m  \u001b[0;32m 1.0.0\u001b[0;0m          \u001b[0;35m1\u001b[0;35m.\u001b[4;35m1\u001b[0;35m.\u001b[0;35m0\u001b[0;0m  minor\u001b[0;0m       node_modules/module\u001b[0;0m  dependencies\u001b[0;0m   \n\u001b[0;33mmodule-patch\u001b[0;0m          \u001b[0;0m1\u001b[0;0m.\u001b[0;0m0\u001b[0;0m.\u001b[4m0\u001b[0;0m  \u001b[0;32m 1.0.0\u001b[0;0m          \u001b[0;35m1\u001b[0;35m.\u001b[0;35m0\u001b[0;35m.\u001b[4;35m1\u001b[0;0m  patch\u001b[0;0m       node_modules/module\u001b[0;0m  dependencies\u001b[0;0m   \n\u001b[0;33mmodule-prerelease\u001b[0;0m     \u001b[0;0m1\u001b[0;0m.\u001b[0;0m0\u001b[0;0m.\u001b[0;0m0\u001b[0;0m  \u001b[0;32m 1.0.0\u001b[0;0m  \u001b[0;35m1\u001b[0;35m.\u001b[0;35m0\u001b[0;35m.\u001b[0;35m0\u001b[4;35m-\u001b[4;35malpha\u001b[4;35m.\u001b[4;35m1\u001b[0;0m  prerelease\u001b[0;0m  node_modules/module\u001b[0;0m  dependencies\u001b[0;0m   \n\u001b[0;33mmodule-build\u001b[0;0m          \u001b[0;0m1\u001b[0;0m.\u001b[0;0m0\u001b[0;0m.\u001b[4m0\u001b[0;0m  \u001b[0;32m 1.0.0\u001b[0;0m    \u001b[0;35m1\u001b[0;35m.\u001b[0;35m0\u001b[0;35m.\u001b[4;35m0+build\u001b[0;0m  build\u001b[0;0m       node_modules/module\u001b[0;0m  dependencies\u001b[0;0m   \n\u001b[0;33mmodule-sub-version\u001b[0;0m    \u001b[0;0m1\u001b[0;0m.\u001b[0;0m0\u001b[0;0m.\u001b[0;0m0\u001b[0;0m  \u001b[0;32m 1.0.0\u001b[0;0m        \u001b[0;35m1\u001b[0;35m.\u001b[0;35m0\u001b[0;35m.\u001b[0;35m0\u001b[4;35m.\u001b[4;35m1\u001b[0;0m  \u001b[0;0m            node_modules/module\u001b[0;0m  dependencies\u001b[0;0m   \n\u001b[0;33mmodule-revert\u001b[0;0m         \u001b[0;0m1\u001b[0;0m.\u001b[4m1\u001b[0;0m.\u001b[0;0m0\u001b[0;0m  \u001b[0;32m 1.1.0\u001b[0;0m          \u001b[0;35m1\u001b[0;35m.\u001b[4;35m0\u001b[0;35m.\u001b[0;35m0\u001b[0;0m  \u001b[0;0m            node_modules/module\u001b[0;0m  dependencies\u001b[0;0m   \n\u001b[0;33mmodule-non-semver\u001b[0;0m        \u001b[4mR1\u001b[0;0m  \u001b[0;32m    R1\u001b[0;0m             \u001b[4;35mR2\u001b[0;0m  \u001b[0;0m            node_modules/module\u001b[0;0m  dependencies\u001b[0;0m   \n\u001b[0;31mmodule-diff-wanted\u001b[0;0m    \u001b[0;0m1\u001b[0;0m.\u001b[4m0\u001b[0;0m.\u001b[0;0m0\u001b[0;0m  \u001b[0;32m 1.1.0\u001b[0;0m          \u001b[0;35m1\u001b[0;35m.\u001b[4;35m2\u001b[0;35m.\u001b[0;35m0\u001b[0;0m  minor\u001b[0;0m       node_modules/module\u001b[0;0m  dependencies\u001b[0;0m   \n\u001b[0;33mmodule-dev-major\u001b[0;0m      \u001b[4m1\u001b[0;0m.\u001b[0;0m0\u001b[0;0m.\u001b[0;0m0\u001b[0;0m  \u001b[0;32m 1.0.0\u001b[0;0m          \u001b[4;35m2\u001b[0;35m.\u001b[0;35m0\u001b[0;35m.\u001b[0;35m0\u001b[0;0m  major\u001b[0;0m       node_modules/module\u001b[0;0m  devDependencies\u001b[0;0m\n\n');

		// For testing purpose: console.log(stdout);
	});

	await test('should return with outdated dependency message, ignoring pre-releases', ['--ignore-pre-releases'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		assert('`command` should be `"npm outdated --json --long --save false"`', command === 'npm outdated --json --long --save false');
		assert('`exitCode` should be `1`', exitCode === 1);
		assert('`stdout` should contain `"9 outdated dependencies found:"`', stdout.includes('9 outdated dependencies found:'));

		assert('`stdout` should not contain `"module-prerelease"`', !stdout.includes('module-prerelease'));
	});

	await test('should return with outdated non-dev-dependency message, ignoring dev-dependencies', ['--ignore-dev-dependencies'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		assert('`command` should be `"npm outdated --json --long --save false"`', command === 'npm outdated --json --long --save false');
		assert('`exitCode` should be `1`', exitCode === 1);
		assert('`stdout` should contain `"9 outdated dependencies found:"`', stdout.includes('9 outdated dependencies found:'));

		assert('`stdout` should not contain `"module-dev-major"`', !stdout.includes('module-dev-major'));
	});

	await test('should return with outdated dependency message, ignoring package `"module-major"` and `"module-minor"`', ['--ignore-packages', 'module-major,module-minor'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		assert('`command` should be `"npm outdated --json --long --save false"`', command === 'npm outdated --json --long --save false');
		assert('`exitCode` should be `1`', exitCode === 1);
		assert('`stdout` should contain `"8 outdated dependencies found:"`', stdout.includes('8 outdated dependencies found:'));

		assert('`stdout` should not contain `"module-major"`', !stdout.includes('module-major'));
		assert('`stdout` should not contain `"module-minor"`', !stdout.includes('module-minor'));
	});

	await test('should return with the help indicating an argument problem', ['--ignore-packages'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		assert('`command` should be `undefined`', command === undefined);
		assert('`exitCode` should be `1`', exitCode === 1);
		assert('`stdout` should contain `"Invalid value of --ignore-packages"`', stdout.includes('Invalid value of --ignore-packages'));
	});

	await test('should return with outdated dependency message', ['--global'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		assert('`command` should be `"npm outdated --json --long --save false"`', command === 'npm outdated --json --long --save false --global');
		assert('`exitCode` should be `1`', exitCode === 1);
		assert('`stdout` should contain `"10 outdated dependencies found:"`', stdout.includes('10 outdated dependencies found:'));
	});

	// @todo Improve this test by adding modules with deeper node_modules-structure
	await test('should return with outdated dependency message', ['--depth', '10'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		assert('`command` should be `"npm outdated --json --long --save false"`', command === 'npm outdated --json --long --save false --depth 10');
		assert('`exitCode` should be `1`', exitCode === 1);
		assert('`stdout` should contain `"10 outdated dependencies found:"`', stdout.includes('10 outdated dependencies found:'));
	});

	await test('should return with the help indicating an argument problem', ['--depth', 'INVALID'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		assert('`command` should be `undefined`', command === undefined);
		assert('`exitCode` should be `1`', exitCode === 1);
		assert('`stdout` should contain `"Invalid value of --depth"`', stdout.includes('Invalid value of --depth'));
	});

	await test('should return with outdated dependency message if all options are activated', ['--ignore-pre-releases', '--ignore-dev-dependencies', '--ignore-packages', 'module-major,module-minor', '--global', '--depth', '10'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
		assert('`command` should be `"npm outdated --json --long --save false"`', command === 'npm outdated --json --long --save false --global --depth 10');
		assert('`exitCode` should be `1`', exitCode === 1);
		assert('`stdout` should contain `"6 outdated dependencies found:"`', stdout.includes('6 outdated dependencies found:'));

		assert('`stdout` should not contain `"module-major"`', !stdout.includes('module-major'));
		assert('`stdout` should not contain `"module-minor"`', !stdout.includes('module-minor'));
		assert('`stdout` should not contain `"module-prerelease"`', !stdout.includes('module-prerelease'));
		assert('`stdout` should not contain `"module-dev-major"`', !stdout.includes('module-dev-major'));
	});

	console.log();
	console.log(`${styles.GREEN}${sum.passed} passed${styles.NONE}`);
	if (sum.failed > 0) {
		console.log(`${styles.RED}${sum.failed} failed${styles.NONE}`);
	}
})();

/**
 * @param {string} message
 * @param {boolean} ok
 */
function assert (message, ok) {
	if (ok) {
		const styledMessage = message.replace(/\n/gu, '\\n').replace(/`(.+?)`/gu, `${styles.UNDERLINE}$1${styles.GRAY}`);

		console.log(`    ${styles.GREEN}√${styles.GRAY} ${styledMessage}${styles.NONE}`);

		sum.passed++;
	}
	else {
		const styledMessage = message.replace(/\n/gu, '\\n').replace(/`(.+?)`/gu, `${styles.UNDERLINE}$1${styles.RED}`);

		console.error(`    ${styles.RED}× ${styledMessage}${styles.NONE}`);
		console.error();
		console.error(`      ${styles.GRAY}- Test failed ${(Error().stack || '').split('\n').slice(2, 3).join('').trim()}${styles.NONE}`);
		console.error();

		sum.failed++;
	}
}

/**
 * @param {string} title
 * @param {string[]} argv
 * @param {object} dependencies
 * @param {(command: string | undefined, exitCode: number, stdout: string) => void} expectedCallback
 */
async function test (title, argv, dependencies, expectedCallback) {
	const styledTitle = title.replace(/\n/gu, '\\n').replace(/`(.+?)`/gu, `${styles.UNDERLINE}$1${styles.NONE}`);

	console.log();
	console.log(`  ${JSON.stringify(argv)} ${styledTitle}`);
	console.log();

	let usedCommand;

	const checkOutdated = proxyquire('../check-outdated', {
		// eslint-disable-next-line @typescript-eslint/camelcase,camelcase
		child_process: {
			/**
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
