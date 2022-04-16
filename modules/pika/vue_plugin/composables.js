import { usePika } from './pika.js';
import { onServerPrefetch, ref, useSSRContext } from 'vue';
import { useRoute } from 'vue-router';

export async function useData() {
  const pika = usePika()
  const fetching = ref(false)
  const data = ref()

  if (import.meta.env.SSR) {
    onServerPrefetch(async () => {
      const { request } = useSSRContext()
      const { shadow } = useRoute().matched[pika.data.length].meta
      const { get } = await shadow()
      fetching.value = true
      data.value = await get(request)
      pika.data.push(data.value)
      fetching.value = false
    })
    return { data, fetching }
  } else {
    if (pika.data.length) {
      data.value = pika.data.shift()
      return { data, fetching }
    } else {
      fetching.value = true
      data.value = await fetch(location.pathname)
      fetching.value = false
      return { data, fetching }
    }
  }
}
