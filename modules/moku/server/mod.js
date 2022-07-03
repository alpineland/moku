import { etag, normalise_route, fnv1a } from './utils.js';

export { etag, fnv1a };

/**
 * @typedef {import('moku').SSRContext} SSRContext
 * @typedef {(request: Request, ctx: SSRContext) => Promise<Response> } Respond
 */

export function create_handler(opts) {
  const { trailing_slash, respond } = opts;

  /**
   * @param {Request} req
   */
  return async (req, ctx) => {
    const url = new URL(req.url);
    const normalised = normalise_route(url.pathname, trailing_slash);

    // permanent redirect on trailing slash
    if (normalised !== url.pathname) {
      return new Response(null, {
        status: 301,
        statusText: 'Moved Permanently',
        headers: {
          location: normalised + url.search + url.hash,
        },
      });
    }

    try {
      return await respond(req, ctx);
    } catch (error) {
      ctx.error = error;
      return await respond(req, ctx);
    }
  };
}

/** @type {import('pika').RespondEndpoint} */
export async function respond_endpoint(request, _, mod) {
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
