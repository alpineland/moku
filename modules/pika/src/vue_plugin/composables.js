import { response_endpoint } from '../server/endpoint.js'
import { usePika } from './pika.js'
import { computed, onServerPrefetch } from 'vue'
import { useRoute } from 'vue-router'

/**
 * @param {string} [endpoint]
 * @returns
 */
export function useEndpointData(endpoint) {
  const pika = usePika()
  const route = useRoute()

  if (import.meta.env.SSR) {
    onServerPrefetch(async () => {
      for (const match of route.matched) {
        const module = await match.meta.__endpoint(endpoint)
        const resp = await response_endpoint({
          request: new Request('/'),
          module,
        })
        pika.data[route.path] = await resp.json()
      }
    })
  } else {
    pika.data[route.path] = __PIKA__[route.path]
  }

  return computed(() => pika.data[route.path] || {})
}
