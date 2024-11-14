const { URL_REGEX, COMMAND_OR_PATH_REGEX } = require("../regex-constants");
const { insideMarkdownFenced } = require("./link-patterns");
const { ClickHandler } = require("../utils/click-handler");
const { handlePasteText, handleOpenLink } = require("./link-handlers");
const { getTextInRange } = require("../utils/xterm-utils");
const { CustomWebLinkProvider } = require("./CustomWebLinkProvider");
const { CustomOscLinkProvider } = require("./CustomOscLinkProvider");

class CustomLinksAddon {
  constructor(tooltipHandlers) {
    this.linkProviders = [];
    this.showTooltip = tooltipHandlers.showTooltip;
    this.hideTooltip = tooltipHandlers.hideTooltip;

    // For links, we want to handle single and double clicks differently.
    this.linkClick = new ClickHandler(
      handlePasteText, // Single-click action
      handleOpenLink // Double-click action
    );
  }

  activate(xterm) {
    console.log("Activating CustomLinksAddon", xterm);

    // Configure OSC 8 link handling
    const activate = (event, url, range) => {
      // The link handler gives us the URL so we pass linkText so we know that too.
      const linkText = getTextInRange(xterm, range);
      return this.linkClick.handle(event, url, range, xterm, linkText);
    };
    const hover = (event, text, range) => {
      console.log("OSC link hover", [event, text, range]);
      // Enable preview for links.
      // TODO: Consider fetching content and rendering title/etc for non-recognized URLs,
      // and doing full preview on known URLs (including localhost content).
      const previewUrl = text;
      this.showTooltip(event, `Open link: ${previewUrl}`, previewUrl, range);
    };
    const leave = (event) => {
      this.hideTooltip();
    };

    xterm.registerLinkProvider(
      new CustomOscLinkProvider(xterm, activate, hover, leave)
    );

    // Define all link providers
    const providers = [
      // Load custom addon for URLs with tooltip support.
      {
        matcher: URL_REGEX,
        handler: (event, text, range) =>
          this.linkClick.handle(event, text, range, xterm),
        hover: (event, text, range) => {
          console.log("URL link hover", [event, text, range]);
          const previewUrl = text;
          this.showTooltip(
            event,
            "Click to paste, double click to open link",
            previewUrl,
            range
          );
        },
        leave: () => this.hideTooltip(),
      },

      // Load custom addon for click-to-paste on commands or paths.
      {
        matcher: COMMAND_OR_PATH_REGEX,
        handler: (event, text, range) =>
          handlePasteText(event, text, range, xterm),
        // Don't match paths starting with @ as regular paths, as they have
        // significance for Kmd (and aren't likely to appear otherwise).
        filter: (line, match) => match.matchText[0] !== "@",
        hover: (event, text, range) => {
          console.log("Command/path hover", [event, text, range]);
          this.showTooltip(event, "Click to paste", null, range);
        },
        leave: () => this.hideTooltip(),
      },

      // Load custom addon for markdown fenced code blocks
      {
        matcher: insideMarkdownFenced,
        handler: (event, text, range) =>
          handlePasteText(event, text, range, xterm),
      },
    ];

    // Register link providers
    providers.forEach(({ matcher, handler, filter = null, hover, leave }) => {
      const linkProvider = new CustomWebLinkProvider(
        xterm,
        matcher,
        filter,
        handler,
        {
          hover,
          leave,
        }
      );
      this.linkProviders.push(xterm.registerLinkProvider(linkProvider));

      console.log("Loaded provider", {
        matcher,
        handler,
        filter,
        hover,
        leave,
      });
    });
  }

  dispose() {
    this.linkProviders.forEach((provider) => provider.dispose());
    this.linkProviders = [];
    this.linkClick.destroy();
  }
}

module.exports = { CustomLinksAddon };
