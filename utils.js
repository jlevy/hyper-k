const notUrlPath = (line, pathMatch) => {
  if (!pathMatch) {
    return true;
  }
  const startIndex = pathMatch.index;
  // Negative lookbehind to confirm the preceding text is not the start of a URL.
  const precedingText = line.substring(0, startIndex);
  const urlRegex = /(?:https?:\/\/?)$/;

  return !urlRegex.test(precedingText);
};

exports.notUrlPath = notUrlPath;
