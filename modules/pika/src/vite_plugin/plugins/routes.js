import path from 'path'
import {
  walk,
  withLeadingSlash,
  withoutLeadingSlash,
  withoutTrailingSlash,
} from '../utils.js'

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
  const routeDir = path.resolve(root, 'src/routes')
  const files = []

  for await (const file of walk(routeDir, exclude)) {
    files.push(file)
  }

  files.sort()
  const routes = []
  const s = JSON.stringify
  for (const file of files) {
    const raw = '/' + path.relative(routeDir, file).replace(/\.vue$/, '.js')

    routes.push(`{
      path: ${s(toRoutePath(file, routeDir))},
      component: () => import(${s(file)}),
      name: ${s(toRouteName(file, routeDir))},
      meta: {
        __endpoint: (endpoint = ${s(raw)}) => import(/* @vite-ignore */ ${s(
      routeDir,
    )} + endpoint)
      }
    }`)
  }

  return routes.join(',')
}

/**
 * @param {string} file
 * @param {string} routeDir
 */
export function toRoutePath(file, routeDir) {
  const raw = path.relative(routeDir, file).replace(/\.vue$/, '')

  let pathname = raw

  if (raw.endsWith('$')) {
    pathname = raw.replace(/\$/g, ':') + '*'
  } else if (/(?<!\$)\${1}(?!\$)/g.test(raw)) {
    pathname = raw.replace(/\$/g, ':')
  } else if (raw.includes('$')) {
    // TODO: handle edge case like $/nested/$.vue
    throw new Error(`Invalid route file ${raw}.vue`)
  }

  if (pathname.endsWith('index')) {
    pathname = pathname.replace(/index$/, '')
  }

  return withLeadingSlash(withoutTrailingSlash(pathname))
}

/**
 * @param {string} file 
 * @param {string} routeDir 
 */
function toRouteName(file, routeDir) {
  const raw = path.relative(routeDir, file).replace(/\.vue$/, '')

  return withoutLeadingSlash(withoutTrailingSlash(raw))
}
