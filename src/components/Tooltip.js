const React = require("react");
const IframeTooltip = require("./IframeTooltip");
const PlainTooltip = require("./PlainTooltip");
const {
  CONTENT_TOOLTIP_INIT_SIZE,
  SMALL_TOOLTIP_SIZE,
  TRANSITION_DURATION,
  MOUSE_MOVE_TIMEOUT,
  VISIBLE_TIMEOUT,
  COMPONENT_BOX_SHADOW,
} = require("../custom-theme/theme-constants");

class Tooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visiblePosition: props.position,
      transitioning: false,
      visible: props.visible,
      lastMouseMoveTime: Date.now(),
      typingHidden: false,
      isHovered: false,
      hideTimeout: null,
    };
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
    if (this.state.hideTimeout) {
      clearTimeout(this.state.hideTimeout);
    }
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

  handleTooltipMouseEnter() {
    this.setState({ isHovered: true });
  }

  setHideTimeout() {
    // Clear any existing timeout
    if (this.state.hideTimeout) {
      clearTimeout(this.state.hideTimeout);
    }

    // Set new timeout and keep tooltip visible for a little longer
    const hideTimeout = setTimeout(() => {
      this.setState({
        visible: false,
        hideTimeout: null,
      });
    }, VISIBLE_TIMEOUT);

    return hideTimeout;
  }

  handleTooltipMouseLeave() {
    const hideTimeout = this.setHideTimeout();
    this.setState({
      hideTimeout,
      isHovered: false,
    });
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

  static getDerivedStateFromProps(nextProps, prevState) {
    // If tooltip is being explicitly hidden via props
    if (!nextProps.visible && prevState.visible) {
      // Hide immediately
      if (prevState.hideTimeout) {
        clearTimeout(prevState.hideTimeout);
      }
      return {
        visible: false,
        hideTimeout: null,
        transitioning: false,
      };
    }

    // Check if mouse has actually moved recently
    const mouseHasMoved =
      Date.now() - prevState.lastMouseMoveTime < MOUSE_MOVE_TIMEOUT;

    // Keep tooltip visible if it's being hovered
    if (prevState.isHovered) {
      return {
        visible: true,
        visiblePosition: prevState.visiblePosition,
        typingHidden: false,
      };
    }

    if (mouseHasMoved) {
      // If we have an active hideTimeout, keep current position and content
      if (prevState.hideTimeout) {
        return {
          visible: true,
          // Don't update position during timeout to keep the old tooltip in place
          typingHidden: false,
        };
      }

      // If no timeout, follow the props
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
    // Handle visibility changes.
    if (prevProps.visible && !this.props.visible) {
      const hideTimeout = this.setHideTimeout();
      this.setState({
        visible: true,
        hideTimeout,
        visiblePosition: prevProps.position,
      });
    }

    // Handle position transitions
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
      {
        style: containerStyle,
        onMouseEnter: this.handleTooltipMouseEnter,
        onMouseLeave: this.handleTooltipMouseLeave,
      },
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
