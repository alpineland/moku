import { plugin_build } from './plugins/build.js';
import { plugin_dev } from './plugins/dev.js';
import { plugin_manifest } from './plugins/manifest.js';
import { plugin_routes } from './plugins/routes.js';

/**
 * @param {import('~/types/mod').PluginSettings} settings
 * @returns {import('vite').Plugin[]}
 */
export function pika(settings) {
  settings = {
    appDir: 'app',
    routesDir: 'routes',
    ...settings,
  };
  return [
    plugin_dev(settings),
    plugin_routes(
      /** @type {Required<import('~/types/mod').PluginSettings>} */ (settings),
    ),
    plugin_build(
      /** @type {Required<import('~/types/mod').PluginSettings>} */ (settings),
    ),
    plugin_manifest(),
  ];
}
