/**
 * @file Generate URLs.
 */

/** @typedef {import('./files').PackageJSON} PackageJSON */

/** @type {{ regExp: RegExp; getRepositoryURL: (match: string[]) => string; getChangelogURL: (match: string[]) => string; }[]} */
const REPOSITORY_URLS = [
	{
		regExp: /^github:(.+)/u,
		getRepositoryURL: (match) => `https://github.com/${match[1]}`,
		getChangelogURL: (match) => `https://github.com/${match[1]}/releases`
	},
	{
		regExp: /^gist:(.+)/u,
		getRepositoryURL: (match) => `https://gist.github.com/${match[1]}`,
		getChangelogURL: (match) => `https://gist.github.com/${match[1]}/revisions`
	},
	{
		regExp: /^bitbucket:(.+)/u,
		getRepositoryURL: (match) => `https://bitbucket.org/${match[1]}`,
		// @todo Right now, I can't find a reference, to a public bitbucket repository
		getChangelogURL: (match) => `https://bitbucket.org/${match[1]}`
	},
	{
		regExp: /^gitlab:(.+)/u,
		getRepositoryURL: (match) => `https://gitlab.com/${match[1]}`,
		getChangelogURL: (match) => `https://gitlab.com/${match[1]}/-/releases`
	},
	{
		regExp: /^git\+(https?:\/\/.+)\.git$/u,
		getRepositoryURL: (match) => match[1],
		getChangelogURL: (match) => getChangelogFromURL(match[1])
	},
	{
		regExp: /^git\+ssh:\/\/git@(.+)\.git$/u,
		getRepositoryURL: (match) => `https://${match[1]}`,
		getChangelogURL: (match) => getChangelogFromURL(`https://${match[1]}`)
	},
	// Fallback (should be the last item)
	{
		regExp: /^(https?:\/\/.+)/u,
		getRepositoryURL: (match) => match[1],
		getChangelogURL: (match) => match[1]
	}
];

/**
 * Generates a link to the npmjs.com website, based on a dependency name..
 *
 * @param {string} packageName - Options which shall be appened to the `npm outdated` command-line call.
 * @returns {string} The link to the package on the npmjs.com website.
 */
function getNpmJSLink (packageName) {
	return `https://www.npmjs.com/package/${encodeURIComponent(packageName)}`;
}

/**
 * Returns the URL of the author from the package.json.
 *
 * @param {PackageJSON} packageJSON - The content of a package.json.
 * @returns {string | undefined} The URL of the author.
 */
function getPackageAuthor (packageJSON) {
	if (packageJSON.author) {
		if (typeof packageJSON.author === 'string') {
			const match = (/\((http.+?)\)/u).exec(packageJSON.author);

			if (match !== null) {
				return match[1];
			}
		}
		else if (packageJSON.author.url) {
			return packageJSON.author.url;
		}
	}

	return undefined;
}

/**
 * Returns the URL of the homepage from the package.json.
 *
 * @param {PackageJSON} packageJSON - The content of a package.json.
 * @returns {string | undefined} The URL of the homepage.
 */
function getPackageHomepage (packageJSON) {
	if (packageJSON.homepage) {
		return packageJSON.homepage;
	}

	return undefined;
}

/**
 * Returns the URL of the repository from the package.json.
 *
 * @param {PackageJSON} packageJSON - The content of a package.json.
 * @param {boolean} [linkToChangelog] - If the returned URL should link to the "Releases" page.
 * @returns {string | undefined} The URL of the repository.
 */
function getPackageRepository (packageJSON, linkToChangelog) {
	if (packageJSON.repository) {
		if (typeof packageJSON.repository === 'string') {
			for (const repo of REPOSITORY_URLS) {
				const match = repo.regExp.exec(packageJSON.repository);

				if (match !== null) {
					return (linkToChangelog ? repo.getChangelogURL(match) : repo.getRepositoryURL(match));
				}
			}
		}
		else if (packageJSON.repository.url) {
			for (const repo of REPOSITORY_URLS) {
				const match = repo.regExp.exec(packageJSON.repository.url);

				if (match !== null) {
					return (linkToChangelog ? repo.getChangelogURL(match) : repo.getRepositoryURL(match));
				}
			}
		}
	}

	return undefined;
}

/**
 * Tries to determine the URL to the changelog for a specific service `url`.
 *
 * @param {string} url - Service url
 * @returns {string} Either returns an URL to the changelog for a specific service, or it returns `url`.
 */
function getChangelogFromURL (url) {
	if ((/^https?:\/\/github.com\/[^/]+?\/[^/#?]+$/u).test(url)) {
		return `${url}/releases`;
	}
	if ((/^https?:\/\/gist.github.com\/([^/]+?\/)?[^/#?]+$/u).test(url)) {
		return `${url}/revisions`;
	}
	if ((/^https?:\/\/gitlab.com\/[^/]+?\/[^/#?]+$/u).test(url)) {
		return `${url}/-/releases`;
	}

	return url;
}

module.exports = {
	getNpmJSLink,
	getPackageAuthor,
	getPackageHomepage,
	getPackageRepository
};
