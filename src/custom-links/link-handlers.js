// Custom handler to paste text into the terminal.
function handlePasteText(event, text, terminal) {
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

  // Experimented with a delay to make it look like typing but doesn't seem necessary.
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

function handleOpenLinkWindow(event, uri, terminal) {
  console.log("Opening link in new window", uri, event);
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

function handleOpenLink(event, uri) {
  console.log("Opening link externally", uri);
  const { shell } = require("electron");
  shell.openExternal(uri);
}

module.exports = {
  handlePasteText,
  handleOpenLinkWindow,
  handleOpenLink,
};
