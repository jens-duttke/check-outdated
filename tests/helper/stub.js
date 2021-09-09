/**
 * @file Assertion methods.
 */

const path = require('path');

const proxyquire = require('proxyquire').noPreserveCache();

/** @typedef {import('../index').MockData} MockData */

/**
 * Stub native modules used by check-outdated.
 *
 * @param {MockData | undefined} mockData - Mock data to stub native modules.
 * @param {any} dependencies - Mock of the `npm outdated --json` response.
 * @param {(command: string) => void} [setUsedCommand] - Callback function which receives the used `child_process` command.
 * @returns {import('../../check-outdated')} New check-outdated with stubbed native modules.
 */
function stub (mockData, dependencies, setUsedCommand) {
	/** @type {import('../../check-outdated')} */
	return proxyquire(path.join(process.cwd(), 'check-outdated'), {
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
					if (typeof setUsedCommand === 'function') {
						setUsedCommand(command);
					}

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
}

module.exports = {
	stub
};
