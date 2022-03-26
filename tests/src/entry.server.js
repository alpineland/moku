import { createApp } from './main.js'
import { endpoints, routes } from './pika.gen.js'
import { renderHeadToString } from '@vueuse/head'
import { renderToString } from 'vue/server-renderer'

/** @type {import('pika').StartServer} */
export async function start({ request }) {
  // TODO: route matchings
  const { type } = matchRoutes(routes, endpoints)

  if (type === 'endpoint') {
    return render_endpoint(request)
  }

  const { app, router, head } = createApp()

  await router.push(request.url)
  await router.isReady()

  const body = await renderToString(app)
  const { headTags, htmlAttrs, bodyAttrs } = renderHeadToString(head)

  const markup = render_markup(request, {
    headTags,
    htmlAttrs,
    body,
    bodyAttrs,
  })

  return new Response(markup, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
