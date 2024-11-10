// Theme code based on
// https://github.com/sindresorhus/hyper-snazzy/blob/main/index.js

const colors = require("../colors");

const decorateConfig = (config) =>
  Object.assign({}, config, {
    foregroundColor: colors.foreground,
    backgroundColor: colors.background,
    borderColor: colors.border,
    cursorColor: colors.cursor,
    cursorAccentColor: colors.background,
    selectionColor: colors.selection,
    colors: {
      black: colors.black.dark,
      red: colors.red.dark,
      green: colors.green.dark,
      yellow: colors.yellow.dark,
      blue: colors.blue.dark,
      magenta: colors.magenta.dark,
      cyan: colors.cyan.dark,
      white: colors.white.dark,
      lightBlack: colors.black.light,
      lightRed: colors.red.light,
      lightGreen: colors.green.light,
      lightYellow: colors.yellow.light,
      lightBlue: colors.blue.light,
      lightMagenta: colors.magenta.light,
      lightCyan: colors.cyan.light,
      lightWhite: colors.white.light,
    },

    css: `
		/* Add a highlight line below the active tab */
		.tab_tab::before {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 2px;
			background-color: hsl(134, 43%, 60%);
			transform: scaleX(0);
			will-change: transform;
		}
		.tab_tab.tab_active::before {
			transform: scaleX(1);
			transition: all 200ms cubic-bezier(0, 0, 0.2, 1);
		}

		/* Fade the title of inactive tabs and the content of inactive panes */
		.tab_text,
		.term_term {
			opacity: 0.6;
			will-change: opacity;
		}
		.tab_active .tab_text,
		.term_active .term_term {
			opacity: 1;
			transition: opacity 0.12s ease-in-out;
		}

		/* Allow custom css / overrides */
		${config.css}
	`,
  });

module.exports = { decorateConfig };
