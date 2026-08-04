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
 * @throws {Error} If an argument is unknown, given multiple times with a value, or not consumed at all.
 */
function parseArguments (argv, availableArgs) {
	const args = {};

	const unsupportedArguments = argv.filter((argument) => (argument.startsWith('-') && !Object.keys(availableArgs).includes(argument)));

	if (unsupportedArguments.length > 0) {
		throw new Error(`Unknown argument${(unsupportedArguments.length > 1 ? 's' : '')}: ${unsupportedArguments.join(', ')}`);
	}

	const consumedIndices = new Set();

	for (const [name, value] of Object.entries(availableArgs)) {
		if (typeof value === 'function') {
			const index = argv.indexOf(name);

			if (index !== -1) {
				const finalValue = value(argv[index + 1] || '');

				if (typeof finalValue === 'string') {
					return finalValue;
				}

				// The argument and the following token, which the validator consumed as its value
				consumedIndices.add(index);
				consumedIndices.add(index + 1);

				Object.assign(args, finalValue);
			}
		}
		else {
			// Flag arguments are idempotent, so every occurrence is consumed
			for (let index = argv.indexOf(name); index !== -1; index = argv.indexOf(name, index + 1)) {
				consumedIndices.add(index);

				Object.assign(args, value);
			}
		}
	}

	const unusedArguments = argv.filter((_argument, index) => !consumedIndices.has(index));

	if (unusedArguments.length > 0) {
		const duplicateArguments = unusedArguments.filter((argument) => (argument in availableArgs));

		if (duplicateArguments.length > 0) {
			throw new Error(`Duplicate argument${(duplicateArguments.length > 1 ? 's' : '')}: ${duplicateArguments.join(', ')}`);
		}

		throw new Error(`Unexpected argument${(unusedArguments.length > 1 ? 's' : '')}: ${unusedArguments.join(', ')}`);
	}

	return args;
}

module.exports = parseArguments;
