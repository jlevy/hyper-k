const React = require("react");
const DynamicIframe = require("./DynamicIframe");
const {
  CONTENT_TOOLTIP_INIT_SIZE,
  CONTENT_TOOLTIP_MAX_SIZE,
} = require("../custom-theme/theme-constants");

class IframeTooltip extends React.Component {
  render() {
    const { src, onResize } = this.props;

    return React.createElement(
      "div",
      {
        style: {
          pointerEvents: "auto",
        },
      },
      React.createElement(DynamicIframe, {
        src,
        initialWidth: CONTENT_TOOLTIP_INIT_SIZE.width,
        initialHeight: CONTENT_TOOLTIP_INIT_SIZE.height,
        maxWidth: CONTENT_TOOLTIP_MAX_SIZE.width,
        maxHeight: CONTENT_TOOLTIP_MAX_SIZE.height,
        onResize,
      })
    );
  }
}

module.exports = IframeTooltip;
