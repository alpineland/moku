import { views } from './routes/mod.js';
import { createHead } from '@vueuse/head';
import { Root, createPika } from 'moku-vue';
import { createSSRApp } from 'vue';
import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
} from 'vue-router';

export function createUniApp() {
  const app = createSSRApp(Root);
  const head = createHead();
  const base = import.meta.env.BASE_URL;
  const router = createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory(base)
      : createWebHistory(base),
    routes: views,
  });
  const pika = createPika();

  app.use(router);
  app.use(pika);
  app.use(head);

  return { app, router, pika, head };
}
