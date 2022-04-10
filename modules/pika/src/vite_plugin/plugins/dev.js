import { installGlobals } from '../../globals/mod.js';
import { getRequest, setResponse } from '../../node/mod.js';
import { get_entry, read_template } from '../utils.js';

/**
 * @param {import('~/types/mod').PluginSettings} settings
 * @returns {import('vite').Plugin}
 */
export function plugin_dev(settings) {
  return {
    name: 'pika:dev',
    apply: 'serve',
    configureServer(server) {
      installGlobals();
      return () => {
        for (const [i, s] of server.middlewares.stack.entries()) {
          // @ts-expect-error using internal
          if (s.handle.name === 'viteSpaFallbackMiddleware') {
            server.middlewares.stack.splice(i, 1);
          }
        }
        server.middlewares.use(ssr_middleware(server, settings));
      };
    },
  };
}

/**
 * @param {import('vite').ViteDevServer} vds
 * @param {import('~/types/mod').PluginSettings} settings
 */
function ssr_middleware(vds, settings) {
  /** @type {import('vite').Connect.SimpleHandleFunction} */
  return async function pikaSSRMiddleware(req, res) {
    try {
      if (!req.url || !req.method) throw new Error('Incomplete request');

      const { config } = vds;
      const protocol = config.server.https ? 'https' : 'http';
      const base = protocol + '://' + req.headers.host;
      const request = await getRequest(base, req);
      const html = await vds.transformIndexHtml(
        req.url,
        read_template(config.root, 'index.html'),
        req.originalUrl,
      );

      const { start } = await vds.ssrLoadModule(
        get_entry(config, `${settings.appDir}/entry.server`),
      );

      /** @type {import('~/types/mod').SSRContext} */
      const ssrContext = {
        request,
        url: req.url,
        entryClient: get_entry(config, `${settings.appDir}/entry.client`),
        html,
      };
      const response = await start({ request, ssrContext });

      if (response) {
        setResponse(res, response);
      }
    } catch (/** @type {any} */ e) {
      vds.ssrFixStacktrace(e);
      console.error(e); // TODO: move to server part
      res.statusCode = 500;
      res.end(e.stack);
    }
  };
}
