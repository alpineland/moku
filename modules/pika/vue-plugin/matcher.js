import { createRouterMatcher, START_LOCATION } from 'vue-router';

/**
 * @param {import('vue-router').RouteRecordRaw[]} routes
 * @param {import('vue-router').PathParserOptions} options
 */
export function createMatchFunction(routes, options) {
  const matcher = createRouterMatcher(routes, options);
  /** @param {Request} request */
  return (request) => {
    const url = new URL(request.url);
    const matched_route = matcher.resolve(
      { path: url.pathname },
      START_LOCATION,
    ).matched[0];
    const { respondEndpoint, respondError, respondView } = matched_route.meta;
    return {
      mod: matched_route.components['default'],
      respondEndpoint,
      respondError,
      respondView,
    };
  };
}
