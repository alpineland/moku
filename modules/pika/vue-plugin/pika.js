import { inject } from 'vue';

const PIKA_KEY = Symbol(import.meta.env.DEV ? 'pika' : '');

export function usePika() {
  const pika = inject(PIKA_KEY);
  if (!pika) {
    throw new Error(
      'Failed to inject Pika. ' +
        'Make sure you have called "app.use(createPika())"',
    );
  }
  return pika;
}

export function createPika() {
  let tc
  if (!import.meta.env.SSR) {
    tc = document.getElementById('__PIKA_DATA__')?.textContent
  }
  const pika = {
    data: tc ? JSON.parse(tc) : [],
    install(/** @type {import('vue').App} */ app) {
      app.provide(PIKA_KEY, this);
    },
  };

  return pika;
}
