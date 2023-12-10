# @todo

<!-- markdownlint-disable MD034 -->

## Functionality improvements

- Delay warning for major and minor releases by X days to ensure that the new version has been adequately tested by others

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

    ````json
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

- Support of aliases:

  ```json
  "gsap": "npm:@gsap/shockingly@^3.6.0",
  ```
  
  Installable by using:

  ```sh
  npm install -D tailwindcss@npm:@tailwindcss/postcss7-compat
  ```

  See the npm issue [[BUG] npm outdated fails to parse aliases](https://github.com/npm/cli/issues/2800)

- Test for CHANGELOG at [GitLab](https://gitlab.com/allardyce/vectato)
  
- Add option to automatically update the outdated dependencies
  - It must be configurable if you want to auto-update only patches, or minor or major (all)
  - It must be configurable if the status code should be still -1 or if it should be 0
    - This must be configurable on a version-type base, e.g. patches should be silently updated, while minor and major updates should return -1

## Code quality improvements

## Test improvements

- Improve the "--depth" test by adding modules with deeper node_modules-structure.
- Add some more tests for edge-cases
  - child_process.exec() returns with error (first callback parameter)
