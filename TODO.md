# @todo

- Replace styling strings by functions which can be combined.  
  style.red(style.underline('Test'))
- Don't colorize while writing into a file.  
  check-outdated.js > file.txt
- Search for "// eslint-disable-next-line" and fix the issue.
- Replace Change ESLint rule `'max-statements': ['error', 40, { ignoreTopLevelFunctions: true }]` to `20` and optimize the code.  
  This error shouldn't be thrown because `checkOutdated()` is a top-level-function?!?
- Improve the "--depth" test by adding modules with deeper node_modules-structure.
