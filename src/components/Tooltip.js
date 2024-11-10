const React = require("react");
const colors = require("../colors");

const tooltipStyle = {
  position: "fixed",
  backgroundColor: colors.tooltip,
  color: colors.foreground,
  padding: "5px",
  pointerEvents: "none",
  zIndex: 1000,
  transition: "opacity 0.2s ease-in, visibility 0.2s ease-in",
  opacity: 0,
  visibility: "hidden",
};

class Tooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visiblePosition: props.position,
      transitioning: false,
    };
  }

  componentDidUpdate(prevProps) {
    // Transition more smoothly from one position to another.
    if (prevProps.position !== this.props.position) {
      // Start fade out
      this.setState({ transitioning: true });

      // Update position after fade out
      setTimeout(() => {
        this.setState({
          visiblePosition: this.props.position,
          transitioning: false,
        });
      }, 200);
    }
  }

  render() {
    const { visible, content, fontSize } = this.props;
    const { visiblePosition, transitioning } = this.state;

    const VIEWPORT_HEIGHT = window.innerHeight;
    const TOP_THRESHOLD = VIEWPORT_HEIGHT * 0.1; // Top 10% of screen
    const HORIZONTAL_OFFSET = 10;
    const VERTICAL_OFFSET = 25;

    const verticalOffset =
      visiblePosition.y < TOP_THRESHOLD ? VERTICAL_OFFSET : -VERTICAL_OFFSET;

    const style = {
      ...tooltipStyle,
      fontSize: fontSize,
      left: visiblePosition.x + HORIZONTAL_OFFSET,
      top: visiblePosition.y + verticalOffset,
      opacity: visible && !transitioning ? 1 : 0,
      visibility: visible ? "visible" : "hidden",
    };

    return React.createElement("div", { style }, content);
  }
}

module.exports = Tooltip;
