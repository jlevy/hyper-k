// Based on regex from WebLinksAddon:
const IMAGE_URL_REGEX =
  /(?:https?|HTTPS?):[/]{2}[^\s"'!*(){}|\\\^<>`]*[^\s"':,.!?{}|\\\^~\[\]`()<>]\.(?:png|jpg|jpeg|gif|webp)/;

const COMMAND_REGEX = /`([^`]+)`/g;

const COMBINED_REGEX = new RegExp(
  `(?:${COMMAND_REGEX.source})|(?:${IMAGE_URL_REGEX.source})`,
  "g"
);

module.exports = { IMAGE_URL_REGEX, COMMAND_REGEX, COMBINED_REGEX };
