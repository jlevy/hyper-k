const isLocalUrl = (url) => {
  return (
    url.startsWith("file://") ||
    url.startsWith("http://localhost") ||
    url.startsWith("http://127.0.0.1")
  );
};

const abbreviateUrl = (url, maxLength = 60) => {
  return url.length > maxLength ? url.slice(0, maxLength - 1) + "…" : url;
};

module.exports = { isLocalUrl, abbreviateUrl };
