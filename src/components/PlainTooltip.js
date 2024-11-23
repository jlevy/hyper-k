const React = require("react");
const colors = require("../colors");
const {
  SMALL_TOOLTIP_WIDTH,
  UI_FONT_WEIGHT,
} = require("../custom-theme/theme-constants");

const plainTooltipContainerStyle = {
  backgroundColor: colors.tooltip_bg,
  color: colors.foreground,
  padding: "5px",
  pointerEvents: "auto", // Allow interactions within tooltip if needed
  maxWidth: SMALL_TOOLTIP_WIDTH + "px",
  wordWrap: "break-word",
  fontSize: "12px",
  fontWeight: UI_FONT_WEIGHT,
  cursor: "default",
  userSelect: "text",
};

class PlainTooltip extends React.Component {
  render() {
    const { text, fontSize, visible } = this.props;
    const style = {
      ...plainTooltipContainerStyle,
      fontSize: fontSize || "12px",
      opacity: visible ? 1 : 0,
      transition: "opacity 1s ease-in-out, visibility 1s ease-in-out",
    };
    return React.createElement("div", { style }, text);
  }
}

module.exports = PlainTooltip;
