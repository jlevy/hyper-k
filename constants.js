// Based on regex from xterm.js's WebLinksAddon:
//
// consider everthing starting with http:// or https://
// up to first whitespace, `"` or `'` as url
// NOTE: The repeated end clause is needed to not match a dangling `:`
// resembling the old (...)*([^:"\'\\s]) final path clause
// additionally exclude early + final:
// - unsafe from rfc3986: !*'()
// - unsafe chars from rfc1738: {}|\^~[]` (minus [] as we need them for ipv6 adresses, also allow ~)
// also exclude as finals:
// - final interpunction like ,.!?
// - any sort of brackets <>()[]{} (not spec conform, but often used to enclose urls)
// - unsafe chars from rfc1738: {}|\^~[]`
//
// Note the first capturing group, if present, is what we pass to handlers.
// So use non-capturing groups (?:...) if necessary.
const URL_REGEX =
  /(?:https?|HTTPS?):[/]{2}[^\s"'!*(){}|\\\^<>`]*[^\s"':,.!?{}|\\\^~\[\]`()<>]/;

// URLs with an explicit image file extension.
const IMAGE_URL_REGEX =
  /(?:https?|HTTPS?):[/]{2}[^\s"'!*(){}|\\\^<>`]*[^\s"':,.!?{}|\\\^~\[\]`()<>]\.(?:png|jpg|jpeg|gif|webp)/;

// Code commands or excerpt like `ls`.
const COMMAND_REGEX = /`([^`]+)`/;

// File paths with alphanum files and paths (no spaces) and the most common file extensions.
// Don't match paths with //. Lookahead at end included so we never match files with .txt. or
// other externsions in the middle of a filename.
const FILE_PATH_REGEX =
  /(?:(?!\/{2})[/\p{L}\p{N}_.@$%&~+-])+[.](?:txt|htm|html|json|js|css|md|py|yml|yaml|toml|csv|pdf|docx|xls|png|jpg|jpeg|gif|webp)(?=$|[^/\p{L}\p{N}_.@$%&~+-])/u;

const COMMAND_OR_PATH_REGEX = new RegExp(
  `(?:${COMMAND_REGEX.source}|${FILE_PATH_REGEX.source})`,
  "u"
);

module.exports = {
  URL_REGEX,
  IMAGE_URL_REGEX,
  COMMAND_REGEX,
  FILE_PATH_REGEX,
  COMMAND_OR_PATH_REGEX,
};
