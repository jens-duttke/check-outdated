[![npm version](https://badge.fury.io/js/check-outdated.svg)](https://badge.fury.io/js/check-outdated)
[![Dependency Status](https://img.shields.io/david/jens-duttke/check-outdated.svg)](https://www.npmjs.com/package/check-outdated)
[![Known Vulnerabilities](https://snyk.io/test/github/jens-duttke/check-outdated/badge.svg?targetFile=package.json)](https://snyk.io/test/github/jens-duttke/check-outdated?targetFile=package.json)
[![npm](https://img.shields.io/npm/dm/check-outdated.svg?maxAge=2592000)](https://www.npmjs.com/package/check-outdated)
[![MIT license](https://img.shields.io/github/license/jens-duttke/check-outdated.svg?style=flat)](https://opensource.org/licenses/MIT)

# check-outdated

Ensures that your dependencies are up-to-date, otherwise the process is terminated with status code 1.

This is an improved version of `npm outdated`, which can be used in build-pipelines, pre-publish scripts (npm) or pre-commit hook (Git) to make sure all the used dependencies are up-to-date.

- Zero dependencies
- Optionally to ignore pre-releases (e.g. "2.1.0-alpha", "2.1.0-beta", "2.1.0-rc.1")
- Optionally ignore dev dependencies
- Optionally ignore specific packages
- Optionally check globally installed packages
- Optionally set depth for checking dependency tree

## Install

```sh
npm install check-outdated --save-dev
```

### Usage

On command-line you can run the command like this:
```sh
node_modules/.bin/check-outdated --ignore-pre-releases --ignore-dev-dependencies --ignore-packages package1,package2
```

Or put it into your `package.json`:
```json
{
  "scripts": {
    "check-outdated": "check-outdated --ignore-pre-releases --ignore-dev-dependencies --ignore-packages package1,package2",
    "preversion": "npm run lint && npm run test && npm run check-outdated"
  }
}
```

| Argument | Description |
|-|-|
| --help, -h | Show the help
| --ignore-pre-releases | Don't recommend to update to the latest version, if it contains a hyphen (e.g. "2.1.0-alpha", "2.1.0-beta", "2.1.0-rc.1") |
| --ignore-dev-dependencies | Do not warn if devDependencies are outdated. |
| --ignore-packages \<comma-separated-list-of-package-names\> | Ignore the listed packages, even if they are outdated |
| --global | Check packages in the global install prefix instead of in the current project (equal to the npm outdated-option) |
| --depth \<number\> | Max depth for checking dependency tree (equal to the npm outdated-option) |
