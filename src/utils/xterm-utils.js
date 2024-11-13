/**
 * Get text from the xterm.js buffer, with trimming of whitespace.
 */
function getTextInRange(xterm, range) {
  const buffer = xterm.buffer.active;
  const { start, end } = range;
  let text = "";

  // Adjust for zero-based indexing
  for (let y = start.y - 1; y <= end.y - 1; y++) {
    const line = buffer.getLine(y);
    if (!line) continue;

    // Adjust column indices for zero-based indexing
    const startCol = y === start.y - 1 ? start.x - 1 : 0;
    const endCol = y === end.y - 1 ? end.x : line.length;

    const lineText = line.translateToString(false, startCol, endCol).trim();
    text += lineText;

    if (y < end.y - 1) {
      text += "\n";
    }
  }

  return text;
}

/**
 * Dimensions of the xterm.js terminal cell in pixels.
 */
function getCellDimensions(xterm) {
  const core = xterm._core;
  // xterm.js v4 vs v5 have different places for this.
  return {
    width:
      core._renderService.dimensions.actualCellWidth ||
      core._renderService.dimensions.css.cell.width,
    height:
      core._renderService.dimensions.actualCellHeight ||
      core._renderService.dimensions.css.cell.height,
  };
}

/**
 * Calculate the position of the tooltip based on range of characters
 * within the terminal.
 */
function calculateTooltipPosition(xterm, range, cellDimensions) {
  const core = xterm._core;

  // Convert terminal coordinates to pixel positions.
  const startCoords = core.screenElement.getBoundingClientRect();

  // Account for scroll position.
  const scrollOffset = xterm.buffer.active.viewportY;
  const adjustedY = range.start.y - scrollOffset;

  // Calculate position of the top-right corner of the link.
  return {
    x: startCoords.left + range.end.x * cellDimensions.width,
    y: startCoords.top + (adjustedY - 1) * cellDimensions.height,
  };
}

module.exports = {
  getTextInRange,
  getCellDimensions,
  calculateTooltipPosition,
};
