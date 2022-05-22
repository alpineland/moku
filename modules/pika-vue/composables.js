import { usePika } from './pika.js';
import { onServerPrefetch, ref, useSSRContext } from 'vue';

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
