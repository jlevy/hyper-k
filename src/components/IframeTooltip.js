const React = require("react");

const containerStyle = {
  backgroundColor: "transparent",
  width: "400px",
  height: "600px", // TODO: Adapt size more intelligently.
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
