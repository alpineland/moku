import { installGlobals } from '../globals/mod.js'
import { readTemplate } from './utils.js'

/**
 * @param {{ssrEntry: string, template: string}} options
 * @returns {import('vite').Plugin}
 */
export function devPlugin(options) {
  return {
    name: 'pika:dev',
    apply: 'serve',
    configureServer(server) {
      installGlobals()
      return () => {
        removeHtmlMiddlewares(server.middlewares)
        server.middlewares.use(
          devHandler(server, options.template, options.ssrEntry),
        )
      }
    },
  }
}

/**
 * A handler that return a middleware function to be used in own server
 * @param {import('vite').ViteDevServer} server
 * @param {string} template
 * @param {string} entry
 */
export function devHandler(
  server,
  template = 'index.html',
  entry = './src/entry-server',
) {
  /**
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  return async (req, res) => {
    try {
      if (!req.url || !req.method) throw new Error('Incomplete request')

      const protocol = server.config.server.https ? 'https' : 'http'
      const url = new URL(req.url, `${protocol}://${req.headers.host}`).pathname
      const render = (await server.ssrLoadModule(entry)).default
      const [body, preloadLinks] = await render(url)

      let html = await server.transformIndexHtml(
        url,
        readTemplate(server.config.root, template),
      )
      html = html
        .replace(/\s*<!-- vue.head -->\s*/, preloadLinks)
        .replace(/\s*<!-- vue.body -->\s*/, body)

      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html')
      res.end(html)
    } catch (/** @type {any} */ e) {
      server && server.ssrFixStacktrace(e)
      console.error(e)
      res.statusCode = 500
      res.end(e.stack)
    }
  }
}

/** @param {import('vite').ViteDevServer['middlewares']} server */
function removeHtmlMiddlewares(server) {
  const htmlMiddlewares = [
    'viteIndexHtmlMiddleware',
    'vite404Middleware',
    'viteSpaFallbackMiddleware',
  ]

  for (let i = server.stack.length - 1; i > 0; i--) {
    // @ts-expect-error using internals until https://github.com/vitejs/vite/pull/4640 is merged
    if (htmlMiddlewares.includes(server.stack[i].handle.name)) {
      server.stack.splice(i, 1)
    }
  }
}
