/**
 * @file ESLint configuration
 */

module.exports = {
	extends: [
		require.resolve('linter-bundle/eslint'),
		require.resolve('linter-bundle/eslint/overrides-javascript-lazy'),
		require.resolve('linter-bundle/eslint/overrides-jsdoc'),
		require.resolve('linter-bundle/eslint/overrides-type-declarations')
	]
};
