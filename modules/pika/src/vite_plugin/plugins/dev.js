import { installGlobals } from '../../globals/mod.js'
import { getRequest, setResponse } from '../../node/mod.js'
import { respond } from '../../server/mod.js'
import { get_entry, read_template } from '../utils.js'

/**
 * @returns {import('vite').Plugin}
 */
export function dev() {
  return {
    name: 'pika:dev',
    apply: 'serve',
    configureServer(server) {
      installGlobals()
      return () => {
        // removing the spa middleware before Vite calling postHooks
        server.middlewares.stack.splice(-1)
        server.middlewares.use(devHandler(server))
      }
    },
  }
}

/**
 * A handler that return a middleware function to be used in own server
 * @param {import('vite').ViteDevServer} server
 */
export function devHandler(server) {
  /**
   * @param {import('http').IncomingMessage} req
   * @param {import('http').ServerResponse} res
   */
  return async (req, res) => {
    try {
      if (!req.url || !req.method) throw new Error('Incomplete request')

      const protocol = server.config.server.https ? 'https' : 'http'
      const base = protocol + '://' + req.headers.host

      let request

      try {
        request = await getRequest(base, req)
      } catch (/** @type {any} */ e) {
        res.statusCode = e.status || 400
        return res.end(e.reason || 'Invalid request body')
      }

      let html = await server.transformIndexHtml(
        request.url,
        read_template(server.config.root, 'index.html'),
      )

      const response = await respond(request, html)

      if (response) {
        setResponse(res, response)
      }

      const entryServer = get_entry(server.config, 'src/entry.server')
      const { start } = await server.ssrLoadModule(entryServer)
      const { htmlAttrs, headTags, body, bodyAttrs } = await start({ request })
      const entry = get_entry(server.config, 'src/entry.client')
      const script = `
  <script type="module" data-pika-59827764>
    import { start } from ${JSON.stringify(entry)};
    start({ el: document.querySelector('[data-pika-59827764]').parentNode })
  </script>
  `
      html = html
        .replace('<html', `<html${htmlAttrs}`)
        .replace('<body', `<body${bodyAttrs}`)
        .replace('<!-- vue.head -->', headTags)
        .replace('<!-- vue.body -->', body + script)

      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html')
      res.end(html)
    } catch (/** @type {any} */ e) {
      server.ssrFixStacktrace(e)
      console.error(e) // TODO: move to server part
      res.statusCode = 500
      res.end(e.stack)
    }
  }
}
