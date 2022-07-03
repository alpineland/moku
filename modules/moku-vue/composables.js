import { inject, onServerPrefetch, ref, useSSRContext } from 'vue';

export async function useData(fn) {
  const pika = usePika();
  const fetching = ref(false);
  const data = ref();

  if (import.meta.env.SSR) {
    onServerPrefetch(async () => {
      const ctx = useSSRContext();
      const { get } = await fn();
      fetching.value = true;
      data.value = await get(ctx.request, ctx);
      pika.data.push(data.value);
      fetching.value = false;
    });
    return { data, fetching };
  } else {
    if (pika.data.length) {
      data.value = pika.data.shift();
      return { data, fetching };
    } else {
      fetching.value = true;
      data.value = await fetch(location.pathname);
      fetching.value = false;
      return { data, fetching };
    }
  }
}

const PIKA_KEY = Symbol();

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
  let tc;
  if (!import.meta.env.SSR) {
    tc = document.getElementById('__PIKA_DATA__')?.textContent;
  }
  const pika = {
    data: tc ? JSON.parse(tc) : [],
    install(/** @type {import('vue').App} */ app) {
      app.provide(PIKA_KEY, this);
    },
  };

  return pika;
}
