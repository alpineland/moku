import { usePika } from './pika.js';
import { computed, onServerPrefetch, ref, useSSRContext } from 'vue';
import { useRoute } from 'vue-router';

export async function useData({ server, client }) {
  const pika = usePika()
  const fetching = ref(false)
  const matched = useRoute().matched

  if (import.meta.env.SSR) {
    const key = matched[pika.data.size].path
    onServerPrefetch(async () => {
      const { request } = useSSRContext()
      fetching.value = true
      const data = await server(request)
      pika.data.set(key, data)
      fetching.value = false
    })
    return { data: computed(() => pika.data.get(key)), fetching }
  } else {
    if (pika.initialLoad) {
      pika.initialLoad = false
      const key = matched[matched.length - pika.data.size].path
      const data = pika.data.get(key)
      pika.data.delete(key)
      return { data, fetching }
    } else {
      fetching.value = true
      const data = await client()
      fetching.value = false
      return { data, fetching }
    }
  }
}
