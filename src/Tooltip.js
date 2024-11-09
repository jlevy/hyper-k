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

    const VIEWPORT_HEIGHT = window.innerHeight;
    const TOP_THRESHOLD = VIEWPORT_HEIGHT * 0.1; // Top 10% of screen
    const HORIZONTAL_OFFSET = 10;
    const VERTICAL_OFFSET = 25;

    // Default to above and right of cursor/element.
    // If we are near the top of the screen, position below instead.
    const verticalOffset =
      position.y < TOP_THRESHOLD ? VERTICAL_OFFSET : -VERTICAL_OFFSET;

    const style = {
      ...tooltipStyle,
      left: position.x + HORIZONTAL_OFFSET,
      top: position.y + verticalOffset,
      opacity: visible ? 1 : 0,
      visibility: visible ? "visible" : "hidden",
    };

    return React.createElement("div", { style }, content);
  }
}

module.exports = Tooltip;
