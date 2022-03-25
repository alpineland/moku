import { createApp } from './main.js'
import { renderHeadToString } from '@vueuse/head'
import { renderToString } from 'vue/server-renderer'

/** @type {import('pika').StartServer} */
export async function start({ request }) {
  const { app, router, head } = createApp()

  await router.push(request.url)
  await router.isReady()

  const body = await renderToString(app)
  const { headTags, htmlAttrs, bodyAttrs } = renderHeadToString(head)

  return {
    headTags,
    htmlAttrs,
    body,
    bodyAttrs,
  }
}
