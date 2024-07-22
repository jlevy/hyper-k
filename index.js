const {
  imageDecorateTerm,
  imageMiddleware,
  imageReducer,
  imageTermProps,
  imageMapTermsState,
} = require("./image-handler");
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
      addHighlights(this._term.term, COMMAND_OR_PATH_REGEX);
      this._term.term.onRender(() =>
        addHighlights(this._term.term, COMMAND_OR_PATH_REGEX)
      );
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
