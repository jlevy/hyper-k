const ExtFlags = {
  /**
   * bit 27..32 (upper 3 unused)
   */
  UNDERLINE_STYLE: 0x1c000000,
};

const UnderlineStyle = {
  NONE: 0,
  SINGLE: 1,
  DOUBLE: 2,
  CURLY: 3,
  DOTTED: 4,
  DASHED: 5,
};

/**
 * Monkey-patch ExtendedAttrs
 *
 * XXX Okay this is ugly but xterm.js hard-codes the underline style for OSC links.
 * https://github.com/xtermjs/xterm.js/blob/5.3.0/src/common/buffer/AttributeData.ts#L149-L155
 * We just hotfix it here.
 */
function hotfixUnderlineStyle(addon, xterm) {
  try {
    tryHotfix(addon, xterm);
  } catch (error) {
    console.error(
      "Error hotfixing underline style, maybe use Hyper v4?",
      error
    );
  }
}

function tryHotfix(addon, xterm) {
  // Get the prototype of ExtendedAttrs.
  const extendedAttrsPrototype = Object.getPrototypeOf(
    xterm._core._inputHandler._curAttrData.extended
  );

  if (!xterm._core?._inputHandler?._curAttrData?.extended) {
    console.error("Cannot access required xterm.js internals");
    return;
  }

  if (!extendedAttrsPrototype) {
    console.error("Cannot access ExtendedAttrs prototype");
    return;
  }

  // Redefine the underlineStyle getter to remove the forced DASHED style.
  Object.defineProperty(extendedAttrsPrototype, "underlineStyle", {
    get: function () {
      console.log("ExtendedAttrs.underlineStyle getter", this);
      // Instead of forcing UnderlineStyle.DASHED when _urlId is set,
      // use the style specified in _ext
      return (this._ext & ExtFlags.UNDERLINE_STYLE) >> 26;
    },
    set: function (value) {
      this._ext &= ~ExtFlags.UNDERLINE_STYLE;
      this._ext |= (value << 26) & ExtFlags.UNDERLINE_STYLE;
    },
  });

  const propertyDescriptor = Object.getOwnPropertyDescriptor(
    extendedAttrsPrototype,
    "underlineStyle"
  );
  addon._originalUnderlineStyleProp = propertyDescriptor;

  Object.defineProperty(extendedAttrsPrototype, "underlineStyle", {
    get: function () {
      // Removing hard-coded link style.
      // if (this._urlId) {
      //   return UnderlineStyle.DASHED;
      // }
      return (this._ext & ExtFlags.UNDERLINE_STYLE) >> 26;
    },
    set: addon._originalUnderlineStyleProp.set, // Use original setter
  });

  console.log("xterm-underline-hotfix: patched ExtendedAttrs.underlineStyle");
}

// Restore the original underlineStyle getter
function restoreUnderlineStyle(addon, xterm) {
  if (addon._originalUnderlineStyleProp) {
    const extendedAttrsPrototype = Object.getPrototypeOf(
      xterm._core._inputHandler._curAttrData.extended
    );
    Object.defineProperty(extendedAttrsPrototype, "underlineStyle", {
      get: addon._originalUnderlineStyleProp.get,
      set: addon._originalUnderlineStyleProp.set,
    });
  }
}

module.exports = { hotfixUnderlineStyle, restoreUnderlineStyle };
