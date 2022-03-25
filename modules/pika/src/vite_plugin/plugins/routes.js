import fs from 'fs'
import path from 'path'
import {
  walk,
  with_leading_slash,
  without_leading_slash,
  without_trailing_slash,
} from '../utils.js'

/**
 * @param {{
 * exclude: RegExp,
 * routeFn: () => void
 * }} options
 * @returns {import('vite').Plugin}
 */
export function routes({ exclude = /\.[jt]s$/, routeFn = () => {} } = {}) {
  /** @type {string} */
  let root

  return {
    name: 'pika:routes',
    configResolved(config) {
      root = config.root
    },
    configureServer(server) {
      const file_to_write = path.join(root, 'src', 'pika.gen.js')
      const update = async () => {
        const routes = await generate_routes(root, exclude)
        fs.writeFileSync(file_to_write, `export const routes = [${routes}]`)
      }
      if (!fs.existsSync(file_to_write)) update()
      server.watcher.on('add', update)
      server.watcher.on('unlink', update)
    },
  }
}

/**
 * @param {string} root
 * @param {RegExp} exclude
 */
async function generate_routes(root, exclude) {
  const src = path.resolve(root, 'src')
  const routeDir = path.resolve(src, 'routes')
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
      component: () => import(${s('./' + path.relative(src, file))}),
      name: ${s(toRouteName(file, routeDir))},
      meta: {
        endpoint: (endpoint = ${s(raw)}) => import(/* @vite-ignore */ ${s(
      routeDir,
    )} + endpoint)
      },
      props: true,
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

  return with_leading_slash(without_trailing_slash(pathname))
}

/**
 * @param {string} file
 * @param {string} routeDir
 */
function toRouteName(file, routeDir) {
  const raw = path.relative(routeDir, file).replace(/\.vue$/, '')

  return without_leading_slash(without_trailing_slash(raw))
}
