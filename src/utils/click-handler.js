/**
 * Simple click handler.
 * This is helpful because we can't use use-gesture on the xterm.js canvas,
 * which doesn't have DOM elements to bind to.
 * Passes all args directly to the callbacks.
 */
class ClickHandler {
  constructor(singleClickCallback, doubleClickCallback, delay = 200) {
    this.singleClickCallback = singleClickCallback;
    this.doubleClickCallback = doubleClickCallback;
    this.delay = delay;
    this.lastClickTime = null;
    this.singleClickTimeout = null;
  }

  handle(...args) {
    const clickTime = new Date().getTime();

    if (this.lastClickTime && clickTime - this.lastClickTime < this.delay) {
      // Double-click detected
      if (this.singleClickTimeout) {
        clearTimeout(this.singleClickTimeout);
        this.singleClickTimeout = null;
      }
      this.doubleClickCallback(...args);
    } else {
      // Possible single click; delay action to check for double-click
      this.singleClickTimeout = setTimeout(() => {
        this.singleClickCallback(...args);
        this.singleClickTimeout = null;
      }, this.delay);
    }

    this.lastClickTime = clickTime;
  }

  destroy() {
    if (this.singleClickTimeout) {
      clearTimeout(this.singleClickTimeout);
      this.singleClickTimeout = null;
    }
    this.lastClickTime = null;
  }
}

module.exports = { ClickHandler };
