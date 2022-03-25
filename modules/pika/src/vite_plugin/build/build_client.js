import path from 'path'
import {
  ASSETS_DIR,
  CLIENT_MANIFEST,
  CLIENT_OUT_DIR,
  GENERATED_CODE,
  SERVER_MANIFEST,
  TARGET,
} from './constants.js'
import { build } from 'vite'

/** @param {import('vite').InlineConfig} config */
export async function build_client(config) {
  /** @type {Record<string, string>} */
  const input = {
    'entry.client': 'src/entry.client',
  }

  config = {
    ...config,
    build: {
      ...config.build,
      target: TARGET,
      outDir: CLIENT_OUT_DIR,
      assetsDir: ASSETS_DIR,
      ssrManifest: SERVER_MANIFEST,
      manifest: CLIENT_MANIFEST,
      rollupOptions: {
        input,
        output: {
          chunkFileNames: path.join(ASSETS_DIR, 'chunks', '[name].[hash].js'),
          generatedCode: GENERATED_CODE,
        },
      },
    },
  }

  await build(config)
}
