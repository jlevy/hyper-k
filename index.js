const {
  imageDecorateTerm,
  imageMiddleware,
  imageReducer,
  imageTermProps,
  imageMapTermsState,
} = require("./image-view");
const { linkAddonsDecorateTerm } = require("./link-addons");
const { highlightsDecorateTerm } = require("./highlights");

exports.decorateTerm = (Term, { React, notify }) => {
  console.log("Decorating term", Term);

  // Apply decorations in sequence.
  let DecoratedTerm = linkAddonsDecorateTerm(Term, { React });

  // Highlights is kind of slow and may not be necessary.
  // DecoratedTerm = highlightsDecorateTerm(DecoratedTerm, { React });

  DecoratedTerm = imageDecorateTerm(DecoratedTerm, { React });

  return DecoratedTerm;
};

exports.middleware = imageMiddleware;
exports.reduceUI = imageReducer;
exports.mapTermsState = imageMapTermsState;
exports.getTermGroupProps = imageTermProps;
exports.getTermProps = imageTermProps;

console.log("hyper-easy loaded");
