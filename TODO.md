# @todo

## Functionality improvements

- Test für CHANGELOG auf GitLab:
  https://gitlab.com/allardyce/vectato

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

