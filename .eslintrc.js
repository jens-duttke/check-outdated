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
		warnOnUnsupportedTypeScriptVersion: false
	},
	env: {
		node: true,
		es6: true
	},
	reportUnusedDisableDirectives: true,
	overrides: [
		{
			files: ['tests/*.js'],
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
		// Faulty @typescript-eslint Rules (see https://github.com/typescript-eslint/typescript-eslint/issues/906)
		'@typescript-eslint/explicit-function-return-type': 'off',

		// Unused @typescript-eslint Rules
		'@typescript-eslint/indent': 'off',
		'@typescript-eslint/no-use-before-define': 'off',
		'@typescript-eslint/no-var-requires': 'off',

		/**
		 * eslint-plugin-jsdoc Rules
		 * @see https://github.com/gajus/eslint-plugin-jsdoc
		 */
		'jsdoc/check-access': 'error',
		'jsdoc/check-alignment': 'error',
        'jsdoc/check-examples': 'off', // @todo need to be configured to allow text-based examples
        'jsdoc/check-indentation': 'error',
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
		'jsdoc/no-defaults': 'error',
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
		'dot-notation': 'error',
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
		'no-void': 'error',
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
		'no-sync': 'error',

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
		'id-length': ['off', { exceptions: ['i', 'x', 'y', 'z'] }],
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
		'max-len': ['error', { code: 160 }],
		'max-lines': ['error', { max: 350, skipBlankLines: true, skipComments: true }],
		'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
		'max-nested-callbacks': 'error',
		'max-params': ['error', { max: 4 }],
		'max-statements': ['error', 30],
		'max-statements-per-line': ['error', { max: 3 }],
		'multiline-comment-style': 'off', // doesn't work together with "// @ts-ignore"
		'multiline-ternary': ['error', 'always-multiline'],
		'new-cap': ['error', { properties: false }],
		'new-parens': 'error',
		'newline-per-chained-call': ['error', { ignoreChainWithDepth: 4 }],
		'no-array-constructor': 'off', // @typescript-eslint/no-array-constructor
		'no-bitwise': ['error', { allow: ['^', '~', '<<', '>>', '>>>', '|=', '&=', '^=', '<<=', '>>=', '>>>='] }], // Disallow "&" and "|".
		'no-continue': 'error',
		'no-inline-comments': 'off', // @todo JSDoc inline comments must be allowed
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
		'spaced-comment': ['error', 'always', { markers: ['/'], block: { markers: ['!'], balanced: true } }], // @todo Remove '/' as soon as we use import instead of require()
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
