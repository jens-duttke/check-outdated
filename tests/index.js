/**
 * @file Different tests to verify everything works correctly.
 */

const assert = require('assert').strict;
const proxyquire = require('proxyquire').noPreserveCache();
const tty = require('tty');

let colorize = require('../helper/colorize');

const isTerminal = tty.isatty(1);

if (!isTerminal) {
	colorize = colorize.disabled;
}

/**
 * Used to mock the response for `npm outdated`.
 *
 * @type {{ [dependencyName: string]: Partial<import('../check-outdated').OutdatedDependency>; }}
 */
const DEFAULT_RESPONSE = {
	'module-major': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module-major',
		type: 'dependencies'
	},
	'module-minor': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '1.1.0',
		location: 'node_modules/module-minor',
		type: 'dependencies'
	},
	'module-patch': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '1.0.1',
		location: 'node_modules/module-patch',
		type: 'dependencies'
	},
	'module-prerelease': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '1.0.0-alpha.1',
		location: 'node_modules/module-prelease',
		type: 'dependencies'
	},
	'module-build': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '1.0.0+build',
		location: 'node_modules/module-build',
		type: 'dependencies'
	},
	'module-sub-version': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '1.0.0.1',
		location: 'node_modules/module-sub-version',
		type: 'dependencies'
	},
	'module-revert': {
		current: '1.1.0',
		wanted: '1.1.0',
		latest: '1.0.0',
		location: 'node_modules/module-revert',
		type: 'dependencies'
	},
	'module-non-semver': {
		current: 'R1',
		wanted: 'R1',
		latest: 'R2',
		location: 'node_modules/module-non-semver',
		type: 'dependencies'
	},
	'module-git': {
		current: 'git',
		wanted: 'git',
		latest: 'git',
		location: 'node_modules/module-git',
		type: 'dependencies'
	},
	'module-linked': {
		current: 'linked',
		wanted: 'linked',
		latest: 'linked',
		location: 'node_modules/module-linked',
		type: 'dependencies'
	},
	'module-remote': {
		current: 'remote',
		wanted: 'remote',
		latest: 'remote',
		location: 'node_modules/module-remote',
		type: 'dependencies'
	},
	'module-diff-wanted': {
		current: '1.0.0',
		wanted: '1.1.0',
		latest: '1.2.0',
		location: 'node_modules/module-diff-wanted',
		type: 'dependencies'
	},
	'module-dev-major': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module-dev-major',
		type: 'devDependencies'
	},
	'module-absolute-unix-path': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: '/home/user/node_modules/module-absolute-unix-path',
		type: 'dependencies'
	},
	'module-absolute-windows-path': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'C:\\Users\\user\\AppData\\Roaming\\npm\\node_modules\\module-absolute-windows-path',
		type: 'dependencies'
	},
	'module-with-homepage': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module-with-changelog',
		type: 'dependencies',
		homepage: 'https://www.duttke.de'
	},
	'module-with-changelog': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module-with-changelog',
		type: 'dependencies'
	},
	'module-with-package-json-with-homepage-and-author': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module-with-package-json-with-homepage-and-author',
		type: 'dependencies'
	},
	'module-with-package-json-with-repository-and-author': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module-with-package-json-with-repository-and-author',
		type: 'dependencies'
	},
	'module-with-package-json-with-github-repository': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module-with-package-json-with-github-repository',
		type: 'dependencies'
	},
	'module-with-package-json-with-github-repository2': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module-with-package-json-with-github-repository2',
		type: 'dependencies'
	},
	'module-with-package-json-with-github-repository-string': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module-with-package-json-with-github-repository-string',
		type: 'dependencies'
	},
	'module-with-package-json-with-gist-repository-string': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module-with-package-json-with-gist-repository-string',
		type: 'dependencies'
	},
	'module-with-package-json-with-bitbucket-repository-string': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module-with-package-json-with-bitbucket-repository-string',
		type: 'dependencies'
	},
	'module-with-package-json-with-gitlab-repository-string': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module-with-package-json-with-gitlab-repository-string',
		type: 'dependencies'
	},
	'module-with-package-json-with-repository-without-url': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module-with-package-json-with-repository-without-url',
		type: 'dependencies'
	},
	'module-with-package-json-with-author': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module-with-package-json-with-author',
		type: 'dependencies'
	},
	'module-with-package-json-with-author-without-url': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module-with-package-json-with-author-without-url',
		type: 'dependencies'
	},
	'module-with-package-json-with-author-string': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module-with-package-json-with-author-string',
		type: 'dependencies'
	},
	'module-with-package-json-with-homepage-and-repository': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/module-with-package-json-with-homepage-and-repository',
		type: 'dependencies'
	},
	'@scoped/module': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.0.0',
		location: 'node_modules/@scoped/module',
		type: 'dependencies'
	}
};

