# @todo

## Functionality improvements

- "--check-also" option which allows to check additional packages which are not referenced in the package.json
  --check-also better-npm-audit@1.9.1,improved-yarn-audit@2.3.3

- Ensure that [optionalDependencies](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#optionaldependencies) are handled correctly.

- Support of aliases:
  "gsap": "npm:@gsap/shockingly@^3.6.0",
  
  Installable using:
  npm install -D tailwindcss@npm:@tailwindcss/postcss7-compat

  See the npm issue [[BUG] npm outdated fails to parse aliases
](https://github.com/npm/cli/issues/2800)

- [Test for CHANGELOG at GitLab](https://gitlab.com/allardyce/vectato)
  
- Add main-branch detection in helper\urls.js -> getChangelogFromURL() (right now, we assume the main branch is called "master")

- Add option to automatically update the outdated dependencies
  - It must be configurable if you want to auto-update only patches, or minor or major (all)
  - It must be configurable if the status code should be still -1 or if it should be 0
    - This must be configurable on a version-type base, e.g. patches should be silently updated, while minor and major updates should return -1

## Code quality improvements

## Test improvements

- Improve the "--depth" test by adding modules with deeper node_modules-structure.
- Add some more tests for edge-cases
  - child_process.exec() returns with error (first callback parameter)
