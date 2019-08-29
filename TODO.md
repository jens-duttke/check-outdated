# @todo

## Functionality improvements

## Code quality improvements

## Test improvements

- Improve the "--depth" test by adding modules with deeper node_modules-structure.
- Add some more tests for edge-cases
  - Additional unknown parameters
  - npm-command not found
  - non-object response (which cannot be parsed with JSON.parse())
  - Missing properties in JSON response (could happen if npm get updated)
