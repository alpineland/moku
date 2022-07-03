import { createUniApp } from './main.js';
// import { views } from './routes/mod.js';
import { renderHeadToString } from '@vueuse/head';
import { create_handler } from 'moku';
import { renderDocumentToString } from 'moku-vue';
import { renderToString } from 'vue/server-renderer';

export const handler = create_handler({
  match: () => ({ mod: null }),
  async respond(req, ctx) {
    const { app, router, head, pika } = createUniApp();

    await router.push(ctx.url);
    await router.isReady();

    const appHtml = await renderToString(app, { req, ...ctx });
    const { headTags, htmlAttrs, bodyAttrs } = renderHeadToString(head);
    const markup = await renderDocumentToString({
      headTags,
      htmlAttrs,
      appHtml,
      bodyAttrs,
      pika,
      ssrContext: ctx,
    });

    return new Response(markup, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  },
});
