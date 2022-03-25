import { createApp } from './main.js'

/** @type {import('pika').StartClient} */
export function start({ el }) {
  const { app, router } = createApp()
  router.isReady().then(() => app.mount(el))
}
