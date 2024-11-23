/*
 * Portions adapted from xterm.js OscLinkProvider.ts
 * which is
 * Copyright (c) 2022 The xterm.js authors. All rights reserved.
 * @license MIT
 */

const colors = require("../colors");

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
              // Custom overrides that differ from xterm.js.
              // Important: these are for hover, not persistent styling.
              // XXX You would think you could control the persistent non-hover styling of links
              // here. But no as of xterm.js v5. OSC links are hard-coded as dashed links.
              decorations: { underline: false, pointerCursor: true },
              activate: (e, text) => this._activate(e, text, range),
              // Set up a custom decoration for hover (since ILinkDecorations only supports
              // underline).
              hover: (e, text) => {
                // Create decoration
                const buffer = this._xterm.buffer.active;
                const lineIndex =
                  range.start.y - 1 - buffer._buffer.y - buffer._buffer.ybase;
                console.log(
                  "CustomOscLinkProvider: hover creating decoration",
                  {
                    xterm: this._xterm,
                    lineIndex,
                  }
                );
                const marker = this._xterm.registerMarker(lineIndex);
                if (marker) {
                  this._currentDecoration = this._xterm.registerDecoration({
                    marker,
                    layer: "top",
                    width: range.end.x - range.start.x + 1,
                    height: 1,
                    x: range.start.x - 1,
                    backgroundColor: colors.link_hover_bg,
                  });

                  this._xterm.refresh(range.start.y - 1, range.start.y - 1);
                }

                // Call original hover handler
                this._hover(e, text, range);
              },
              leave: (e, text) => {
                // Clean up decoration
                if (this._currentDecoration) {
                  this._currentDecoration.dispose();
                  this._currentDecoration = null;
                }

                // Call original leave handler
                this._leave(e, text, range);
              },
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
