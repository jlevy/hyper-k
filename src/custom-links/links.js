const React = require("react");
const Tooltip = require("../components/Tooltip");
const { CustomLinksAddon } = require("./CustomLinksAddon");
const {
  getCellDimensions,
  cellToPixelCoords,
} = require("../utils/xterm-utils");

// Function to remove old addons.
// XXX This is a hack but not sure of a better way.
function removeOldAddons(xterm) {
  console.log("links: Cleaning up original addons", [
    ...xterm._addonManager._addons,
  ]);

  xterm._addonManager._addons.forEach((addon) => {
    // Name isn't preserved after minification so we have to infer which is
    // the WebLinksAddOn in xterm.js v4 or v5
    if (
      addon &&
      addon.instance &&
      (addon.instance._useLinkProvider !== undefined ||
        addon.instance._linkProvider !== undefined)
    ) {
      console.log("links: removing old WebLinksAddon instance", addon);
      addon.instance.dispose();
    }
  });

  console.log("links: Cleaned up addons", [...xterm._addonManager._addons]);
}

// Upper right of the range of chars.
function pickTooltipPosition(xterm, range, cellDimensions) {
  const startPosition = cellToPixelCoords(xterm, range.start, cellDimensions);
  const endPosition = cellToPixelCoords(xterm, range.end, cellDimensions);
  return {
    x: Math.max(startPosition.x, endPosition.x),
    y: Math.min(startPosition.y, endPosition.y),
  };
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
    }

    showTooltip(event, text, previewUrl, range) {
      const xterm = this._term.term;
      console.log("links: showTooltip", {
        event,
        text,
        previewUrl,
        range,
        xterm,
      });

      const cellDimensions = getCellDimensions(xterm);
      const position = pickTooltipPosition(xterm, range, cellDimensions);

      this.setState({
        tooltipVisible: true,
        tooltipContent: text,
        tooltipPosition: position,
        tooltipFontSize: `${cellDimensions.height}px`,
        tooltipPreviewUrl: previewUrl || null,
      });
    }

    hideTooltip() {
      this.setState({
        tooltipVisible: false,
      });
    }

    onDecorated(term) {
      console.debug("links: onDecorated", term);
      if (term === null) {
        return;
      }
      if (this.props.onDecorated) {
        this.props.onDecorated(term);
      }
      this._term = term;
      const xterm = this._term.term;

      removeOldAddons(xterm);

      // Add new custom links addon
      const linksAddon = new CustomLinksAddon({
        showTooltip: this.showTooltip,
        hideTooltip: this.hideTooltip,
      });

      console.log("Customizing links", { xterm, linksAddon });
      xterm.loadAddon(linksAddon);

      console.log("links: Final addons", [...xterm._addonManager._addons]);
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
  };
};

module.exports = { decorateTerm };
