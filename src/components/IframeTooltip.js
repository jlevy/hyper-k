const React = require("react");
const DynamicIframe = require("./DynamicIframe");
const {
  VISIBILITY_TRANSITION,
  CONTENT_TOOLTIP_INIT_SIZE,
  CONTENT_TOOLTIP_MAX_SIZE,
} = require("../custom-theme/theme-constants");

class IframeTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      iframeLoaded: false,
    };
    this.handleIframeLoad = this.handleIframeLoad.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.src !== prevProps.src) {
      // New src, reset iframeLoaded to false
      this.setState({ iframeLoaded: false });
    }
  }

  handleIframeLoad() {
    this.setState({ iframeLoaded: true });
  }

  render() {
    const { src, onResize, visible } = this.props;
    const { iframeLoaded } = this.state;

    // The content is visible only when the tooltip is visible and the iframe has loaded
    const contentStyle = {
      pointerEvents: "auto",
      opacity: visible && iframeLoaded ? 1 : 0,
      visibility: visible && iframeLoaded ? "visible" : "hidden",
      transition: VISIBILITY_TRANSITION,
    };

    return React.createElement(
      "div",
      {
        style: contentStyle,
      },
      React.createElement(DynamicIframe, {
        src,
        onLoad: this.handleIframeLoad,
        initialWidth: CONTENT_TOOLTIP_INIT_SIZE.width,
        initialHeight: CONTENT_TOOLTIP_INIT_SIZE.height,
        maxWidth: CONTENT_TOOLTIP_MAX_SIZE.width,
        maxHeight: CONTENT_TOOLTIP_MAX_SIZE.height,
        onResize,
      })
    );
  }
}

module.exports = IframeTooltip;
