/* eslint-disable n/no-unsupported-features/es-syntax -- The linting is not part of the published bundle, so we don't need to support Node.js v10 here */

/**
 * @file ESLint configuration
 */

import javascriptLazyConfig from 'linter-bundle/eslint/javascript-lazy.mjs';
import jsdocConfig from 'linter-bundle/eslint/jsdoc.mjs';
import typeDeclarationsConfig from 'linter-bundle/eslint/type-declarations.mjs';
import eslintConfig from 'linter-bundle/eslint.mjs';

export default [
	...eslintConfig,
	...javascriptLazyConfig,
	...jsdocConfig,
	...typeDeclarationsConfig,
	{
		files: [
			'tests/**/*.js'
		],
		rules: {
			'@typescript-eslint/no-unnecessary-condition': 'off' // In tests, conditions are never unnecessary.
		}
	},
	{
		files: [
			'**/*.js',
			'**/*.ts',
			'**/*.mjs',
			'**/*.mts',
			'**/*.cjs',
			'**/*.cts',
			'**/*.jsx',
			'**/*.tsx'
		],
		rules: {
			'@typescript-eslint/prefer-nullish-coalescing': 'off', // Disabled as we are supporting Node.js v10, which does not support Nullish Coalescing
			'@typescript-eslint/prefer-optional-chain': 'off', // Disabled as we are supporting Node.js v10, which does not support Nullish Coalescing
			'logical-assignment-operators': 'off', // Disabled as we are supporting Node.js v10, which does not support Logical assignment operators
			'unicorn/prefer-node-protocol': 'off', // Disabled as we are supporting Node.js v10, which does not support the node protocol
			'unicorn/prefer-top-level-await': 'off', // Disabled as we are supporting Node.js v10, which does not support top-level await
			'unicorn/no-array-sort': 'off', // Disabled as we are supporting Node.js v10, which does not support top-level await

			'n/no-unsupported-features/es-syntax': ['error', { ignores: ['hashbang'] }] // Hashbang is stripped by Node.js itself, works in all versions
		}
	}
];
