import { routes } from './pika.gen.js'
import { createHead } from '@vueuse/head'
import { Root, createPika } from 'pika'
import { createSSRApp } from 'vue'
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'

export function createApp() {
  const app = createSSRApp(Root)
  const head = createHead()
  const pika = createPika()
  const base = import.meta.env.BASE_URL
  const router = createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory(base)
      : createWebHistory(base),
    routes,
  })

  app.use(router)
  app.use(pika)
  app.use(head)
  return { app, router, pika, head }
}