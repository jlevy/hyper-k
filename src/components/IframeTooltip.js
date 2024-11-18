const React = require("react");
const {
  CONTENT_TOOLTIP_WIDTH,
  CONTENT_TOOLTIP_HEIGHT,
} = require("./tooltip-constants");

const containerStyle = {
  backgroundColor: "transparent",
  width: CONTENT_TOOLTIP_WIDTH + "px",
  height: CONTENT_TOOLTIP_HEIGHT + "px",
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

class IframeTooltip extends React.Component {
  render() {
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
