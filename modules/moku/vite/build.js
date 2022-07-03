import * as path from 'node:path';

/**
 * @param {Required<import('./mod.js').PluginOpts>} opts
 * @returns {import('vite').Plugin}
 */
export function plugin_build(opts) {
  return {
    name: 'moku:build',
    apply: 'build',
    async config({ build, publicDir }) {
      const ssr = !!build?.ssr;

      return {
        publicDir: ssr ? false : publicDir,
        build: {
          assetsDir: '_moku',
          ssrManifest: ssr ? false : build?.ssrManifest || 'ssr-manifest.json',
          outDir: path.join(build?.outDir || 'dist', ssr ? 'server' : 'client'),
          rollupOptions: {
            input: ssr ? opts.entry_server : opts.entry_client,
          },
        },
      };
    },
  };
}
