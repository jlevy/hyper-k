const Tooltip = require("../components/Tooltip");
const { CustomLinksAddon } = require("./CustomLinksAddon");
const IframeViewer = require("../components/IframeViewer");
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

const decorateTerm = (Term, { React }) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.React = React;
      this._term = null;

      // We need to maintain state since we get it from the link provider, which is a canvas,
      // and we can't therefore listen on target elements to trigger tooltips.
      // "Activated" means the mouse has activated to the tooltip becuase of its position
      // in the terminal. In the tooltip, "visible" means the tooltip is actually visible.
      this.state = {
        tooltipActivated: false,
        tooltipContent: "",
        tooltipPreviewUrl: null,
        tooltipPosition: { x: 0, y: 0 },
        tooltipFontSize: "12px",
      };
      this.onDecorated = this.onDecorated.bind(this);
      this.showTooltip = this.showTooltip.bind(this);
      this.hideTooltip = this.hideTooltip.bind(this);
      this.iframeViewerRef = this.React.createRef();
      this.tooltipRef = this.React.createRef();
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
        tooltipActivated: true,
        tooltipContent: text,
        tooltipPosition: position,
        tooltipFontSize: `${cellDimensions.height}px`,
        tooltipPreviewUrl: previewUrl || null,
      });

      if (this.tooltipRef.current) {
        this.tooltipRef.current.setShowTimeout(position, text, previewUrl);
      }
    }

    hideTooltip(immediate = false) {
      this.setState({
        tooltipActivated: false,
      });
      // Note even if xterm thinks we aren't active, we still need to check if
      // the actual tooltip is hovered.
      if (this.tooltipRef.current && !this.tooltipRef.current.state.isHovered) {
        console.log("links: hideTooltip immediate", immediate);
        this.tooltipRef.current.setHideTimeout(immediate ? 0 : undefined);
      }
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

      // Add new custom links addon, pass showIframe method directly
      const linksAddon = new CustomLinksAddon(xterm, {
        showTooltip: this.showTooltip,
        hideTooltip: () => this.hideTooltip(false),
        showIframe: (src, range) => {
          console.log("links: showIframe", {
            src,
            range,
            iframeViewerRef: this.iframeViewerRef,
          });
          if (!this.iframeViewerRef.current) {
            throw new Error("IframeViewer ref not available");
          }
          this.hideTooltip(true);
          this.iframeViewerRef.current.showIframe(src, range, xterm);
        },
        hideIframe: () => {
          console.log("links: hideIframe");
          if (this.iframeViewerRef.current) {
            this.iframeViewerRef.current.hideIframe();
          }
        },
      });

      console.log("Customizing links", { xterm, linksAddon });
      xterm.loadAddon(linksAddon);

      console.log("links: Final addons", [...xterm._addonManager._addons]);
    }

    render() {
      const { options, ...props } = this.props;
      const filteredOptions = { ...options };
      // Remove any existing linkHandler.
      delete filteredOptions.linkHandler;

      // Create Term, Tooltip, and IframeViewer inside a Fragment
      return this.React.createElement(
        "div",
        { style: { position: "relative", width: "100%", height: "100%" } },
        this.React.createElement(
          this.React.Fragment,
          null,
          this.React.createElement(Term, {
            ...props,
            onDecorated: this.onDecorated,
            options: filteredOptions,
          }),
          this.React.createElement(Tooltip, {
            ref: this.tooltipRef,
            activated: this.state.tooltipActivated,
            targetPosition: this.state.tooltipPosition,
            content: this.state.tooltipContent,
            fontSize: this.state.tooltipFontSize,
            previewUrl: this.state.tooltipPreviewUrl,
          }),
          this.React.createElement(IframeViewer, {
            ref: this.iframeViewerRef,
          })
        )
      );
    }
  };
};

module.exports = { decorateTerm };
