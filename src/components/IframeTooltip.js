const React = require("react");
const DynamicIframe = require("./DynamicIframe");
const {
  VISIBILITY_TRANSITION,
  CONTENT_TOOLTIP_INIT_SIZE,
  CONTENT_TOOLTIP_MAX_SIZE,
} = require("../custom-theme/theme-constants");
const ImageTooltip = require("./ImageTooltip");

class IframeTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      iframeLoaded: false,
      isImage: false,
    };
    this.handleIframeLoad = this.handleIframeLoad.bind(this);
  }

  componentDidMount() {
    this.checkIfImage();
  }

  componentDidUpdate(prevProps) {
    if (this.props.src !== prevProps.src) {
      this.setState({ iframeLoaded: false });
      this.checkIfImage();
    }
  }

  async checkIfImage() {
    try {
      const response = await fetch(this.props.src, { method: "HEAD" });
      const contentType = response.headers.get("content-type");
      this.setState({ isImage: contentType?.startsWith("image/") });
    } catch (error) {
      console.error("Error checking content type:", error);
      this.setState({ isImage: false });
    }
  }

  handleIframeLoad() {
    this.setState({ iframeLoaded: true });
  }

  render() {
    const { src, onResize, visible } = this.props;
    const { iframeLoaded, isImage } = this.state;

    if (isImage) {
      return React.createElement(ImageTooltip, {
        src,
        visible,
        onResize,
      });
    }

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
