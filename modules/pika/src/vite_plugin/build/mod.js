import { build_client } from './build_client.js'
import { build_server } from './build_server.js'

/** @param {import('vite').InlineConfig} config */
export async function build(config) {
  await build_client(config)
  await build_server(config)
}
