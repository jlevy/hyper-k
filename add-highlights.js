const HIGHLIGHT_BG = "#2f3f3c";

const addHighlights = (term, highlightRegex, filter) => {
  const buffer = term.buffer.active;
  const decorationService = term._core._decorationService;

  // Clear previous decorations.
  if (term.decorations) {
    term.decorations.forEach((decoration) => decoration.dispose());
  }
  term.decorations = [];

  // Decorate every match based on the regex.
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
