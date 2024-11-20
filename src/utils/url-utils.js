const isLocalUrl = (url) => {
  return (
    url.startsWith("file://") ||
    url.startsWith("http://localhost") ||
    url.startsWith("http://127.0.0.1")
  );
};

module.exports = { isLocalUrl };
