const {
  imageMiddleware,
  imageReducer,
  imageTermProps,
  mapTermsStateToImageProps,
} = require("./image-handler");
const addCodeHighlights = require("./code-highlighter");

const KEY_CODE_BACKSPACE = 8;

exports.decorateTerm = (Term, { React, notify }) => {
  console.log("Decorating term", Term);

  return class extends React.Component {
    constructor(props, context) {
      super(props, context);
      this._term = null;
      this.onDecorated = this.onDecorated.bind(this);
      this.handleKeyUp = this.handleKeyUp.bind(this);
      this.setImageView = this.setImageView.bind(this);
    }

    componentDidUpdate(prevProps) {
      if (prevProps.imageViewState !== this.props.imageViewState) {
        const { url } = this.props.imageViewState || {};
        this.setImageView(url);
      }
    }

    componentWillUnmount() {
      if (this._term) {
        this._term.termRef.removeEventListener(
          "keyup",
          this.handleKeyUp,
          false
        );
        if (this._term.term) {
          this._term.term.offRender(() => addCodeHighlights(this._term.term));
        }
      }
    }

    onDecorated(term) {
      console.log("onDecorated", term);
      if (term === null) {
        return;
      }
      if (this.props.onDecorated) {
        this.props.onDecorated(term);
      }
      this._term = term;

      this._term.termRef.addEventListener("keyup", this.handleKeyUp, false);
      addCodeHighlights(this._term.term);

      // Observe changes in the terminal content.
      console.log("Adding onRender listener", this._term.term);
      this._term.term.onRender(() => addCodeHighlights(this._term.term));
    }

    handleKeyUp(event) {
      // Hide image on keypress.
      const { keyCode } = event;
      if (keyCode === KEY_CODE_BACKSPACE) {
        this.setImageView(null);
      }
    }

    createImageView() {
      if (!this.imageView) {
        this.imageView = React.createElement("img", {
          style: {
            position: "absolute",
            top: 0,
            right: 0,
            height: "auto",
            maxWidth: "35%",
            maxHeight: "35%",
            display: "none",
          },
          src: null,
          id: "image-view",
        });
      }
      return this.imageView;
    }

    setImageView(imageUrl) {
      let imageView = document.getElementById("image-view");
      if (!imageView) {
        return;
      }
      if (imageUrl) {
        imageView.style.display = "block";
        imageView.src = imageUrl;
      } else {
        imageView.style.display = "none";
        imageView.src = null;
      }
    }

    render() {
      console.log("Rendering term", this.props);

      return React.createElement(
        "div",
        {
          style: {
            width: "100%",
            height: "100%",
          },
        },
        [
          React.createElement(
            Term,
            Object.assign({}, this.props, {
              onDecorated: this.onDecorated,
            })
          ),
          this.createImageView(),
        ]
      );
    }
  };
};

exports.middleware = imageMiddleware;
exports.reduceUI = imageReducer;
exports.mapTermsState = mapTermsStateToImageProps;
exports.getTermGroupProps = imageTermProps;
exports.getTermProps = imageTermProps;

console.log("hyper-easy loaded");
