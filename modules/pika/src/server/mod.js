import { etag, normalize_route } from './utils.js';

export class Server {
  /** @param {import('~/types/mod').ServerSettings} settings */
  constructor(settings) {
    this.endpoints = settings.endpoints;
    this.trailing_slash = settings.trailingSlash;
  }

  /**
   * @param {{
   *    request: Request
   *    view: import('~/types/mod').ViewFn
   *    endpoint: import('~/types/mod').EndpointFn
   * }} args
   * @returns {Promise<Response>}
   */
  async respond({ request, view, endpoint, error }) {
    const url = new URL(request.url);
    const normalized = normalize_route(url.pathname, this.trailing_slash);

    // trailing slash redirection
    if (normalized !== url.pathname) {
      return new Response(null, {
        status: 301,
        headers: {
          location: normalized + url.search + url.hash,
        },
      });
    }

    /** @type {Response} */
    let resp;
    /** @type {{ [method: string]: import('~/types/mod').RequestHandler } | undefined} */
    let mod;
    /** @type {URLPatternComponentResult['groups'] | undefined} */
    let params;

    try {
      for (const { pathname, load } of this.endpoints) {
        const result = new URLPattern({ pathname, search: '_data=raw' }).exec(request.url);
        if (result !== null) {
          params = result.pathname.groups;
          mod = await load();
          break;
        }
      }

      if (mod && params) {
        resp = endpoint
          ? await endpoint()
          : await this.respond_endpoint(request, mod, params);
      } else {
        resp = await view();
      }

      return resp;
    } catch (e) {
      return error ? await error() : await this.respond_error(request);
    }
  }

  /**
   * @param {Request} request
   * @param {{ [method: string]: import('~/types/mod').RequestHandler }} mod
   * @param {URLPatternComponentResult['groups']} params
   * @returns {Promise<Response>}
   */
  async respond_endpoint(request, mod, params) {
    const method = request.method.toLowerCase();
    let handler = mod[method];

    if (!handler && method === 'head') {
      handler = mod.get;
    }

    if (!handler) return;

    const resp = await handler({ request, params });
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

  async respond_error(request) {}
}

/**
 * @param {{
 *    headTags: string,
 *    htmlAttrs: string,
 *    appHtml: string,
 *    bodyAttrs: string,
 *    pika: { data: Record<any, any> },
 *    ssrContext: import('~/types/mod').SSRContext
 * }} args
 */
export async function renderDocumentToString({
  headTags,
  htmlAttrs,
  appHtml,
  bodyAttrs,
  pika,
  ssrContext,
}) {
  const entry_client_attr = 'data-pika-' + (await etag(appHtml)).slice(0, 8);
  const script = `
  <script type="module" ${entry_client_attr}>
    import { start } from "${ssrContext.entryClient}";
    start({ el: document.querySelector("[${entry_client_attr}]").parentNode })
  </script>
  <script id="__PIKA_DATA__" type="application/json">
    ${JSON.stringify(pika.data)}
  </script>`;

  return ssrContext.html
    .replace('<html', `<html ${htmlAttrs}`)
    .replace('<body', `<body ${bodyAttrs}`)
    .replace('<!-- pika.head -->', headTags)
    .replace('<!-- pika.app -->', appHtml + script);
}
