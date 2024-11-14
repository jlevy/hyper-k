/*
 * Portions adapted from xterm.js OscLinkService.ts
 * which is
 * Copyright (c) 2022 The xterm.js authors. All rights reserved.
 * @license MIT
 */

class CustomOscLinkService {
  constructor(xterm) {
    this._terminal = xterm;
    this._bufferService = xterm._core._bufferService;
    this.serviceBrand = null;
    this._nextId = 1;

    /**
     * A map of the link key to link entry. This is used to add additional lines to links with ids.
     */
    this._entriesWithId = new Map();

    /**
     * A map of the link id to the link entry. The "link id" (number) which is the numberic
     * representation of a unique link should not be confused with "id" (string) which comes in with
     * `id=` in the OSC link's properties.
     */
    this._dataByLinkId = new Map();

    console.log("CustomOscLinkService created", this);
  }

  registerLink(data) {
    console.log("CustomOscLinkService.registerLink called with data:", data);

    const buffer = this._bufferService.buffer;

    // Links with no id will only ever be registered a single time
    if (data.id === undefined) {
      const marker = buffer.addMarker(buffer.ybase + buffer.y);
      const entry = {
        data,
        id: this._nextId++,
        lines: [marker],
      };
      console.log("Registering link without id:", entry);
      marker.onDispose(() => this._removeMarkerFromLink(entry, marker));
      this._dataByLinkId.set(entry.id, entry);
      return entry.id;
    }

    // Add the line to the link if it already exists
    const key = this._getEntryIdKey(data);
    const match = this._entriesWithId.get(key);
    if (match) {
      console.log("Found existing link:", match);
      this.addLineToLink(match.id, buffer.ybase + buffer.y);
      return match.id;
    }

    // Create the link
    const marker = buffer.addMarker(buffer.ybase + buffer.y);
    const entry = {
      id: this._nextId++,
      key: this._getEntryIdKey(data),
      data,
      lines: [marker],
    };
    console.log("Registering new link with id:", entry);

    marker.onDispose(() => this._removeMarkerFromLink(entry, marker));
    this._entriesWithId.set(entry.key, entry);
    this._dataByLinkId.set(entry.id, entry);
    return entry.id;
  }

  addLineToLink(linkId, y) {
    const entry = this._dataByLinkId.get(linkId);
    if (!entry) {
      return;
    }
    if (entry.lines.every((e) => e.line !== y)) {
      const marker = this._bufferService.buffer.addMarker(y);
      entry.lines.push(marker);
      marker.onDispose(() => this._removeMarkerFromLink(entry, marker));
    }
  }

  getLinkData(linkId) {
    const entry = this._dataByLinkId.get(linkId);
    console.log("getLinkData called for id:", linkId, "found entry:", entry);
    return entry?.data;
  }

  _getEntryIdKey(linkData) {
    return `${linkData.id};;${linkData.uri}`;
  }

  _removeMarkerFromLink(entry, marker) {
    const index = entry.lines.indexOf(marker);
    if (index === -1) {
      return;
    }
    entry.lines.splice(index, 1);
    if (entry.lines.length === 0) {
      if (entry.data.id !== undefined) {
        this._entriesWithId.delete(entry.key);
      }
      this._dataByLinkId.delete(entry.id);
    }
  }
}

module.exports = { CustomOscLinkService };
