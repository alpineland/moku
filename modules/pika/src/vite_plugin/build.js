import { build as viteBuild } from 'vite'

/** @param {import('vite').InlineConfig} config */
export async function build(config) {
  await buildClient(config)
  await buildServer(config)
}

/** @param {import('vite').InlineConfig} config */
async function buildClient(config) {
  config = {
    ...config,
    build: {
      outDir: 'dist/client',
      assetsDir: '_pika',
      ssrManifest: true,
      ...config.build,
    },
  }
  await viteBuild(config)
}

/** @param {import('vite').InlineConfig} config */
async function buildServer(config) {
  config = {
    ...config,
    publicDir: false,
    build: {
      ssr: true,
      outDir: 'dist/server',
      rollupOptions: {
        input: 'src/entry-server',
        output: {
          format: 'esm',
        },
      },
      ...config.build,
    },
  }
  await viteBuild(config)
}
