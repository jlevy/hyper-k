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

    // Get tooltip dimensions based on content type
    const tooltipDimensions = previewUrl
      ? { width: 400, height: 600 } // IframeTooltip dimensions
      : { width: 300, height: 100 }; // PlainTooltip approximate dimensions

    // Adjust position to fit viewport
    const adjustedPosition = adjustCoordsToViewport(
      {
        x: visiblePosition.x + 10, // Small horizontal offset
        y: visiblePosition.y - 25, // Small upward offset
      },
      tooltipDimensions.width,
      tooltipDimensions.height
    );

    const containerStyle = {
      position: "fixed",
      left: adjustedPosition.x,
      top: adjustedPosition.y,
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

// Keep tooltip within viewport bounds
function adjustCoordsToViewport(coords, elementWidth, elementHeight) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  return {
    x: Math.max(0, Math.min(coords.x, viewportWidth - elementWidth)),
    y: Math.max(0, Math.min(coords.y, viewportHeight - elementHeight)),
  };
}

module.exports = Tooltip;
