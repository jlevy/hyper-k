const React = require("react");
const colors = require("../colors");
const DynamicIframe = require("./DynamicIframe");
const {
  POPOVER_TRANSITION,
  COMPONENT_BOX_SHADOW,
} = require("../custom-theme/theme-constants");

class IframePopover extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: props.open, // Controls whether the popover is in the DOM
      transitioning: false, // Indicates if a transition is in progress
    };
    this.handleResize = this.handleResize.bind(this);
    this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.open && !prevState.visible) {
      // Popover just opened
      return {
        visible: true,
        transitioning: true,
      };
    } else if (!nextProps.open && prevState.visible) {
      // Popover just closed
      return {
        transitioning: true,
      };
    }
    return null;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.open && !this.props.open) {
      // Start fade-out transition
      // The visibility will be set to false after the transition ends
    } else if (!prevProps.open && this.props.open) {
      // Popover just opened
      // End transitioning state after a short delay to ensure the transition begins
      setTimeout(() => {
        this.setState({ transitioning: false });
      }, 10); // Small delay to ensure CSS transition picks up the change
    }
  }

  handleResize({ width, height }) {
    if (this.props.onResize) {
      this.props.onResize({ width, height });
    }
  }

  handleTransitionEnd() {
    if (!this.props.open) {
      // Transition ended and popover is closed, remove it from DOM
      this.setState({ visible: false, transitioning: false });
    } else {
      // Transition ended and popover is open
      this.setState({ transitioning: false });
    }
  }

  render() {
    const { src, onClose, position } = this.props;
    const { visible, transitioning } = this.state;

    // Don't render anything if popover is not visible and not transitioning
    if (!visible && !transitioning) return null;

    const containerStyle = {
      position: "fixed",
      left: position?.x || 0,
      top: position?.y || 0,
      backgroundColor: colors.tooltip_bg,
      padding: "0 4px",
      boxShadow: COMPONENT_BOX_SHADOW,
      display: "flex",
      flexDirection: "column",
      zIndex: 990,
      opacity: this.props.open && !transitioning ? 1 : 0, // Fade in/out
      visibility: visible ? "visible" : "hidden", // Hide when not visible
      transition: POPOVER_TRANSITION,
    };

    return React.createElement(
      "div",
      {
        style: containerStyle,
        onTransitionEnd: this.handleTransitionEnd,
      },
      React.createElement(
        "button",
        {
          onClick: onClose,
          style: {
            alignSelf: "flex-end",
            background: "none",
            border: "none",
            color: colors.foreground,
            cursor: "pointer",
            padding: 0,
            fontSize: "16px",
          },
        },
        "×"
      ),
      React.createElement(DynamicIframe, {
        src,
        onResize: this.handleResize,
        initialWidth: this.props?.width || 400,
        initialHeight: this.props?.height || 600,
        maxWidth: this.props?.maxWidth,
        maxHeight: this.props?.maxHeight,
      })
    );
  }
}

module.exports = IframePopover;
