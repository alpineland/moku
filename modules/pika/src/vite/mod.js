import { buildPlugin } from './build.js'
import { devPlugin } from './dev.js'

/**
 * @param {{ssrEntry: string, template: string}} options
 * @returns {import('vite').Plugin[]}
 */
export function pika(
  options = {
    ssrEntry: './src/entry-server',
    template: 'index.html',
  },
) {
  return [devPlugin(options), buildPlugin(options)]
}
