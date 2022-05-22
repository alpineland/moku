import { createUniApp } from './main.js';

const { app, router } = createUniApp();

/** @type {import('pika').StartClient} */
export function start({ el }) {
  router.isReady().then(() => app.mount(el));
}
