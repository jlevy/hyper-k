/**
 * Portions adapted from the xterm.js addon
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

// Custom handler to paste text into the terminal.
function pasteText(event, text, terminal) {
  console.log("Paste text to terminal", text);

  terminal.focus();

  // XXX It wasn't clear how it's best to simulate typing text, but this seems to be what we want.
  // You can't use terminal.write() as it won't go into the textarea input. And you can't
  // just write to the textarea. Finally, simulating keypresses is pretty messy. So instead
  // fire the xterm.js event.
  function sendChar(char) {
    terminal._core._onData.fire(char);
  }

  for (let i = 0; i < text.length; i++) {
    sendChar(text[i]);
  }

  // Experimented with a delay to make it look like typing but
  // doesn't seem necessary.
  // let i = 0;
  // function typeNextChar() {
  //   if (i < text.length) {
  //     sendChar(text[i]);
  //     i++;
  //     setTimeout(typeNextChar, 2); // Very short delay.
  //   }
  // }
  // typeNextChar();
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
    const filter = options.filter || null;
    const clickHandler = (event, text) => {
      console.log("CustomLinksAddon: clickHandler", text, event);
      this._handler(event, text, this._terminal);
    };
    this._linkProvider = this._terminal.registerLinkProvider(
      new CustomLinkProvider(
        this._terminal,
        regex,
        filter,
        clickHandler,
        options
      )
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
