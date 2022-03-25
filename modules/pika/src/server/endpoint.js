import { etag } from './utils.js'

/**
 * @param {Request} request
 * @param {{ [method: string]: import('pika').RequestHandler }} module
 * @returns
 */
export async function response_endpoint(request, module) {
  const method = request.method.toLowerCase()
  let handler = module[method]

  if (!handler && method === 'head') {
    handler = module.get
  }

  if (!handler) return

  const resp = await handler({ request })
  const { headers, body } = resp

  if (
    (typeof body === 'string' || body instanceof Uint8Array) &&
    !headers.has('etag')
  ) {
    const cache_control = headers.get('cache-control')
    if (!cache_control || !/no-store|immutable/.test(cache_control)) {
      headers.set('etag', await etag(body))
    }
  }

  return resp
}
