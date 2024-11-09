const React = require("react");
const Tooltip = require("./Tooltip");
const { CustomLinksAddon, openLink, pasteText } = require("./CustomLinksAddon");
const { URL_REGEX, COMMAND_OR_PATH_REGEX } = require("./constants");
const { notUrlPath } = require("./utils");
const { insideMarkdownFenced } = require("./link-patterns");

// Function to remove old addons
function removeOldAddons(term) {
  console.log("Current addons", term._addonManager._addons);
  term._addonManager._addons.forEach((addon) => {
    if (
      addon &&
      addon.instance &&
      addon.instance._useLinkProvider !== undefined
    ) {
      console.log("Removing old WebLinksAddon instance", addon);
      addon.instance.dispose();
    }
  });
  console.log("Updated addons", term._addonManager._addons);
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
      };
      this.onDecorated = this.onDecorated.bind(this);
      this.showTooltip = this.showTooltip.bind(this);
      this.hideTooltip = this.hideTooltip.bind(this);
      this.handleLink = this.handleLinkClick.bind(this);
    }

    showTooltip(event, text, range) {
      const terminal = this._term.term;
      const core = terminal._core;
      console.log("showTooltip", { event, text, range, core });

      // Convert terminal coordinates to pixel positions.
      const startCoords = core.screenElement.getBoundingClientRect();

      // Get the width and height of a cell in pixels.
      // xterm.js v4 vs v5 have different places for this.
      const cellWidth =
        core._renderService.dimensions.actualCellWidth ||
        core._renderService.dimensions.css.cell.width;
      const cellHeight =
        core._renderService.dimensions.actualCellHeight ||
        core._renderService.dimensions.css.cell.height;

      // Account for scroll position.
      const scrollOffset = terminal.buffer.active.viewportY;
      const adjustedY = range.start.y - scrollOffset;

      // Calculate position of the top-right corner of the link.
      const x = startCoords.left + range.end.x * cellWidth;
      const y = startCoords.top + (adjustedY - 1) * cellHeight;

      this.setState({
        tooltipVisible: true,
        tooltipContent: text,
        // Mouse cursor position works too, but feels jitterier to the user.
        // tooltipPosition: { x: event.clientX, y: event.clientY },
        tooltipPosition: { x, y },
      });
    }

    hideTooltip() {
      console.log("hideTooltip");
      this.setState({
        tooltipVisible: false,
      });
    }

    handleLinkClick(event, uri) {
      const { shell } = require("electron");
      console.log("handleLinkClick", uri);
      shell.openExternal(uri);
    }

    onDecorated(term) {
      if (term === null) {
        return;
      }
      if (this.props.onDecorated) {
        this.props.onDecorated(term);
      }
      this._term = term;

      // Remove the old web links addon.
      removeOldAddons(this._term.term);

      // Configure OSC 8 link handling.
      this._term.term.options.linkHandler = {
        activate: this.handleLinkClick,
        hover: (event, text, range) => {
          console.log("OSC link hover", [event, text, range]);
          this.showTooltip(event, `Open link: ${text}`, range);
        },
        leave: () => this.hideTooltip(),
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
      const webLinksAddon = new CustomLinksAddon(URL_REGEX, openLink, {
        hover: (event, text, range) => {
          console.log("URL link hover", [event, text, range]);
          this.showTooltip(event, `Open link: ${text}`, range);
        },
        leave: () => this.hideTooltip(),
      });
      this._term.term.loadAddon(webLinksAddon);
      console.log("Loaded webLinksAddon with tooltips", webLinksAddon);
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
        })
      );
    }
  };
};

module.exports = { decorateTerm };
