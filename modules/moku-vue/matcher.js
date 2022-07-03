import { createRouterMatcher, START_LOCATION } from 'vue-router';

/**
 * @param {import('vue-router').RouteRecordRaw[]} routes
 * @param {import('vue-router').PathParserOptions} options
 */
export function createMatchFunction(routes, options = {}) {
  const matcher = createRouterMatcher(routes, options);
  /** @param {Request} request */
  return (request) => {
    const url = new URL(request.url);
    if (url.searchParams.get('_pika') !== null) {
      const matched_route = matcher
        .resolve({ path: url.pathname }, START_LOCATION)
        .matched.at(-1);
      if (matched_route) {
        const { respondEndpoint, respondError, respondView } =
          matched_route.meta;
        return {
          mod: matched_route.components['default'],
          respondEndpoint,
          respondError,
          respondView,
        };
      }
    } else {
      for (const route of routes) {
        const pattern = new URLPattern({ pathname: route.path }).exec(
          request.url,
        );
        if (pattern !== null) {
          const { mod, respondEndpoint, respondError, respondView } = route;
          return {
            mod,
            respondEndpoint,
            respondError,
            respondView,
          };
        }
      }
    }
  };
}
