const React = require("react");

const tooltipStyle = {
  position: "fixed",
  backgroundColor: "rgba(168, 170, 149, 0.8)",
  color: "#fff",
  padding: "5px",
  fontSize: "12px",
  pointerEvents: "none",
  zIndex: 1000,
  transition: "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out",
  opacity: 0,
  visibility: "hidden",
};

class Tooltip extends React.Component {
  render() {
    const { visible, content, position } = this.props;

    const viewportHeight = window.innerHeight;
    // Define a threshold (e.g., bottom 20% of screen)
    const bottomThreshold = viewportHeight * 0.8;

    // If cursor is below threshold, position tooltip above cursor
    const verticalOffset = position.y > bottomThreshold ? -30 : 10;

    const style = {
      ...tooltipStyle,
      left: position.x + 10,
      top: position.y + verticalOffset,
      opacity: visible ? 1 : 0,
      visibility: visible ? "visible" : "hidden",
    };

    return React.createElement("div", { style }, content);
  }
}

module.exports = Tooltip;
