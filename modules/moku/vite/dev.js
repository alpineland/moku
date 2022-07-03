import * as fs from 'node:fs';
import * as path from 'node:path';
import { get_request, set_response } from '../node/mod.js';

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
</body>
</html>
`;

/**
 * @param {Required<import('./mod.js').PluginOpts>} opts
 * @returns {import('vite').Plugin}
 */
export function plugin_dev(opts) {
  /** @type {string} */
  let root;

  return {
    name: 'moku:dev',
    apply: 'serve',
    config() {
      return {
        appType: 'custom',
      };
    },
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res) => {
          try {
            if (!req.url || !req.method) throw new Error('incomplete request');

            const { config } = server;
            const protocol = config.server.https ? 'https' : 'http';
            const base = protocol + '://' + req.headers.host;

            const template = server.transformIndexHtml(
              req.url,
              html,
              req.originalUrl,
            );

            const request = await get_request(base, req);
            const { handler } = await server.ssrLoadModule(
              path.resolve(root, opts.entry_server),
            );
            const ctx = {
              url: req.url,
              entry_client: get_entry(path.resolve(root, opts.entry_client)),
              template,
            };

            const resp = await handler(request, ctx);

            if (resp) {
              set_response(res, resp);
            }
          } catch (/** @type {any} */ e) {
            server.ssrFixStacktrace(e);
            res.statusCode = 500;
            res.end(e.stack);
          }
        });
      };
    },
  };
}

/**
 * @param {string} entry
 * @param {string[]} exts
 */
function get_entry(entry, exts = ['.js', '.ts']) {
  for (const ext of exts) {
    if (entry.endsWith(ext)) {
      return;
    }
  }

  const ext = exts.find((ext) => fs.existsSync(entry + ext));

  if (!ext) {
    throw new Error(`missing "${entry}"`);
  }

  return entry + ext;
}
