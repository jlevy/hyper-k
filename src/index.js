const { decorateConfig: colorsDecorateConfig } = require("./colors");

const {
  decorateTerm: imageDecorateTerm,
  middleware: imageMiddleware,
  reducer: imageReducer,
  getTermProps: imageGetTermProps,
  mapTermsState: imageMapTermsState,
} = require("./image-view");
const { decorateTerm: linkAddonsDecorateTerm } = require("./link-addons");
const { decorateTerm: highlightsDecorateTerm } = require("./highlights");

exports.decorateTerm = (Term, { React, notify }) => {
  console.log("Decorating term", Term);

  // Apply decorations in sequence.
  let DecoratedTerm = linkAddonsDecorateTerm(Term, { React });

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

exports.decorateConfig = colorsDecorateConfig;

console.log("hyper-k loaded");
