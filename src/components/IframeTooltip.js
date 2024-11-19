const React = require("react");
const {
  CONTENT_TOOLTIP_INIT_SIZE,
  CONTENT_TOOLTIP_MAX_SIZE,
} = require("./tooltip-constants");

class IframeTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 0,
      width: 0,
    };
  }

  componentDidMount() {
    window.addEventListener("message", this.handleIframeMessage);
  }

  componentWillUnmount() {
    window.removeEventListener("message", this.handleIframeMessage);
  }

  // We support messages from the iframe content to resize the iframe.
  handleIframeMessage = (event) => {
    console.debug("IframeTooltip: handleIframeMessage", event);

    // Verify message origin for security
    const expectedOrigin =
      this.props.src.startsWith("file://") ||
      this.props.src.startsWith("http://localhost") ||
      this.props.src.startsWith("http://127.0.0.1")
        ? null
        : new URL(this.props.src).origin;
    if (
      event.origin === expectedOrigin ||
      ((event.origin === null || event.origin === "null") &&
        expectedOrigin === null)
    ) {
      if (event.data.type === "suggestedSize") {
        const { height, width } = event.data;
        console.log("IframeTooltip: adjusting size from message", {
          height,
          width,
        });
        this.setState({ height, width });
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
  };

  render() {
    const width = Math.min(
      this.state.width || CONTENT_TOOLTIP_INIT_SIZE.width,
      CONTENT_TOOLTIP_MAX_SIZE.width
    );
    const height = Math.min(
      this.state.height || CONTENT_TOOLTIP_INIT_SIZE.height,
      CONTENT_TOOLTIP_MAX_SIZE.height
    );
    const containerStyle = {
      backgroundColor: "transparent",
      width: width + "px",
      height: height + "px",
      overflow: "hidden",
      pointerEvents: "auto", // Allow interactions within iframe
      transition: "opacity 0.2s ease-in, visibility 0.2s ease-in",
    };

    const iframeStyle = {
      width: "100%",
      height: "100%",
      border: "none",
      overflow: "hidden",
    };

    const { src, fontSize } = this.props;
    return React.createElement(
      "div",
      { style: containerStyle },
      React.createElement("iframe", {
        src: src,
        style: iframeStyle,
        sandbox: "allow-scripts",
      })
    );
  }
}

module.exports = IframeTooltip;
