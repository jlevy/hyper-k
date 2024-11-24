/**
 * Helper to compute relative font sizes.
 * Example:
 *     getRelativeFontSize("16px", 0.8) => "12.8px"
 */
const getRelativeFontSize = (baseFontSize, factor) => {
  // Extract the numeric value and unit
  const match = baseFontSize.match(/^(\d+\.?\d*)(\D+)$/);
  if (!match) return baseFontSize;

  const [, size, unit] = match;
  return `${parseFloat(size) * factor}${unit}`;
};

const smallFont = (fontSize) => getRelativeFontSize(fontSize, 0.9);
const smallerFont = (fontSize) => getRelativeFontSize(fontSize, 0.8);
const tinyFont = (fontSize) => getRelativeFontSize(fontSize, 0.7);

module.exports = {
  getRelativeFontSize,
  smallFont,
  smallerFont,
  tinyFont,
};
