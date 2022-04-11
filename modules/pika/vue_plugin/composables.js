import { usePika } from './pika.js';
import { computed, onServerPrefetch, useSSRContext } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export async function useData({ server, client } = {}) {
  const pika = usePika();
  const route = useRoute();
  const router = useRouter();

  if (import.meta.env.SSR) {
    onServerPrefetch(async () => {
      const { request } = useSSRContext();

      if (server) {
        const resp = await server(request);
        pika.data[route.path] = resp;
      } else {
        const { get } = await router.currentRoute.value.meta.shadow();
        const resp = await get({ request, params: route.params });
        pika.data[route.path] = await resp.json();
      }
    });
  } else {
    // if (first_visit) {
    //   const id = document.getElementById('__PIKA_DATA__');
    //   if (id && id.textContent) {
    //     pika.data[route.path] = JSON.parse(id.textContent)[route.path];
    //   }
    // } else if (client) {
    //   pika.data[route.path] = await client();
    // } else {
    //   pika.data[route.path] = await fetch(endpoint);
    // }
  }

  return computed(() => pika.data[route.path] || {});
}
