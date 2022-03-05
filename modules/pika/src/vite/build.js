import path from 'path'
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
      ssrManifest: false,
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
      rollupOptions: {
        output: {
          format: 'esm',
        },
      },
      ...config.build,
    },
  }
  await viteBuild(config)
}

/**
 * @param {{ssrEntry: string, template: string}} options
 * @returns {import('vite').Plugin}
 */
export function buildPlugin(options) {
  return {
    name: 'pika:build',
    apply: 'build',
    config({ build }) {
      const ssr = !!build?.ssr

      return {
        build: {
          assetsDir: '_pika',
          outDir: path.join(build?.outDir || 'dist', ssr ? 'server' : 'client'),
          ssr: ssr ? options.ssrEntry : false,
        },
      }
    },
  }
}
