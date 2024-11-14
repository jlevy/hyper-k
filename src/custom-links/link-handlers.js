const { isUrl } = require("../regex-constants");

// Custom handler to paste text into the terminal.
function handlePasteText(event, text, range, xterm, linkText) {
  console.log("Paste text to terminal", {
    event,
    text,
    range,
    xterm,
    linkText,
  });

  // Paste the text from the xterm, if this was an OSC link, otherwise
  // paste the text or literal URL content.
  const textToPaste = linkText || text;

  xterm.focus();

  // XXX It wasn't clear how it's best to simulate typing text, but this seems to be what we want.
  // You can't use terminal.write() as it won't go into the textarea input. And you can't
  // just write to the textarea. Finally, simulating keypresses is pretty messy. So instead
  // fire the xterm.js event.
  function sendChar(char) {
    xterm._core._onData.fire(char);
  }

  for (let i = 0; i < textToPaste.length; i++) {
    sendChar(textToPaste[i]);
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

function handleOpenLinkWindow(event, uri, range, xterm, linkText) {
  console.log("handleOpenLinkWindow: Opening UR", {
    uri,
    event,
    range,
    xterm,
    linkText,
  });

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

function handleOpenLink(event, uri, range, xterm, linkText) {
  if (isUrl(uri)) {
    console.log("handleOpenLink: Opening URL", {
      event,
      uri,
      range,
      xterm,
      linkText,
    });

    const { shell } = require("electron");
    shell.openExternal(uri);
  } else {
    console.log("handleOpenLink: Skipping non-URL link", uri);
  }
}

// function defaultActivate(e, uri) {
//   const answer = confirm(
//     `Do you want to navigate to ${uri}?\n\nWARNING: This link could potentially be dangerous`
//   );
//   if (answer) {
//     const newWindow = window.open();
//     if (newWindow) {
//       try {
//         newWindow.opener = null;
//       } catch {
//         // no-op, Electron can throw
//       }
//       newWindow.location.href = uri;
//     } else {
//       console.warn("Opening link blocked as opener could not be cleared");
//     }
//   }
// }

module.exports = {
  handlePasteText,
  handleOpenLinkWindow,
  handleOpenLink,
};
