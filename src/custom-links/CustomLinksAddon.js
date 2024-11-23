const { URL_REGEX, COMMAND_OR_PATH_REGEX } = require("../regex-constants");
const { isLocalUrl } = require("../utils/url-utils");
const { insideMarkdownFenced } = require("./link-patterns");
const { ClickHandler } = require("../utils/click-handler");
const { handlePasteText, handleOpenLink } = require("./link-handlers");
const { getTextInRange } = require("../utils/xterm-utils");
const { CustomWebLinkProvider } = require("./CustomWebLinkProvider");
const { CustomOscLinkProvider } = require("./CustomOscLinkProvider");
const { CustomOscLinkService } = require("./CustomOscLinkService");
const { LinkHoverDecoration } = require("./LinkHoverDecoration");
const { RichUri, RichUriType } = require("../utils/rich-terminal-codes");
const {
  hotfixUnderlineStyle,
  restoreUnderlineStyle,
} = require("./xterm-underline-hotfix");

class CustomLinksAddon {
  constructor(xterm, handlers) {
    this.xterm = xterm;
    this.linkProviders = [];
    this.showTooltip = handlers.showTooltip;
    this.hideTooltip = handlers.hideTooltip;
    this.showIframe = handlers.showIframe;
    this.hideIframe = handlers.hideIframe;
    this.hoverDecoration = new LinkHoverDecoration(xterm);

    // For links, we want to handle single and double clicks differently.
    this.linkClickHandler = new ClickHandler(
      // Single-click shows iframe if available
      (event, previewUrl, range, xterm, linkText) => {
        console.log("CustomLinksAddon: URL link single-click", {
          previewUrl,
        });
        if (isLocalUrl(previewUrl)) {
          this.showIframe(previewUrl, range);
        } else {
          handleOpenLink(event, previewUrl, range, xterm);
        }
      },

      // Double-click pastes URL
      (event, previewUrl, range, xterm, linkText) => {
        handlePasteText(event, previewUrl, range, xterm, linkText);
      }
    );

    this.commandClickHandler = new ClickHandler(
      // Single-click pastes command
      (event, previewUrl, range, xterm, linkText) => {
        handlePasteText(event, previewUrl, range, xterm, linkText);
      },
      // Double-click pastes command too (for now)
      (event, previewUrl, range, xterm, linkText) => {
        handlePasteText(event, previewUrl, range, xterm, linkText);
      }
    );

    console.log("CustomLinksAddon: initialized", {
      clickHandler: this.linkClickHandler,
      iframeViewer: this.iframeViewer,
    });
  }

  activate(xterm) {
    console.log("Activating CustomLinksAddon", xterm);
    this.xterm = xterm;

    // -- Hotfix underline style --

    try {
      hotfixUnderlineStyle(this, xterm);
    } catch (error) {
      console.error(
        "Error hotfixing underline style, maybe use Hyper v4?",
        error
      );
    }

    // -- OSC link provider --

    // Find and remove the old OSC link provider.
    // We can't control its behavior fully with options, so we'll replace with our own.
    xterm._core.linkifier2._linkProviders =
      xterm._core.linkifier2._linkProviders.filter((provider) => {
        if (provider._oscLinkService !== undefined) {
          console.log(
            "CustomLinksAddon: removing old OscLinkProvider",
            provider
          );
          return false;
        }
        return true;
      });
    console.log(
      "CustomLinksAddon: cleaned up link providers",
      xterm._core.linkifier2._linkProviders
    );

    // -- OSC link service --

    // Same for the OSC link service. Replace with our own.
    const customOscLinkService = new CustomOscLinkService(xterm);

    // Store reference to old service in case we need to clean it up.
    const oldService = xterm._core._oscLinkService;

    // Replace the service. We have to replace it in two places.
    xterm._core._oscLinkService = customOscLinkService;
    xterm._core._inputHandler._oscLinkService = customOscLinkService;

    console.log("CustomLinksAddon: replaced OSC link service", {
      old: oldService,
      new: customOscLinkService,
    });

    // Clean up old service if it has a dispose method.
    if (oldService && typeof oldService.dispose === "function") {
      oldService.dispose();
    }

    // -- OSC link provider --

    // Configure OSC link handling
    const activate = (event, url, range) => {
      // The link handler gives us the URL so we pass linkText so we know that too.
      const linkText = getTextInRange(xterm, range);
      return this.linkClickHandler.handle(event, url, range, xterm, linkText);
    };
    const hover = (event, text, range) => {
      console.debug("CustomLinksAddon: OSC link hover", [event, text, range]);
      // Show hover decoration.
      this.hoverDecoration.create(range);

      const richUri = RichUri.parse(text);
      if (richUri) {
        // TODO: Handle other RichUri types
        if (richUri.type === RichUriType.TOOLTIP) {
          this.showTooltip(event, richUri.metadata.text, null, range);
          return;
        } else if (richUri.type === RichUriType.URL) {
          // Enable preview for links.
          // TODO: Consider fetching content and rendering title/etc for non-recognized URLs,
          // and doing full preview on known URLs (including localhost content).
          const previewUrl = text;
          this.showTooltip(
            event,
            `Open link: ${previewUrl}`,
            previewUrl,
            range
          );
          return;
        }
      }
      console.warn("CustomLinksAddon: unsupported RichUri type", richUri);
    };
    const leave = (event) => {
      this.hoverDecoration.dispose();
      this.hideTooltip();
    };

    // Now register the custom OSC link provider.
    xterm.registerLinkProvider(
      new CustomOscLinkProvider(xterm, activate, hover, leave)
    );

    // -- Web link providers (literal URLs or commands/paths patterns) --

    // Define the web link providers
    const providers = [
      // Load custom addon for URLs with tooltip support.
      {
        matcher: URL_REGEX,
        handler: (event, text, range) =>
          this.linkClickHandler.handle(event, text, range, xterm),
        hover: (event, text, range) => {
          console.debug("CustomLinksAddon: URL link hover", [
            event,
            text,
            range,
          ]);

          this.hoverDecoration.create(range);

          const previewUrl = text;
          this.showTooltip(
            event,
            "Click to paste, double click to open link",
            previewUrl,
            range
          );
        },
        leave: (event) => {
          this.hoverDecoration.dispose();
          this.hideTooltip();
        },
      },

      // Load custom addon for click-to-paste on commands or paths.
      {
        matcher: COMMAND_OR_PATH_REGEX,
        handler: (event, text, range) =>
          this.commandClickHandler.handle(event, text, range, xterm),
        // Don't match paths starting with @ as regular paths, as they have
        // significance for Kmd (and aren't likely to appear otherwise).
        filter: (line, match) => match.matchText[0] !== "@",
        hover: (event, text, range) => {
          console.debug("CustomLinksAddon: command/path hover", [
            event,
            text,
            range,
          ]);
          this.hoverDecoration.create(range);
          this.showTooltip(event, "Click to paste", null, range);
        },
        leave: (event) => {
          this.hoverDecoration.dispose();
          this.hideTooltip();
        },
      },

      // Load custom addon for markdown fenced code blocks
      {
        matcher: insideMarkdownFenced,
        handler: (event, text, range) =>
          handlePasteText(event, text, range, xterm),
      },
    ];

    // Register the web link providers
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

      console.log("CustomLinksAddon: loaded link provider", {
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
    this.linkClickHandler.destroy();

    restoreUnderlineStyle(this, this.xterm);
  }
}

module.exports = { CustomLinksAddon };
