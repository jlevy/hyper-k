const COLOR_CODE_BG = "#7b7b15";

const KEY_CODE_BACKSPACE = 8;

const COMMAND_REGEX = /`([^`]+)`/g;

const IMAGE_URL_REGEX = /https?:\/\/.*\.(png|jpg|jpeg|gif|webp)/;

exports.decorateTerm = (Term, { React, notify }) => {
  console.log("Decorating term", Term);

  return class extends React.Component {
    constructor(props, context) {
      super(props, context);
      this._term = null;
      this.onDecorated = this.onDecorated.bind(this);
      this.handleKeyUp = this.handleKeyUp.bind(this);
      this.addDecorations = this.addDecorations.bind(this);
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
          this._term.term.offRender(this.addDecorations);
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

      this.addDecorations();

      // Observe changes in the terminal content.
      console.log("Adding onRender listener", this._term.term);
      if (this._term.term) {
        this._term.term.onRender(this.addDecorations);
      } else {
        console.error("No term to attach onRender listener to", this);
      }
    }

    handleKeyUp(event) {
      // Hide image on keypress.
      const { keyCode } = event;
      if (keyCode === KEY_CODE_BACKSPACE) {
        this.setImageView(null);
      }
    }

    addDecorations() {
      console.log("Adding decorations", this);

      if (!this?._term?.term) {
        return;
      }

      const term = this._term.term;
      const buffer = term.buffer.active;
      const decorationService = term._core._decorationService;

      console.log("Buffer", buffer);

      // Clear previous decorations.
      if (this.decorations) {
        this.decorations.forEach((decoration) => decoration.dispose());
      }
      this.decorations = [];

      // Decorate every command based on the regex.
      for (let lineIndex = 0; lineIndex < buffer.length; lineIndex++) {
        const line = buffer.getLine(lineIndex);
        if (!line) continue;
        const lineContent = line.translateToString(true);
        let match;
        while ((match = COMMAND_REGEX.exec(lineContent)) !== null) {
          const start = match.index;
          const end = start + match[0].length;

          const marker = term.registerMarker(
            lineIndex - buffer._buffer.y - buffer._buffer.ybase
          );

          for (let i = start + 1; i < end - 1; i++) {
            const cell = line.getCell(i);
            if (!cell) continue;

            const decoration = decorationService.registerDecoration({
              marker: marker,
              x: i,
              width: 1,
              backgroundColor: COLOR_CODE_BG,
            });
            this.decorations.push(decoration);
          }
        }
      }

      term.refresh(0, buffer.length - 1);
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

exports.middleware = (store) => (next) => (action) => {
  if (action.type === "SESSION_ADD_DATA") {
    const { data } = action;

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
