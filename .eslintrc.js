/**
 * @file ESLint configuration
 */

module.exports = {
	extends: [
		require.resolve('linter-bundle/eslint'),
		require.resolve('linter-bundle/eslint/overrides-javascript-lazy'),
		require.resolve('linter-bundle/eslint/overrides-jsdoc'),
		require.resolve('linter-bundle/eslint/overrides-type-declarations')
	],
	rules: {
		'@typescript-eslint/prefer-nullish-coalescing': 'off', // Disabled as we are supporting Node.js v10, which does not support Nullish Coalescing
		'@typescript-eslint/prefer-optional-chain': 'off', // Disabled as we are supporting Node.js v10, which does not support Nullish Coalescing
		'logical-assignment-operators': 'off' // Disabled as we are supporting Node.js v10, which does not support Logical assignment operators
	}
};
