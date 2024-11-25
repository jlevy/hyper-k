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
} = require("./custom-links/links");
const {
  decorateTerm: highlightsDecorateTerm,
} = require("./custom-highlights/highlights");
const {
  middleware: notificationMiddleware,
} = require("./custom-notifications/notifications");

exports.decorateTerm = (Term, { React, notify }) => {
  console.log("hyper-k: Decorating term", Term);

  let DecoratedTerm = Term;

  // Apply decorations in sequence.
  DecoratedTerm = linkAddonsDecorateTerm(DecoratedTerm, { React });

  // Highlights is kind of slow as we operate on the whole buffer.
  // Disabling for now.
  // DecoratedTerm = highlightsDecorateTerm(DecoratedTerm, { React });

  // Disabling auto image view for now as well. Tooltip image hovers
  // seem a bit more intuitive.
  // DecoratedTerm = imageDecorateTerm(DecoratedTerm, { React });

  return DecoratedTerm;
};

// Helper to compose middleware (similar to Redux's compose).
const composeMiddleware =
  (...middlewares) =>
  (store) =>
  (next) =>
  (action) => {
    // Convert each middleware into a chain of functions
    const chain = middlewares.map((middleware) => middleware(store));
    // Compose them right-to-left (Redux standard)
    const composed = chain.reduceRight(
      (next_, middleware) => middleware(next_),
      next
    );
    // Execute the composed chain
    return composed(action);
  };

exports.middleware = composeMiddleware(notificationMiddleware, imageMiddleware);

exports.reduceUI = imageReducer;
exports.mapTermsState = imageMapTermsState;
exports.getTermGroupProps = imageGetTermProps;
exports.getTermProps = imageGetTermProps;

exports.decorateConfig = themeDecorateConfig;

console.log("hyper-k loaded");
