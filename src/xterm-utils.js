// Get the dimensions of a cell in pixels.
function getCellDimensions(terminal) {
  const core = terminal._core;
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

// Calculate the position of the tooltip based on range of characters
// within the terminal.
function calculateTooltipPosition(terminal, range, cellDimensions) {
  const core = terminal._core;

  // Convert terminal coordinates to pixel positions.
  const startCoords = core.screenElement.getBoundingClientRect();

  // Account for scroll position.
  const scrollOffset = terminal.buffer.active.viewportY;
  const adjustedY = range.start.y - scrollOffset;

  // Calculate position of the top-right corner of the link.
  return {
    x: startCoords.left + range.end.x * cellDimensions.width,
    y: startCoords.top + (adjustedY - 1) * cellDimensions.height,
  };
}

module.exports = { getCellDimensions, calculateTooltipPosition };
