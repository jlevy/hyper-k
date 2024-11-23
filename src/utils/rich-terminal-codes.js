const RichUriType = {
  URL: "url",
  TOOLTIP: "tooltip",
  BUTTON: "button",
  COMMAND: "command",

  getPrefix(type) {
    if (type === this.URL) {
      return "";
    }
    return `ui://${type}`;
  },
};

const UI_SCHEME = "ui://";

class RichUri {
  constructor(type, urlText = null, metadata = {}) {
    this.type = type;
    this.urlText = urlText;
    this.metadata = metadata;
  }

  getUriString() {
    if (this.type === RichUriType.URL) {
      if (!this.urlText) {
        throw new Error("urlText is required for URL type");
      }
      return this.urlText;
    }

    const queryString = new URLSearchParams(this.metadata).toString();
    return `${RichUriType.getPrefix(this.type)}?${queryString}`;
  }

  static parse(uriStr) {
    // Handle regular URLs
    if (uriStr.startsWith("http://") || uriStr.startsWith("https://")) {
      return new RichUri(RichUriType.URL, uriStr);
    }

    // Validate UI scheme
    if (!uriStr.startsWith(UI_SCHEME)) {
      console.debug("RichUri: not a UI URI", uriStr);
      return null;
    }

    // Parse the UI URI
    const uriWithoutScheme = uriStr.slice(UI_SCHEME.length);
    const [typeStr, queryStr] = uriWithoutScheme.split("?", 2);

    // Validate type
    if (!Object.values(RichUriType).includes(typeStr)) {
      console.debug("RichUri: invalid type", typeStr);
      return null;
    }

    // Parse query parameters
    const params = new URLSearchParams(queryStr);
    const metadata = Object.fromEntries(params.entries());

    return new RichUri(typeStr, null, metadata);
  }
}

module.exports = { RichUri, RichUriType };
