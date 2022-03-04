import path from 'path'
import { build as viteBuild, mergeConfig } from 'vite'

/** @param {import('vite').InlineConfig} config */
export async function build(config) {
  await buildClient(config)
  await buildServer(config)
}

/** @param {import('vite').InlineConfig} config */
async function buildClient(config) {
  await viteBuild(config)
}

/** @param {import('vite').InlineConfig} config */
async function buildServer(config) {
  config = mergeConfig(config, {
    build: {
      ssr: true,
      rollupOptions: {
        output: {
          format: 'esm',
        },
      },
    },
  })
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
    config({ publicDir, build }) {
      const ssr = !!build?.ssr

      return {
        publicDir: ssr ? false : publicDir,
        build: {
          assetsDir: '_pika',
          outDir: path.join(build?.outDir || 'dist', ssr ? 'server' : 'client'),
          ssrManifest: !ssr,
          ssr: ssr ? options.ssrEntry : false,
        },
      }
    },
  }
}
