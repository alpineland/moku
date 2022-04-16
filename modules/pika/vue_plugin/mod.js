export { Root } from './components/root.js';
export { useData } from './composables.js';
export { createPika, usePika } from './pika.js';

import { etag } from 'pika/server';

/**
 * @param {{
 *    headTags: string,
 *    htmlAttrs: string,
 *    appHtml: string,
 *    bodyAttrs: string,
 *    pika: { data: Record<any, any> },
 *    ssrContext: import('pika').SSRContext
 * }} args
 */
export async function renderDocumentToString({
  headTags,
  htmlAttrs,
  appHtml,
  bodyAttrs,
  pika,
  ssrContext,
}) {
  const entry_client_attr = 'data-pika-' + (await etag(appHtml)).slice(0, 8);
  const script = `
  <script type="module" ${entry_client_attr}>
    import { start } from "${ssrContext.entryClient}";
    start({ el: document.querySelector("[${entry_client_attr}]").parentNode })
  </script>
  <script id="__PIKA_DATA__" type="application/json">
    ${JSON.stringify(pika.data)}
  </script>`;

  return ssrContext.template
    .replace('<html', `<html ${htmlAttrs}`)
    .replace('<body', `<body ${bodyAttrs}`)
    .replace('<!-- pika.head -->', headTags)
    .replace('<!-- pika.app -->', appHtml + script);
}
