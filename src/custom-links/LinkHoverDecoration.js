const colors = require("../colors");

class LinkHoverDecoration {
  constructor(xterm) {
    this._xterm = xterm;
    this._currentDecoration = null;
  }

  create(range) {
    const buffer = this._xterm.buffer.active;
    const lineIndex =
      range.start.y - 1 - buffer._buffer.y - buffer._buffer.ybase;
    console.log("CustomOscLinkProvider: hover creating decoration", {
      xterm: this._xterm,
      lineIndex,
    });
    const marker = this._xterm.registerMarker(lineIndex);
    if (marker) {
      this._currentDecoration = this._xterm.registerDecoration({
        marker,
        layer: "top",
        width: range.end.x - range.start.x + 1,
        height: 1,
        x: range.start.x - 1,
        backgroundColor: colors.link_hover_bg,
        foregroundColor: colors.input,
      });

      this._xterm.refresh(range.start.y - 1, range.start.y - 1);
    }
  }

  dispose() {
    if (this._currentDecoration) {
      this._currentDecoration.dispose();
      this._currentDecoration = null;
    }
  }
}

module.exports = { LinkHoverDecoration };
