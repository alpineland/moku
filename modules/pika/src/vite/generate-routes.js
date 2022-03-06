import fs from 'fs'
import path from 'path'

/**
 * @param {string} dir
 * @returns {AsyncIterableIterator<string>}
 */
async function* walk(dir) {
  const files = await fs.promises.opendir(dir)
  for await (const file of files) {
    const entry = path.join(dir, file.name)
    if (file.isDirectory()) yield* walk(entry)
    else if (file.isFile()) yield entry
  }
}

/** @param {string} [root] */
export async function generateRoutes(root) {
  root = root || '.'
  const routeDir = path.join(root, 'src', 'routes')
  const routes = []
  for await (const route of walk(routeDir)) {
    routes.push(route.replace('src', '.'))
  }

  const output = `// @ts-check

export const routes = [${routes
    .map(
      (file) => `
  {
    path: '${file}',
    component: () => import('${file}'),
  },`,
    )
    .join('')}
]
`
  fs.writeFileSync('./src/generated-routes.js', output)
}
