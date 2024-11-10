const { decorateConfig: themeDecorateConfig } = require("./custom-theme/theme");
const {
  decorateTerm: imageDecorateTerm,
  middleware: imageMiddleware,
  reducer: imageReducer,
  getTermProps: imageGetTermProps,
  mapTermsState: imageMapTermsState,
} = require("./custom-image-view/image-view");
const {
  decorateTerm: linkAddonsDecorateTerm,
} = require("./custom-links/link-addons");
const {
  decorateTerm: highlightsDecorateTerm,
} = require("./custom-highlights/highlights");

exports.decorateTerm = (Term, { React, notify }) => {
  console.log("Decorating term", Term);

  let DecoratedTerm = Term;

  // Apply decorations in sequence.
  DecoratedTerm = linkAddonsDecorateTerm(DecoratedTerm, { React });

  // Highlights is kind of slow and may not be necessary. Disable for now.
  // DecoratedTerm = highlightsDecorateTerm(DecoratedTerm, { React });

  DecoratedTerm = imageDecorateTerm(DecoratedTerm, { React });

  return DecoratedTerm;
};

exports.middleware = imageMiddleware;
exports.reduceUI = imageReducer;
exports.mapTermsState = imageMapTermsState;
exports.getTermGroupProps = imageGetTermProps;
exports.getTermProps = imageGetTermProps;

exports.decorateConfig = themeDecorateConfig;

console.log("hyper-k loaded");
