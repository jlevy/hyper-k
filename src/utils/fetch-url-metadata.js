async function fetchUrlMetadata(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    // Helper to get meta content
    const getMeta = (name) => {
      const el = doc.querySelector(
        `meta[name="${name}"], meta[property="og:${name}"]`
      );
      return el ? el.getAttribute("content") : null;
    };

    return {
      title: doc.querySelector("title")?.textContent || getMeta("title"),
      description: getMeta("description"),
      image: getMeta("image"),
      url: url, // Include original URL
    };
  } catch (error) {
    console.error("Failed to fetch URL metadata:", error);
    // Fallback to basic URL info
    const urlObj = new URL(url);
    return {
      title: urlObj.hostname,
      description: url,
      url: url,
    };
  }
}

module.exports = { fetchUrlMetadata };
