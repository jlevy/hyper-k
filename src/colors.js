// Based on:
// https://rootloops.sh?sugar=8&colors=7&sogginess=5&flavor=2&fruit=9&milk=1
const colors = {
  black: {
    dark: "hsl(0, 0%, 10%)",
    light: "hsl(0, 0%, 73%)",
    lighter: "hsl(0, 0%, 90%)",
  },
  red: {
    dark: "hsl(7, 73%, 72%)",
    light: "hsl(7, 87%, 85%)",
    lighter: "hsl(7, 95%, 94%)",
  },
  green: {
    dark: "hsl(134, 43%, 60%)",
    light: "hsl(134, 53%, 73%)",
    lighter: "hsl(134, 70%, 90%)",
  },
  yellow: {
    dark: "hsl(44, 54%, 55%)",
    light: "hsl(44, 74%, 76%)",
    lighter: "hsl(44, 80%, 90%)",
  },
  blue: {
    dark: "hsl(225, 71%, 76%)",
    light: "hsl(225, 86%, 88%)",
    lighter: "hsl(225, 90%, 94%)",
  },
  magenta: {
    dark: "hsl(305, 54%, 71%)",
    light: "hsl(305, 68%, 85%)",
    lighter: "hsl(305, 96%, 95%)",
  },
  cyan: {
    dark: "hsl(188, 58%, 57%)",
    light: "hsl(188, 52%, 76%)",
    lighter: "hsl(188, 52%, 92%)",
  },
  white: {
    dark: "hsl(240, 6%, 87%)",
    light: "hsl(240, 6%, 94%)",
    lighter: "hsl(240, 6%, 98%)",
  },
  foreground: "#fff",
  background: "#000",
  border: "hsl(231, 17%, 16%)",
  cursor: "hsl(305, 84%, 68%)",
  selection: "hsla(305, 32%, 72%, 0.58)",
};

// Theme code based on
// https://github.com/sindresorhus/hyper-snazzy/blob/main/index.js

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
