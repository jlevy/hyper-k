const { COMBINED_REGEX } = require("./constants");

const HIGHLIGHT_BG = "#7b7b15";

const addHighlights = (term) => {
  const buffer = term.buffer.active;
  const decorationService = term._core._decorationService;

  // Clear previous decorations.
  if (term.decorations) {
    term.decorations.forEach((decoration) => decoration.dispose());
  }
  term.decorations = [];

  // Decorate every match based on the regex.
  for (let lineIndex = 0; lineIndex < buffer.length; lineIndex++) {
    const line = buffer.getLine(lineIndex);
    if (!line) continue;
    const lineContent = line.translateToString(true);
    let match;
    while ((match = COMBINED_REGEX.exec(lineContent)) !== null) {
      // Highlight first capturing group, if it is present, otherwise the whole match.
      let hl_start, hl_end;
      if (match[1]) {
        hl_start = match.index + match[0].indexOf(match[1]);
        hl_end = hl_start + match[1].length;
      } else {
        hl_start = match.index;
        hl_end = hl_start + match[0].length;
      }

      const marker = term.registerMarker(
        lineIndex - buffer._buffer.y - buffer._buffer.ybase
      );

      const decoration = decorationService.registerDecoration({
        marker: marker,
        x: hl_start,
        width: hl_end - hl_start,
        backgroundColor: HIGHLIGHT_BG,
      });
      term.decorations.push(decoration);
    }
  }

  term.refresh(0, buffer.length - 1);

  console.log(
    `addHighlights inserted ${term.decorations.length} decorations on terminal`,
    term
  );
};

module.exports = addHighlights;
