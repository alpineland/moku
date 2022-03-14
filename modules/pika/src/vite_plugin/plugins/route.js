import path from 'path'
import { walk } from '../utils.js'

const virtualId = 'virtual:pika/routes'
const virtualResolvedId = `\0${virtualId}`

/**
 * @param {{
 * exclude: RegExp,
 * routeFn: () => void
 * }} options
 * @returns {import('vite').Plugin}
 */
export function routePlugin({ exclude = /\.[jt]s$/, routeFn = () => {} } = {}) {
  /** @type {string} */
  let root

  return {
    name: 'pika:routes',
    configResolved(config) {
      root = config.root
    },
    resolveId(id) {
      if (id === virtualId) return virtualResolvedId
    },
    async load(id) {
      if (id === virtualResolvedId) {
        const routes = await generateRoutes(root, exclude)
        return `export const routes = [${routes}];`
      }
    },
  }
}

/**
 * @param {string} root
 * @param {RegExp} exclude
 */
async function generateRoutes(root, exclude) {
  const routeDir = path.relative(root, 'src/routes')
  const files = []

  for await (const file of walk(routeDir, exclude)) {
    files.push(file)
  }

  const routes = []
  const s = JSON.stringify
  for (const file of files) {
    const rfile = path
      .relative('src/routes', file)
      .replace(/\.vue$/, '')
      .replace('index', '')
    routes.push(`{
      path: ${s(leadingSlash(routerPath(rfile)))},
      component: () => import(${s(leadingSlash(file))})
    }`)
  }

  return routes.join(',')
}

/** @param {string} str */
function leadingSlash(str) {
  return str.startsWith('/') ? str : '/' + str
}

/** @param {string} str */
function routerPath(str) {
  return str.replaceAll('$', ':')
}
