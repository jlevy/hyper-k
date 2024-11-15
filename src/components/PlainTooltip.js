const React = require("react");
const colors = require("../colors");

const plainTooltipContainerStyle = {
  backgroundColor: colors.tooltip,
  color: colors.foreground,
  padding: "5px",
  borderRadius: "4px",
  pointerEvents: "auto", // Allow interactions within tooltip if needed
  maxWidth: "300px",
  wordWrap: "break-word",
  fontSize: "12px", // Default font size; can be overridden via props
};

class PlainTooltip extends React.Component {
  render() {
    const { text, fontSize } = this.props;
    const style = {
      ...plainTooltipContainerStyle,
      fontSize: fontSize || "12px",
    };
    return React.createElement("div", { style }, text);
  }
}

module.exports = PlainTooltip;
