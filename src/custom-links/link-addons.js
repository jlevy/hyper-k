const React = require("react");
const Tooltip = require("../components/Tooltip");
const { CustomLinksAddon, pasteText } = require("./CustomLinksAddon");
const { URL_REGEX, COMMAND_OR_PATH_REGEX } = require("../regex-constants");
const { notUrlPath } = require("../utils");
const { insideMarkdownFenced } = require("./link-patterns");

// Function to remove old addons.
// XXX This is a hack but not sure of a better way.
function removeOldAddons(term) {
  term._addonManager._addons.forEach((addon) => {
    // Name isn't preserved after minification so we have to infer which is
    // the WebLinksAddOn in xterm.js v4 or v5
    if (
      addon &&
      addon.instance &&
      (addon.instance._useLinkProvider !== undefined ||
        addon.instance._linkProvider !== undefined)
    ) {
      console.log("Removing old WebLinksAddon instance", addon);
      addon.instance.dispose();
    }
  });
}

function getCellDimensions(terminal) {
  const core = terminal._core;
  // xterm.js v4 vs v5 have different places for this.
  return {
    width:
      core._renderService.dimensions.actualCellWidth ||
      core._renderService.dimensions.css.cell.width,
    height:
      core._renderService.dimensions.actualCellHeight ||
      core._renderService.dimensions.css.cell.height,
  };
}

function calculateTooltipPosition(terminal, range, cellDimensions) {
  const core = terminal._core;

  // Convert terminal coordinates to pixel positions.
  const startCoords = core.screenElement.getBoundingClientRect();

  // Account for scroll position.
  const scrollOffset = terminal.buffer.active.viewportY;
  const adjustedY = range.start.y - scrollOffset;

  // Calculate position of the top-right corner of the link.
  return {
    x: startCoords.left + range.end.x * cellDimensions.width,
    y: startCoords.top + (adjustedY - 1) * cellDimensions.height,
  };
}

function handleOpenLinkWindow(event, uri, terminal) {
  console.log("Opening link in new window", uri, event);
  const newWindow = window.open();
  if (newWindow) {
    try {
      newWindow.opener = null;
    } catch {
      // no-op, Electron can throw
    }
    newWindow.location.href = uri;
  } else {
    console.warn("Opening link blocked as opener could not be cleared");
  }
}

function handleOpenLinkElectron(event, uri) {
  console.log("Opening link externally", uri);
  const { shell } = require("electron");
  shell.openExternal(uri);
}

const decorateTerm = (Term) => {
  return class extends React.Component {
    constructor(props, context) {
      super(props, context);
      this._term = null;
      this.state = {
        tooltipVisible: false,
        tooltipContent: "",
        tooltipPosition: { x: 0, y: 0 },
        tooltipFontSize: "12px",
      };
      this.onDecorated = this.onDecorated.bind(this);
      this.showTooltip = this.showTooltip.bind(this);
      this.hideTooltip = this.hideTooltip.bind(this);
    }

    showTooltip(event, text, range) {
      const terminal = this._term.term;
      console.log("showTooltip", { event, text, range, terminal });

      const cellDimensions = getCellDimensions(terminal);
      const position = calculateTooltipPosition(
        terminal,
        range,
        cellDimensions
      );

      this.setState({
        tooltipVisible: true,
        tooltipContent: text,
        tooltipPosition: position,
        tooltipFontSize: `${cellDimensions.height}px`,
      });
    }

    hideTooltip() {
      console.log("hideTooltip");
      this.setState({
        tooltipVisible: false,
      });
    }

    onDecorated(term) {
      console.log("link-addons onDecorated", term);
      if (term === null) {
        return;
      }
      if (this.props.onDecorated) {
        this.props.onDecorated(term);
      }
      this._term = term;

      console.log("Original addons", [
        ...this._term.term._addonManager._addons,
      ]);

      // Remove the old web links addon.
      removeOldAddons(this._term.term);

      console.log("Cleaned up addons", [
        ...this._term.term._addonManager._addons,
      ]);

      // Configure OSC 8 link handling.
      this._term.term.options.linkHandler = {
        activate: handleOpenLinkElectron,
        hover: (event, text, range) => {
          console.log("OSC link hover", [event, text, range]);
          this.showTooltip(event, `Open link: ${text}`, range);
          event.target.style.cursor = "pointer";
        },
        leave: (event) => {
          this.hideTooltip();
          if (event && event.target) {
            event.target.style.cursor = "auto";
          }
        },
      };

      // Load custom addon for click-to-paste on commands or paths.
      const commandPasteAddon = new CustomLinksAddon(
        COMMAND_OR_PATH_REGEX,
        pasteText,
        {
          filter: notUrlPath,
          hover: (event, text, range) => {
            console.log("Command/path hover", [event, text, range]);
            this.showTooltip(event, `Click to paste`, range);
          },
          leave: () => this.hideTooltip(),
        }
      );
      this._term.term.loadAddon(commandPasteAddon);
      console.log("Loaded commandPasteAddon", commandPasteAddon);

      const fencedCodeBlockAddon = new CustomLinksAddon(
        insideMarkdownFenced,
        pasteText
      );
      this._term.term.loadAddon(fencedCodeBlockAddon);
      console.log("Loaded fencedCodeBlockAddon", fencedCodeBlockAddon);

      // Load custom addon for URLs with tooltip support.
      const webLinksAddon = new CustomLinksAddon(
        URL_REGEX,
        handleOpenLinkElectron,
        {
          hover: (event, text, range) => {
            console.log("URL link hover", [event, text, range]);
            this.showTooltip(event, `Open link: ${text}`, range);
          },
          leave: () => this.hideTooltip(),
        }
      );
      this._term.term.loadAddon(webLinksAddon);
      console.log("Loaded webLinksAddon with tooltips", webLinksAddon);

      console.log("Final addons", [...this._term.term._addonManager._addons]);
    }

    render() {
      // Remove terminalOptions from props since we're handling links differently now.
      const { options, ...props } = this.props;
      const filteredOptions = { ...options };
      // Remove any existing linkHandler.
      delete filteredOptions.linkHandler;

      return React.createElement(
        React.Fragment || "div",
        null,
        React.createElement(
          Term,
          Object.assign({}, props, {
            onDecorated: this.onDecorated,
            options: filteredOptions,
          })
        ),
        React.createElement(Tooltip, {
          visible: this.state.tooltipVisible,
          content: this.state.tooltipContent,
          position: this.state.tooltipPosition,
          fontSize: this.state.tooltipFontSize,
        })
      );
    }
  };
};

module.exports = { decorateTerm };