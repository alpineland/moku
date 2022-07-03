import { plugin_build } from './build.js';
import { plugin_dev } from './dev.js';

/**
 * @typedef {{
 *    entry_client?: string
 *    entry_server?: string
 * }} PluginOpts
 */

/**
 * @param {PluginOpts} [opts]
 * @returns {import('vite').Plugin[]}
 */
export function moku(opts) {
  const req_opts = {
    entry_client: 'app/entry.client',
    entry_server: 'app/entry.server',
    ...opts,
  };
  return [plugin_build(req_opts), plugin_dev(req_opts)];
}
