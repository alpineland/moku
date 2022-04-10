import { createUniApp } from './main.js';

/** @type {import('pika').StartClient} */
export function start({ el }) {
  const { app, router } = createUniApp();
  router.isReady().then(() => app.mount(el));
}
