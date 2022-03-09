import { usePika } from './pika.js'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * @param {string} route
 * @returns
 */
export function useEndpointData(route = useRoute().path) {
  const pika = usePika()

  return computed(() => {
    pika.data[route] || {}
  })
}
