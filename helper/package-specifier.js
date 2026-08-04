/**
 * @file Helper functionality to work with `name@version` package specifiers.
 */

/**
 * A package name together with the version or version range it is pinned to.
 *
 * @typedef {object} PackageSpecifier
 * @property {string} name - The package name, including a leading scope (e.g. "@scope/pkg").
 * @property {string} version - The version or version range behind the separator, which can be an empty string.
 */

/**
 * Splits a `name@version` specifier, like the values of `--ignore-packages`, into the package name and the version.
 *
 * The separator is the first `@` after the first character, so that the leading `@` of a scoped package name is not mistaken for it.
 * A `String.indexOf()` lookup is used instead of a regular expression, because a regular expression which allows `@` in both parts backtracks quadratically on long input.
 *
 * @public
 * @param {string} specifier - The specifier to split (e.g. "pkg@^1.0.0" or "@scope/pkg@1.2.3").
 * @returns {PackageSpecifier | null} The name and version, or `null` if the specifier holds no version.
 */
function splitPackageSpecifier (specifier) {
	const separatorIndex = specifier.indexOf('@', 1);

	if (separatorIndex === -1) {
		return null;
	}

	return {
		name: specifier.slice(0, separatorIndex),
		version: specifier.slice(separatorIndex + 1)
	};
}

module.exports = splitPackageSpecifier;
