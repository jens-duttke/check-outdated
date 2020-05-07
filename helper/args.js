/**
 * @file Parses the given `argv` array, based on an object with supported args, into key/value pairs.
 */

/** @typedef {{ [key: string]: any; }} Options */

/** @typedef {{ [argName: string]: ((value: string) => Partial<Options> | string) | Partial<Options>; }} AvailableArguments */

/**
 * Parses the given `argv` array, based on an object with supported args, into key/value pairs.
 *
 * @public
 * @param {string[]} argv - Arguments given in the command line (`process.argv.slice(2)`).
 * @param {AvailableArguments} availableArgs - Configuration object with supported arguments.
 * @returns {Options | string} Either a `Options` object or a `string` which should be returned to the user, if arguments cannot be parsed.
 * @throws If arguments is unknown.
 */
function parseArgs (argv, availableArgs) {
	const args = {};

	const unsupportedArgs = argv.filter((arg) => arg.startsWith('-') && !Object.keys(availableArgs).includes(arg));
	if (unsupportedArgs.length > 0) {
		throw new Error(`Unknown argument${(unsupportedArgs.length > 1 ? 's' : '')}: ${unsupportedArgs.join(', ')}`);
	}

	for (const [name, value] of Object.entries(availableArgs)) {
		if (typeof value === 'function') {
			const index = argv.indexOf(name);

			if (index !== -1) {
				const finalValue = value(argv[index + 1] || '');

				if (typeof finalValue === 'string') {
					return finalValue;
				}

				Object.assign(args, finalValue);
			}
		}
		else if (argv.includes(name)) {
			Object.assign(args, value);
		}
	}

	return args;
}

module.exports = parseArgs;
