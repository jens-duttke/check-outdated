/**
 * @file Generate URLs.
 */

const https = require('https');

const STATUS_OK = 200;

/** @typedef {import('./files').PackageJSON} PackageJSON */

/** @type {readonly {
 *   readonly regExp: RegExp;
 *   readonly getRepositoryURL: (match: readonly string[]) => string;
 *   readonly getChangelogURL: (match: readonly string[]) => Promise<string> | string;
 * }[]} */
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
		getChangelogURL: async (match) => getChangelogFromURL(match[1])
	},
	{
		regExp: /^git\+ssh:\/\/git@(.+)\.git$/u,
		getRepositoryURL: (match) => `https://${match[1]}`,
		getChangelogURL: async (match) => getChangelogFromURL(`https://${match[1]}`)
	},
	// Fallback (should be the last item)
	{
		regExp: /^(https?:\/\/.+)/u,
		getRepositoryURL: (match) => match[1],
		getChangelogURL: async (match) => getChangelogFromURL(match[1])
	}
];

/**
 * Generates a link to the npmjs.com website, based on a dependency name..
 *
 * @public
 * @param {string} packageName - Options which shall be appened to the `npm outdated` command-line call.
 * @returns {string} The link to the package on the npmjs.com website.
 */
function getNpmJSLink (packageName) {
	return `https://www.npmjs.com/package/${encodeURIComponent(packageName)}`;
}

/**
 * Returns the URL of the author from the package.json.
 *
 * @public
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
 * @public
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
 * @public
 * @param {PackageJSON} packageJSON - The content of a package.json.
 * @param {boolean} [linkToChangelog] - If the returned URL should link to the "Releases" page.
 * @returns {Promise<string | undefined>} The URL of the repository.
 */
async function getPackageRepository (packageJSON, linkToChangelog) {
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
 * @private
 * @param {string} url - Service URL
 * @returns {Promise<string>} Either returns an URL to the changelog for a specific service, or it returns `url`.
 */
async function getChangelogFromURL (url) {
	const githubMatch = (/^https?:\/\/github.com\/([^/]+?\/[^/#?]+)/u).exec(url);

	if (githubMatch !== null) {
		if (await isFileOnGitHub(githubMatch[1], 'CHANGELOG.md')) {
			return `https://github.com/${githubMatch[1]}/blob/master/CHANGELOG.md`;
		}

		return `https://github.com/${githubMatch[1]}/releases`;
	}

	const gistMatch = (/^https?:\/\/gist.github.com\/([^/]+?\/)?[^/#?]+/u).exec(url);

	if (gistMatch !== null) {
		return `${gistMatch[0]}/revisions`;
	}

	const gitlabMatch = (/^https?:\/\/gitlab.com\/[^/]+?\/[^/#?]+/u).exec(url);

	if (gitlabMatch !== null) {
		return `${gitlabMatch[0]}/-/releases`;
	}

	return url;
}

/**
 * Checks if a specific file exists in a GitHub repository.
 *
 * @private
 * @param {string} repoName - GitHub repository name, e.g. "jens.duttke/check-outdated"
 * @param {string} fileName - File name, e.g. "README.md"
 * @returns {Promise<boolean>} Returns `true` or `false`.
 */
async function isFileOnGitHub (repoName, fileName) {
	return new Promise((resolve) => {
		https.get({
			host: 'api.github.com',
			path: `/repos/${repoName}/contents/${fileName}`,
			method: 'GET',
			headers: {
				'User-Agent': 'Mozilla/5.0'
			}
		}, (response) => {
			if (response.statusCode !== STATUS_OK) {
				response.destroy();

				resolve(false);

				return;
			}

			/** @type {string[]} */
			const data = [];

			response.setEncoding('utf8');
			response.on('data', (chunk) => data.push(chunk));
			response.on('end', () => {
				try {
					const json = JSON.parse(data.join(''));
					const BASE64_DECODING_FACTOR = 0.75;
					const MINIMUM_CONTENT_SIZE = 256;

					resolve((json.content.replace(/\n/gu, '').length * BASE64_DECODING_FACTOR) >= MINIMUM_CONTENT_SIZE);
				}
				catch {
					resolve(false);
				}
			});
			response.on('error', () => resolve(false));
		});
	});
}

module.exports = {
	getNpmJSLink,
	getPackageAuthor,
	getPackageHomepage,
	getPackageRepository
};
