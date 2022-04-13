import { etag, normalize_route } from './utils.js';

export { etag }

/**
 *
 * @param {import('pika').ServerSettings} settings
 * @returns {{ respond: (request: Request) => Promise<Response> }}
 */
export function Server(settings) {
  settings = {
    trailingSlash: false,
    ...settings,
  };

  /** @param {Request} request */
  async function respond(request) {
    const {
      matcher,
      routes,
      respondEndpoint,
      respondError,
      respondView,
      trailingSlash,
    } = settings;
    const url = new URL(request.url);
    const normalized = normalize_route(url.pathname, trailingSlash);

    if (normalized !== url.pathname) {
      return new Response(null, {
        status: 301,
        headers: {
          location: normalized + url.search + url.hash,
        },
      });
    }

    const {
      mod,
      respondEndpoint: respond_endpoint = respondEndpoint,
      respondError: respond_error = respondError,
      respondView: respond_view = respondView,
    } = matcher(routes);

    try {
      if (mod) {
        return await respond_endpoint(request, mod);
      } else {
        return await respond_view(request);
      }
    } catch (e) {
      return await respond_error(e);
    }
  }

  return { respond };
}

/** @type {import('pika').RespondEndpoint} */
export async function respondEndpoint(request, mod) {
  const method = request.method.toLowerCase();
  let handler = mod[method];

  if (!handler && method === 'head') {
    handler = mod.get;
  }

  const resp = await handler({ request });
  const { headers, body } = resp;

  if (
    (typeof body === 'string' || body instanceof Uint8Array) &&
    !headers.has('etag')
  ) {
    const cc = headers.get('cache-control');

    if (!cc || !/no-store|immutable/.test(cc)) {
      headers.set('etag', await etag(body));
    }
  }

  return resp;
}

/** @type {import('pika').RespondError} */
export async function respondError(error) {}
