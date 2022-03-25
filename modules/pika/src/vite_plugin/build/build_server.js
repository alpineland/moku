import path from 'path'
import {
  ASSETS_DIR,
  GENERATED_CODE,
  SERVER_OUT_DIR,
  TARGET,
} from './constants.js'
import { build } from 'vite'

/** @param {import('vite').InlineConfig} config */
export async function build_server(config) {
  /** @type {Record<string, string>} */
  const input = {
    'entry.server': 'src/entry.server',
  }

  config = {
    ...config,
    publicDir: false,
    build: {
      ...config.build,
      ssr: true,
      target: TARGET,
      outDir: SERVER_OUT_DIR,
      assetsDir: ASSETS_DIR,
      rollupOptions: {
        input,
        output: {
          format: 'esm',
          chunkFileNames: path.join(ASSETS_DIR, 'chunks', '[name].[hash].js'),
          generatedCode: GENERATED_CODE,
        },
      },
    },
  }

  await build(config)
}
