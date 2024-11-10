const addHighlights = require("./add-highlight-decorations");
const { COMMAND_OR_PATH_REGEX } = require("../regex-constants");
const { notUrlPath } = require("../regex-constants");

const decorateTerm = (Term, { React }) => {
  return class extends React.Component {
    constructor(props, context) {
      super(props, context);
      this._term = null;
      this.onDecorated = this.onDecorated.bind(this);
    }

    componentWillUnmount() {
      if (this._term && this._term.term) {
        this._term.term.offRender(() => addHighlights(this._term.term));
      }
    }

    onDecorated(term) {
      if (term === null) {
        return;
      }
      if (this.props.onDecorated) {
        this.props.onDecorated(term);
      }
      this._term = term;

      // Add highlights based on regexes, now and after changes to terminal content.
      addHighlights(this._term.term, COMMAND_OR_PATH_REGEX, notUrlPath);
      this._term.term.onRender(() =>
        addHighlights(this._term.term, COMMAND_OR_PATH_REGEX, notUrlPath)
      );
    }

    render() {
      return React.createElement(Term, {
        ...this.props,
        onDecorated: this.onDecorated,
      });
    }
  };
};

module.exports = { decorateTerm };
