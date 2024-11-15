const React = require("react");
const IframeTooltip = require("./IframeTooltip");
const PlainTooltip = require("./PlainTooltip");

const TRANSITION_DURATION = 250;

class Tooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visiblePosition: props.position,
      transitioning: false,
      visible: props.visible,
      lastMouseMoveTime: Date.now(),
      typingHidden: false,
    };
    this.handleUserTyping = this.handleUserTyping.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleUserTyping, true);
    document.addEventListener("mousemove", this.handleMouseMove, true);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleUserTyping, true);
    document.removeEventListener("mousemove", this.handleMouseMove, true);
  }

  handleUserTyping(event) {
    if (this.state.visible) {
      this.setState({
        transitioning: true,
        typingHidden: true,
      });

      setTimeout(() => {
        this.setState({
          visible: false,
          transitioning: false,
        });
      }, TRANSITION_DURATION);
    }
  }

  handleMouseMove(event) {
    this.setState({
      lastMouseMoveTime: Date.now(),
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Check if mouse has actually moved recently
    const mouseHasMoved = Date.now() - prevState.lastMouseMoveTime < 500;

    if (mouseHasMoved) {
      return {
        visible: nextProps.visible,
        visiblePosition: nextProps.position,
        typingHidden: false,
      };
    }

    // If mouse hasn't moved or was hidden by typing, keep it hidden
    if (!mouseHasMoved && prevState.typingHidden) {
      return {
        visible: false,
      };
    }

    return null;
  }

  componentDidUpdate(prevProps) {
    // Transition more smoothly from one position to another.
    if (
      prevProps.position.x !== this.props.position.x ||
      prevProps.position.y !== this.props.position.y
    ) {
      // Start fade out
      this.setState({ transitioning: true });

      // Update position after fade out
      setTimeout(() => {
        this.setState({
          visiblePosition: this.props.position,
          transitioning: false,
        });
      }, TRANSITION_DURATION);
    }
  }

  render() {
    const { content, previewUrl, fontSize } = this.props;
    const { visiblePosition, transitioning, visible } = this.state;

    const VIEWPORT_HEIGHT = window.innerHeight;
    const TOP_THRESHOLD = VIEWPORT_HEIGHT * 0.1; // Top 10% of screen
    const HORIZONTAL_OFFSET = 10;
    const VERTICAL_OFFSET = 25;

    const verticalOffset =
      visiblePosition.y < TOP_THRESHOLD ? VERTICAL_OFFSET : -VERTICAL_OFFSET;

    const containerStyle = {
      position: "fixed",
      left: visiblePosition.x + HORIZONTAL_OFFSET,
      top: visiblePosition.y + verticalOffset,
      zIndex: 1000,
      pointerEvents: "none",
      opacity: visible && !transitioning ? 1 : 0,
      visibility: visible ? "visible" : "hidden",
      transition: "opacity 0.25s ease-in, visibility 0.25s ease-in",
    };

    // Decide which tooltip content component to render
    let ContentComponent;
    if (previewUrl) {
      ContentComponent = React.createElement(IframeTooltip, {
        src: previewUrl,
        fontSize,
      });
    } else {
      ContentComponent = React.createElement(PlainTooltip, {
        text: content,
        fontSize,
      });
    }

    return React.createElement(
      "div",
      { style: containerStyle },
      ContentComponent
    );
  }
}

module.exports = Tooltip;
