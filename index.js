const {
  imageDecorateTerm,
  imageMiddleware,
  imageReducer,
  imageTermProps,
  imageMapTermsState,
} = require("./image-view");
const addHighlights = require("./add-highlights");
const { CustomLinksAddon, openLink, pasteText } = require("./CustomLinksAddon");
const { URL_REGEX, COMMAND_OR_PATH_REGEX } = require("./constants");

// XXX: Hack to use our own WebLinksAddon, not the one preloaded from Hyper.
function removeOldAddons(term) {
  console.log("Current addons", term._addonManager._addons);
  term._addonManager._addons.forEach((addon) => {
    if (addon?.instance?._useLinkProvider !== undefined) {
      console.log("Removing old WebLinksAddon instance", addon);
      addon.instance.dispose();
    }
  });
  console.log("Updated addons", term._addonManager._addons);
}

// Return true if the match is not a portion of a URL path.
const notUrlPath = (line, pathMatch) => {
  if (!pathMatch) {
    return true;
  }
  const startIndex = pathMatch.index;
  // Negative lookbehind to confirmt he preceding text is not the start of a URL.
  const precedingText = line.substring(0, startIndex);
  const urlRegex = /(?:https?:\/\/?)$/;

  return !urlRegex.test(precedingText);
};

exports.decorateTerm = (Term, { React, notify }) => {
  console.log("Decorating term", Term);

  const TermWithHighlights = class extends React.Component {
    constructor(props, context) {
      super(props, context);
      this._term = null;
      this.onDecorated = this.onDecorated.bind(this);
    }

    componentWillUnmount() {
      if (this._term) {
        if (this._term.term) {
          this._term.term.offRender(() => addHighlights(this._term.term));
        }
      }
    }

    onDecorated(term) {
      console.log("onDecorated for terminal", term);
      if (term === null) {
        return;
      }
      if (this.props.onDecorated) {
        this.props.onDecorated(term);
      }
      this._term = term;

      // Remove the old web links addon.
      removeOldAddons(this._term.term);

      // Load custom addons for links and click-to-paste.
      const commandPastePaddon = new CustomLinksAddon(pasteText, {
        filter: notUrlPath,
        urlRegex: COMMAND_OR_PATH_REGEX,
      });
      this._term.term.loadAddon(commandPastePaddon);
      console.log("Loaded commandPastePaddon", commandPastePaddon);

      const webLinksAddon = new CustomLinksAddon(openLink, {
        urlRegex: URL_REGEX,
      });
      this._term.term.loadAddon(webLinksAddon);
      console.log("Loaded webLinksAddon", webLinksAddon);

      // Add highlights based on regexes, now and after changes to terminal content.
      // (This approach seems too slow. Disabling for now.)
      // addHighlights(this._term.term, COMMAND_OR_PATH_REGEX, notUrlPath);
      // this._term.term.onRender(() =>
      //   addHighlights(this._term.term, COMMAND_OR_PATH_REGEX, notUrlPath)
      // );
    }

    render() {
      return React.createElement(Term, {
        ...this.props,
        onDecorated: this.onDecorated,
      });
    }
  };

  // Decorate term for image view.
  return imageDecorateTerm(TermWithHighlights, { React, notify });
};

exports.middleware = imageMiddleware;
exports.reduceUI = imageReducer;
exports.mapTermsState = imageMapTermsState;
exports.getTermGroupProps = imageTermProps;
exports.getTermProps = imageTermProps;

console.log("hyper-easy loaded");
