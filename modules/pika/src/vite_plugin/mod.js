import { dev } from './plugins/dev.js'
import { routes } from './plugins/routes.js'

export function pika() {
  return [dev(), routes()]
}
