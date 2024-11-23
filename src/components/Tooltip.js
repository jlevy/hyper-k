const React = require("react");
const IframeTooltip = require("./IframeTooltip");
const PlainTooltip = require("./PlainTooltip");
const {
  CONTENT_TOOLTIP_INIT_SIZE,
  SMALL_TOOLTIP_SIZE,
  TRANSITION_DURATION,
  MOUSE_MOVE_TIMEOUT,
  TOOLTIP_SHOW_DELAY,
  TOOLTIP_HIDE_DELAY,
  TOOLTIP_BORDER_RADIUS,
  COMPONENT_BOX_SHADOW,
} = require("../custom-theme/theme-constants");

// Keep tooltip within viewport bounds
function adjustCoordsToViewport(coords, elementWidth, elementHeight) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  return {
    x: Math.max(0, Math.min(coords.x, viewportWidth - elementWidth)),
    y: Math.max(0, Math.min(coords.y, viewportHeight - elementHeight)),
  };
}

class Tooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      targetPosition: props.targetPosition, // Approximately where we want the tooltip.
      currentContent: props.content,
      currentPreviewUrl: props.previewUrl,
      visible: false, // Start as not visible
      lastMouseMoveTime: Date.now(),
      typingHidden: false,
      isHovered: false,
      tooltipDimensions: props.previewUrl
        ? CONTENT_TOOLTIP_INIT_SIZE
        : SMALL_TOOLTIP_SIZE,
    };
    this.hideTimeout = null;
    this.showTimeout = null;
    this.handleUserTyping = this.handleUserTyping.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleTooltipMouseEnter = this.handleTooltipMouseEnter.bind(this);
    this.handleTooltipMouseLeave = this.handleTooltipMouseLeave.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleUserTyping, true);
    document.addEventListener("mousemove", this.handleMouseMove, true);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleUserTyping, true);
    document.removeEventListener("mousemove", this.handleMouseMove, true);
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
  }

  handleUserTyping() {
    this.setState({ typingHidden: true });
  }

  handleMouseMove() {
    this.setState({ lastMouseMoveTime: Date.now() });
  }

  // Entering the tooltip itself.
  handleTooltipMouseEnter() {
    this.setState({ isHovered: true });
    this.clearHideTimeout();
  }

  // Leaving the tooltip itself.
  handleTooltipMouseLeave() {
    this.setState({ isHovered: false });
    this.setHideTimeout(TOOLTIP_HIDE_DELAY);
  }

  componentDidUpdate(prevProps, prevState) {
    const mouseHasMoved =
      Date.now() - this.state.lastMouseMoveTime < MOUSE_MOVE_TIMEOUT;

    // Reset typing hidden if mouse moves
    if (mouseHasMoved && this.state.typingHidden) {
      this.setState({ typingHidden: false });
    }

    // Handle visibility changes
    if (!prevProps.activated && this.props.activated) {
      if (!this.state.typingHidden) {
        this.setShowTimeout(
          this.props.targetPosition,
          this.props.content,
          this.props.previewUrl
        );
      }
    } else if (
      !this.state.isHovered &&
      prevProps.activated &&
      !this.props.activated && // Only handle activation change
      !this.hideTimeout // Only set timeout if not already set
    ) {
      this.setHideTimeout(TOOLTIP_HIDE_DELAY);
    } else if (!prevState.typingHidden && this.state.typingHidden) {
      this.setHideTimeout(TOOLTIP_HIDE_DELAY);
    }
  }

  clearShowTimeout() {
    clearTimeout(this.showTimeout);
    this.showTimeout = null;
  }

  clearHideTimeout() {
    clearTimeout(this.hideTimeout);
    this.hideTimeout = null;
  }

  setShowTimeout(targetPosition, currentContent, currentPreviewUrl) {
    this.clearHideTimeout();

    clearTimeout(this.showTimeout);
    this.showTimeout = setTimeout(() => {
      this.setState({
        visible: true,
        targetPosition,
        currentContent,
        currentPreviewUrl,
      });
      this.showTimeout = null;
    }, TOOLTIP_SHOW_DELAY);
  }

  setHideTimeout(timeout) {
    this.clearShowTimeout();

    clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => {
      this.setState({ visible: false });
      this.hideTimeout = null;
    }, timeout);
  }

  adjustPosition(targetPosition, tooltipDimensions) {
    return adjustCoordsToViewport(
      {
        x: targetPosition.x + 10,
        y: targetPosition.y - 25,
      },
      tooltipDimensions.width,
      tooltipDimensions.height
    );
  }

  handleIframeResize(newSize) {
    console.log("Tooltip: handleIframeResize", newSize);
    this.setState({ tooltipDimensions: newSize });
  }

  render() {
    const { fontSize } = this.props;
    const {
      targetPosition,
      visible,
      currentContent,
      currentPreviewUrl,
      tooltipDimensions,
    } = this.state;

    const finalPosition = this.adjustPosition(
      targetPosition,
      tooltipDimensions
    );

    const containerStyle = {
      position: "fixed",
      left: finalPosition.x,
      top: finalPosition.y,
      zIndex: 1000,
      opacity: visible ? 1 : 0,
      visibility: visible ? "visible" : "hidden",
      borderRadius: TOOLTIP_BORDER_RADIUS,
      transition: `
        opacity ${TRANSITION_DURATION}ms ease-in,
        visibility ${TRANSITION_DURATION}ms ease-in,
        width ${TRANSITION_DURATION}ms ease-in-out,
        height ${TRANSITION_DURATION}ms ease-in-out
      `,
      overflow: "hidden",
      boxShadow: COMPONENT_BOX_SHADOW,
    };

    // Update ContentComponent to use state values and add visibility control
    let ContentComponent;
    if (currentPreviewUrl) {
      ContentComponent = React.createElement(IframeTooltip, {
        src: currentPreviewUrl,
        fontSize,
        onResize: this.handleIframeResize.bind(this),
        visible: visible, // Pass visibility state
      });
    } else {
      ContentComponent = React.createElement(PlainTooltip, {
        text: currentContent,
        fontSize,
        visible: visible, // Pass visibility state
      });
    }

    return React.createElement(
      "div",
      {
        style: containerStyle,
        onMouseEnter: this.handleTooltipMouseEnter,
        onMouseLeave: this.handleTooltipMouseLeave,
      },
      ContentComponent
    );
  }
}

module.exports = Tooltip;
