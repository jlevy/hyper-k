const React = require("react");
const colors = require("../colors");
const {
  UI_FONT_WEIGHT,
  UI_BOLD_FONT_WEIGHT,
} = require("../custom-theme/theme-constants");
const { fetchUrlMetadata } = require("../utils/fetch-url-metadata");
const { smallFont } = require("../utils/font-sizing");
const { abbreviateUrl } = require("../utils/url-utils");
const {
  VISIBILITY_TRANSITION,
  CONTENT_TOOLTIP_MAX_SIZE,
} = require("../custom-theme/theme-constants");

const tooltipStyle = {
  cursor: "default",
  userSelect: "text",
  pointerEvents: "auto",
};

const linkInfoStyle = {
  backgroundColor: colors.tooltip_bg,
  color: colors.text,
  background: colors.bg_translucent,
  padding: "8px",
  wordWrap: "break-word",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

class LinkInfoTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      metadata: null,
      imageLoaded: false,
    };
    this.handleImageLoad = this.handleImageLoad.bind(this);
  }

  componentDidMount() {
    this.fetchMetadata();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.url !== this.props.url) {
      this.fetchMetadata();
    }
  }

  async fetchMetadata() {
    try {
      this.setState({ loading: true });
      const metadata = await fetchUrlMetadata(this.props.url);
      this.setState({ metadata, loading: false });
    } catch (error) {
      console.error("LinkInfoTooltip error:", error);
      const urlObj = new URL(this.props.url);
      this.setState({
        metadata: {
          title: urlObj.hostname,
          description: this.props.url,
          contentType: null,
        },
        loading: false,
      });
    }
  }

  handleImageLoad(event) {
    const { onResize } = this.props;
    const img = event.target;

    // Calculate dimensions while respecting max size
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    let width = Math.min(img.naturalWidth, CONTENT_TOOLTIP_MAX_SIZE.width);
    let height = width / aspectRatio;

    if (height > CONTENT_TOOLTIP_MAX_SIZE.height) {
      height = CONTENT_TOOLTIP_MAX_SIZE.height;
      width = height * aspectRatio;
    }

    this.setState({ imageLoaded: true });

    if (onResize) {
      onResize({ width, height });
    }
  }

  render() {
    const { url, visible, fontSize } = this.props;
    const { loading, metadata } = this.state;

    // Don't render anything while loading
    if (loading || !metadata) {
      return null;
    }

    const style = {
      ...tooltipStyle,
      opacity: visible ? 1 : 0,
      transition: VISIBILITY_TRANSITION,
    };

    if (metadata.contentType && metadata.contentType.startsWith("image/")) {
      return React.createElement("img", {
        src: url,
        onLoad: this.handleImageLoad,
        style: {
          maxWidth: CONTENT_TOOLTIP_MAX_SIZE.width + "px",
          maxHeight: CONTENT_TOOLTIP_MAX_SIZE.height + "px",
          border: `2px solid ${colors.bg_translucent}`,
          ...style,
        },
      });
    } else {
      // Render link title/description
      return React.createElement(
        "div",
        {
          style: {
            ...linkInfoStyle,
            ...style,
          },
        },
        metadata.title &&
          React.createElement(
            "div",
            {
              style: {
                fontWeight: UI_FONT_WEIGHT,
              },
            },
            metadata.title
          ),
        url &&
          React.createElement(
            "div",
            {
              style: {
                marginTop: "0.5rem",
                fontSize: smallFont(fontSize),
                fontWeight: UI_BOLD_FONT_WEIGHT,
              },
            },
            React.createElement(
              "a",
              {
                href: url,
                target: "_blank",
                style: {
                  color: colors.text,
                  textDecoration: "none",
                },
              },
              abbreviateUrl(url)
            )
          ),
        metadata.description &&
          React.createElement(
            "div",
            {
              style: {
                marginTop: "0.5rem",
                fontSize: smallFont(fontSize),
                fontWeight: UI_FONT_WEIGHT,
              },
            },
            metadata.description
          )
      );
    }
  }
}

module.exports = LinkInfoTooltip;
