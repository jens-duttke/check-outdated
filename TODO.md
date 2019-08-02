# @todo

## Functionality improvements

- Don't colorize while writing into a file.  
  check-outdated.js > file.txt

## Code quality improvements

- Replace styling strings by functions which can be combined.  
  style.red(style.underline('Test'))
- Search for "// eslint-disable-next-line" and fix the issue.
- Replace Change ESLint rule `'max-statements': ['error', 40, { ignoreTopLevelFunctions: true }]` to `20` and optimize the code.  
  This error shouldn't be thrown because `checkOutdated()` is a top-level-function?!?

## Test improvements

- Improve the "--depth" test by adding modules with deeper node_modules-structure.
- Add some more tests for edge-cases
  - Additional unknown parameters
  - npm-command not found
  - non-object response (which cannot be parsed with JSON.parse())
  - Missing properties in JSON response (could happen if npm get updated)
