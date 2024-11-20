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
      visiblePosition: props.position,
      transitioning: false,
      visible: false, // Start as not visible
      lastMouseMoveTime: Date.now(),
      typingHidden: false,
      isHovered: false,
      currentContent: props.content,
      currentPreviewUrl: props.previewUrl,
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

  handleTooltipMouseEnter() {
    this.setState({ isHovered: true });
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  handleTooltipMouseLeave() {
    this.setState({ isHovered: false });
    this.setHideTimeout();
  }

  componentDidUpdate(prevProps, prevState) {
    const mouseHasMoved =
      Date.now() - this.state.lastMouseMoveTime < MOUSE_MOVE_TIMEOUT;

    // Reset typing hidden if mouse moves
    if (mouseHasMoved && this.state.typingHidden) {
      this.setState({ typingHidden: false });
    }

    // Handle visibility changes
    if (!prevProps.visible && this.props.visible) {
      if (!this.state.typingHidden) {
        this.setShowTimeout(
          this.props.position,
          this.props.content,
          this.props.previewUrl
        );
      }
    } else if (
      !this.state.isHovered &&
      ((prevProps.visible && !this.props.visible) ||
        (!prevState.typingHidden && this.state.typingHidden))
    ) {
      this.setHideTimeout();
    }
  }

  setShowTimeout(position, currentContent, currentPreviewUrl) {
    clearTimeout(this.hideTimeout);
    this.hideTimeout = null;

    clearTimeout(this.showTimeout);
    this.showTimeout = setTimeout(() => {
      this.setState({
        visible: true,
        visiblePosition: position,
        currentContent,
        currentPreviewUrl,
      });
      this.showTimeout = null;
    }, TOOLTIP_SHOW_DELAY);
  }

  setHideTimeout() {
    clearTimeout(this.showTimeout);
    this.showTimeout = null;

    clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => {
      this.setState({ visible: false });
      this.hideTimeout = null;
    }, TOOLTIP_HIDE_DELAY);
  }

  calculateAdjustedPosition(basePosition, width, height) {
    // Apply offsets
    const positionWithOffset = {
      x: basePosition.x + 10, // Small horizontal offset
      y: basePosition.y - 25, // Small upward offset
    };

    // Adjust to viewport
    const adjustedPosition = adjustCoordsToViewport(
      positionWithOffset,
      width,
      height
    );

    // Remove offsets for state storage
    return {
      x: adjustedPosition.x - 10,
      y: adjustedPosition.y + 25,
    };
  }

  handleIframeResize(newSize) {
    this.setState({
      visiblePosition: this.calculateAdjustedPosition(
        this.state.visiblePosition,
        newSize.width,
        newSize.height
      ),
    });
  }

  render() {
    const { fontSize } = this.props;
    const {
      visiblePosition,
      transitioning,
      visible,
      currentContent,
      currentPreviewUrl,
    } = this.state;

    // Use currentContent and currentPreviewUrl instead of props
    const tooltipDimensions = currentPreviewUrl
      ? CONTENT_TOOLTIP_INIT_SIZE
      : SMALL_TOOLTIP_SIZE;

    const adjustedPosition = this.calculateAdjustedPosition(
      visiblePosition,
      tooltipDimensions.width,
      tooltipDimensions.height
    );

    const containerStyle = {
      position: "fixed",
      left: adjustedPosition.x + 10, // Re-add offset for display
      top: adjustedPosition.y - 25, // Re-add offset for display
      zIndex: 1000,
      opacity: visible && !transitioning ? 1 : 0,
      visibility: visible ? "visible" : "hidden",
      transition: `
        opacity ${TRANSITION_DURATION}ms ease-in,
        visibility ${TRANSITION_DURATION}ms ease-in,
        width ${TRANSITION_DURATION}ms ease-in-out,
        height ${TRANSITION_DURATION}ms ease-in-out
      `,
      overflow: "hidden",
      boxShadow: COMPONENT_BOX_SHADOW,
    };

    // Update ContentComponent to use state values
    let ContentComponent;
    if (currentPreviewUrl) {
      ContentComponent = React.createElement(IframeTooltip, {
        src: currentPreviewUrl,
        fontSize,
        onResize: this.handleIframeResize.bind(this),
      });
    } else {
      ContentComponent = React.createElement(PlainTooltip, {
        text: currentContent,
        fontSize,
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
