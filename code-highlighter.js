const COLOR_CODE_BG = "#7b7b15";
const COMMAND_REGEX = /`([^`]+)`/g;

const addCodeHighlights = (term) => {
  console.log("Adding decorations", term);

  const buffer = term.buffer.active;
  const decorationService = term._core._decorationService;

  console.log("Buffer", buffer);

  // Clear previous decorations.
  if (term.decorations) {
    term.decorations.forEach((decoration) => decoration.dispose());
  }
  term.decorations = [];

  // Decorate every command based on the regex.
  for (let lineIndex = 0; lineIndex < buffer.length; lineIndex++) {
    const line = buffer.getLine(lineIndex);
    if (!line) continue;
    const lineContent = line.translateToString(true);
    let match;
    while ((match = COMMAND_REGEX.exec(lineContent)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      const marker = term.registerMarker(
        lineIndex - buffer._buffer.y - buffer._buffer.ybase
      );

      for (let i = start + 1; i < end - 1; i++) {
        const cell = line.getCell(i);
        if (!cell) continue;

        const decoration = decorationService.registerDecoration({
          marker: marker,
          x: i,
          width: 1,
          backgroundColor: COLOR_CODE_BG,
        });
        term.decorations.push(decoration);
      }
    }
  }

  term.refresh(0, buffer.length - 1);
};

module.exports = addCodeHighlights;
