const colors = require("../colors");

const addHighlights = (xterm, highlightRegex, filter) => {
  const buffer = xterm.buffer.active;

  // Clear previous decorations.
  if (xterm.decorations) {
    xterm.decorations.forEach((decoration) => decoration.dispose());
  }
  xterm.decorations = [];

  // Decorate every match based on the regex.
  // TODO: Consider only decorating visible lines.
  for (let lineIndex = 0; lineIndex < buffer.length; lineIndex++) {
    const regex = new RegExp(highlightRegex.source, "gu"); // Clear state.

    const line = buffer.getLine(lineIndex);
    if (!line) continue;
    const lineContent = line.translateToString(true);
    let match;
    while ((match = regex.exec(lineContent)) !== null) {
      if (filter && !filter(lineContent, match)) {
        continue;
      }
      // Highlight first capturing group, if it is present, otherwise the whole match.
      let hl_start, hl_end;
      if (match[1]) {
        hl_start = match.index + match[0].indexOf(match[1]);
        hl_end = hl_start + match[1].length;
      } else {
        hl_start = match.index;
        hl_end = hl_start + match[0].length;
      }

      const marker = xterm.registerMarker(
        lineIndex - buffer._buffer.y - buffer._buffer.ybase
      );

      const decoration = xterm.registerDecoration({
        marker: marker,
        x: hl_start,
        width: hl_end - hl_start,
        backgroundColor: colors.highlight_bg,
      });
      xterm.decorations.push(decoration);
    }
  }

  xterm.refresh(0, buffer.length - 1);

  console.log(
    `addHighlights registered ${xterm.decorations.length} decorations`
  );
};

module.exports = addHighlights;
