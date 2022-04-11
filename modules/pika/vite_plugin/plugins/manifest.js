/** @returns {import('vite').Plugin} */
export function plugin_manifest() {
  /** @type {import('pika').SSRManifest} */
  const manifest = {
    entryClient: '',
    html: '',
  };

  return {
    name: 'pika:manifest',
    enforce: 'post',
    apply: ({ build }, { command }) => !build?.ssr && command === 'build',
    generateBundle(_, bundle) {
      for (const file in bundle) {
        const chunk = bundle[file];
        if (chunk.fileName === 'index.html' && chunk.type === 'asset') {
          manifest.html = /** @type {string} */ (chunk.source);
          delete bundle[file];
        } else if (chunk.name === 'entry.client' && chunk.type === 'chunk') {
          manifest.entryClient = chunk.fileName;
        }
      }

      this.emitFile({
        type: 'asset',
        fileName: 'manifest.js',
        source: `export const manifest = ${JSON.stringify(manifest)}`,
      });
    },
  };
}
