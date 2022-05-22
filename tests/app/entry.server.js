import { createUniApp } from './main.js';
import { views } from './routes/mod.js';
import { renderHeadToString } from '@vueuse/head';
import { respondEndpoint, respondError, Server } from 'pika/server';
import { renderDocumentToString } from 'pika/vue-plugin';
import { renderToString } from 'vue/server-renderer';

export const server = Server({
  routes: views,
  matcher: async (request, routes) => {
    for (const r of routes) {
      console.log(await r.component());
    }
    return { mod: routes[0].component };
  },
  respondEndpoint,
  respondError,
  async respondView(request, ctx) {
    const { app, router, head, pika } = createUniApp();

    await router.push(ctx.url);
    await router.isReady();

    const appHtml = await renderToString(app, { request, ...ctx });
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
