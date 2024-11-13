const React = require("react");
const Tooltip = require("../components/Tooltip");
const { CustomLinksAddon } = require("./CustomLinksAddon");
const { handlePasteText, handleOpenLink } = require("./link-handlers");
const { URL_REGEX, COMMAND_OR_PATH_REGEX } = require("../regex-constants");
const {
  getCellDimensions,
  calculateTooltipPosition,
  getTextInRange,
} = require("../utils/xterm-utils");
const { ClickHandler } = require("../utils/click-handler");
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

const decorateTerm = (Term) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this._term = null;
      this.state = {
        tooltipVisible: false,
        tooltipContent: "",
        tooltipPreviewUrl: null,
        tooltipPosition: { x: 0, y: 0 },
        tooltipFontSize: "12px",
      };
      this.onDecorated = this.onDecorated.bind(this);
      this.showTooltip = this.showTooltip.bind(this);
      this.hideTooltip = this.hideTooltip.bind(this);

      // For links, we want to handle single and double clicks differently.
      this.linkClick = new ClickHandler(
        handlePasteText, // Single-click action
        handleOpenLink // Double-click action
      );
    }

    showTooltip(event, text, previewUrl, range) {
      const xterm = this._term.term;
      console.log("showTooltip", { event, text, previewUrl, range, xterm });

      const cellDimensions = getCellDimensions(xterm);
      const position = calculateTooltipPosition(xterm, range, cellDimensions);

      this.setState({
        tooltipVisible: true,
        tooltipContent: text,
        tooltipPosition: position,
        tooltipFontSize: `${cellDimensions.height}px`,
        tooltipPreviewUrl: previewUrl || null,
      });
    }

    hideTooltip() {
      console.log("hideTooltip");
      this.setState({
        tooltipVisible: false,
        tooltipPreviewUrl: null,
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
      const xterm = this._term.term;

      console.log("Original addons", [...xterm._addonManager._addons]);

      // Remove the old web links addon.
      removeOldAddons(xterm);

      console.log("Cleaned up addons", [...xterm._addonManager._addons]);

      // Configure OSC 8 link handling via xterm.js's linkHandler.
      xterm.options.linkHandler = {
        activate: (event, url, range) => {
          // The link handler gives us the URL so we pass linkText so we know that too.
          const linkText = getTextInRange(xterm, range);
          return this.linkClick.handle(event, url, range, xterm, linkText);
        },
        hover: (event, text, range) => {
          console.log("OSC link hover", [event, text, range]);
          // Enable preview for links.
          // TODO: Consider fetching content and rendering title/etc for non-recognized URLs,
          // and doing full preview on known URLs (including localhost content).
          const previewUrl = text;
          this.showTooltip(
            event,
            `Open link: ${previewUrl}`,
            previewUrl,
            range
          );
          event.target.style.cursor = "pointer";
        },
        leave: (event) => {
          this.hideTooltip();
          if (event && event.target) {
            event.target.style.cursor = "auto";
          }
        },
      };

      // Load custom addon for URLs with tooltip support.
      const webLinksAddon = new CustomLinksAddon(
        URL_REGEX,
        (event, text, range) =>
          this.linkClick.handle(event, text, range, xterm),
        {
          hover: (event, text, range) => {
            console.log("URL link hover", [event, text, range]);
            const previewUrl = text;
            this.showTooltip(
              event,
              "Click to paste, double click to open link",
              previewUrl,
              range
            );
          },
          leave: () => this.hideTooltip(),
        }
      );
      xterm.loadAddon(webLinksAddon);
      console.log("Loaded webLinksAddon with tooltips", webLinksAddon);

      // Load custom addon for click-to-paste on commands or paths.
      const commandPasteAddon = new CustomLinksAddon(
        COMMAND_OR_PATH_REGEX,
        (event, text, range) => handlePasteText(event, text, range, xterm),
        {
          // Don't match paths starting with @ as regular paths, as they have
          // significance for Kmd (and aren't likely to appear otherwise).
          filter: (line, match) => {
            return match.matchText[0] !== "@";
          },
          hover: (event, text, range) => {
            console.log("Command/path hover", [event, text, range]);
            this.showTooltip(event, "Click to paste", null, range);
          },
          leave: () => this.hideTooltip(),
        }
      );
      xterm.loadAddon(commandPasteAddon);
      console.log("Loaded commandPasteAddon", commandPasteAddon);

      const fencedCodeBlockAddon = new CustomLinksAddon(
        insideMarkdownFenced,
        (event, text, range) => handlePasteText(event, text, range, xterm)
      );
      xterm.loadAddon(fencedCodeBlockAddon);
      console.log("Loaded fencedCodeBlockAddon", fencedCodeBlockAddon);

      console.log("Final addons", [...xterm._addonManager._addons]);
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
          previewUrl: this.state.tooltipPreviewUrl,
        })
      );
    }

    componentWillUnmount() {
      this.linkClick.destroy();
    }
  };
};

module.exports = { decorateTerm };
