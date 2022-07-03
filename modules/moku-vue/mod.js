export { Root } from './components/root.js';
export { createPika, useData, usePika } from './composables.js';
export { createMatchFunction } from './matcher.js';

import { fnv1a } from 'moku';

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
  const entry_client_attr = 'data-moku-' + fnv1a(appHtml);
  const script = `
  <script type="module" ${entry_client_attr}>
    import { start } from "${ssrContext.entry_client}";
    start({ el: document.querySelector("[${entry_client_attr}]").parentNode })
  </script>
  <script id="__PIKA_DATA__" type="application/json">
    ${JSON.stringify(pika.data)}
  </script>`;

  return ssrContext.template
    .replace('<html', `<html ${htmlAttrs}`)
    .replace('<body', `<body ${bodyAttrs}`)
    .replace('</head>', headTags + '</head>')
    .replace(
      '</body>',
      '<div id="__pika-vue">' + appHtml + '</div>' + script + '</body>',
    );
}
