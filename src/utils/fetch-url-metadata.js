async function extractMetadata(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Helper to get meta content, checking both standard and OpenGraph tags
  const getMeta = (name) => {
    const selectors = [
      `meta[name="${name}"]`,
      `meta[property="og:${name}"]`,
      `meta[name="twitter:${name}"]`,
    ];
    const el = doc.querySelector(selectors.join(", "));
    return el ? el.getAttribute("content") : null;
  };

  return {
    title: doc.querySelector("title")?.textContent || getMeta("title"),
    description: getMeta("description"),
    image: getMeta("image"),
  };
}

async function fetchUrlMetadata(url) {
  try {
    // First try a HEAD request to check content type
    const headResponse = await fetch(url, { method: "HEAD" });
    const contentType = headResponse.headers.get("Content-Type");

    // If it's an image, return early with just the content type
    if (contentType && contentType.startsWith("image/")) {
      console.log("Image detected", contentType);
      return {
        contentType,
        url,
        title: null,
        description: null,
      };
    }

    // For non-image content, proceed with HTML parsing
    const response = await fetch(url);
    const contentTypeFromGet = response.headers.get("Content-Type");

    // If content is not HTML, return basic info with content type
    if (!contentTypeFromGet?.includes("text/html")) {
      console.log("Not HTML", contentTypeFromGet);
      return {
        contentType: contentTypeFromGet,
        url,
        title: new URL(url).hostname,
        description: null,
      };
    }

    // Parse HTML content
    const text = await response.text();
    const metadata = await extractMetadata(text);

    return {
      ...metadata,
      contentType: contentTypeFromGet,
      url,
    };
  } catch (error) {
    console.error("fetch-url-metadata error:", error);
    // Fallback to basic URL info
    const urlObj = new URL(url);
    return {
      title: urlObj.hostname,
      description: url,
      url: url,
      contentType: null,
      error: error.message,
    };
  }
}

module.exports = { fetchUrlMetadata };
