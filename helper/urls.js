/**
 * @file Generate URLs.
 */

const https = require('https');

const STATUS_OK = 200;

/** @typedef {import('./files').PackageJSON} PackageJSON */

/**
 * @type {readonly {
 *   readonly regExp: RegExp;
 *   readonly getRepositoryURL: (match: readonly string[], directory: string) => string;
 *   readonly getChangelogURL: (match: readonly string[], directory: string) => Promise<string> | string;
 * }[]}
 */
const REPOSITORY_URLS = [
	{
		regExp: /^github:(.+)/u,
		getRepositoryURL: (match, directory) => `https://github.com/${match[1]}${directory}`,
		getChangelogURL: (match) => `https://github.com/${match[1]}/releases`
	},
	{
		regExp: /^gist:(.+)/u,
		getRepositoryURL: (match, directory) => `https://gist.github.com/${match[1]}${directory}`,
		getChangelogURL: (match) => `https://gist.github.com/${match[1]}/revisions`
	},
	{
		regExp: /^bitbucket:(.+)/u,
		getRepositoryURL: (match, directory) => `https://bitbucket.org/${match[1]}${directory}`,
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
		getRepositoryURL: (match, directory) => `${match[1]}${directory}`,
		getChangelogURL: async (match, directory) => getChangelogFromURL(match[1], directory)
	},
	{
		regExp: /^git\+ssh:\/\/git@(.+)\.git$/u,
		getRepositoryURL: (match, directory) => `https://${match[1]}${directory}`,
		getChangelogURL: async (match, directory) => getChangelogFromURL(`https://${match[1]}`, directory)
	},
	// Fallback (should be the last item)
	{
		regExp: /^(https?:\/\/.+?)(\.git)?$/u,
		getRepositoryURL: (match, directory) => `${match[1]}${directory}`,
		getChangelogURL: async (match, directory) => getChangelogFromURL(match[1], directory)
	}
];

/**
 * Generates a link to the npmjs.com website, based on a dependency name..
 *
 * @public
 * @param {string} packageName - Options which shall be appended to the `npm outdated` command-line call.
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
					if (linkToChangelog) {
						return repo.getChangelogURL(match, '');
					}

					return repo.getRepositoryURL(match, '');
				}
			}
		}
		else if (packageJSON.repository.url) {
			for (const repo of REPOSITORY_URLS) {
				const match = repo.regExp.exec(packageJSON.repository.url);

				if (match !== null) {
					const directory = (packageJSON.repository.directory ? packageJSON.repository.directory.replace(/^\/*/u, '/').replace(/\/+$/u, '') : '');

					if (linkToChangelog) {
						return repo.getChangelogURL(match, directory);
					}

					return repo.getRepositoryURL(match, directory);
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
 * @param {string} directory - Sub-directory path, starting with "/" or an empty string
 * @returns {Promise<string>} Either returns an URL to the changelog for a specific service, or it returns `url`.
 */
async function getChangelogFromURL (url, directory) {
	const githubMatch = (/^https?:\/\/github.com\/([^/]+?\/[^/#?]+)/u).exec(url);

	if (githubMatch !== null) {
		const linkToChangelog = await getFileOnGitHub(githubMatch[1], 'CHANGELOG.md', directory, 256);

		if (linkToChangelog) {
			return linkToChangelog;
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
 * Returns a link to the HTML representation of a specific file in a GitHub repository.
 *
 * @private
 * @param {string} repoName - GitHub repository name, e.g. "jens.duttke/check-outdated"
 * @param {string} fileName - File name, e.g. "README.md"
 * @param {string} directory - Sub-directory path, starting with "/" or an empty string
 * @param {number} minimumContentSize - The minimum required size of the file content.
 * @returns {Promise<string | undefined>} Returns either the URL to the HTML representation of the file, or `undefined` if the file has not been found, or if it is too small.
 */
async function getFileOnGitHub (repoName, fileName, directory = '', minimumContentSize = 0) {
	return new Promise((resolve) => {
		https.get({
			host: 'api.github.com',
			path: `/repos/${repoName}/contents${directory}/${fileName}`,
			method: 'GET',
			headers: {
				'User-Agent': 'Mozilla/5.0'
			}
		}, (response) => {
			if (response.statusCode !== STATUS_OK) {
				response.destroy();

				resolve(undefined);

				return;
			}

			/** @type {string[]} */
			const data = [];

			response.setEncoding('utf8');
			response.on('data', (chunk) => { data.push(chunk); });
			response.on('end', () => {
				try {
					const json = JSON.parse(data.join(''));

					if (json.html_url && json.size >= minimumContentSize) {
						resolve(json.html_url);
					}
					else {
						resolve(undefined);
					}
				}
				catch {
					resolve(undefined);
				}
			});
			response.on('error', () => resolve(undefined));
		});
	});
}

module.exports = {
	getNpmJSLink,
	getPackageAuthor,
	getPackageHomepage,
	getPackageRepository
};