/**
 * Used to mock the return response for `fs.existsSync()`.
 *
 * @type {{ [path: string]: boolean; }}
 */
const EXISTS_MOCK = {
	'node_modules/module-with-changelog/CHANGELOG.md': true
};

/**
 * Used to mock the return value for `fs.readFileSync()`.
 *
 * @type {{ [path: string]: string | import('../helper/files').PackageJSON; }}
 */
const READ_FILE_MOCK = {
	'node_modules/module-with-package-json-with-homepage-and-author/package.json': {
		homepage: 'https://www.duttke.de/#homepage',
		author: 'Jens Duttke <github@duttke.de> (https://www.duttke.de/#author)'
	},
	'node_modules/module-with-package-json-with-repository-and-author/package.json': {
		repository: {
			type: 'git',
			url: 'https://www.duttke.de/#git'
		},
		author: 'Jens Duttke <github@duttke.de> (https://www.duttke.de/#author)'
	},
	'node_modules/module-with-package-json-with-github-repository/package.json': {
		repository: {
			type: 'git',
			url: 'https://github.com/jens-duttke/check-outdated'
		}
	},
	'node_modules/module-with-package-json-with-github-repository2/package.json': {
		repository: {
			type: 'git',
			url: 'git+https://github.com/jens-duttke/check-outdated.git'
		}
	},
	'node_modules/module-with-package-json-with-github-repository-string/package.json': {
		repository: 'github:user/repo'
	},
	'node_modules/module-with-package-json-with-gist-repository-string/package.json': {
		repository: 'gist:11081aaa281'
	},
	'node_modules/module-with-package-json-with-bitbucket-repository-string/package.json': {
		repository: 'bitbucket:user/repo'
	},
	'node_modules/module-with-package-json-with-gitlab-repository-string/package.json': {
		repository: 'gitlab:user/repo'
	},
	'node_modules/module-with-package-json-with-repository-without-url/package.json': {
		repository: {
			type: 'git'
		}
	},
	'node_modules/module-with-package-json-with-author/package.json': {
		author: {
			name: 'Jens Duttke',
			email: 'github@duttke.de',
			url: 'https://www.duttke.de/#author'
		}
	},
	'node_modules/module-with-package-json-with-author-without-url/package.json': {
		author: {
			name: 'Jens Duttke',
			email: 'github@duttke.de'
		}
	},
	'node_modules/module-with-package-json-with-author-string/package.json': {
		author: 'Jens Duttke <github@duttke.de> (https://www.duttke.de/#author)'
	},
	'node_modules/module-with-package-json-with-homepage-and-repository/package.json': {
		homepage: 'https://www.duttke.de/#homepage',
		repository: {
			type: 'git',
			url: 'https://www.duttke.de/#git'
		}
	}
};

const sum = {
	passed: 0,
	failed: 0
};

