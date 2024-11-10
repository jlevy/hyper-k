/**
 * Return the line itself as a match if it's inside a fenced code block, otherwise
 * return no matches.
 *
 * Only works for named fenced blocks that include a language name, such as:
 *
 * ```python
 * print("Hello, world!")
 * ```
 */
function insideMarkdownFenced(line, y, terminal, lang_regex = /^[a-z]+$/) {
  const buf = terminal.buffer.active;
  const maxLines = 500;
  let startLineIndex = y - 1;
  let endLineIndex = y - 1;
  let insideFencedBlock = false;

  // Check upwards for the start of the fenced block.
  for (let i = 0; i < maxLines && startLineIndex >= 0; i++, startLineIndex--) {
    const currentLine = buf
      .getLine(startLineIndex)
      .translateToString(true)
      .trim();
    // The last-appearing fenced block must be a beginning fence, with a language name.
    if (currentLine.startsWith("```")) {
      if (
        currentLine.length > 3 &&
        lang_regex.test(currentLine.slice(3)) &&
        i > 0
      ) {
        insideFencedBlock = true;
      } else {
        insideFencedBlock = false;
      }
      break;
    }
  }

  if (!insideFencedBlock) {
    return [];
  }

  // Check downwards for the end of the fenced block.
  for (
    let i = 0;
    i < maxLines && endLineIndex < buf.length;
    i++, endLineIndex++
  ) {
    const currentLine = buf
      .getLine(endLineIndex)
      .translateToString(true)
      .trim();
    if (currentLine === "```") {
      // Match inside a fenced block is the entire line.
      return [
        {
          matchText: line,
          fullText: line,
          index: 0,
        },
      ];
    }
  }

  return [];
}

module.exports = {
  insideMarkdownFenced,
};
