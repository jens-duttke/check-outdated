/**
 * @file The wrapper for a specific test suite.
 */

const path = require('path');

const proxyquire = require('proxyquire').noPreserveCache();

const colorize = require('./colorize');

/** @typedef {import('../index').MockData} MockData */

/** @type {MockData | undefined} */
let mockData;

/**
 * Set the mocks used for simulating `fs` methods return values.
 *
 * @public
 * @param {MockData} newMockData - Mock data for `fs.exists()`.
 */
function setMocks (newMockData) {
	mockData = newMockData;
}

/**
 * Create a test suite to test a specific "check-outdated" call.
 *
 * @public
 * @param {string} title - The title of the test suite.
 * @param {string[]} argv - Arguments which are used for the `check-outdated` call.
 * @param {any} dependencies - Mock of the `npm outdated --json` response.
 * @param {(command: string | undefined, exitCode: number, stdout: string) => void} expectedCallback - Callback with for the assertion functionality.
 * @returns {Promise<void>} The Promise is resolved with `void` as soon as the test suite is finished.
 */
async function test (title, argv, dependencies, expectedCallback) {
	/* eslint-disable no-console -- console.log() is used to output the test results */
	console.log();
	console.log(`  ${JSON.stringify(argv)} ${title.replace(/\n/gu, '\\n').replace(/`(.+?)`/gu, colorize.underline('$1'))}`);
	console.log();
	/* eslint-enable no-console */

	let usedCommand;

	/** @type {import('../../check-outdated')} */
	const checkOutdated = proxyquire(path.join(process.cwd(), 'check-outdated'), {
		'./helper/dependencies': proxyquire(path.join(process.cwd(), 'helper/dependencies'), {
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
		'./helper/files': proxyquire(path.join(process.cwd(), 'helper/files'), {
			fs: {
				/**
				 * Mock of the fs.existsSync() function, which is used by `check-outdated` to figure out of CHANGELOG.md in the package folder exists.
				 *
				 * @param {string | Buffer | URL} filePath - Filename or file descriptor.
				 * @returns {boolean} Returns true if the `filePath` exists, false otherwise.
				 * @throws Error if no mock data for the file exist.
				 */
				existsSync (filePath) {
					if (typeof filePath !== 'string') {
						throw new TypeError('fs.existsSync(): Mock only support strings as path.');
					}

					if (mockData === undefined) { return false; }

					const normalizedPath = filePath.replace(/\\/gu, '/');

					if (!(normalizedPath in mockData.fsExists)) {
						throw new Error(`fs.existsSync(): Mocked data for "${normalizedPath}" not found.`);
					}

					return mockData.fsExists[normalizedPath];
				},

				/**
				 * Mock of the fs.readFileSync() function, which is used by `check-outdated` to read package.json files.
				 *
				 * @param {string | Buffer | URL | number} filePath - Filename or file descriptor.
				 * @param {{ encoding?: string | null; flag?: string; } | string} options - Either an object, or an string representing the encoding.
				 * @returns {string | Buffer} Returns the contents of the `filePath`.
				 * @throws Error if no mock data for the file exist.
				 */
				readFileSync (filePath, options) {
					if (typeof filePath !== 'string') {
						throw new TypeError('fs.readFileSync(): Mock only support strings as path.');
					}

					if (options !== 'utf8') {
						throw new Error('fs.readFileSync(): Mock only support "utf8" encoding.');
					}

					if (mockData === undefined) { return ''; }

					const normalizedPath = filePath.replace(/\\/gu, '/');

					if (!(normalizedPath in mockData.fsReadFile)) {
						throw new Error(`fs.readFileSync(): Mocked data for "${normalizedPath}" not found.`);
					}

					const content = mockData.fsReadFile[normalizedPath];

					return (typeof content === 'string' ? content : JSON.stringify(content, null, '  '));
				}
			},
			path: {
				/**
				 * Mock of the path.resolve() function, which is used by `check-outdated` to get the absolute path of the referencing package.json.
				 *
				 * @param {string[]} pathSegments - A sequence of paths or path segments.
				 * @returns {string} Returns an absolute path.
				 * @throws Error if the number of arguments is not 2, or if if the second argument is not a string.
				 */
				resolve (...pathSegments) {
					if (pathSegments.length !== 2) {
						throw new RangeError('path.resolve(): Mock expects exactly 2 path segments.');
					}

					if (typeof pathSegments[1] !== 'string') {
						throw new TypeError('path.resolve(): Mock expects the second path segment to be an string.');
					}

					return pathSegments[1];
				}
			}
		}),
		'./helper/urls': proxyquire(path.join(process.cwd(), 'helper/urls'), {
			https: {
				/**
				 * Mock of the https.get() function, which is used by `check-outdated` to check if a file exists on a specific server.
				 *
				 * @param {{ host: string; path: string; }} options - The command to run.
				 * @param {(
				 *   res: {
				 *     statusCode: number;
				 *     on (event: 'data' | 'end' | 'error', listener: (...args: any[]) => void): void;
				 *     setEncoding (encoding: string): void, destroy (): void;
				 *   }
				 * ) => void} callback - Called with the output when process terminates.
				 * @returns {void}
				 */
				get (options, callback) {
					const STATUS_NOT_FOUND = 404;

					/** @type {{ statusCode: number; data?: string; }} */
					const response = (mockData && mockData.httpsGet[`${options.host}${options.path}`]) || { statusCode: STATUS_NOT_FOUND };

					// eslint-disable-next-line node/no-callback-literal -- `callback()` is not using the Node.js error-first callback pattern.
					callback({
						...response,
						on (event, listener) {
							switch (event) {
								case 'data':
									if (typeof response.data === 'string') {
										listener(response.data);
									}
									break;

								case 'end':
									listener();
									break;

								default:
							}
						},
						setEncoding () { /* Do nothing */ },
						destroy () { /* Do nothing */ }
					});
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

module.exports = {
	setMocks,
	test
};
