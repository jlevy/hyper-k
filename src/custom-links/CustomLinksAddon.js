const { URL_REGEX, COMMAND_OR_PATH_REGEX } = require("../regex-constants");
const { isLocalUrl } = require("../utils/url-utils");
const { insideMarkdownFenced } = require("./link-patterns");
const { ClickHandler } = require("../utils/click-handler");
const { handlePasteText, handleOpenLink } = require("./link-handlers");
const { getTextInRange } = require("../utils/xterm-utils");
const { CustomWebLinkProvider } = require("./CustomWebLinkProvider");
const { CustomOscLinkProvider } = require("./CustomOscLinkProvider");
const { CustomOscLinkService } = require("./CustomOscLinkService");

const ExtFlags = {
  /**
   * bit 27..32 (upper 3 unused)
   */
  UNDERLINE_STYLE: 0x1c000000,
};

const UnderlineStyle = {
  NONE: 0,
  SINGLE: 1,
  DOUBLE: 2,
  CURLY: 3,
  DOTTED: 4,
  DASHED: 5,
};

/**
 * Monkey-patch ExtendedAttrs
 *
 * XXX Okay this is ugly but xterm.js hard-codes the underline style for OSC links.
 * https://github.com/xtermjs/xterm.js/blob/5.3.0/src/common/buffer/AttributeData.ts#L149-L155
 * We just hotfix it here.
 */
function hotfixUnderlineStyle(addon, xterm) {
  // Get the prototype of ExtendedAttrs.
  const extendedAttrsPrototype = Object.getPrototypeOf(
    xterm._core._inputHandler._curAttrData.extended
  );

  if (!xterm._core?._inputHandler?._curAttrData?.extended) {
    console.error("Cannot access required xterm.js internals");
    return;
  }

  if (!extendedAttrsPrototype) {
    console.error("Cannot access ExtendedAttrs prototype");
    return;
  }

  // Redefine the underlineStyle getter to remove the forced DASHED style.
  Object.defineProperty(extendedAttrsPrototype, "underlineStyle", {
    get: function () {
      console.log("ExtendedAttrs.underlineStyle getter", this);
      // Instead of forcing UnderlineStyle.DASHED when _urlId is set,
      // use the style specified in _ext
      return (this._ext & ExtFlags.UNDERLINE_STYLE) >> 26;
    },
    set: function (value) {
      this._ext &= ~ExtFlags.UNDERLINE_STYLE;
      this._ext |= (value << 26) & ExtFlags.UNDERLINE_STYLE;
    },
  });

  const propertyDescriptor = Object.getOwnPropertyDescriptor(
    extendedAttrsPrototype,
    "underlineStyle"
  );
  addon._originalUnderlineStyleProp = propertyDescriptor;

  Object.defineProperty(extendedAttrsPrototype, "underlineStyle", {
    get: function () {
      // Removing hard-coded link style.
      // if (this._urlId) {
      //   return UnderlineStyle.DASHED;
      // }
      return (this._ext & ExtFlags.UNDERLINE_STYLE) >> 26;
    },
    set: addon._originalUnderlineStyleProp.set, // Use original setter
  });

  console.log("CustomLinksAddon: patched ExtendedAttrs.underlineStyle");
}

// Restore the original underlineStyle getter
function restoreUnderlineStyle(addon, xterm) {
  if (addon._originalUnderlineStyleProp) {
    const extendedAttrsPrototype = Object.getPrototypeOf(
      xterm._core._inputHandler._curAttrData.extended
    );
    Object.defineProperty(extendedAttrsPrototype, "underlineStyle", {
      get: addon._originalUnderlineStyleProp.get,
      set: addon._originalUnderlineStyleProp.set,
    });
  }
}

class CustomLinksAddon {
  constructor(handlers) {
    this.linkProviders = [];
    this.showTooltip = handlers.showTooltip;
    this.hideTooltip = handlers.hideTooltip;
    this.showIframe = handlers.showIframe;
    this.hideIframe = handlers.hideIframe;

    // For links, we want to handle single and double clicks differently.
    this.urlLinkClick = new ClickHandler(
      // Single-click pastes URL
      (event, previewUrl, range) => {
        handlePasteText(event, previewUrl, range, this.xterm);
      },
      // Double-click shows iframe if available
      (event, previewUrl, range) => {
        console.log("CustomLinksAddon: URL link double-click", {
          previewUrl,
        });
        if (isLocalUrl(previewUrl)) {
          this.showIframe(previewUrl, range);
        } else {
          handleOpenLink(event, previewUrl, range, this.xterm);
        }
      }
    );

    console.log("CustomLinksAddon: initialized", {
      urlLinkClick: this.urlLinkClick,
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
      return this.urlLinkClick.handle(event, url, range, xterm, linkText);
    };
    const hover = (event, text, range) => {
      // Enable preview for links.
      // TODO: Consider fetching content and rendering title/etc for non-recognized URLs,
      // and doing full preview on known URLs (including localhost content).
      console.debug("CustomLinksAddon: OSC link hover", [event, text, range]);
      const previewUrl = text;
      this.showTooltip(event, `Open link: ${previewUrl}`, previewUrl, range);
    };
    const leave = (event) => {
      this.hideTooltip();
    };

    // Now register the custom OSC link provider.
    xterm.registerLinkProvider(
      new CustomOscLinkProvider(xterm, activate, hover, leave)
    );

    // -- Web link providers --

    // Define the web link providers
    const providers = [
      // Load custom addon for URLs with tooltip support.
      {
        matcher: URL_REGEX,
        handler: (event, text, range) =>
          this.urlLinkClick.handle(event, text, range, xterm),
        hover: (event, text, range) => {
          console.debug("CustomLinksAddon: URL link hover", [
            event,
            text,
            range,
          ]);
          const previewUrl = text;
          this.showTooltip(
            event,
            "Click to paste, double click to open link",
            previewUrl,
            range
          );
        },
        leave: (event) => {
          this.hideTooltip();
        },
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
          console.debug("CustomLinksAddon: command/path hover", [
            event,
            text,
            range,
          ]);
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
    this.urlLinkClick.destroy();

    restoreUnderlineStyle(this, this.xterm);
  }
}

module.exports = { CustomLinksAddon };
