const { IMAGE_URL_REGEX } = require("./constants");

const KEY_CODE_BACKSPACE = 8;
const KEY_CODE_ESCAPE = 27;

const imageDecorateTerm = (Term, { React }) => {
  console.log("Decorating term for image view", Term);

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
      }
    }

    onDecorated(term) {
      console.log("onDecorated for image view", term);
      if (term === null) {
        return;
      }
      if (this.props.onDecorated) {
        this.props.onDecorated(term);
      }
      this._term = term;

      // Key listener.
      this._term.termRef.addEventListener("keyup", this.handleKeyUp, false);
    }

    handleKeyUp(event) {
      // Hide image on keypress.
      const { keyCode } = event;
      if (keyCode === KEY_CODE_BACKSPACE || keyCode === KEY_CODE_ESCAPE) {
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
            // Fade in/out effect:
            opacity: 0,
            transition: "opacity 0.4s ease-in-out",
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
        setTimeout(() => {
          imageView.style.opacity = 1; // Fade in
        }, 0);
        imageView.src = imageUrl;
      } else {
        imageView.style.opacity = 0;
        setTimeout(() => {
          imageView.style.display = "none";
        }, 400); // Match the duration of the opacity transition.
      }
    }

    render() {
      console.log("Rendering term with image view", this.props);

      return React.createElement(
        "div",
        {
          style: {
            width: "100%",
            height: "100%",
          },
        },
        [
          React.createElement(Term, {
            ...this.props,
            onDecorated: this.onDecorated,
          }),
          this.createImageView(),
        ]
      );
    }
  };
};

const imageMiddleware = (store) => (next) => (action) => {
  if (action.type === "SESSION_ADD_DATA") {
    const { data } = action;
    const match = data.match(new RegExp(IMAGE_URL_REGEX, "u"));
    if (match) {
      const imageUrl = match[0];
      console.log("image-handler: Loading image URL", imageUrl);

      store.dispatch({
        type: "HOOK_IMAGE",
        url: imageUrl,
      });
    }
  }

  next(action);
};

const imageReducer = (state, action) => {
  switch (action.type) {
    case "HOOK_IMAGE":
      console.log("Reduce HOOK_IMAGE", action);
      return state.set("imageViewState", {
        url: action.url,
      });
  }
  return state;
};

const imageTermProps = (uid, parentProps, props) => ({
  ...props,
  imageViewState: parentProps.imageViewState,
});

const imageMapTermsState = (state, map) => ({
  ...map,
  imageViewState: state.ui.imageViewState,
});

module.exports = {
  imageDecorateTerm,
  imageMiddleware,
  imageReducer,
  imageTermProps,
  imageMapTermsState,
};
