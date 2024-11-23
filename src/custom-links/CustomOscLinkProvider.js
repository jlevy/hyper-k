/*
 * Portions adapted from xterm.js OscLinkProvider.ts
 * which is
 * Copyright (c) 2022 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const { LINK_DECORATIONS } = require("../custom-theme/theme-constants");

const isAllowedUrl = (url) => {
  try {
    const parsed = new URL(url);
    const allowed = ["http:", "https:", "ui:"].includes(parsed.protocol);
    if (!allowed) {
      console.debug(
        "CustomOscLinkProvider: not supporting disallowed link",
        url
      );
    }
    return allowed;
  } catch (e) {
    console.debug("CustomOscLinkProvider: not supporting invalid link", url, e);
    return false;
  }
};

class CustomOscLinkProvider {
  constructor(xterm, activate, hover, leave) {
    this._xterm = xterm;
    this._activate = activate;
    this._hover = hover;
    this._leave = leave;
    this._bufferService = xterm._core._bufferService;
    this._oscLinkService = xterm._core._oscLinkService;

    console.log("CustomOscLinkProvider created", this);
  }

  provideLinks(y, callback) {
    const line = this._bufferService.buffer.lines.get(y - 1);
    if (!line) {
      callback(undefined);
      return;
    }

    const result = [];
    const lineLength = line.getTrimmedLength();
    let currentLinkId = -1;
    let currentStart = -1;
    let finishLink = false;

    for (let x = 0; x < lineLength; x++) {
      // Minor optimization, only check for content if there isn't a link in case the link ends with
      // a null cell
      if (currentStart === -1 && !line.hasContent(x)) {
        continue;
      }

      const cell = {};
      line.loadCell(x, cell);

      // Instead of checking cell.hasExtendedAttrs() (which we don't have access to since
      // we haven't imported CellData) just check the extended property.
      if (cell.extended?.urlId) {
        if (currentStart === -1) {
          currentStart = x;
          currentLinkId = cell.extended.urlId;
          continue;
        } else {
          finishLink = cell.extended.urlId !== currentLinkId;
        }
      } else {
        if (currentStart !== -1) {
          finishLink = true;
        }
      }

      if (finishLink || (currentStart !== -1 && x === lineLength - 1)) {
        const text = this._oscLinkService.getLinkData(currentLinkId)?.uri;
        console.debug("CustomOscLinkProvider: found link text", {
          oscLinkService: this._oscLinkService,
          currentLinkId,
          text,
        });
        if (text) {
          // These ranges are 1-based
          const range = {
            start: {
              x: currentStart + 1,
              y,
            },
            end: {
              // Offset end x if it's a link that ends on the last cell in the line
              x: x + (!finishLink && x === lineLength - 1 ? 1 : 0),
              y,
            },
          };

          if (isAllowedUrl(text)) {
            console.debug("CustomOscLinkProvider: found allowed link", {
              text,
            });
            result.push({
              text,
              range,

              activate: (e, text) => this._activate(e, text, range),
              // Set up a custom decoration for hover (since ILinkDecorations only supports
              // underline).
              hover: (e, uri) => {
                this._hover(e, uri, range);
              },
              leave: (e, uri) => {
                this._leave(e, uri, range);
              },
              // Important: these are for hover, not persistent styling.
              // XXX You would think you could control the persistent non-hover styling of links
              // here. But no as of xterm.js v5. OSC links are hard-coded as dashed links.
              decorations: LINK_DECORATIONS,
            });
          }
        }
        finishLink = false;

        // Clear link or start a new link if one starts immediately
        if (cell.extended?.urlId) {
          currentStart = x;
          currentLinkId = cell.extended.urlId;
        } else {
          currentStart = -1;
          currentLinkId = -1;
        }
      }
    }

    // TODO: Handle fetching and returning other link ranges to underline other links with the same
    //       id
    callback(result);
  }
}

module.exports = { CustomOscLinkProvider };
