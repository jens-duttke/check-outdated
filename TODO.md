# @todo

<!-- markdownlint-disable MD034 -->

## Functionality improvements

- If no changelog is found, could we create one automatically, if version tags are available?
  e.g. https://github.com/GoogleChrome/workbox/compare/v6.5.2...v6.5.3

- Also check "overrides" and "resolutions":  
  - Overrides:  
    https://docs.npmjs.com/cli/v8/configuring-npm/package-json#overrides

    ```json
    "foo": {
      ".": "1.0.0",
      "bar": "1.0.0"
    }
    "bar": {
      "foo": "1.0.0"
    }
    "baz": {
      "bar": {
        "foo": "1.0.0"
      }
    }
    "bar@2.0.0": {
      "foo": "1.0.0"
    }
    ```

    References can be ignored as they do not "manage" their own version number:

    ```json
    "overrides": {
      "luxon": "^1.21.3",
      "@vlc/components": "$@vlc/components",
      "@vlc/dialog": "$@vlc/dialog",
      "@vlc/form": "$@vlc/form",
      "@vlc/snackbar": "$@vlc/snackbar",
      "@vlc/table": "$@vlc/table",
      "formik-material-ui": "$formik-material-ui"
    },
    ```

  - Resolutions:  
    https://classic.yarnpkg.com/en/docs/selective-version-resolutions/

    ```json
    "d2/left-pad": "1.1.1",
    "c/**/left-pad": "^1.1.2"
    ```

    When resolving the position within the file, it must be taken into account that different packages can contain different versions of sub-components.

- "--check-also" option which allows to check additional packages which are not referenced in the package.json  
  Example:

  ```sh
  --check-also better-npm-audit@1.9.1,improved-yarn-audit@2.3.3
  ```

- Ensure that [optionalDependencies](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#optionaldependencies) are handled correctly.

- Add option to automatically update the outdated dependencies
  - It must be configurable if you want to auto-update only patches, or minor or major (all)
  - It must be configurable if the status code should be still -1 or if it should be 0
    - This must be configurable on a version-type base, e.g. patches should be silently updated, while minor and major updates should return -1

## Code quality improvements

## Test improvements

- Improve the "--depth" test by adding modules with deeper node_modules-structure.
- Add some more tests for edge-cases
  - `npm outdated` exec call fails with an Error object and empty stdout (triggers the `reject(error)` path in `getOutdatedDependencies`)
  - Malformed JSON in a dependency's `package.json` inside `node_modules` (affects `JSON.parse` in `reference` column and wildcard `*` version filter)
  - Dependency's `package.json` missing the expected dependency type field (e.g. no `dependencies` key), causing `JSON.parse(...)[dependency.type]` to be `undefined` in the `*` version filter
  - `--ignore-packages` with leading/trailing commas (e.g. `,module1,module2,`) — creates empty strings in the array that pass validation
  - `--columns` with duplicate column names (no deduplication, column renders twice)
  - `semverDiff` and `semverInRange` with edge-case inputs: empty strings, missing parts, or non-numeric segments
  - HTTP error codes from GitHub API (404, 403 rate-limit, 500)
  - Non-parseable or missing timestamps from npm registry in min-age filtering (e.g. `new Date(value)` returns `Invalid Date`, or version key missing in `time` object)
  - Alias regex in `prepareResponseObject` does not match (e.g. dependency name containing only `:`) — `aliasName` becomes `undefined`
