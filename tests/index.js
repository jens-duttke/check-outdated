/**
 * @file Different tests to verify everything works correctly.
 */

/* eslint-disable @typescript-eslint/no-magic-numbers */

const assert = require('assert').strict;

const colorize = require('./helper/colorize');
const { describe } = require('./helper/describe');
const { expect, expectNoOfAffectedDependencies, expectVarToEqual, expectVarToHaveWord, expectVarNotToHaveWord, getExpectResult } = require('./helper/expect');
const { setMocks, test } = require('./helper/test');

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
	'module-broken-version': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.3.4',
		location: 'node_modules/module-patch',
		type: 'dependencies'
	},
	'@scoped/module-sub-broken-version': {
		current: '1.0.0',
		wanted: '1.0.0',
		latest: '2.3.4',
		location: 'node_modules/module-patch',
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
		location: 'node_modules/module-with-homepage',
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

void (async () => {
	setMocks(EXISTS_MOCK, READ_FILE_MOCK);

	await describe('-h / --help arguments', async () => {
		await test('should show help', ['-h'], {}, (command, exitCode, stdout) => {
			expectVarToEqual(command, undefined);
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Arguments:');
		});

		await test('should show help', ['--help'], {}, (command, exitCode, stdout) => {
			expectVarToEqual(command, undefined);
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Arguments:');
		});
	});

	await describe('Invalid npm response', async () => {
		await test('should catch npm error', [], { error: { code: 'TEST', summary: 'Test error' } }, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expect('`stdout` should contain the correct output', () => assert.equal(stdout, '\u001b[31mError while gathering outdated dependencies:\u001b[39m\n\n\u001b[35mcode\u001b[39m TEST\n\u001b[35msummary\u001b[39m Test error\n'));
		});

		await test('should catch JSON.parse() error', [], '{ "Incomplete JSON response', (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Error while gathering outdated dependencies:');
			expectVarToHaveWord(stdout, 'Unexpected end of JSON input');
			expectVarToHaveWord(stdout, '{ "Incomplete JSON response');
		});

		await test('should throw "Unexpected JSON response" error for string response', [], '"string"', (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Error while gathering outdated dependencies:');
			expectVarToHaveWord(stdout, 'Unexpected JSON response');
			expectVarToHaveWord(stdout, '"string"');
		});

		await test('should catch "Unexpected JSON response" error for null response', [], 'null', (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Error while gathering outdated dependencies:');
			expectVarToHaveWord(stdout, 'Unexpected JSON response');
			expectVarToHaveWord(stdout, 'null');
		});

		await test('should return without outdated dependency message for empty response', [], '', (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 0);

			expectVarToEqual(stdout, 'All dependencies are up-to-date.\n');
		});

		await test('should return without outdated dependency message for empty object response', [], {}, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 0);

			expectVarToEqual(stdout, 'All dependencies are up-to-date.\n');
		});

		await test('should return with missing properties message', [], { 'missing-properties': {} }, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Missing properties "current", "wanted", "latest" in response for dependency "missing-properties".');
		});
	});

	await describe('Invalid arguments', async () => {
		await test('should return with an "Unknown argument" message, for a single argument', ['--unknown-argument'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, undefined);
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Unknown argument: --unknown-argument');
		});

		await test('should return with an "Unknown argument"  message, for multiple arguments', ['--unknown-argument1', '--unknown-argument2'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, undefined);
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Unknown arguments: --unknown-argument1, --unknown-argument2');
		});
	});

	await describe('--ignore-dev-dependencies argument', async () => {
		await test('should return with outdated dependency message, ignoring pre-releases', ['--ignore-pre-releases'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, DEFAULT_RESPONSE, 1);

			expectVarNotToHaveWord(stdout, 'module-prerelease');
		});
	});

	await describe('--ignore-dev-dependencies argument', async () => {
		await test('should return with outdated non-dev-dependency message, ignoring dev-dependencies', ['--ignore-dev-dependencies'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, DEFAULT_RESPONSE, 1);

			expectVarNotToHaveWord(stdout, 'module-dev-major');
		});
	});

	await describe('--ignore-packages argument', async () => {
		await test('should return with outdated dependency message, ignoring package `"module-major"` and `"module-minor"`', ['--ignore-packages', 'module-major,module-minor'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, DEFAULT_RESPONSE, 2);

			expectVarNotToHaveWord(stdout, 'module-major');
			expectVarNotToHaveWord(stdout, 'module-minor');
		});

		await test('should return with outdated dependency message, ignoring package `"module-major"` and `"module-minor"`', ['--ignore-packages', 'module-major,module-minor'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, DEFAULT_RESPONSE, 2);

			expectVarNotToHaveWord(stdout, 'module-major');
			expectVarNotToHaveWord(stdout, 'module-minor');
		});

		await test('should return with outdated dependency message, ignoring package `"module-broken-version"`', ['--ignore-packages', 'module-broken-version@2.3.4'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, DEFAULT_RESPONSE, 1);

			expectVarNotToHaveWord(stdout, 'module-broken-version');
		});

		await test('should return with outdated dependency message, informing about an unnecessary ignore of package `"module-broken-version"`', ['--ignore-packages', 'module-broken-version@2.3.3'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, DEFAULT_RESPONSE, 0);

			expectVarToHaveWord(stdout, '\u001b[33mmodule-broken-version\u001b[39m', false);
			expectVarToHaveWord(stdout, 'The --ignore-packages filter "module-broken-version@2.3.3" has no effect, because the latest version is 2.3.4.');
		});

		await test('should return with outdated dependency message, ignoring package `"@scoped/module-sub-broken-version"`', ['--ignore-packages', '@scoped/module-sub-broken-version@2.3.4'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, DEFAULT_RESPONSE, 1);

			expectVarNotToHaveWord(stdout, '@scoped/module-sub-broken-version');
		});

		await test('should return with outdated dependency message, informing about an unnecessary ignore of package `"@scoped/module-sub-broken-version"`', ['--ignore-packages', '@scoped/module-sub-broken-version@2.3.3'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, DEFAULT_RESPONSE, 0);

			expectVarToHaveWord(stdout, '\u001b[33m@scoped/module-sub-broken-version\u001b[39m', false);
			expectVarToHaveWord(stdout, 'The --ignore-packages filter "@scoped/module-sub-broken-version@2.3.3" has no effect, because the latest version is 2.3.4.');
		});

		await test('should return with the help indicating an argument problem', ['--ignore-packages'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, undefined);
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Invalid value of --ignore-packages');
		});
	});

	await describe('--columns argument', async () => {
		await test('should return with outdated dependency message and all available columns', ['--columns', 'name,current,wanted,latest,type,location,packageType,changes,changesPreferLocal,homepage,npmjs'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, DEFAULT_RESPONSE, 0);

			expect('`stdout` should contain the correct output', () => assert.equal(
				stdout.replace(/\x20+(\n|$)/gu, '$1'),
				[
					'30 outdated dependencies found:',
					'',
					'\u001b[4mPackage\u001b[24m                                                    \u001b[4mCurrent\u001b[24m  \u001b[4mWanted\u001b[24m         \u001b[4mLatest\u001b[24m  \u001b[4mType\u001b[24m        \u001b[4mLocation\u001b[24m                                                                     \u001b[4mPackage Type\u001b[24m     \u001b[4mChanges\u001b[24m                                                                             \u001b[4mChanges\u001b[24m                                                                             \u001b[4mHomepage\u001b[24m                                                                            \u001b[4mnpmjs.com\u001b[24m',
					'\u001b[33mmodule-major\u001b[39m                                                 \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-major                                                    dependencies     https://www.npmjs.com/package/module-major                                          https://www.npmjs.com/package/module-major                                          https://www.npmjs.com/package/module-major                                          https://www.npmjs.com/package/module-major',
					'\u001b[33mmodule-minor\u001b[39m                                                 1.\u001b[4m0\u001b[24m.0   \u001b[32m1.0.0\u001b[39m          \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35;4m1\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  minor       node_modules/module-minor                                                    dependencies     https://www.npmjs.com/package/module-minor                                          https://www.npmjs.com/package/module-minor                                          https://www.npmjs.com/package/module-minor                                          https://www.npmjs.com/package/module-minor',
					'\u001b[33mmodule-patch\u001b[39m                                                 1.0.\u001b[4m0\u001b[24m   \u001b[32m1.0.0\u001b[39m          \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35;4m1\u001b[39;24m  patch       node_modules/module-patch                                                    dependencies     https://www.npmjs.com/package/module-patch                                          https://www.npmjs.com/package/module-patch                                          https://www.npmjs.com/package/module-patch                                          https://www.npmjs.com/package/module-patch',
					'\u001b[33mmodule-prerelease\u001b[39m                                            1.0.0   \u001b[32m1.0.0\u001b[39m  \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35;4m-\u001b[39;24m\u001b[35;4malpha\u001b[39;24m\u001b[35;4m.\u001b[39;24m\u001b[35;4m1\u001b[39;24m  prerelease  node_modules/module-prelease                                                 dependencies     https://www.npmjs.com/package/module-prerelease                                     https://www.npmjs.com/package/module-prerelease                                     https://www.npmjs.com/package/module-prerelease                                     https://www.npmjs.com/package/module-prerelease',
					'\u001b[33mmodule-build\u001b[39m                                                 1.0.0   \u001b[32m1.0.0\u001b[39m    \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35;4m+\u001b[39;24m\u001b[35;4mbuild\u001b[39;24m  build       node_modules/module-build                                                    dependencies     https://www.npmjs.com/package/module-build                                          https://www.npmjs.com/package/module-build                                          https://www.npmjs.com/package/module-build                                          https://www.npmjs.com/package/module-build',
					'\u001b[33mmodule-sub-version\u001b[39m                                           1.0.0   \u001b[32m1.0.0\u001b[39m        \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35;4m.\u001b[39;24m\u001b[35;4m1\u001b[39;24m              node_modules/module-sub-version                                              dependencies     https://www.npmjs.com/package/module-sub-version                                    https://www.npmjs.com/package/module-sub-version                                    https://www.npmjs.com/package/module-sub-version                                    https://www.npmjs.com/package/module-sub-version',
					'\u001b[33mmodule-revert\u001b[39m                                                1.\u001b[4m1\u001b[24m.0   \u001b[32m1.1.0\u001b[39m          \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35;4m0\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m              node_modules/module-revert                                                   dependencies     https://www.npmjs.com/package/module-revert                                         https://www.npmjs.com/package/module-revert                                         https://www.npmjs.com/package/module-revert                                         https://www.npmjs.com/package/module-revert',
					'\u001b[33mmodule-broken-version\u001b[39m                                        \u001b[4m1\u001b[24m.\u001b[4m0\u001b[24m.\u001b[4m0\u001b[24m   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35;4m3\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35;4m4\u001b[39;24m  major       node_modules/module-patch                                                    dependencies     https://www.npmjs.com/package/module-broken-version                                 https://www.npmjs.com/package/module-broken-version                                 https://www.npmjs.com/package/module-broken-version                                 https://www.npmjs.com/package/module-broken-version',
					'\u001b[33m@scoped/module-sub-broken-version\u001b[39m                            \u001b[4m1\u001b[24m.\u001b[4m0\u001b[24m.\u001b[4m0\u001b[24m   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35;4m3\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35;4m4\u001b[39;24m  major       node_modules/module-patch                                                    dependencies     https://www.npmjs.com/package/%40scoped%2Fmodule-sub-broken-version                 https://www.npmjs.com/package/%40scoped%2Fmodule-sub-broken-version                 https://www.npmjs.com/package/%40scoped%2Fmodule-sub-broken-version                 https://www.npmjs.com/package/%40scoped%2Fmodule-sub-broken-version',
					'\u001b[33mmodule-non-semver\u001b[39m                                               \u001b[4mR1\u001b[24m      \u001b[32mR1\u001b[39m             \u001b[35;4mR2\u001b[39;24m              node_modules/module-non-semver                                               dependencies     https://www.npmjs.com/package/module-non-semver                                     https://www.npmjs.com/package/module-non-semver                                     https://www.npmjs.com/package/module-non-semver                                     https://www.npmjs.com/package/module-non-semver',
					'\u001b[31mmodule-diff-wanted\u001b[39m                                           1.\u001b[4m0\u001b[24m.0   \u001b[32m1.1.0\u001b[39m          \u001b[35m1\u001b[39m\u001b[35m.\u001b[39m\u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  minor       node_modules/module-diff-wanted                                              dependencies     https://www.npmjs.com/package/module-diff-wanted                                    https://www.npmjs.com/package/module-diff-wanted                                    https://www.npmjs.com/package/module-diff-wanted                                    https://www.npmjs.com/package/module-diff-wanted',
					'\u001b[33mmodule-dev-major\u001b[39m                                             \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-dev-major                                                devDependencies  https://www.npmjs.com/package/module-dev-major                                      https://www.npmjs.com/package/module-dev-major                                      https://www.npmjs.com/package/module-dev-major                                      https://www.npmjs.com/package/module-dev-major',
					'\u001b[33mmodule-absolute-unix-path\u001b[39m                                    \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       /home/user/node_modules/module-absolute-unix-path                            dependencies     https://www.npmjs.com/package/module-absolute-unix-path                             https://www.npmjs.com/package/module-absolute-unix-path                             https://www.npmjs.com/package/module-absolute-unix-path                             https://www.npmjs.com/package/module-absolute-unix-path',
					'\u001b[33mmodule-absolute-windows-path\u001b[39m                                 \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       C:\\Users\\user\\AppData\\Roaming\\npm\\node_modules\\module-absolute-windows-path  dependencies     https://www.npmjs.com/package/module-absolute-windows-path                          https://www.npmjs.com/package/module-absolute-windows-path                          https://www.npmjs.com/package/module-absolute-windows-path                          https://www.npmjs.com/package/module-absolute-windows-path',
					'\u001b[33mmodule-with-homepage\u001b[39m                                         \u001b[4m1\u001b[24m.0.0   \u001b[32m1.0.0\u001b[39m          \u001b[35;4m2\u001b[39;24m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m\u001b[35m.\u001b[39m\u001b[35m0\u001b[39m  major       node_modules/module-with-homepage                                            dependencies     https://www.npmjs.com/package/module-with-homepage                                  https://www.npmjs.com/package/module-with-homepage                                  https://www.duttke.de                                                               https://www.npmjs.com/package/module-with-homepage',
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
			expectVarToEqual(command, undefined);
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Invalid column name "INVALID" in --columns');
		});

		await test('should return with the help indicating an argument problem', ['--columns', 'name,INVALID1,INVALID2'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, undefined);
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Invalid column name "INVALID1" in --columns');
			expectVarNotToHaveWord(stdout, 'Invalid column name "INVALID2" in --columns');
		});

		await test('should return with the help indicating an argument problem', ['--columns'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, undefined);
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Invalid value of --columns');
		});
	});

	await describe('--global argument', async () => {
		await test('should return with outdated dependency message', ['--global'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false --global');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, DEFAULT_RESPONSE, 0);
		});
	});

	await describe('--depth argument', async () => {
		// @todo Improve this test by adding modules with deeper node_modules-structure
		await test('should return with outdated dependency message', ['--depth', '10'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false --depth 10');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, DEFAULT_RESPONSE, 0);
		});

		await test('should return with the help indicating an argument problem', ['--depth', 'INVALID'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, undefined);
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Invalid value of --depth');
		});

		await test('should return with the help indicating an argument problem', ['--depth'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, undefined);
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Invalid value of --depth');
		});
	});

	await describe('All arguments', async () => {
		await test('should return with outdated dependency message if all options are activated', ['--ignore-pre-releases', '--ignore-dev-dependencies', '--ignore-packages', 'module-major,module-minor', '--global', '--depth', '10'], DEFAULT_RESPONSE, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false --global --depth 10');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, DEFAULT_RESPONSE, 4);

			expectVarNotToHaveWord(stdout, 'module-major');
			expectVarNotToHaveWord(stdout, 'module-minor');
			expectVarNotToHaveWord(stdout, 'module-prerelease');
			expectVarNotToHaveWord(stdout, 'module-dev-major');
		});
	});

	const sum = getExpectResult();

	console.log();
	console.log(colorize.green(`${sum.passed} passed`));
	if (sum.failed > 0) {
		console.log(colorize.red(`${sum.failed} failed`));

		process.exitCode = 1;
	}
	console.log();
})();
