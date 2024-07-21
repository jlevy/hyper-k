/**
 * Adapted from the xterm.js addon
 * https://github.com/xtermjs/xterm.js/tree/master/addons/addon-web-links
 * which is
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */

const { URL_REGEX } = require("./constants");
const { CustomLinkProvider } = require("./CustomLinkProvider");

function openLink(event, uri, terminal) {
  const newWindow = window.open();
  if (newWindow) {
    try {
      newWindow.opener = null;
    } catch {
      // no-op, Electron can throw
    }
    newWindow.location.href = uri;
  } else {
    console.warn("Opening link blocked as opener could not be cleared");
  }
}

// Custom handler to type text into the terminal.
function pasteText(event, text, terminal) {
  console.log("Paste text to terminal", text);
  terminal.write(text);
}

class CustomLinksAddon {
  constructor(handler = openLink, options = {}) {
    this._handler = handler;
    this._options = options;
    this._terminal = undefined;
    this._linkProvider = undefined;
  }

  activate(terminal) {
    this._terminal = terminal;
    const options = this._options;
    const regex = options.urlRegex || URL_REGEX;
    const clickHandler = (event, text) => {
      console.log("CustomLinksAddon: clickHandler", text, event);
      this._handler(event, text, this._terminal);
    };
    this._linkProvider = this._terminal.registerLinkProvider(
      new CustomLinkProvider(this._terminal, regex, clickHandler, options)
    );

    console.log("CustomLinksAddon: activated", this);
  }

  dispose() {
    if (this._linkProvider) {
      this._linkProvider.dispose();
    }
  }
}

module.exports = { CustomLinksAddon, openLink, pasteText };
