const KEY_CODE_BACKSPACE = 8;

exports.decorateTerm = (Term, { React, notify }) => {
  console.log("Decorating term", Term);

  return class extends React.Component {
    constructor(props, context) {
      super(props, context);
      this._term = null;
      this.onDecorated = this.onDecorated.bind(this);
      this.handleKeyUp = this.handleKeyUp.bind(this);
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
      console.log("decorated term", term);
      if (term === null) {
        return;
      }

      if (this.props.onDecorated) {
        this.props.onDecorated(term);
      }
      this._term = term;

      this._term.termRef.addEventListener("keyup", this.handleKeyUp, false);
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

IMAGE_URL_REGEX = /https?:\/\/.*\.(png|jpg|jpeg|gif|webp)/;

exports.middleware = (store) => (next) => (action) => {
  if (action.type === "SESSION_ADD_DATA") {
    const { data } = action;

    // console.log("session data", data);

    const match = data.match(IMAGE_URL_REGEX);
    if (match) {
      const imageUrl = match[0];
      console.log("Saw an image URL", imageUrl);

      store.dispatch({
        type: "HOOK_IMAGE",
        url: imageUrl,
      });
    }
  }

  next(action);
};

exports.reduceUI = (state, action) => {
  switch (action.type) {
    case "HOOK_IMAGE":
      console.log("Reduce HOOK_IMAGE", action);
      return state.set("imageViewState", {
        url: action.url,
      });
  }
  return state;
};

exports.mapTermsState = (state, map) =>
  Object.assign(map, {
    imageViewState: state.ui.imageViewState,
  });

const passProps = (uid, parentProps, props) =>
  Object.assign(props, {
    imageViewState: parentProps.imageViewState,
  });

exports.getTermGroupProps = passProps;
exports.getTermProps = passProps;

console.log("hyper-easy loaded");
