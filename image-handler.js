const IMAGE_URL_REGEX = /https?:\/\/.*\.(png|jpg|jpeg|gif|webp)/;

const imageMiddleware = (store) => (next) => (action) => {
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

const imageTermProps = (uid, parentProps, props) =>
  Object.assign(props, {
    imageViewState: parentProps.imageViewState,
  });

const mapTermsStateToImageProps = (state, map) =>
  Object.assign(map, {
    imageViewState: state.ui.imageViewState,
  });

module.exports = {
  imageMiddleware,
  imageReducer,
  imageTermProps,
  mapTermsStateToImageProps,
};
