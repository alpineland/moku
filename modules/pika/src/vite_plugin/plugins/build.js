import path from 'path';
import { walk } from '../utils.js';
import { normalizePath } from 'vite';

/**
 * @param {Required<import('~/types/mod').PluginSettings>} settings
 * @returns {import('vite').Plugin}
 */
export function plugin_build(settings) {
  return {
    name: 'pika:build',
    apply: 'build',
    async config({ root, build, publicDir }) {
      const ssr = !!build?.ssr;
      root ||= process.cwd();
      const app_dir = path.join(root, settings.appDir);
      const routes_dir = path.join(app_dir, settings.routesDir);

      /** @type {Record<string, string>} */
      const input = {};

      if (ssr) {
        input['entry.server'] = path.join(app_dir, 'entry.server');
      } else {
        input['entry.client'] = path.join(app_dir, 'entry.client');
        input['__index_html__'] = path.join(root, 'index.html');
      }

      for await (const file of walk(routes_dir, /^\./)) {
        if (!ssr && /\.[jt]s$/.test(file)) {
          continue;
        }
        input[normalizePath(path.relative(app_dir, file))] = file;
      }

      return {
        publicDir: ssr ? false : publicDir,
        build: {
          target: 'es2020',
          assetsDir: '_pika',
          ssrManifest: ssr ? false : build?.ssrManifest || 'ssr-manifest.json',
          outDir: path.join(build?.outDir || 'dist', ssr ? 'server' : 'client'),
          rollupOptions: {
            input,
            output: {
              format: 'es',
              generatedCode: 'es2015',
            },
            onwarn(warning, warn) {
              if (!ssr && warning.message.includes('__index_html__')) {
                return;
              }
              warn(warning);
            },
          },
        },
      };
    },
  };
}
