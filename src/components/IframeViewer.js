const React = require("react");
const IframePopover = require("./IframePopover");

class IframeViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      src: null,
      position: null,
      size: null,
    };
    this.showIframe = this.showIframe.bind(this);
    this.hideIframe = this.hideIframe.bind(this);
    this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown, { capture: true });
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown(event) {
    if (event.key === "Escape") {
      this.hideIframe();
    }
  }

  showIframe(src, range, xterm) {
    const terminalElement = xterm.element;
    const terminalRect = terminalElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    const padding = 20;
    // Position the iframe to fit within the viewport
    const position = {
      x: Math.max(Math.min(terminalRect.right, viewportWidth - 600), padding),
      y: terminalRect.top,
    };
    const size = {
      width: terminalRect.right - position.x - padding,
      height: terminalRect.bottom - position.y - padding,
    };
    console.log("IframeViewer: showIframe", { src, position, size });

    this.setState({ open: true, src, position, size });
  }

  hideIframe() {
    // Only set 'open' to false to initiate the closing transition
    this.setState({
      open: false,
      // Do not reset 'src', 'position', or 'size' yet
    });
  }

  handleTransitionEnd() {
    // When the transition ends and the popover is fully closed, clear 'src', 'position', and 'size'
    if (!this.state.open) {
      this.setState({
        src: null,
        position: null,
        size: null,
      });
    }
  }

  render() {
    return React.createElement(IframePopover, {
      open: this.state.open,
      src: this.state.src,
      position: this.state.position,
      width: this.state.size?.width,
      height: this.state.size?.height,
      maxWidth: this.state.size?.width,
      maxHeight: this.state.size?.height,
      onClose: this.hideIframe,
      onTransitionEnd: this.handleTransitionEnd, // Pass the handler to IframePopover
    });
  }
}

module.exports = IframeViewer;