(async () => {
	await describe('-h / --help arguments', async () => {
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
	});

	await describe('Invalid npm response', async () => {
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
	});

	await describe('Invalid arguments', async () => {
		await test('should return with an "Unknown argument" message, for a single argument', ['--unknown-argument'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expect('`command` should be `undefined`', () => assert.equal(command, undefined));
			expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
			expect('`stdout` should contain `"Unknown argument: --unknown-argument"`', () => assertHasWord(stdout, 'Unknown argument: --unknown-argument'));
		});

		await test('should return with an "Unknown argument"  message, for multiple arguments', ['--unknown-argument1', '--unknown-argument2'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expect('`command` should be `undefined`', () => assert.equal(command, undefined));
			expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
			expect('`stdout` should contain `"Unknown arguments: --unknown-argument1, --unknown-argument2"`', () => assertHasWord(stdout, 'Unknown arguments: --unknown-argument1, --unknown-argument2'));
		});
	});

	await describe('--ignore-dev-dependencies argument', async () => {
		await test('should return with outdated dependency message, ignoring pre-releases', ['--ignore-pre-releases'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false'));
			expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
			expect('`stdout` should contain `"27 outdated dependencies found:"`', () => assertHasWord(stdout, '27 outdated dependencies found:'));

			expect('`stdout` should not contain `"module-prerelease"`', () => assertNotHasWord(stdout, 'module-prerelease'));
		});
	});

	await describe('--ignore-dev-dependencies argument', async () => {
		await test('should return with outdated non-dev-dependency message, ignoring dev-dependencies', ['--ignore-dev-dependencies'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false'));
			expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
			expect('`stdout` should contain `"27 outdated dependencies found:"`', () => assertHasWord(stdout, '27 outdated dependencies found:'));

			expect('`stdout` should not contain `"module-dev-major"`', () => assertNotHasWord(stdout, 'module-dev-major'));
		});
	});

	await describe('--ignore-packages argument', async () => {
		await test('should return with outdated dependency message, ignoring package `"module-major"` and `"module-minor"`', ['--ignore-packages', 'module-major,module-minor'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false'));
			expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
			expect('`stdout` should contain `"26 outdated dependencies found:"`', () => assertHasWord(stdout, '26 outdated dependencies found:'));

			expect('`stdout` should not contain `"module-major"`', () => assertNotHasWord(stdout, 'module-major'));
			expect('`stdout` should not contain `"module-minor"`', () => assertNotHasWord(stdout, 'module-minor'));
		});

		await test('should return with the help indicating an argument problem', ['--ignore-packages'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expect('`command` should be `undefined`', () => assert.equal(command, undefined));
			expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
			expect('`stdout` should contain `"Invalid value of --ignore-packages"`', () => assertHasWord(stdout, 'Invalid value of --ignore-packages'));
		});
	});

	await describe('--columns argument', async () => {
		await test('should return with outdated dependency message and all available columns', ['--columns', 'name,current,wanted,latest,type,location,packageType,changes,changesPreferLocal,homepage,npmjs'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false'));
			expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
			expect('`stdout` should contain `"28 outdated dependencies found:"`', () => assertHasWord(stdout, '28 outdated dependencies found:'));

			expect('`stdout` should contain `"module-major"`', () => assertHasWord(stdout, 'module-major'));
			expect('`stdout` should contain `"module-minor"`', () => assertHasWord(stdout, 'module-minor'));
			expect('`stdout` should contain `"module-patch"`', () => assertHasWord(stdout, 'module-patch'));
			expect('`stdout` should contain `"module-prerelease"`', () => assertHasWord(stdout, 'module-prerelease'));
			expect('`stdout` should contain `"module-build"`', () => assertHasWord(stdout, 'module-build'));
			expect('`stdout` should contain `"module-sub-version"`', () => assertHasWord(stdout, 'module-sub-version'));
			expect('`stdout` should contain `"module-revert"`', () => assertHasWord(stdout, 'module-revert'));
			expect('`stdout` should contain `"module-non-semver"`', () => assertHasWord(stdout, 'module-non-semver'));
			expect('`stdout` should not contain `"module-git"`', () => assertNotHasWord(stdout, 'module-git'));
			expect('`stdout` should not contain `"module-linked"`', () => assertNotHasWord(stdout, 'module-linked'));
			expect('`stdout` should not contain `"module-remote"`', () => assertNotHasWord(stdout, 'module-remote'));
			expect('`stdout` should contain `"module-diff-wanted"`', () => assertHasWord(stdout, 'module-diff-wanted'));
			expect('`stdout` should contain `"module-dev-major"`', () => assertHasWord(stdout, 'module-dev-major'));
			expect('`stdout` should contain `"module-absolute-unix-path"`', () => assertHasWord(stdout, 'module-absolute-unix-path'));
			expect('`stdout` should contain `"module-absolute-windows-path"`', () => assertHasWord(stdout, 'module-absolute-windows-path'));
			expect('`stdout` should contain `"module-with-changelog"`', () => assertHasWord(stdout, 'module-with-changelog'));
			expect('`stdout` should contain `"module-with-package-json-with-homepage-and-author"`', () => assertHasWord(stdout, 'module-with-package-json-with-homepage-and-author'));
			expect('`stdout` should contain `"module-with-package-json-with-repository-and-author"`', () => assertHasWord(stdout, 'module-with-package-json-with-repository-and-author'));
			expect('`stdout` should contain `"module-with-package-json-with-github-repository"`', () => assertHasWord(stdout, 'module-with-package-json-with-github-repository'));
			expect('`stdout` should contain `"module-with-package-json-with-github-repository2"`', () => assertHasWord(stdout, 'module-with-package-json-with-github-repository2'));
			expect('`stdout` should contain `"module-with-package-json-with-github-repository-string"`', () => assertHasWord(stdout, 'module-with-package-json-with-github-repository-string'));
			expect('`stdout` should contain `"module-with-package-json-with-gist-repository-string"`', () => assertHasWord(stdout, 'module-with-package-json-with-gist-repository-string'));
			expect('`stdout` should contain `"module-with-package-json-with-bitbucket-repository-string"`', () => assertHasWord(stdout, 'module-with-package-json-with-bitbucket-repository-string'));
			expect('`stdout` should contain `"module-with-package-json-with-gitlab-repository-string"`', () => assertHasWord(stdout, 'module-with-package-json-with-gitlab-repository-string'));
			expect('`stdout` should contain `"module-with-package-json-with-repository-without-url"`', () => assertHasWord(stdout, 'module-with-package-json-with-repository-without-url'));
			expect('`stdout` should contain `"module-with-package-json-with-author"`', () => assertHasWord(stdout, 'module-with-package-json-with-author'));
			expect('`stdout` should contain `"module-with-package-json-with-author-without-url"`', () => assertHasWord(stdout, 'module-with-package-json-with-author-without-url'));
			expect('`stdout` should contain `"module-with-package-json-with-author-string"`', () => assertHasWord(stdout, 'module-with-package-json-with-author-string'));
			expect('`stdout` should contain `"module-with-package-json-with-homepage-and-repository"`', () => assertHasWord(stdout, 'module-with-package-json-with-homepage-and-repository'));
			expect('`stdout` should contain `"@scoped/module"`', () => assertHasWord(stdout, '@scoped/module'));

			expect('`stdout` should contain the correct response', () => assert.equal(
				stdout.replace(/\x20+(\n|$)/gu, '$1'),
				[
					'28 outdated dependencies found:',
					'',
					'\u001b[4mPackage\u001b[24m                                                    \u001b[4mCurrent\u001b[24m  \u001b[4mWanted\u001b[24m         \u001b[4mLatest\u001b[24m  \u001b[4mType\u001b[24m        \u001b[4mLocation\u001b[24m                                                                     \u001b[4mPackage Type\u001b[24m     \u001b[4mChanges\u001b[24m                                                                             \u001b[4mChanges\u001b[24m                                                                             \u001b[4mHomepage\u001b[24m                                                                            \u001b[4mnpmjs.com\u001b[24m',
					'\u001b[33mmodule-major\u001b[39m                                                 \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-major                                                    dependencies     https://www.npmjs.com/package/module-major                                          https://www.npmjs.com/package/module-major                                          https://www.npmjs.com/package/module-major                                          https://www.npmjs.com/package/module-major',
					'\u001b[33mmodule-minor\u001b[39m                                                 1.\u001b[4m0\u001b[24m.0   \u001b[32m1.0.0\u001b[39m          \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35;4m1\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  minor       node_modules/module-minor                                                    dependencies     https://www.npmjs.com/package/module-minor                                          https://www.npmjs.com/package/module-minor                                          https://www.npmjs.com/package/module-minor                                          https://www.npmjs.com/package/module-minor',
					'\u001b[33mmodule-patch\u001b[39m                                                 1.0.\u001b[4m0\u001b[24m   \u001b[32m1.0.0\u001b[39m          \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35;4m1\u001b[39;24m  patch       node_modules/module-patch                                                    dependencies     https://www.npmjs.com/package/module-patch                                          https://www.npmjs.com/package/module-patch                                          https://www.npmjs.com/package/module-patch                                          https://www.npmjs.com/package/module-patch',
					'\u001b[33mmodule-prerelease\u001b[39m                                            1.0.0   \u001b[32m1.0.0\u001b[39m  \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35;4m-\u001b[39;24m\u001b[35;4malpha\u001b[39;24m\u001b[35;4m.\u001b[39;24m\u001b[35;4m1\u001b[39;24m  prerelease  node_modules/module-prelease                                                 dependencies     https://www.npmjs.com/package/module-prerelease                                     https://www.npmjs.com/package/module-prerelease                                     https://www.npmjs.com/package/module-prerelease                                     https://www.npmjs.com/package/module-prerelease',
					'\u001b[33mmodule-build\u001b[39m                                                 1.0.0   \u001b[32m1.0.0\u001b[39m    \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35;4m+\u001b[39;24m\u001b[35;4mbuild\u001b[39;24m  build       node_modules/module-build                                                    dependencies     https://www.npmjs.com/package/module-build                                          https://www.npmjs.com/package/module-build                                          https://www.npmjs.com/package/module-build                                          https://www.npmjs.com/package/module-build',
					'\u001b[33mmodule-sub-version\u001b[39m                                           1.0.0   \u001b[32m1.0.0\u001b[39m        \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35;4m.\u001b[39;24m\u001b[35;4m1\u001b[39;24m              node_modules/module-sub-version                                              dependencies     https://www.npmjs.com/package/module-sub-version                                    https://www.npmjs.com/package/module-sub-version                                    https://www.npmjs.com/package/module-sub-version                                    https://www.npmjs.com/package/module-sub-version',
					'\u001b[33mmodule-revert\u001b[39m                                                1.\u001b[4m1\u001b[24m.0   \u001b[32m1.1.0\u001b[39m          \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35;4m0\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m              node_modules/module-revert                                                   dependencies     https://www.npmjs.com/package/module-revert                                         https://www.npmjs.com/package/module-revert                                         https://www.npmjs.com/package/module-revert                                         https://www.npmjs.com/package/module-revert',
					'\u001b[33mmodule-non-semver\u001b[39m                                               \u001b[4mR1\u001b[24m      \u001b[32mR1\u001b[39m             \u001b[35;4mR2\u001b[39;24m              node_modules/module-non-semver                                               dependencies     https://www.npmjs.com/package/module-non-semver                                     https://www.npmjs.com/package/module-non-semver                                     https://www.npmjs.com/package/module-non-semver                                     https://www.npmjs.com/package/module-non-semver',
					'\u001b[31mmodule-diff-wanted\u001b[39m                                           1.\u001b[4m0\u001b[24m.0   \u001b[32m1.1.0\u001b[39m          \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  minor       node_modules/module-diff-wanted                                              dependencies     https://www.npmjs.com/package/module-diff-wanted                                    https://www.npmjs.com/package/module-diff-wanted                                    https://www.npmjs.com/package/module-diff-wanted                                    https://www.npmjs.com/package/module-diff-wanted',
					'\u001b[33mmodule-dev-major\u001b[39m                                             \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-dev-major                                                devDependencies  https://www.npmjs.com/package/module-dev-major                                      https://www.npmjs.com/package/module-dev-major                                      https://www.npmjs.com/package/module-dev-major                                      https://www.npmjs.com/package/module-dev-major',
					'\u001b[33mmodule-absolute-unix-path\u001b[39m                                    \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       /home/user/node_modules/module-absolute-unix-path                            dependencies     https://www.npmjs.com/package/module-absolute-unix-path                             https://www.npmjs.com/package/module-absolute-unix-path                             https://www.npmjs.com/package/module-absolute-unix-path                             https://www.npmjs.com/package/module-absolute-unix-path',
					'\u001b[33mmodule-absolute-windows-path\u001b[39m                                 \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       C:\\Users\\user\\AppData\\Roaming\\npm\\node_modules\\module-absolute-windows-path  dependencies     https://www.npmjs.com/package/module-absolute-windows-path                          https://www.npmjs.com/package/module-absolute-windows-path                          https://www.npmjs.com/package/module-absolute-windows-path                          https://www.npmjs.com/package/module-absolute-windows-path',
					'\u001b[33mmodule-with-homepage\u001b[39m                                         \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-with-changelog                                           dependencies     https://www.npmjs.com/package/module-with-homepage                                  node_modules/module-with-changelog/CHANGELOG.md                                     https://www.duttke.de                                                               https://www.npmjs.com/package/module-with-homepage',
					'\u001b[33mmodule-with-changelog\u001b[39m                                        \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-with-changelog                                           dependencies     https://www.npmjs.com/package/module-with-changelog                                 node_modules/module-with-changelog/CHANGELOG.md                                     https://www.npmjs.com/package/module-with-changelog                                 https://www.npmjs.com/package/module-with-changelog',
					'\u001b[33mmodule-with-package-json-with-homepage-and-author\u001b[39m            \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-with-package-json-with-homepage-and-author               dependencies     https://www.duttke.de/#homepage                                                     https://www.duttke.de/#homepage                                                     https://www.duttke.de/#homepage                                                     https://www.npmjs.com/package/module-with-package-json-with-homepage-and-author',
					'\u001b[33mmodule-with-package-json-with-repository-and-author\u001b[39m          \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-with-package-json-with-repository-and-author             dependencies     https://www.duttke.de/#git                                                          https://www.duttke.de/#git                                                          https://www.duttke.de/#git                                                          https://www.npmjs.com/package/module-with-package-json-with-repository-and-author',
					'\u001b[33mmodule-with-package-json-with-github-repository\u001b[39m              \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-with-package-json-with-github-repository                 dependencies     https://github.com/jens-duttke/check-outdated                                       https://github.com/jens-duttke/check-outdated                                       https://github.com/jens-duttke/check-outdated                                       https://www.npmjs.com/package/module-with-package-json-with-github-repository',
					'\u001b[33mmodule-with-package-json-with-github-repository2\u001b[39m             \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-with-package-json-with-github-repository2                dependencies     https://github.com/jens-duttke/check-outdated/releases                              https://github.com/jens-duttke/check-outdated/releases                              https://github.com/jens-duttke/check-outdated                                       https://www.npmjs.com/package/module-with-package-json-with-github-repository2',
					'\u001b[33mmodule-with-package-json-with-github-repository-string\u001b[39m       \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-with-package-json-with-github-repository-string          dependencies     https://github.com/user/repo/releases                                               https://github.com/user/repo/releases                                               https://github.com/user/repo                                                        https://www.npmjs.com/package/module-with-package-json-with-github-repository-string',
					'\u001b[33mmodule-with-package-json-with-gist-repository-string\u001b[39m         \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-with-package-json-with-gist-repository-string            dependencies     https://gist.github.com/11081aaa281/revisions                                       https://gist.github.com/11081aaa281/revisions                                       https://gist.github.com/11081aaa281                                                 https://www.npmjs.com/package/module-with-package-json-with-gist-repository-string',
					'\u001b[33mmodule-with-package-json-with-bitbucket-repository-string\u001b[39m    \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-with-package-json-with-bitbucket-repository-string       dependencies     https://bitbucket.org/user/repo                                                     https://bitbucket.org/user/repo                                                     https://bitbucket.org/user/repo                                                     https://www.npmjs.com/package/module-with-package-json-with-bitbucket-repository-string',
					'\u001b[33mmodule-with-package-json-with-gitlab-repository-string\u001b[39m       \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-with-package-json-with-gitlab-repository-string          dependencies     https://gitlab.com/user/repo/-/releases                                             https://gitlab.com/user/repo/-/releases                                             https://gitlab.com/user/repo                                                        https://www.npmjs.com/package/module-with-package-json-with-gitlab-repository-string',
					'\u001b[33mmodule-with-package-json-with-repository-without-url\u001b[39m         \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-with-package-json-with-repository-without-url            dependencies     https://www.npmjs.com/package/module-with-package-json-with-repository-without-url  https://www.npmjs.com/package/module-with-package-json-with-repository-without-url  https://www.npmjs.com/package/module-with-package-json-with-repository-without-url  https://www.npmjs.com/package/module-with-package-json-with-repository-without-url',
					'\u001b[33mmodule-with-package-json-with-author\u001b[39m                         \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-with-package-json-with-author                            dependencies     https://www.npmjs.com/package/module-with-package-json-with-author                  https://www.npmjs.com/package/module-with-package-json-with-author                  https://www.duttke.de/#author                                                       https://www.npmjs.com/package/module-with-package-json-with-author',
					'\u001b[33mmodule-with-package-json-with-author-without-url\u001b[39m             \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-with-package-json-with-author-without-url                dependencies     https://www.npmjs.com/package/module-with-package-json-with-author-without-url      https://www.npmjs.com/package/module-with-package-json-with-author-without-url      https://www.npmjs.com/package/module-with-package-json-with-author-without-url      https://www.npmjs.com/package/module-with-package-json-with-author-without-url',
					'\u001b[33mmodule-with-package-json-with-author-string\u001b[39m                  \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-with-package-json-with-author-string                     dependencies     https://www.npmjs.com/package/module-with-package-json-with-author-string           https://www.npmjs.com/package/module-with-package-json-with-author-string           https://www.duttke.de/#author                                                       https://www.npmjs.com/package/module-with-package-json-with-author-string',
					'\u001b[33mmodule-with-package-json-with-homepage-and-repository\u001b[39m        \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-with-package-json-with-homepage-and-repository           dependencies     https://www.duttke.de/#git                                                          https://www.duttke.de/#git                                                          https://www.duttke.de/#homepage                                                     https://www.npmjs.com/package/module-with-package-json-with-homepage-and-repository',
					'\u001b[33m@scoped/module\u001b[39m                                               \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/@scoped/module                                                  dependencies     https://www.npmjs.com/package/%40scoped%2Fmodule                                    https://www.npmjs.com/package/%40scoped%2Fmodule                                    https://www.npmjs.com/package/%40scoped%2Fmodule                                    https://www.npmjs.com/package/%40scoped%2Fmodule',
					'',
					''
				].join('\n')
			));

			/*
				For testing purpose:
				console.log(stdout);
				require('fs').writeFileSync('stdout.txt', stdout.split('\n').map((line) => JSON.stringify(line.replace(/\x20+$/gu, '')).replace(/^"|"$/gu, '\'')).join(',\n'), 'utf8');
			*/
		});

		await test('should return with outdated dependency message', ['--columns', 'INVALID'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expect('`command` should be `undefined`', () => assert.equal(command, undefined));
			expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
			expect('`stdout` should contain `"Invalid value of --depth"`', () => assertHasWord(stdout, 'Invalid column name "INVALID" in --columns'));
		});

		await test('should return with the help indicating an argument problem', ['--columns', 'name,INVALID1,INVALID2'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expect('`command` should be `undefined`', () => assert.equal(command, undefined));
			expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
			expect('`stdout` should contain `"Invalid value of --depth"`', () => assertHasWord(stdout, 'Invalid column name "INVALID1" in --columns'));
		});

		await test('should return with the help indicating an argument problem', ['--columns'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expect('`command` should be `undefined`', () => assert.equal(command, undefined));
			expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
			expect('`stdout` should contain `"Invalid value of --depth"`', () => assertHasWord(stdout, 'Invalid value of --columns'));
		});
	});

	await describe('--global argument', async () => {
		await test('should return with outdated dependency message', ['--global'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false --global'));
			expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
			expect('`stdout` should contain `"28 outdated dependencies found:"`', () => assertHasWord(stdout, '28 outdated dependencies found:'));
		});
	});

	await describe('--depth argument', async () => {
		// @todo Improve this test by adding modules with deeper node_modules-structure
		await test('should return with outdated dependency message', ['--depth', '10'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false --depth 10'));
			expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
			expect('`stdout` should contain `"28 outdated dependencies found:"`', () => assertHasWord(stdout, '28 outdated dependencies found:'));
		});

		await test('should return with the help indicating an argument problem', ['--depth', 'INVALID'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expect('`command` should be `undefined`', () => assert.equal(command, undefined));
			expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
			expect('`stdout` should contain `"Invalid value of --depth"`', () => assertHasWord(stdout, 'Invalid value of --depth'));
		});

		await test('should return with the help indicating an argument problem', ['--depth'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expect('`command` should be `undefined`', () => assert.equal(command, undefined));
			expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
			expect('`stdout` should contain `"Invalid value of --depth"`', () => assertHasWord(stdout, 'Invalid value of --depth'));
		});
	});

	await describe('All arguments', async () => {
		await test('should return with outdated dependency message if all options are activated', ['--ignore-pre-releases', '--ignore-dev-dependencies', '--ignore-packages', 'module-major,module-minor', '--global', '--depth', '10'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expect('`command` should be `"npm outdated --json --long --save false"`', () => assert.equal(command, 'npm outdated --json --long --save false --global --depth 10'));
			expect('`exitCode` should be `1`', () => assert.equal(exitCode, 1));
			expect('`stdout` should contain `"24 outdated dependencies found:"`', () => assertHasWord(stdout, '24 outdated dependencies found:'));

			expect('`stdout` should not contain `"module-major"`', () => assertNotHasWord(stdout, 'module-major'));
			expect('`stdout` should not contain `"module-minor"`', () => assertNotHasWord(stdout, 'module-minor'));
			expect('`stdout` should not contain `"module-prerelease"`', () => assertNotHasWord(stdout, 'module-prerelease'));
			expect('`stdout` should not contain `"module-dev-major"`', () => assertNotHasWord(stdout, 'module-dev-major'));
		});
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
 * @private
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
		console.log(`      ${colorize.gray(`${errorType}: ${error.message.trim().replace(/\n/gu, '\n      ')}`)}`);
		console.log();

		if (error.expected && error.actual) {
			console.log(`      ${colorize.red(`- ${error.expected.replace(/\n/gu, '\n      ')}`)}`);
			console.log(`      ${colorize.green(`+ ${error.actual.replace(/\n/gu, '\n      ')}`)}`);
			console.log();
		}

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
 * @private
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
 * @private
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
 * @private
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
 * @private
 * @param {string} str - The source string.
 * @returns {string} The escaped string.
 */
function escapeRegExp (str) {
	return str.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

/**
 * Wrapper to group related test cases.
 *
 * @param {string} title - The title of the group of tests.
 * @param {() => Promise<void>} tests - The function which contains the different test suites.
 * @returns {Promise<void>} The Promise is resolved with `void` as soon as all test suites are finished.
 */
async function describe (title, tests) {
	console.log();
	console.log(`${colorize.cyan(title.replace(/`(.+?)`/gu, colorize.underline('$1')))}`);
	console.log();

	await tests();
}

/**
 * Create a test suite to test a specific "check-outdated" call.
 *
 * @private
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
		'./helper/dependencies': proxyquire('../helper/dependencies', {
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
		}),
		'./helper/files': proxyquire('../helper/files', {
			fs: {
				/**
				 * Mock of the fs.existsSync() function, which is used by `check-outdated` to figure out of CHANGELOG.md in the package folder exists.
				 *
				 * @param {string | Buffer | URL} path - Filename or file descriptor.
				 * @returns {boolean} Returns true if the path exists, false otherwise.
				 */
				existsSync (path) {
					if (typeof path !== 'string') {
						throw new TypeError('fs.existsSync(): Mock only support strings as path.');
					}

					const normalizedPath = path.replace(/\\/gu, '/');

					if (!(normalizedPath in EXISTS_MOCK)) {
						throw new Error(`fs.existsSync(): Mocked data for "${normalizedPath}" not found.`)
					}

					return EXISTS_MOCK[normalizedPath];
				},

				/**
				 * Mock of the fs.readFileSync() function, which is used by `check-outdated` to read package.json files of dependencies.
				 *
				 * @param {string | Buffer | URL | number} path - Filename or file descriptor.
				 * @param {{ encoding?: string | null; flag?: string; } | string} options - Either an object, or an string representing the encoding.
				 * @returns {string | Buffer} Returns the contents of the `path`.
				 */
				readFileSync (path, options) {
					if (typeof path !== 'string') {
						throw new TypeError('fs.readFileSync(): Mock only support strings as path.');
					}

					if (options !== 'utf8') {
						throw new Error('fs.readFileSync(): Mock only support "utf8" encoding.');
					}

					const normalizedPath = path.replace(/\\/gu, '/');

					if (!(normalizedPath in READ_FILE_MOCK)) {
						throw new Error(`fs.readFileSync(): Mocked data for "${normalizedPath}" not found.`)
					}

					const content = READ_FILE_MOCK[normalizedPath];

					return (typeof content === 'string' ? content : JSON.stringify(content));
				}
			}
		})
	});

	const unhookCapture = captureStdout();

	const exitCode = await checkOutdated(argv);

	const stdout = unhookCapture();

	expectedCallback(usedCommand, exitCode, stdout);
}

/**
 * Start capturing the output to process.stdout.
 *
 * @private
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
