# @todo

<!-- markdownlint-disable MD034 -->

## Functionality improvements

- If no changelog is found, could we create one automatically, if version tags are available?
  e.g. https://github.com/GoogleChrome/workbox/compare/v6.5.2...v6.5.3

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
