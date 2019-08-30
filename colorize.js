/**
 * @typedef {(text: string) => string} ColorizeFunction
 */

/**
 * @typedef {Readonly<Colorize> & ColorizeFunction} ColorizeProperty
 */

/**
 * @typedef {object} Colorize
 *
 * General.
 * @property {ColorizeProperty} disabled
 *
 * Foreground colors.
 * @property {ColorizeProperty} gray
 * @property {ColorizeProperty} red
 * @property {ColorizeProperty} green
 * @property {ColorizeProperty} yellow
 * @property {ColorizeProperty} blue
 * @property {ColorizeProperty} magenta
 * @property {ColorizeProperty} cyan
 * @property {ColorizeProperty} white
 *
 * Text Decoration.
 * @property {ColorizeProperty} bold
 * @property {ColorizeProperty} underline
 */

/**
 * @typedef {object} ColorizeOptions
 * @property {string} [fgColor]
 * @property {string} [textDecoration]
 * @property {boolean} [disabled]
 */

const FOREGROUND_COLORS = {
	gray: 90,
	red: 31,
	green: 32,
	yellow: 33,
	blue: 34,
	magenta: 35,
	cyan: 36,
	white: 97
};

const TEXT_DECORATIONS = {
	bold: 1,
	underline: 4
};

const RESET_OFFSET = 20;
const DEFAULT_FOREGROUND_COLOR = 39;

/**
 * Allows to style strings by using ANSI escape sequences for coloring terminal output.
 *
 * @example
 * colorize({ fgColor: 'magenta', textDecoraton: 'underline' })('text');
 * colorize({}).magenta.underline('text');
 *
 * @param {ColorizeOptions} options - Properties, used to set the initial styles and to manage the internal styles on chaining.
 * @returns {ColorizeProperty} Function which can be used to colorize the given text, or for chaining.
 */
function colorize (options) {
	return Object.defineProperties(
		/**
		 * Styles the given `text` using ANSI escape sequences, based on the previously set `options`.
		 *
		 * @example
		 * [...].magenta.underline('text');
		 *
		 * @param {string} text - Plain text.
		 * @returns {string} Input `text` wrapped by ANSI escape sequences.
		 */
		(text) => {
			if (options.disabled || (!options.fgColor && !options.textDecoration)) {
				return text;
			}

			const openCode = [];
			const closeCode = [];

			if (options.fgColor) {
				openCode.push(FOREGROUND_COLORS[options.fgColor]);
				closeCode.push(DEFAULT_FOREGROUND_COLOR);
			}

			if (options.textDecoration) {
				openCode.push(TEXT_DECORATIONS[options.textDecoration]);
				closeCode.push(TEXT_DECORATIONS[options.textDecoration] + RESET_OFFSET);
			}

			return `\x1b[${openCode.join(';')}m${text}\x1b[${closeCode.join(';')}m`;
		},
		Object.assign(
			{
				disabled: {
					get () {
						return colorize({ ...options, disabled: true });
					}
				}
			},
			...Object.keys(FOREGROUND_COLORS).map((key) => ({
				[key]: {
					get () {
						return colorize({ ...options, fgColor: key });
					}
				}
			})),
			...Object.keys(TEXT_DECORATIONS).map((key) => ({
				[key]: {
					get () {
						return colorize({ ...options, textDecoration: key });
					}
				}
			}))
		)
	);
}

module.exports = colorize({});
