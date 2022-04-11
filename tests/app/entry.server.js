import { createUniApp } from './main.js';
import { endpoints, views } from './routes/mod.js';
import { renderHeadToString } from '@vueuse/head';
import { Server, renderDocumentToString } from 'pika/server';
import { renderToString } from 'vue/server-renderer';

const server = new Server({
  endpoints,
  views,
  floc: true,
  trailingSlash: false,
});

/** @type {import('pika').StartServer} */
export async function start({ request, ssrContext }) {
  return await server.respond({
    request,
    ssrContext,
    async view() {
      const { app, router, head, pika } = createUniApp();

      await router.push(ssrContext.url);
      await router.isReady();

      const appHtml = await renderToString(app, ssrContext);
      const { headTags, htmlAttrs, bodyAttrs } = renderHeadToString(head);
      const markup = await renderDocumentToString({
        headTags,
        htmlAttrs,
        appHtml,
        bodyAttrs,
        pika,
        ssrContext,
      });

      return new Response(markup, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    },
  });
}
