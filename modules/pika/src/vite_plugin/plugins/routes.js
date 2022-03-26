import fs from 'fs'
import path from 'path'
import { walk, with_leading_slash, without_trailing_slash } from '../utils.js'
import { genArrayFromRaw, genDynamicImport } from 'knitwork'

/**
 * @returns {import('vite').Plugin}
 */
export function routes() {
  /** @type {string} */
  let root

  return {
    name: 'pika:routes',
    configResolved(config) {
      root = config.root
    },
    configureServer(server) {
      const file_to_write = path.join(root, 'src', 'pika.gen.js')
      const update_manifest = async () => {
        fs.writeFileSync(file_to_write, await generate_routes(root))
      }
      update_manifest()
      server.watcher.on('add', update_manifest)
      server.watcher.on('unlink', update_manifest)
    },
  }
}

/**
 * @param {string} root
 */
async function generate_routes(root) {
  const src_dir = path.resolve(root, 'src')
  const routes_dir = path.resolve(src_dir, 'routes')
  const files = []

  for await (const file of walk(routes_dir, /^\./)) {
    files.push(file)
  }

  files.sort()
  const views = []
  const endpoints = []
  const s = JSON.stringify

  for (const file of files) {
    const relative_file = './' + path.relative(src_dir, file)
    const filename = path
      .relative(routes_dir, file)
      .replace(/\.(?:vue|js|ts)$/, '')

    if (file.endsWith('.js') || file.endsWith('.ts')) {
      endpoints.push({
        path: s(to_route_path(filename)),
      })
    } else if (file.endsWith('.vue')) {
      views.push({
        path: s(to_route_path(filename)),
        component: genDynamicImport(relative_file),
        props: true,
      })
    }
  }

  const views_str = `export const views = ${genArrayFromRaw(views)};`

  const endpoints_str = `export const endpoints = ${genArrayFromRaw(
    endpoints,
  )};`

  return `// DO NOT EDIT. Generated by "pika:routes" plugin of Pika.
// This file should be checked into version control.

${views_str}

${endpoints_str}
`
}

/** @param {string} file */
export function to_route_path(file) {
  let pathname = file

  if (file.endsWith('$')) {
    pathname = file.replace(/\$/g, ':') + '*'
  } else if (/(?<!\$)\${1}(?!\$)/g.test(file)) {
    pathname = file.replace(/\$/g, ':')
  } else if (file.includes('$')) {
    // TODO: handle edge case like $/nested/$.vue
    throw new Error(`Invalid route file ${file}.vue`)
  }

  if (pathname.endsWith('index')) {
    pathname = pathname.replace(/index$/, '')
  }

  return with_leading_slash(without_trailing_slash(pathname))
}
