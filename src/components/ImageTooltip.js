const React = require("react");
const colors = require("../colors");
const {
  VISIBILITY_TRANSITION,
  IMAGE_TOOLTIP_MAX_SIZE,
} = require("../custom-theme/theme-constants");

class ImageTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imageLoaded: false,
      size: null,
    };
    this.handleImageLoad = this.handleImageLoad.bind(this);
  }

  handleImageLoad(event) {
    const { onResize } = this.props;
    const img = event.target;

    // Calculate dimensions while maintaining aspect ratio
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    let width = Math.min(img.naturalWidth, IMAGE_TOOLTIP_MAX_SIZE.width);
    let height = width / aspectRatio;

    if (height > IMAGE_TOOLTIP_MAX_SIZE.height) {
      height = IMAGE_TOOLTIP_MAX_SIZE.height;
      width = height * aspectRatio;
    }

    const size = { width, height };
    this.setState({ imageLoaded: true, size });

    if (onResize) {
      onResize(size);
    }
  }

  render() {
    const { src, visible } = this.props;
    const { imageLoaded, size } = this.state;

    return React.createElement("img", {
      src,
      onLoad: this.handleImageLoad,
      style: {
        ...size,
        border: `2px solid ${colors.bg_translucent}`,
        opacity: visible && imageLoaded ? 1 : 0,
        transition: VISIBILITY_TRANSITION,
        pointerEvents: "auto",
      },
      alt: "",
    });
  }
}

module.exports = ImageTooltip;
