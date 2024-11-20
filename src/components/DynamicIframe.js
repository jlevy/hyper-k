const React = require("react");
const { isLocalUrl } = require("../utils/url-utils");

class DynamicIframe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: props.initialHeight,
      width: props.initialWidth,
      // TODO: Consider taking fontSize as well and sending a message to the iframe to set the zoom level?
    };
    this.handleIframeMessage = this.handleIframeMessage.bind(this);
    console.log("DynamicIframe: constructor", { props });
  }

  componentDidMount() {
    window.addEventListener("message", this.handleIframeMessage);
  }

  componentWillUnmount() {
    window.removeEventListener("message", this.handleIframeMessage);
  }

  handleIframeMessage(event) {
    const { src, onResize } = this.props;
    const expectedOrigin = isLocalUrl(src) ? null : new URL(src).origin;

    if (
      event.origin === expectedOrigin ||
      ((event.origin === null || event.origin === "null") &&
        expectedOrigin === null)
    ) {
      if (event.data.type === "suggestedSize") {
        let { height, width } = event.data;

        console.log("IframeTooltip: adjusting size from message", {
          height,
          width,
        });

        // Add a small buffer to prevent scrollbars
        height += 20;

        // Don't grow larger than the max height and width.
        if (this.props.maxHeight) {
          height = Math.min(height, this.props.maxHeight);
        }
        if (this.props.maxWidth) {
          width = Math.min(width, this.props.maxWidth);
        }

        // Don't shrink smaller than the min height and width.
        if (this.props.minHeight) {
          height = Math.max(height, this.props.minHeight);
        }
        if (this.props.minWidth) {
          width = Math.max(width, this.props.minWidth);
        }

        console.log("IframeTooltip: final size", { height, width });

        this.setState({ height, width });
        if (onResize) {
          onResize({ height, width });
        }
      } else {
        console.error("IframeTooltip: unknown message type", event.data);
      }
    } else {
      console.error(
        "Iframe message origin mismatch",
        event.origin,
        expectedOrigin
      );
      return;
    }
  }

  render() {
    const { src, style = {} } = this.props;
    const { width, height } = this.state;

    const containerStyle = {
      backgroundColor: "transparent",
      width: width + "px",
      height: height + "px",
      overflow: "hidden",
      pointerEvents: "auto",
      cursor: "text",
      userSelect: "text",
      ...style,
    };

    const iframeStyle = {
      width: "100%",
      height: "100%",
      border: "none",
      overflow: "hidden",
    };

    return React.createElement(
      "div",
      { style: containerStyle },
      React.createElement("iframe", {
        src: src,
        style: iframeStyle,
        sandbox: "allow-scripts allow-popups",
      })
    );
  }
}

module.exports = DynamicIframe;
