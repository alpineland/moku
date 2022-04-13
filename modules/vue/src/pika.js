import { inject } from 'vue';

const PIKA_KEY = Symbol('[pika]');

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
  const pika = {
    data: import.meta.env.SSR ? new Map() : new Map(JSON.parse(document.getElementById('__PIKA_DATA__')?.textContent)),
    initialLoad: !import.meta.env.SSR,
    install(/** @type {import('vue').App} */ app) {
      app.provide(PIKA_KEY, this);
    },
  };
  return pika;
}
