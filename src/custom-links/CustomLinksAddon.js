/**
 * Portions adapted from the xterm.js addon
 * https://github.com/xtermjs/xterm.js/tree/master/addons/addon-web-links
 * which is
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */

const { CustomLinkProvider } = require("./CustomLinkProvider");

class CustomLinksAddon {
  constructor(matchFunction, handler, options = {}) {
    this._matchFunction = matchFunction;
    this._handler = handler;
    this._options = options;

    // Ensure hover and leave are always arrays
    this._options.hover = Array.isArray(options.hover)
      ? options.hover
      : options.hover
      ? [options.hover]
      : [];
    this._options.leave = Array.isArray(options.leave)
      ? options.leave
      : options.leave
      ? [options.leave]
      : [];
  }

  activate(terminal) {
    this._terminal = terminal;
    const options = this._options;
    const filter = options.filter || null;

    const clickHandler = (event, text) => {
      console.log("CustomLinksAddon: clickHandler", text, event);
      this._handler(event, text, this._terminal);
    };

    // Combine default cursor style changes with user-provided callbacks
    const defaultHoverCallback = (event) => {
      event.target.style.cursor = "pointer";
    };
    const defaultLeaveCallback = (event) => {
      event.target.style.cursor = "auto";
    };

    // Always have hover and leave arrays including the default callbacks
    const hoverCallbacks = [defaultHoverCallback, ...options.hover];
    const leaveCallbacks = [defaultLeaveCallback, ...options.leave];

    // Register the link provider with the combined callbacks
    this._linkProvider = this._terminal.registerLinkProvider(
      new CustomLinkProvider(
        this._terminal,
        this._matchFunction,
        filter,
        clickHandler,
        {
          ...options,
          hover: hoverCallbacks,
          leave: leaveCallbacks,
        }
      )
    );
  }

  dispose() {
    if (this._linkProvider) {
      this._linkProvider.dispose();
    }
  }
}

module.exports = { CustomLinksAddon };
