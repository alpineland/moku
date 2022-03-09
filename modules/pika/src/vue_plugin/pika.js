import { inject } from 'vue'

export const PIKA_KEY = Symbol('Pika')

export function usePika() {
  const pika = inject(PIKA_KEY)
  if (!pika) {
    throw new Error('Failed to inject Pika')
  }
  return pika
}

export function createPika() {
  const pika = {
    data: {},
    install(app) {
      app.provide(PIKA_KEY, this)
    },
  }
  return pika
}
