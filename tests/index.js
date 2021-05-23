/**
 * @file Different tests to verify everything works correctly.
 */

/* eslint-disable max-len -- Since we want to have all tests together in one file, we ignore the max. lines limit here. */

/**
 * @typedef {object} MockData
 * @property {{ [dependencyName: string]: Partial<import('../check-outdated').OutdatedDependency>; }} defaultResponse
 * @property {{ [path: string]: boolean; }} fsExists
 * @property {{ [path: string]: string | import('../helper/files').PackageJSON; }} fsReadFile
 * @property {{ [url: string]: { statusCode: number; data?: string; } | undefined; }} httpsGet
 */

const assert = require('assert').strict;

const colorize = require('./helper/colorize');
const { describe } = require('./helper/describe');
const { expect, expectNoOfAffectedDependencies, expectVarToEqual, expectVarToHaveWord, expectVarNotToHaveWord, getExpectResult } = require('./helper/expect');
const { setMocks, test } = require('./helper/test');
const mockData = /** @type {MockData} */(require('./mock-data.json'));

void (async () => {
	setMocks(mockData);

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

	await test('should return with outdated dependency message', [], mockData.defaultResponse, (command, exitCode, stdout) => {
		expectVarToEqual(command, 'npm outdated --json --long --save false');
		expectVarToEqual(exitCode, 1);

		expectNoOfAffectedDependencies(stdout, mockData.defaultResponse, 0);

		expect('`stdout` should contain the correct output', () => assert.equal(
			stdout.replace(/\u0020+(\n|$)/gu, '$1'),
			[
				'38 outdated dependencies found:',
				'',
				'\u001B[4mPackage\u001B[24m                                                    \u001B[4mCurrent\u001B[24m  \u001B[4mWanted\u001B[24m         \u001B[4mLatest\u001B[24m  \u001B[4mReference\u001B[24m          \u001B[4mChanges\u001B[24m                                                                                      \u001B[4mLocation\u001B[24m',
				'',
				'\u001B[4mdependencies\u001B[24m',
				'\u001B[31m@scoped/module\u001B[39m                                               \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  package.json:12:5  https://www.npmjs.com/package/%40scoped%2Fmodule                                             node_modules/@scoped/module',
				'\u001B[31m@scoped/module-sub-broken-version\u001B[39m                            \u001B[4m1\u001B[24m.\u001B[4m0\u001B[24m.\u001B[4m0\u001B[24m   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35;4m3\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35;4m4\u001B[39;24m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/%40scoped%2Fmodule-sub-broken-version                          node_modules/module-sub-broken-version',
				'\u001B[31mmodule-absolute-unix-path\u001B[39m                                    \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-absolute-unix-path                                      /home/user/node_modules/module-absolute-unix-path',
				'\u001B[31mmodule-absolute-windows-path\u001B[39m                                 \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-absolute-windows-path                                   C:\\Users\\user\\AppData\\Roaming\\npm\\node_modules\\module-absolute-windows-path',
				'\u001B[31mmodule-broken-version\u001B[39m                                        \u001B[4m1\u001B[24m.\u001B[4m0\u001B[24m.\u001B[4m0\u001B[24m   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35;4m3\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35;4m4\u001B[39;24m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-broken-version                                          node_modules/module-broken-version',
				'module-build                                                 1.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m    \u001B[35m1\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35;4m+\u001B[39;24m\u001B[35;4mbuild\u001B[39;24m  package.json:7:5   https://www.npmjs.com/package/module-build                                                   node_modules/module-build',
				'\u001B[33mmodule-diff-wanted\u001B[39m                                           1.\u001B[4m0\u001B[24m.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32;4m1\u001B[39;24m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35m1\u001B[39m\u001B[35m.\u001B[39m\u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-diff-wanted                                             node_modules/module-diff-wanted',
				'\u001B[31mmodule-major\u001B[39m                                                 \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  package.json:3:5   https://www.npmjs.com/package/module-major                                                   node_modules/module-major',
				'\u001B[33mmodule-minor\u001B[39m                                                 1.\u001B[4m0\u001B[24m.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35m1\u001B[39m\u001B[35m.\u001B[39m\u001B[35;4m1\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  package.json:4:5   https://www.npmjs.com/package/module-minor                                                   node_modules/module-minor',
				'module-no-current-version                                        \u001B[90m-\u001B[39m   \u001B[32;4m4\u001B[39;24m\u001B[32;4m.\u001B[39;24m\u001B[32;4m0\u001B[39;24m\u001B[32;4m.\u001B[39;24m\u001B[32;4m0\u001B[39;24m          \u001B[35;4m4\u001B[39;24m\u001B[35;4m.\u001B[39;24m\u001B[35;4m0\u001B[39;24m\u001B[35;4m.\u001B[39;24m\u001B[35;4m0\u001B[39;24m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-no-current-version                                      node_modules/module-no-current-version',
				'module-non-semver                                               \u001B[4mR1\u001B[24m      \u001B[32mR1\u001B[39m             \u001B[35;4mR2\u001B[39;24m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-non-semver                                              node_modules/module-non-semver',
				'\u001B[32mmodule-patch\u001B[39m                                                 1.0.\u001B[4m0\u001B[24m   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35m1\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35;4m1\u001B[39;24m  package.json:5:5   https://www.npmjs.com/package/module-patch                                                   node_modules/module-patch',
				'module-prerelease                                            1.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m  \u001B[35m1\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35;4m-\u001B[39;24m\u001B[35;4malpha\u001B[39;24m\u001B[35;4m.\u001B[39;24m\u001B[35;4m1\u001B[39;24m  package.json:6:5   https://www.npmjs.com/package/module-prerelease                                              node_modules/module-prelease',
				'module-revert                                                1.\u001B[4m1\u001B[24m.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35m1\u001B[39m\u001B[35m.\u001B[39m\u001B[35;4m0\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-revert                                                  node_modules/module-revert',
				'module-sub-version                                           1.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m        \u001B[35m1\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35;4m.\u001B[39;24m\u001B[35;4m1\u001B[39;24m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-sub-version                                             node_modules/module-sub-version',
				'\u001B[31mmodule-wanted-major-major\u001B[39m                                    \u001B[4m2\u001B[24m.0.0   \u001B[32;4m3\u001B[39;24m\u001B[32m.\u001B[39m\u001B[32;4m1\u001B[39;24m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m3\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  package.json:8:5   https://www.npmjs.com/package/module-wanted-major-major                                      node_modules/module-wanted-major-major',
				'\u001B[31mmodule-wanted-minor-major\u001B[39m                                    \u001B[4m2\u001B[24m.0.0   \u001B[32m2\u001B[39m\u001B[32m.\u001B[39m\u001B[32;4m1\u001B[39;24m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m3\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  package.json:9:5   https://www.npmjs.com/package/module-wanted-minor-major                                      node_modules/module-wanted-minor-major',
				'module-wanted-minor-revert                                   \u001B[4m2\u001B[24m.0.0   \u001B[32m2\u001B[39m\u001B[32m.\u001B[39m\u001B[32;4m1\u001B[39;24m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m1\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  package.json:11:5  https://www.npmjs.com/package/module-wanted-minor-revert                                     node_modules/module-wanted-minor-revert',
				'\u001B[31mmodule-wanted-patch-major\u001B[39m                                    \u001B[4m2\u001B[24m.0.0   \u001B[32m2\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32;4m1\u001B[39;24m          \u001B[35;4m3\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  package.json:10:5  https://www.npmjs.com/package/module-wanted-patch-major                                      node_modules/module-wanted-patch-major',
				'\u001B[31mmodule-with-changelog\u001B[39m                                        \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-with-changelog                                          node_modules/module-with-changelog',
				'\u001B[31mmodule-with-empty-changelog\u001B[39m                                  \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://github.com/jens-duttke/empty-changelog/releases                                      node_modules/module-with-empty-changelog',
				'\u001B[31mmodule-with-homepage\u001B[39m                                         \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-with-homepage                                           node_modules/module-with-homepage',
				'\u001B[31mmodule-with-package-json-with-author\u001B[39m                         \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-with-package-json-with-author                           node_modules/module-with-package-json-with-author',
				'\u001B[31mmodule-with-package-json-with-author-string\u001B[39m                  \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-with-package-json-with-author-string                    node_modules/module-with-package-json-with-author-string',
				'\u001B[31mmodule-with-package-json-with-author-without-url\u001B[39m             \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-with-package-json-with-author-without-url               node_modules/module-with-package-json-with-author-without-url',
				'\u001B[31mmodule-with-package-json-with-bitbucket-repository-string\u001B[39m    \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://bitbucket.org/user/repo                                                              node_modules/module-with-package-json-with-bitbucket-repository-string',
				'\u001B[31mmodule-with-package-json-with-gist-repository-string\u001B[39m         \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://gist.github.com/11081aaa281/revisions                                                node_modules/module-with-package-json-with-gist-repository-string',
				'\u001B[31mmodule-with-package-json-with-github-repository\u001B[39m              \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://github.com/jens-duttke/check-outdated/blob/master/CHANGELOG.md                       node_modules/module-with-package-json-with-github-repository',
				'\u001B[31mmodule-with-package-json-with-github-repository-string\u001B[39m       \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://github.com/user/repo/releases                                                        node_modules/module-with-package-json-with-github-repository-string',
				'\u001B[31mmodule-with-package-json-with-github-repository2\u001B[39m             \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://github.com/jens-duttke/check-outdated/blob/master/CHANGELOG.md                       node_modules/module-with-package-json-with-github-repository2',
				'\u001B[31mmodule-with-package-json-with-github-repository3\u001B[39m             \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://github.com/jens-duttke/check-outdated/blob/master/packages/sub-package/CHANGELOG.md  node_modules/module-with-package-json-with-github-repository3',
				'\u001B[31mmodule-with-package-json-with-gitlab-repository-string\u001B[39m       \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://gitlab.com/user/repo/-/releases                                                      node_modules/module-with-package-json-with-gitlab-repository-string',
				'\u001B[31mmodule-with-package-json-with-homepage-and-author\u001B[39m            \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://www.duttke.de/#homepage                                                              node_modules/module-with-package-json-with-homepage-and-author',
				'\u001B[31mmodule-with-package-json-with-homepage-and-repository\u001B[39m        \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://www.duttke.de/#git                                                                   node_modules/module-with-package-json-with-homepage-and-repository',
				'\u001B[31mmodule-with-package-json-with-repository-and-author\u001B[39m          \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://www.duttke.de/#git                                                                   node_modules/module-with-package-json-with-repository-and-author',
				'\u001B[31mmodule-with-package-json-with-repository-without-url\u001B[39m         \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-with-package-json-with-repository-without-url           node_modules/module-with-package-json-with-repository-without-url',
				'',
				'\u001B[4mdevDependencies\u001B[24m',
				'\u001B[31mmodule-dev-major\u001B[39m                                             \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-dev-major                                               node_modules/module-dev-major',
				'',
				'\u001B[4m\u001B[90munknown\u001B[39m\u001B[24m',
				'module-without-properties                                        \u001B[90m-\u001B[39m       \u001B[90m-\u001B[39m              \u001B[90m-\u001B[39m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-without-properties                                      node_modules/module-without-properties',
				'',
				'\u001B[4mColor legend\u001B[24m',
				'\u001B[31mMajor update\u001B[39m: backward-incompatible updates',
				'\u001B[33mMinor update\u001B[39m: backward-compatible features',
				'\u001B[32mPatch update\u001B[39m: backward-compatible bug fixes',
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

	await test('should return with outdated dependency message, prefering "Wanted" versions', ['--prefer-wanted'], mockData.defaultResponse, (command, exitCode, stdout) => {
		expectVarToEqual(command, 'npm outdated --json --long --save false');
		expectVarToEqual(exitCode, 1);

		expect('`stdout` should contain the correct output', () => assert.equal(
			stdout.replace(/\u0020+(\n|$)/gu, '$1'),
			[
				'6 outdated dependencies found:',
				'',
				'\u001B[4mPackage\u001B[24m                     \u001B[4mCurrent\u001B[24m  \u001B[4mWanted\u001B[24m  \u001B[4mLatest\u001B[24m  \u001B[4mReference\u001B[24m          \u001B[4mChanges\u001B[24m                                                   \u001B[4mLocation\u001B[24m',
				'',
				'\u001B[4mdependencies\u001B[24m',
				'\u001B[33mmodule-diff-wanted\u001B[39m            1.\u001B[4m0\u001B[24m.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32;4m1\u001B[39;24m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m   \u001B[35m1\u001B[39m\u001B[35m.\u001B[39m\u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-diff-wanted          node_modules/module-diff-wanted',
				'module-no-current-version         \u001B[90m-\u001B[39m   \u001B[32;4m4\u001B[39;24m\u001B[32;4m.\u001B[39;24m\u001B[32;4m0\u001B[39;24m\u001B[32;4m.\u001B[39;24m\u001B[32;4m0\u001B[39;24m   \u001B[35;4m4\u001B[39;24m\u001B[35;4m.\u001B[39;24m\u001B[35;4m0\u001B[39;24m\u001B[35;4m.\u001B[39;24m\u001B[35;4m0\u001B[39;24m  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-no-current-version   node_modules/module-no-current-version',
				'\u001B[31mmodule-wanted-major-major\u001B[39m     \u001B[4m2\u001B[24m.\u001B[4m0\u001B[24m.0   \u001B[32;4m3\u001B[39;24m\u001B[32m.\u001B[39m\u001B[32;4m1\u001B[39;24m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m   \u001B[35;4m3\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  package.json:8:5   https://www.npmjs.com/package/module-wanted-major-major   node_modules/module-wanted-major-major',
				'\u001B[33mmodule-wanted-minor-major\u001B[39m     2.\u001B[4m0\u001B[24m.0   \u001B[32m2\u001B[39m\u001B[32m.\u001B[39m\u001B[32;4m1\u001B[39;24m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m   \u001B[35;4m3\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  package.json:9:5   https://www.npmjs.com/package/module-wanted-minor-major   node_modules/module-wanted-minor-major',
				'\u001B[33mmodule-wanted-minor-revert\u001B[39m    2.\u001B[4m0\u001B[24m.0   \u001B[32m2\u001B[39m\u001B[32m.\u001B[39m\u001B[32;4m1\u001B[39;24m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m   \u001B[35;4m1\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  package.json:11:5  https://www.npmjs.com/package/module-wanted-minor-revert  node_modules/module-wanted-minor-revert',
				'\u001B[32mmodule-wanted-patch-major\u001B[39m     2.0.\u001B[4m0\u001B[24m   \u001B[32m2\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32;4m1\u001B[39;24m   \u001B[35;4m3\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  package.json:10:5  https://www.npmjs.com/package/module-wanted-patch-major   node_modules/module-wanted-patch-major',
				'',
				'\u001B[4mColor legend\u001B[24m',
				'\u001B[31mMajor update\u001B[39m: backward-incompatible updates',
				'\u001B[33mMinor update\u001B[39m: backward-compatible features',
				'\u001B[32mPatch update\u001B[39m: backward-compatible bug fixes',
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

	await test('should return without outdated dependency message, prefering "Wanted" versions', ['--prefer-wanted'], {
		'module-wanted-equal': {
			current: '1.1.5',
			wanted: '1.1.5',
			latest: '2.0.0',
			location: 'node_modules/module-major',
			type: 'dependencies'
		}
	}, (command, exitCode, stdout) => {
		expectVarToEqual(command, 'npm outdated --json --long --save false');
		expectVarToEqual(exitCode, 0);

		expectVarToEqual(stdout, 'All dependencies are up-to-date.\n');
	});

	await describe('Invalid npm response', async () => {
		await test('should catch npm error', [], { error: { code: 'TEST', summary: 'Test error' } }, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expect('`stdout` should contain the correct output', () => assert.equal(stdout, '\u001B[31mError while gathering outdated dependencies:\u001B[39m\n\n\u001B[35mcode\u001B[39m TEST\n\u001B[35msummary\u001B[39m Test error\n'));
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
	});

	await describe('Invalid arguments', async () => {
		await test('should return with an "Unknown argument" message, for a single argument', ['--unknown-argument'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, undefined);
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Unknown argument: --unknown-argument');
		});

		await test('should return with an "Unknown argument"  message, for multiple arguments', ['--unknown-argument1', '--unknown-argument2'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, undefined);
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Unknown arguments: --unknown-argument1, --unknown-argument2');
		});
	});

	await describe('--ignore-dev-dependencies argument', async () => {
		await test('should return with outdated dependency message, ignoring pre-releases', ['--ignore-pre-releases'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, mockData.defaultResponse, 1);

			expectVarNotToHaveWord(stdout, 'module-prerelease');
		});
	});

	await describe('--ignore-dev-dependencies argument', async () => {
		await test('should return with outdated non-dev-dependency message, ignoring dev-dependencies', ['--ignore-dev-dependencies'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, mockData.defaultResponse, 1);

			expectVarNotToHaveWord(stdout, 'module-dev-major');
		});
	});

	await describe('--ignore-packages argument', async () => {
		await test('should return with outdated dependency message, ignoring package `"module-major"` and `"module-minor"`', ['--ignore-packages', 'module-major,module-minor'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, mockData.defaultResponse, 2);

			expectVarNotToHaveWord(stdout, 'module-major');
			expectVarNotToHaveWord(stdout, 'module-minor');
		});

		await test('should return with outdated dependency message, ignoring package `"module-major"` and `"module-minor"`', ['--ignore-packages', 'module-major,module-minor'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, mockData.defaultResponse, 2);

			expectVarNotToHaveWord(stdout, 'module-major');
			expectVarNotToHaveWord(stdout, 'module-minor');
		});

		await test('should return with outdated dependency message, ignoring package `"module-broken-version"`', ['--ignore-packages', 'module-broken-version@2.3.4'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, mockData.defaultResponse, 1);

			expectVarNotToHaveWord(stdout, 'module-broken-version');
		});

		await test('should return with outdated dependency message, informing about an unnecessary ignore of package `"module-broken-version"`', ['--ignore-packages', 'module-broken-version@2.3.3'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, mockData.defaultResponse, 0);

			expectVarToHaveWord(stdout, '\u001B[31mmodule-broken-version\u001B[39m', false);
			expectVarToHaveWord(stdout, 'The --ignore-packages filter "module-broken-version@2.3.3" has no effect, the latest version is 2.3.4.');
		});

		await test('should return with outdated dependency message, ignoring package `"@scoped/module-sub-broken-version"`', ['--ignore-packages', '@scoped/module-sub-broken-version@2.3.4'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, mockData.defaultResponse, 1);

			expectVarNotToHaveWord(stdout, '@scoped/module-sub-broken-version');
		});

		await test('should return with outdated dependency message, informing about an unnecessary ignore of package `"@scoped/module-sub-broken-version"`', ['--ignore-packages', '@scoped/module-sub-broken-version@2.3.3'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, mockData.defaultResponse, 0);

			expectVarToHaveWord(stdout, '\u001B[31m@scoped/module-sub-broken-version\u001B[39m', false);
			expectVarToHaveWord(stdout, 'The --ignore-packages filter "@scoped/module-sub-broken-version@2.3.3" has no effect, the latest version is 2.3.4.');
		});

		await test('should return with the help indicating an argument problem', ['--ignore-packages'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, undefined);
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Invalid value of --ignore-packages');
		});
	});

	await describe('--columns argument', async () => {
		await test('should return with outdated dependency message and all available columns', ['--columns', 'package,current,wanted,latest,type,location,packageType,reference,changes,changesPreferLocal,homepage,npmjs'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, mockData.defaultResponse, 0);

			expect('`stdout` should contain the correct output', () => assert.equal(
				stdout.replace(/\u0020+(\n|$)/gu, '$1'),
				[
					'38 outdated dependencies found:',
					'',
					'\u001B[4mPackage\u001B[24m                                                    \u001B[4mCurrent\u001B[24m  \u001B[4mWanted\u001B[24m         \u001B[4mLatest\u001B[24m  \u001B[4mType\u001B[24m        \u001B[4mLocation\u001B[24m                                                                     \u001B[4mPackage Type\u001B[24m     \u001B[4mReference\u001B[24m          \u001B[4mChanges\u001B[24m                                                                                      \u001B[4mChanges\u001B[24m                                                                                      \u001B[4mHomepage\u001B[24m                                                                            \u001B[4mnpmjs.com\u001B[24m',
					'\u001B[31m@scoped/module\u001B[39m                                               \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/@scoped/module                                                  dependencies     package.json:12:5  https://www.npmjs.com/package/%40scoped%2Fmodule                                             https://www.npmjs.com/package/%40scoped%2Fmodule                                             https://www.npmjs.com/package/%40scoped%2Fmodule                                    https://www.npmjs.com/package/%40scoped%2Fmodule',
					'\u001B[31m@scoped/module-sub-broken-version\u001B[39m                            \u001B[4m1\u001B[24m.\u001B[4m0\u001B[24m.\u001B[4m0\u001B[24m   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35;4m3\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35;4m4\u001B[39;24m  major       node_modules/module-sub-broken-version                                       dependencies     \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/%40scoped%2Fmodule-sub-broken-version                          https://www.npmjs.com/package/%40scoped%2Fmodule-sub-broken-version                          https://www.npmjs.com/package/%40scoped%2Fmodule-sub-broken-version                 https://www.npmjs.com/package/%40scoped%2Fmodule-sub-broken-version',
					'\u001B[31mmodule-absolute-unix-path\u001B[39m                                    \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       /home/user/node_modules/module-absolute-unix-path                            dependencies     \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-absolute-unix-path                                      https://www.npmjs.com/package/module-absolute-unix-path                                      https://www.npmjs.com/package/module-absolute-unix-path                             https://www.npmjs.com/package/module-absolute-unix-path',
					'\u001B[31mmodule-absolute-windows-path\u001B[39m                                 \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       C:\\Users\\user\\AppData\\Roaming\\npm\\node_modules\\module-absolute-windows-path  dependencies     \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-absolute-windows-path                                   https://www.npmjs.com/package/module-absolute-windows-path                                   https://www.npmjs.com/package/module-absolute-windows-path                          https://www.npmjs.com/package/module-absolute-windows-path',
					'\u001B[31mmodule-broken-version\u001B[39m                                        \u001B[4m1\u001B[24m.\u001B[4m0\u001B[24m.\u001B[4m0\u001B[24m   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35;4m3\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35;4m4\u001B[39;24m  major       node_modules/module-broken-version                                           dependencies     \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-broken-version                                          https://www.npmjs.com/package/module-broken-version                                          https://www.npmjs.com/package/module-broken-version                                 https://www.npmjs.com/package/module-broken-version',
					'module-build                                                 1.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m    \u001B[35m1\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35;4m+\u001B[39;24m\u001B[35;4mbuild\u001B[39;24m  build       node_modules/module-build                                                    dependencies     package.json:7:5   https://www.npmjs.com/package/module-build                                                   https://www.npmjs.com/package/module-build                                                   https://www.npmjs.com/package/module-build                                          https://www.npmjs.com/package/module-build',
					'\u001B[31mmodule-dev-major\u001B[39m                                             \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-dev-major                                                devDependencies  \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-dev-major                                               https://www.npmjs.com/package/module-dev-major                                               https://www.npmjs.com/package/module-dev-major                                      https://www.npmjs.com/package/module-dev-major',
					'\u001B[33mmodule-diff-wanted\u001B[39m                                           1.\u001B[4m0\u001B[24m.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32;4m1\u001B[39;24m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35m1\u001B[39m\u001B[35m.\u001B[39m\u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  minor       node_modules/module-diff-wanted                                              dependencies     \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-diff-wanted                                             https://www.npmjs.com/package/module-diff-wanted                                             https://www.npmjs.com/package/module-diff-wanted                                    https://www.npmjs.com/package/module-diff-wanted',
					'\u001B[31mmodule-major\u001B[39m                                                 \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-major                                                    dependencies     package.json:3:5   https://www.npmjs.com/package/module-major                                                   https://www.npmjs.com/package/module-major                                                   https://www.npmjs.com/package/module-major                                          https://www.npmjs.com/package/module-major',
					'\u001B[33mmodule-minor\u001B[39m                                                 1.\u001B[4m0\u001B[24m.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35m1\u001B[39m\u001B[35m.\u001B[39m\u001B[35;4m1\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  minor       node_modules/module-minor                                                    dependencies     package.json:4:5   https://www.npmjs.com/package/module-minor                                                   https://www.npmjs.com/package/module-minor                                                   https://www.npmjs.com/package/module-minor                                          https://www.npmjs.com/package/module-minor',
					'module-no-current-version                                        \u001B[90m-\u001B[39m   \u001B[32;4m4\u001B[39;24m\u001B[32;4m.\u001B[39;24m\u001B[32;4m0\u001B[39;24m\u001B[32;4m.\u001B[39;24m\u001B[32;4m0\u001B[39;24m          \u001B[35;4m4\u001B[39;24m\u001B[35;4m.\u001B[39;24m\u001B[35;4m0\u001B[39;24m\u001B[35;4m.\u001B[39;24m\u001B[35;4m0\u001B[39;24m  \u001B[90m-\u001B[39m           node_modules/module-no-current-version                                       dependencies     \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-no-current-version                                      https://www.npmjs.com/package/module-no-current-version                                      https://www.npmjs.com/package/module-no-current-version                             https://www.npmjs.com/package/module-no-current-version',
					'module-non-semver                                               \u001B[4mR1\u001B[24m      \u001B[32mR1\u001B[39m             \u001B[35;4mR2\u001B[39;24m  \u001B[90m-\u001B[39m           node_modules/module-non-semver                                               dependencies     \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-non-semver                                              https://www.npmjs.com/package/module-non-semver                                              https://www.npmjs.com/package/module-non-semver                                     https://www.npmjs.com/package/module-non-semver',
					'\u001B[32mmodule-patch\u001B[39m                                                 1.0.\u001B[4m0\u001B[24m   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35m1\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35;4m1\u001B[39;24m  patch       node_modules/module-patch                                                    dependencies     package.json:5:5   https://www.npmjs.com/package/module-patch                                                   https://www.npmjs.com/package/module-patch                                                   https://www.npmjs.com/package/module-patch                                          https://www.npmjs.com/package/module-patch',
					'module-prerelease                                            1.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m  \u001B[35m1\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35;4m-\u001B[39;24m\u001B[35;4malpha\u001B[39;24m\u001B[35;4m.\u001B[39;24m\u001B[35;4m1\u001B[39;24m  prerelease  node_modules/module-prelease                                                 dependencies     package.json:6:5   https://www.npmjs.com/package/module-prerelease                                              https://www.npmjs.com/package/module-prerelease                                              https://www.npmjs.com/package/module-prerelease                                     https://www.npmjs.com/package/module-prerelease',
					'module-revert                                                1.\u001B[4m1\u001B[24m.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35m1\u001B[39m\u001B[35m.\u001B[39m\u001B[35;4m0\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m           node_modules/module-revert                                                   dependencies     \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-revert                                                  https://www.npmjs.com/package/module-revert                                                  https://www.npmjs.com/package/module-revert                                         https://www.npmjs.com/package/module-revert',
					'module-sub-version                                           1.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m        \u001B[35m1\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35;4m.\u001B[39;24m\u001B[35;4m1\u001B[39;24m  \u001B[90m-\u001B[39m           node_modules/module-sub-version                                              dependencies     \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-sub-version                                             https://www.npmjs.com/package/module-sub-version                                             https://www.npmjs.com/package/module-sub-version                                    https://www.npmjs.com/package/module-sub-version',
					'\u001B[31mmodule-wanted-major-major\u001B[39m                                    \u001B[4m2\u001B[24m.0.0   \u001B[32;4m3\u001B[39;24m\u001B[32m.\u001B[39m\u001B[32;4m1\u001B[39;24m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m3\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-wanted-major-major                                       dependencies     package.json:8:5   https://www.npmjs.com/package/module-wanted-major-major                                      https://www.npmjs.com/package/module-wanted-major-major                                      https://www.npmjs.com/package/module-wanted-major-major                             https://www.npmjs.com/package/module-wanted-major-major',
					'\u001B[31mmodule-wanted-minor-major\u001B[39m                                    \u001B[4m2\u001B[24m.0.0   \u001B[32m2\u001B[39m\u001B[32m.\u001B[39m\u001B[32;4m1\u001B[39;24m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m3\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-wanted-minor-major                                       dependencies     package.json:9:5   https://www.npmjs.com/package/module-wanted-minor-major                                      https://www.npmjs.com/package/module-wanted-minor-major                                      https://www.npmjs.com/package/module-wanted-minor-major                             https://www.npmjs.com/package/module-wanted-minor-major',
					'module-wanted-minor-revert                                   \u001B[4m2\u001B[24m.0.0   \u001B[32m2\u001B[39m\u001B[32m.\u001B[39m\u001B[32;4m1\u001B[39;24m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m1\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  \u001B[90m-\u001B[39m           node_modules/module-wanted-minor-revert                                      dependencies     package.json:11:5  https://www.npmjs.com/package/module-wanted-minor-revert                                     https://www.npmjs.com/package/module-wanted-minor-revert                                     https://www.npmjs.com/package/module-wanted-minor-revert                            https://www.npmjs.com/package/module-wanted-minor-revert',
					'\u001B[31mmodule-wanted-patch-major\u001B[39m                                    \u001B[4m2\u001B[24m.0.0   \u001B[32m2\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32;4m1\u001B[39;24m          \u001B[35;4m3\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-wanted-patch-major                                       dependencies     package.json:10:5  https://www.npmjs.com/package/module-wanted-patch-major                                      https://www.npmjs.com/package/module-wanted-patch-major                                      https://www.npmjs.com/package/module-wanted-patch-major                             https://www.npmjs.com/package/module-wanted-patch-major',
					'\u001B[31mmodule-with-changelog\u001B[39m                                        \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-with-changelog                                           dependencies     \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-with-changelog                                          node_modules/module-with-changelog/CHANGELOG.md                                              https://www.npmjs.com/package/module-with-changelog                                 https://www.npmjs.com/package/module-with-changelog',
					'\u001B[31mmodule-with-empty-changelog\u001B[39m                                  \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-with-empty-changelog                                     dependencies     \u001B[90m-\u001B[39m                  https://github.com/jens-duttke/empty-changelog/releases                                      https://github.com/jens-duttke/empty-changelog/releases                                      https://github.com/jens-duttke/empty-changelog/blob/master/README.md                https://www.npmjs.com/package/module-with-empty-changelog',
					'\u001B[31mmodule-with-homepage\u001B[39m                                         \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-with-homepage                                            dependencies     \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-with-homepage                                           https://www.npmjs.com/package/module-with-homepage                                           https://www.duttke.de                                                               https://www.npmjs.com/package/module-with-homepage',
					'\u001B[31mmodule-with-package-json-with-author\u001B[39m                         \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-with-package-json-with-author                            dependencies     \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-with-package-json-with-author                           https://www.npmjs.com/package/module-with-package-json-with-author                           https://www.duttke.de/#author                                                       https://www.npmjs.com/package/module-with-package-json-with-author',
					'\u001B[31mmodule-with-package-json-with-author-string\u001B[39m                  \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-with-package-json-with-author-string                     dependencies     \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-with-package-json-with-author-string                    https://www.npmjs.com/package/module-with-package-json-with-author-string                    https://www.duttke.de/#author                                                       https://www.npmjs.com/package/module-with-package-json-with-author-string',
					'\u001B[31mmodule-with-package-json-with-author-without-url\u001B[39m             \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-with-package-json-with-author-without-url                dependencies     \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-with-package-json-with-author-without-url               https://www.npmjs.com/package/module-with-package-json-with-author-without-url               https://www.npmjs.com/package/module-with-package-json-with-author-without-url      https://www.npmjs.com/package/module-with-package-json-with-author-without-url',
					'\u001B[31mmodule-with-package-json-with-bitbucket-repository-string\u001B[39m    \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-with-package-json-with-bitbucket-repository-string       dependencies     \u001B[90m-\u001B[39m                  https://bitbucket.org/user/repo                                                              https://bitbucket.org/user/repo                                                              https://bitbucket.org/user/repo                                                     https://www.npmjs.com/package/module-with-package-json-with-bitbucket-repository-string',
					'\u001B[31mmodule-with-package-json-with-gist-repository-string\u001B[39m         \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-with-package-json-with-gist-repository-string            dependencies     \u001B[90m-\u001B[39m                  https://gist.github.com/11081aaa281/revisions                                                https://gist.github.com/11081aaa281/revisions                                                https://gist.github.com/11081aaa281                                                 https://www.npmjs.com/package/module-with-package-json-with-gist-repository-string',
					'\u001B[31mmodule-with-package-json-with-github-repository\u001B[39m              \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-with-package-json-with-github-repository                 dependencies     \u001B[90m-\u001B[39m                  https://github.com/jens-duttke/check-outdated/blob/master/CHANGELOG.md                       https://github.com/jens-duttke/check-outdated/blob/master/CHANGELOG.md                       https://github.com/jens-duttke/check-outdated/blob/master/README.md                 https://www.npmjs.com/package/module-with-package-json-with-github-repository',
					'\u001B[31mmodule-with-package-json-with-github-repository-string\u001B[39m       \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-with-package-json-with-github-repository-string          dependencies     \u001B[90m-\u001B[39m                  https://github.com/user/repo/releases                                                        https://github.com/user/repo/releases                                                        https://github.com/user/repo                                                        https://www.npmjs.com/package/module-with-package-json-with-github-repository-string',
					'\u001B[31mmodule-with-package-json-with-github-repository2\u001B[39m             \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-with-package-json-with-github-repository2                dependencies     \u001B[90m-\u001B[39m                  https://github.com/jens-duttke/check-outdated/blob/master/CHANGELOG.md                       https://github.com/jens-duttke/check-outdated/blob/master/CHANGELOG.md                       https://github.com/jens-duttke/check-outdated                                       https://www.npmjs.com/package/module-with-package-json-with-github-repository2',
					'\u001B[31mmodule-with-package-json-with-github-repository3\u001B[39m             \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-with-package-json-with-github-repository3                dependencies     \u001B[90m-\u001B[39m                  https://github.com/jens-duttke/check-outdated/blob/master/packages/sub-package/CHANGELOG.md  https://github.com/jens-duttke/check-outdated/blob/master/packages/sub-package/CHANGELOG.md  https://github.com/jens-duttke/check-outdated/packages/sub-package                  https://www.npmjs.com/package/module-with-package-json-with-github-repository3',
					'\u001B[31mmodule-with-package-json-with-gitlab-repository-string\u001B[39m       \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-with-package-json-with-gitlab-repository-string          dependencies     \u001B[90m-\u001B[39m                  https://gitlab.com/user/repo/-/releases                                                      https://gitlab.com/user/repo/-/releases                                                      https://gitlab.com/user/repo                                                        https://www.npmjs.com/package/module-with-package-json-with-gitlab-repository-string',
					'\u001B[31mmodule-with-package-json-with-homepage-and-author\u001B[39m            \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-with-package-json-with-homepage-and-author               dependencies     \u001B[90m-\u001B[39m                  https://www.duttke.de/#homepage                                                              https://www.duttke.de/#homepage                                                              https://www.duttke.de/#homepage                                                     https://www.npmjs.com/package/module-with-package-json-with-homepage-and-author',
					'\u001B[31mmodule-with-package-json-with-homepage-and-repository\u001B[39m        \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-with-package-json-with-homepage-and-repository           dependencies     \u001B[90m-\u001B[39m                  https://www.duttke.de/#git                                                                   https://www.duttke.de/#git                                                                   https://www.duttke.de/#homepage                                                     https://www.npmjs.com/package/module-with-package-json-with-homepage-and-repository',
					'\u001B[31mmodule-with-package-json-with-repository-and-author\u001B[39m          \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-with-package-json-with-repository-and-author             dependencies     \u001B[90m-\u001B[39m                  https://www.duttke.de/#git                                                                   https://www.duttke.de/#git                                                                   https://www.duttke.de/#git                                                          https://www.npmjs.com/package/module-with-package-json-with-repository-and-author',
					'\u001B[31mmodule-with-package-json-with-repository-without-url\u001B[39m         \u001B[4m1\u001B[24m.0.0   \u001B[32m1\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m\u001B[32m.\u001B[39m\u001B[32m0\u001B[39m          \u001B[35;4m2\u001B[39;24m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m\u001B[35m.\u001B[39m\u001B[35m0\u001B[39m  major       node_modules/module-with-package-json-with-repository-without-url            dependencies     \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-with-package-json-with-repository-without-url           https://www.npmjs.com/package/module-with-package-json-with-repository-without-url           https://www.npmjs.com/package/module-with-package-json-with-repository-without-url  https://www.npmjs.com/package/module-with-package-json-with-repository-without-url',
					'module-without-properties                                        \u001B[90m-\u001B[39m       \u001B[90m-\u001B[39m              \u001B[90m-\u001B[39m  \u001B[90m-\u001B[39m           node_modules/module-without-properties                                       \u001B[90m-\u001B[39m                \u001B[90m-\u001B[39m                  https://www.npmjs.com/package/module-without-properties                                      https://www.npmjs.com/package/module-without-properties                                      https://www.npmjs.com/package/module-without-properties                             https://www.npmjs.com/package/module-without-properties',
					'',
					'\u001B[4mColor legend\u001B[24m',
					'\u001B[31mMajor update\u001B[39m: backward-incompatible updates',
					'\u001B[33mMinor update\u001B[39m: backward-compatible features',
					'\u001B[32mPatch update\u001B[39m: backward-compatible bug fixes',
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

		await test('should return with outdated dependency message', ['--columns', 'INVALID'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, undefined);
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Invalid column name "INVALID" in --columns');
		});

		await test('should return with the help indicating an argument problem', ['--columns', 'package,INVALID1,INVALID2'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, undefined);
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Invalid column name "INVALID1" in --columns');
			expectVarNotToHaveWord(stdout, 'Invalid column name "INVALID2" in --columns');
		});

		await test('should return with the help indicating an argument problem', ['--columns'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, undefined);
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Invalid value of --columns');
		});
	});

	await describe('--global argument', async () => {
		await test('should return with outdated dependency message', ['--global'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false --global');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, mockData.defaultResponse, 0);
		});
	});

	await describe('--depth argument', async () => {
		// @todo Improve this test by adding modules with deeper node_modules-structure
		await test('should return with outdated dependency message', ['--depth', '10'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false --depth 10');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, mockData.defaultResponse, 0);
		});

		await test('should return with the help indicating an argument problem', ['--depth', 'INVALID'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, undefined);
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Invalid value of --depth');
		});

		await test('should return with the help indicating an argument problem', ['--depth'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, undefined);
			expectVarToEqual(exitCode, 1);

			expectVarToHaveWord(stdout, 'Invalid value of --depth');
		});
	});

	await describe('(Almost) all arguments (without "--prefer-wanted")', async () => {
		await test('should return with outdated dependency message if all options are activated', ['--ignore-pre-releases', '--ignore-dev-dependencies', '--ignore-packages', 'module-major,module-minor', '--global', '--depth', '10'], mockData.defaultResponse, (command, exitCode, stdout) => {
			expectVarToEqual(command, 'npm outdated --json --long --save false --global --depth 10');
			expectVarToEqual(exitCode, 1);

			expectNoOfAffectedDependencies(stdout, mockData.defaultResponse, 4);

			expectVarNotToHaveWord(stdout, 'module-major');
			expectVarNotToHaveWord(stdout, 'module-minor');
			expectVarNotToHaveWord(stdout, 'module-prerelease');
			expectVarNotToHaveWord(stdout, 'module-dev-major');
		});
	});

	const sum = getExpectResult();

	/* eslint-disable no-console -- console.log() is used to output the test results */
	console.log();
	console.log(colorize.green(`${sum.passed} passed`));
	if (sum.failed > 0) {
		console.log(colorize.red(`${sum.failed} failed`));

		process.exitCode = 1;
	}
	console.log();
	/* eslint-enable no-console */
})();
