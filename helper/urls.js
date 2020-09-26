/**
 * @file Generate URLs.
 */

const https = require('https');
const path = require('path');

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
 * @param {number} [approximateContentSize] - The minimum content size. The actual file size will most likely differ by some bytes.
 * @returns {Promise<boolean>} Returns `true` or `false`.
 */
async function isFileOnGitHub (repoName, fileName, approximateContentSize = 256) {
	return new Promise((resolve) => {
		https.get({
			host: 'api.github.com',
			path: `/repos/${repoName}/contents/${fileName}`,
			method: 'HEAD',
			headers: {
				'User-Agent': 'Mozilla/5.0'
			}
		}, (response) => {
			response.destroy();

			if (response.statusCode !== STATUS_OK) {
				resolve(false);

				return;
			}

			/**
			 * Since we rely on the HTTP header to save band-width, we need to estimate if the file has any meaningful content.
			 * That's not the safest way, but we prefer performance.
			 *
			 * @example
			 * {                                                                                                          // 2 Bytes
			 *   "name": "[path.basename(fileName)]",                                                                     // 14 Bytes + path.basename(fileName)
			 *   "path": "[fileName]",                                                                                    // 14 Bytes + fileName
			 *   "sha": "9b18e93e51b128498599eda93e6181c19bc26604",                                                       // 53 Bytes
			 *   "size": 104857600,                                                                                       // 21 Bytes
			 *   "url": "https://api.github.com/repos/[repoName]/contents/[fileName]?ref=master",                         // 63 Bytes + repoName + fileName
			 *   "html_url": "https://github.com/[repoName]/blob/master/[fileName]",                                      // 50 Bytes + repoName + fileName
			 *   "git_url": "https://api.github.com/repos/[repoName]/git/blobs/9b18e93e51b128498599eda93e6181c19bc26604", // 97 Bytes + repoName
			 *   "download_url": "https://raw.githubusercontent.com/[repoName]/master/[fileName]",                        // 64 Bytes + repoName + fileName
			 *   "type": "file",                                                                                          // 18 Bytes
			 *   "content": "[base64-encoded file content]",                                                              // 17 Bytes + (file size * 1.3333)
			 *   "encoding": "base64",                                                                                    // 24 Bytes
			 *   "_links": {                                                                                              // 14 Bytes
			 *     "self": "https://api.github.com/repos/[repoName]/contents/[fileName]?ref=master",                      // 66 Bytes + repoName + fileName
			 *     "git": "https://api.github.com/repos/[repoName]/git/blobs/9b18e93e51b128498599eda93e6181c19bc26604",   // 95 Bytes + repoName
			 *     "html": "https://github.com/[repoName]/blob/master/[fileName]"                                         // 47 Bytes + repoName + fileName
			 *   }                                                                                                        // 4 Bytes
			 * }                                                                                                          // 2 Bytes
			 */
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			const minimumFileSize = 665 + path.basename(fileName).length + (fileName.length * 6) + (repoName.length * 7) + (approximateContentSize * 1.3333);
			const contentLength = response.headers['content-length'];

			resolve(typeof contentLength === 'string' && parseInt(contentLength, 10) > minimumFileSize);
		});
	});
}

module.exports = {
	getNpmJSLink,
	getPackageAuthor,
	getPackageHomepage,
	getPackageRepository
};
