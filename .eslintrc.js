module.exports =  {
	parser:  '@typescript-eslint/parser',
	extends:  [
		'plugin:@typescript-eslint/recommended',
	],
	plugins: [
		'jsdoc'
	],
	parserOptions:  {
		ecmaVersion: 2018,
		sourceType: 'module',
		project: [
			'./jsconfig.json'
		],
		warnOnUnsupportedTypeScriptVersion: false
	},
	settings: {
		jsdoc: {
			mode: 'typescript'
		}
	},
	env: {
		node: true,
		es6: true
	},
	reportUnusedDisableDirectives: true,
	overrides: [
		{
			files: ['tests/**/*.js'],
			rules: {
				// @typescript-eslint Rules
				'@typescript-eslint/camelcase': ['error', { allow: ['child_process'] }],

				// Possible Errors
				'no-console': 'off',

				// Stylistic Issues
				'max-len': 'off',
				'max-lines': 'off',
				'max-lines-per-function': 'off',
				'max-statements': 'off'
			}
		}
	],
	rules:  {
		/**
		 * @typescript-eslint Rules
		 * @see https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules
		 */
		'@typescript-eslint/adjacent-overload-signatures': 'error',
		'@typescript-eslint/array-type': 'error',
		'@typescript-eslint/await-thenable': 'error',
		'@typescript-eslint/ban-ts-ignore': 'off', // @typescript-eslint/ban-ts-comment
		'@typescript-eslint/ban-ts-comment': ['error', {
			'ts-expect-error': false
		}],
		'@typescript-eslint/ban-types': ['error', {
			types: {
				'Function': null,
				'JSX.ELement': {
					message: 'Use React.ReactNode instead.',
					fixWith: 'React.ReactNode'
				},
				'Object': {
					message: 'Use {} instead.',
					fixWith: '{}'
				}
			}
		}],
		'@typescript-eslint/brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
		'@typescript-eslint/camelcase': 'error',
		'@typescript-eslint/class-literal-property-style': 'error',
		'@typescript-eslint/class-name-casing': 'error',
		'@typescript-eslint/comma-spacing': 'error',
		'@typescript-eslint/consistent-type-assertions': 'error',
		'@typescript-eslint/consistent-type-definitions': 'error',
		'@typescript-eslint/dot-notation': 'error',
		'@typescript-eslint/explicit-function-return-type': 'off', // Requires type information (@see https://github.com/typescript-eslint/typescript-eslint/issues/906)
		'@typescript-eslint/explicit-member-accessibility': 'off', // @todo This function should also consider JSDoc @public/@private, but it doesn't do that yet, so create an ticket.
		'@typescript-eslint/explicit-module-boundary-types': 'error',
		'@typescript-eslint/func-call-spacing': 'error',
		'@typescript-eslint/generic-type-naming': ['error', '^[A-Z][a-zA-Z]*$'],
		'@typescript-eslint/indent': ['error', 'tab', { SwitchCase: 1, VariableDeclarator: 1, MemberExpression: 1, flatTernaryExpressions: true, ignoredNodes: ['ConditionalExpression'] }],
		'@typescript-eslint/interface-name-prefix': 'error',
		'@typescript-eslint/member-delimiter-style': ['error', { multiline: { delimiter: 'semi', requireLast: true }, singleline: { delimiter: 'semi', requireLast: true } }],
		'@typescript-eslint/member-naming': 'error',
		'@typescript-eslint/member-ordering': ['error', {
			default: [
				// Index signature
				'signature',

				// Fields
				'public-static-field',
				'protected-static-field',
				'private-static-field',

				"public-decorated-field",
				"protected-decorated-field",
				"private-decorated-field",

				'public-instance-field',
				'protected-instance-field',
				'private-instance-field',

				'public-abstract-field',
				'protected-abstract-field',
				'private-abstract-field',

				// Constructors
				'public-constructor',
				'protected-constructor',
				'private-constructor',

				// Methods
				"public-decorated-method",
				'public-instance-method',
				'public-static-method',
				'public-abstract-method',

				"protected-decorated-method",
				'protected-instance-method',
				'protected-static-method',
				'protected-abstract-method',

				"private-decorated-method",
				'private-instance-method',
				'private-static-method',
				'private-abstract-method'
			]
		}],
		'@typescript-eslint/method-signature-style': ['error', 'method'],
		'@typescript-eslint/naming-convention': 'off', // Requires type information
		'@typescript-eslint/no-array-constructor': 'error',
		'@typescript-eslint/no-base-to-string': 'error',
		'@typescript-eslint/no-dupe-class-members': 'error',
		'@typescript-eslint/no-dynamic-delete': 'error',
		'@typescript-eslint/no-empty-function': 'error',
		'@typescript-eslint/no-empty-interface': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-extra-non-null-assertion': 'error',
		'@typescript-eslint/no-extra-parens': ['off', { nestedBinaryExpressions: true, enforceForArrowConditionals: true }], // @todo There should be a option to enforce parens for IIFs + This has to be activated if all other linting errors are resolved
		'@typescript-eslint/no-extra-semi': 'error',
		'@typescript-eslint/no-extraneous-class': 'error',
		'@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
		'@typescript-eslint/no-for-in-array': 'error',
		'@typescript-eslint/no-inferrable-types': 'off',
		'@typescript-eslint/no-invalid-this': 'error',
		'@typescript-eslint/no-invalid-void-type': 'off', // @todo Disabled till intersections with `never` are allowed @see https://github.com/typescript-eslint/typescript-eslint/issues/1946
		'@typescript-eslint/no-magic-numbers': ['error', {
			ignore: [-1, 0, 1, 2, 3],
			ignoreArrayIndexes: true,
			enforceConst: true,
			detectObjects: true
		}],
		'@typescript-eslint/no-misused-new': 'error',
		'@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
		'@typescript-eslint/no-namespace': 'error',
		'@typescript-eslint/no-non-null-assertion': 'error',
		'@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
		'@typescript-eslint/no-parameter-properties': 'error',
		'@typescript-eslint/no-require-imports': 'off', // Requires type information
		'@typescript-eslint/no-this-alias': 'error',
		'@typescript-eslint/no-throw-literal': 'off', // @todo Doesn't work with NodeJS assert.AssertionError()
		'@typescript-eslint/no-type-alias': ['error', {
			allowAliases: 'always',
			allowCallbacks: 'always',
			allowConditionalTypes: 'always',
			allowConstructors: 'always',
			allowLiterals: 'in-unions-and-intersections',
			allowMappedTypes: 'always',
			allowTupleTypes: 'in-unions-and-intersections'
		}],
		'@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
		'@typescript-eslint/no-unnecessary-condition': ['off', { ignoreRhs: true }], // @todo Can't handle JSDoc optional properties correctly
		'@typescript-eslint/no-unnecessary-qualifier': 'error',
		'@typescript-eslint/no-unnecessary-type-arguments': 'error',
		'@typescript-eslint/no-unnecessary-type-assertion': 'error',
		'@typescript-eslint/no-unsafe-assignment': 'off', // @todo Currently doesn't work with JSDoc. @see https://github.com/typescript-eslint/typescript-eslint/issues/1943
		'@typescript-eslint/no-unsafe-call': 'off', // @todo Deactivated for now. Activate later
		'@typescript-eslint/no-unsafe-member-access': 'off', // @todo Deactivated for now. Activate later
		'@typescript-eslint/no-unsafe-return': 'off', // @todo Currently doesn't work with JSDoc. @see https://github.com/typescript-eslint/typescript-eslint/issues/1943
		'@typescript-eslint/no-untyped-public-signature': 'off', // This does not allow "any" as type, which may be correct. Additionally, the functionality is catched by restrictive jsconfig.json settings
		'@typescript-eslint/no-unused-expressions': 'error',
		'@typescript-eslint/no-unused-vars-experimental': 'error',
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		'@typescript-eslint/no-use-before-define': ['error', { functions: false }],
		'@typescript-eslint/no-useless-constructor': 'error',
		'@typescript-eslint/no-var-requires': 'off', // Requires type information
		'@typescript-eslint/prefer-as-const': 'error',
		'@typescript-eslint/prefer-for-of': 'error',
		'@typescript-eslint/prefer-function-type': 'error',
		'@typescript-eslint/prefer-includes': 'error',
		'@typescript-eslint/prefer-namespace-keyword': 'error',
		'@typescript-eslint/prefer-nullish-coalescing': 'off', // @todo `??` is not yet supported by NodeJS. Remove this like, as soon as it is supported.
		'@typescript-eslint/prefer-optional-chain': 'error',
		'@typescript-eslint/prefer-readonly': 'error',
		'@typescript-eslint/prefer-readonly-parameter-types': 'off', // Doesn't work with JSDoc @property definitions
		'@typescript-eslint/prefer-reduce-type-parameter': 'error',
		'@typescript-eslint/prefer-regexp-exec': 'error',
		'@typescript-eslint/prefer-string-starts-ends-with': 'error',
		'@typescript-eslint/prefer-ts-expect-error': 'error',
		'@typescript-eslint/promise-function-async': 'error',
		'@typescript-eslint/quotes': ['error', 'single', { avoidEscape: true }],
		'@typescript-eslint/require-array-sort-compare': 'error',
		'@typescript-eslint/require-await': 'off', // Sometimes a function is marked as async to have a consistent interface with other functions in a class, even if this specific function does not contain async code (yet)
		'@typescript-eslint/restrict-plus-operands': 'error',
		'@typescript-eslint/restrict-template-expressions': ['error', {
			allowAny: true,
			allowBoolean: true,
			allowNullable: true,
			allowNumber: true
		}],
		'@typescript-eslint/return-await': 'error',
		'@typescript-eslint/semi': 'error',
		'@typescript-eslint/space-before-function-paren': 'error',
		'@typescript-eslint/strict-boolean-expressions': ['off', { allowNullable: true, allowSafe: true, ignoreRhs: true }], // @todo Disabled for now, may be activated later
		'@typescript-eslint/switch-exhaustiveness-check': 'error',
		'@typescript-eslint/triple-slash-reference': 'error',
		'@typescript-eslint/type-annotation-spacing': 'error',
		'@typescript-eslint/typedef': 'off', // We are using "noImplicitAny" in tsconfig.json instead
		'@typescript-eslint/unbound-method': 'error',
		'@typescript-eslint/unified-signatures': 'error',

		/**
		 * eslint-plugin-jsdoc Rules
		 * @see https://github.com/gajus/eslint-plugin-jsdoc
		 */
		'jsdoc/check-access': 'error',
		'jsdoc/check-alignment': 'error',
        'jsdoc/check-examples': 'off', // @todo need to be configured to allow text-based examples
        'jsdoc/check-indentation': ['off', { excludeTags: ['typedef'] }], // @todo this doesn't work in all cases
        'jsdoc/check-param-names': 'error',
        'jsdoc/check-syntax': 'error',
        'jsdoc/check-tag-names': 'error',
		'jsdoc/check-types': 'error',
		'jsdoc/check-values': 'error',
		'jsdoc/empty-tags': 'error',
        'jsdoc/implements-on-classes': 'error',
        'jsdoc/match-description': 'error',
		'jsdoc/newline-after-description': 'error',
		'jsdoc/no-bad-blocks': 'error',
		'jsdoc/no-defaults': 'off',
        'jsdoc/no-types': 'off',
        'jsdoc/no-undefined-types': ['error', { definedTypes: ['void', 'never'] }],
        'jsdoc/require-description-complete-sentence': 'off', // @todo Doesn't seems to work correctly
        'jsdoc/require-description': 'error',
		'jsdoc/require-example': 'off',
		'jsdoc/require-file-overview': 'error',
        'jsdoc/require-hyphen-before-param-description': 'error',
        'jsdoc/require-jsdoc': 'error',
        'jsdoc/require-param-description': 'error',
        'jsdoc/require-param-name': 'error',
        'jsdoc/require-param-type': 'error',
		'jsdoc/require-param': 'error',
		'jsdoc/require-property': 'error',
        'jsdoc/require-returns-check': 'error',
        'jsdoc/require-returns-description': 'error',
        'jsdoc/require-returns-type': 'error',
        'jsdoc/require-returns': ['error', { forceReturnsWithAsync: true }],
		'jsdoc/valid-types': 'off', // Checked by TypeScript

		/**
		 * eslint Rules
		 * @see https://eslint.org/docs/rules/
		 */

		// Possible Errors
		'for-direction': 'error',
		'getter-return': 'error',
		'no-async-promise-executor': 'error',
		'no-await-in-loop': 'error',
		'no-compare-neg-zero': 'error',
		'no-cond-assign': 'error',
		'no-console': 'error',
		'no-constant-condition': 'error',
		'no-control-regex': 'off', // This rule does not make sense to me
		'no-debugger': 'error',
		'no-dupe-args': 'error',
		'no-dupe-else-if': 'error',
		'no-dupe-keys': 'error',
		'no-duplicate-case': 'error',
		'no-empty': 'error',
		'no-empty-character-class': 'error',
		'no-ex-assign': 'error',
		'no-extra-boolean-cast': 'error',
		'no-extra-parens': 'off', // @typescript-eslint/no-extra-parens
		'no-extra-semi': 'off', // @typescript-eslint/no-extra-semi
		'no-func-assign': 'error',
		'no-import-assign': 'error',
		'no-inner-declarations': ['error', 'both'],
		'no-invalid-regexp': 'error',
		'no-irregular-whitespace': 'error',
		'no-misleading-character-class': 'error',
		'no-obj-calls': 'error',
		'no-prototype-builtins': 'error',
		'no-regex-spaces': 'error',
		'no-setter-return': 'error',
		'no-sparse-arrays': 'error',
		'no-template-curly-in-string': 'error',
		'no-unexpected-multiline': 'error',
		'no-unreachable': 'error',
		'no-unsafe-finally': 'error',
		'no-unsafe-negation': 'error',
		'require-atomic-updates': 'error',
		'use-isnan': 'error',
		'valid-typeof': ['error', { requireStringLiterals: true }],

		// Best Practices
		'accessor-pairs': 'error',
		'array-callback-return': 'error',
		'block-scoped-var': 'error',
		'class-methods-use-this': 'error',
		'complexity': ['error', { max: 20 }],
		'consistent-return': 'error',
		'curly': 'error',
		'default-case': 'error',
		'default-param-last': 'error',
		'dot-location': ['error', 'property'],
		'dot-notation': 'off', // @typescript-eslint/dot-notation
		'eqeqeq': 'error',
		'grouped-accessor-pairs': 'error',
		'guard-for-in': 'error',
		'max-classes-per-file': 'error',
		'no-alert': 'error',
		'no-caller': 'error',
		'no-case-declarations': 'error',
		'no-constructor-return': 'error',
		'no-div-regex': 'error',
		'no-else-return': 'error',
		'no-empty-function': 'off', // @typescript-eslint/no-empty-function
		'no-empty-pattern': 'error',
		'no-eq-null': 'error',
		'no-eval': 'error',
		'no-extend-native': 'error',
		'no-extra-bind': 'error',
		'no-extra-label': 'error',
		'no-fallthrough': 'error',
		'no-floating-decimal': 'error',
		'no-global-assign': 'error',
		'no-implicit-coercion': 'error',
		'no-implicit-globals': 'error',
		'no-implied-eval': 'error',
		'no-invalid-this': 'error',
		'no-iterator': 'error',
		'no-labels': ['error', { allowLoop: true }],
		'no-lone-blocks': 'error',
		'no-loop-func': 'error',
		'no-magic-numbers': 'off',  // @typescript-eslint/no-magic-numbers
		'no-multi-spaces': 'error',
		'no-multi-str': 'error',
		'no-new': 'error',
		'no-new-func': 'error',
		'no-new-wrappers': 'error',
		'no-octal': 'error',
		'no-octal-escape': 'error',
		'no-param-reassign': 'error',
		'no-proto': 'error',
		'no-redeclare': 'error',
		'no-restricted-properties': 'error',
		'no-return-assign': 'error',
		'no-return-await': 'off', // @typescript-eslint/return-await
		'no-script-url': 'error',
		'no-self-assign': 'error',
		'no-self-compare': 'error',
		'no-sequences': 'error',
		'no-throw-literal': 'off', // @typescript-eslint/no-throw-literal
		'no-unmodified-loop-condition': 'error',
		'no-unused-expressions': 'off', // @typescript-eslint/no-unused-expressions
		'no-unused-labels': 'error',
		'no-useless-call': 'error',
		'no-useless-catch': 'error',
		'no-useless-concat': 'error',
		'no-useless-escape': 'error',
		'no-useless-return': 'error',
		'no-void': 'off', // Conflicts with @typescript-eslint/no-floating-promises
		'no-warning-comments': 'error',
		'no-with': 'error',
		'prefer-named-capture-group': 'off', // ES2018+, not supported in most browsers yet
		'prefer-promise-reject-errors': 'error',
		'prefer-regex-literals': 'error',
		'radix': 'error',
		'require-await': 'off', // @typescript-eslint/require-await
		'require-unicode-regexp': 'error',
		'vars-on-top': 'error',
		'wrap-iife': 'error',
		'yoda': 'error',

		// Strict Mode
		'strict': 'error',

		// Variables
		'init-declarations': 'off',
		'no-delete-var': 'error',
		'no-label-var': 'error',
		'no-restricted-globals': 'error',
		'no-shadow': 'error',
		'no-shadow-restricted-names': 'error',
		'no-undef': 'off', // @todo should be catched by TypeScript. How to do that?
		'no-undef-init': 'error',
		'no-undefined': 'off', // @todo "Using the void operator to generate the value of undefined if necessary." should be disableable
		'no-unused-vars': 'off', // @typescript-eslint/no-unused-vars
		'no-use-before-define': 'off', // @typescript-eslint/no-use-before-define

		// Node.js and CommonJS
		'callback-return': 'error',
		'global-require': 'error',
		'handle-callback-err': 'error',
		'no-buffer-constructor': 'error',
		'no-mixed-requires': 'error',
		'no-new-require': 'error',
		'no-path-concat': 'error',
		'no-process-env': 'error',
		'no-process-exit': 'off',
		'no-restricted-modules': 'error',
		'no-sync': 'off', // @todo Does it make sense to wrap the async-versions into a Promise? Does this have any benefits?

		// Stylistic Issues
		'array-bracket-newline': ['error', 'consistent'],
		'array-bracket-spacing': 'error',
		'array-element-newline': ['error', 'consistent'],
		'block-spacing': 'error',
		'brace-style': 'off', // @typescript-eslint/brace-style
		'camelcase': 'off', // @typescript-eslint/camelcase
		'capitalized-comments': 'error',
		'comma-dangle': ['error', 'never'],
		'comma-spacing': 'off', // @typescript-eslint/comma-spacing
		'comma-style': 'error',
		'computed-property-spacing': 'error',
		'consistent-this': 'error',
		'eol-last': 'error',
		'func-call-spacing': 'off', // @typescript-eslint/func-call-spacing
		'func-name-matching': 'error',
		'func-names': 'error',
		'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
		'function-call-argument-newline': ['error', 'consistent'],
		'function-paren-newline': ['error', 'multiline-arguments'],
		'id-blacklist': 'error',
		'id-length': 'error',
		'id-match': 'error',
		'implicit-arrow-linebreak': 'error',
		'indent': 'off', // @typescript-eslint/indent
		'jsx-quotes': 'error',
		'key-spacing': 'error',
		'keyword-spacing': 'error',
		'line-comment-position': 'error',
		'linebreak-style': 'error',
		'lines-around-comment': ['off', { beforeBlockComment: true, beforeLineComment: true, allowBlockStart: true, allowObjectStart: true, allowArrayStart: true, allowClassStart: true }], // @todo disabled till there is an option like "allowFunctionParenthesiseStart"
		'lines-between-class-members': 'error',
		'max-depth': 'error',
		'max-len': ['error', { code: 160, tabWidth: 4, comments: 160, ignoreUrls: true }],
		'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
		'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
		'max-nested-callbacks': 'error',
		'max-params': ['error', { max: 4 }],
		'max-statements': ['error', 30],
		'max-statements-per-line': ['error', { max: 3 }],
		'multiline-comment-style': 'off', // Doesn't work together with "// @ts-ignore"
		'multiline-ternary': ['error', 'always-multiline'],
		'new-cap': ['error', { properties: false }],
		'new-parens': 'error',
		'newline-per-chained-call': ['error', { ignoreChainWithDepth: 4 }],
		'no-array-constructor': 'off', // @typescript-eslint/no-array-constructor
		'no-bitwise': ['error', { allow: ['^', '~', '<<', '>>', '>>>', '|=', '&=', '^=', '<<=', '>>=', '>>>='] }], // Disallow "&" and "|".
		'no-continue': 'error',
		'no-inline-comments': 'off', // JSDoc inline comments must be allowed
		'no-lonely-if': 'error',
		'no-mixed-operators': 'error',
		'no-mixed-spaces-and-tabs': 'error',
		'no-multi-assign': 'error',
		'no-multiple-empty-lines': ['error', { max: 1 }],
		'no-negated-condition': 'off',
		'no-nested-ternary': 'error',
		'no-new-object': 'error',
		'no-plusplus': 'off',
		'no-restricted-syntax': 'error',
		'no-tabs': ['error', { allowIndentationTabs: true }],
		'no-ternary': 'off',
		'no-trailing-spaces': 'error',
		'no-underscore-dangle': 'error',
		'no-unneeded-ternary': 'error',
		'no-whitespace-before-property': 'error',
		'nonblock-statement-body-position': 'error',
		'object-curly-newline': 'error',
		'object-curly-spacing': ['error', 'always'],
		'object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
		'one-var': ['error', { initialized: 'never', uninitialized: 'never' }],
		'one-var-declaration-per-line': 'error',
		'operator-assignment': 'error',
		'operator-linebreak': ['error', 'after', { overrides: { ':': 'ignore' } }],
		'padded-blocks': ['error', 'never'],
		'padding-line-between-statements': 'error',
		'prefer-exponentiation-operator': 'error',
		'prefer-object-spread': 'error',
		'quote-props': ['error', 'consistent-as-needed'],
		'quotes': 'off', // @typescript-eslint/quotes
		'semi': 'off', // @typescript-eslint/semi
		'semi-spacing': 'error',
		'semi-style': 'error',
		'sort-keys': 'off', // Keys should be grouped by their scope/category, not by their name
		'sort-vars': 'error',
		'space-before-blocks': 'error',
		'space-before-function-paren': 'off', // @typescript-eslint/space-before-function-paren
		'space-in-parens': 'error',
		'space-infix-ops': 'error',
		'space-unary-ops': 'error',
		'spaced-comment': ['error', 'always', { markers: ['/'], block: { markers: ['!'], balanced: true } }], // @todo Remove '/' as soon as we use `import` instead of `require()`
		'switch-colon-spacing': 'error',
		'template-tag-spacing': 'error',
		'unicode-bom': 'error',
		'wrap-regex': 'error',

		// ECMAScript 6
		'arrow-body-style': 'error',
		'arrow-parens': 'error',
		'arrow-spacing': 'error',
		'constructor-super': 'error',
		'generator-star-spacing': 'error',
		'no-class-assign': 'error',
		'no-confusing-arrow': ['error', { allowParens: true }],
		'no-const-assign': 'error',
		'no-dupe-class-members': 'off', // @typescript-eslint/no-no-dupe-class-members
		'no-duplicate-imports': 'error',
		'no-new-symbol': 'error',
		'no-restricted-imports': 'error',
		'no-this-before-super': 'error',
		'no-useless-computed-key': 'error',
		'no-useless-constructor': 'off', // @typescript-eslint/no-useless-constructor
		'no-useless-rename': 'error',
		'no-var': 'error',
		'object-shorthand': 'error',
		'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
		'prefer-const': 'error',
		'prefer-destructuring': 'off', // We don't prefer destructuring if a type is specified ['error', { VariableDeclarator: { array: true, object: true }, AssignmentExpression: { array: false, object: false } }],
		'prefer-numeric-literals': 'error',
		'prefer-rest-params': 'error',
		'prefer-spread': 'error',
		'prefer-template': 'error',
		'require-yield': 'error',
		'rest-spread-spacing': 'error',
		'sort-imports': 'error',
		'symbol-description': 'error',
		'template-curly-spacing': 'error',
		'yield-star-spacing': 'error'
	}
};
