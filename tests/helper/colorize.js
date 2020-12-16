/**
 * @file Wrapper for the colorize module, to disable colorization if the test output is written to a non-terminal target (e.g. a file).
 */

const tty = require('tty');

const colorize = require('../../helper/colorize');

const isTerminal = tty.isatty(1);

if (!isTerminal) {
	module.exports = colorize.disabled;
}
else {
	module.exports = colorize;
}
