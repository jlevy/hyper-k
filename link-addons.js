const { CustomLinksAddon, openLink, pasteText } = require("./CustomLinksAddon");
const { URL_REGEX, COMMAND_OR_PATH_REGEX } = require("./constants");
const { notUrlPath } = require("./utils");

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

const linkAddonsDecorateTerm = (Term, { React }) => {
  return class extends React.Component {
    constructor(props, context) {
      super(props, context);
      this._term = null;
      this.onDecorated = this.onDecorated.bind(this);
    }

    onDecorated(term) {
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
      const commandPasteAddon = new CustomLinksAddon(pasteText, {
        filter: notUrlPath,
        urlRegex: COMMAND_OR_PATH_REGEX,
      });
      this._term.term.loadAddon(commandPasteAddon);
      console.log("Loaded commandPastePaddon", commandPasteAddon);

      const webLinksAddon = new CustomLinksAddon(openLink, {
        urlRegex: URL_REGEX,
      });
      this._term.term.loadAddon(webLinksAddon);
      console.log("Loaded webLinksAddon", webLinksAddon);
    }

    render() {
      return React.createElement(Term, {
        ...this.props,
        onDecorated: this.onDecorated,
      });
    }
  };
};

module.exports = { linkAddonsDecorateTerm };
