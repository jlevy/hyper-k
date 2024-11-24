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
  SMALL_TOOLTIP_WIDTH,
} = require("../custom-theme/theme-constants");

const linkInfoTooltipStyle = {
  backgroundColor: colors.tooltip_bg,
  color: colors.text,
  background: colors.bg_translucent,
  padding: "8px",
  pointerEvents: "auto",
  maxWidth: SMALL_TOOLTIP_WIDTH + "px",
  wordWrap: "break-word",
  cursor: "default",
  userSelect: "text",
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
    };
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
        },
        loading: false,
      });
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
      ...linkInfoTooltipStyle,
      opacity: visible ? 1 : 0,
      transition: VISIBILITY_TRANSITION,
    };

    let content;
    content = React.createElement(
      React.Fragment,
      null,
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

    return React.createElement("div", { style }, content);
  }
}

module.exports = LinkInfoTooltip;
