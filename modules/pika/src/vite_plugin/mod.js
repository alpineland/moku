import { devPlugin } from './dev.js'

export function pika({
  routeDir = './src/routes',
  ssrEntry = './src/entry-server',
  template = 'index.html',
  trailingSlash = false,
} = {}) {
  return devPlugin({ ssrEntry, template })
}
