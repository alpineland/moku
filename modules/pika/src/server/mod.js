import { normalize_route } from './utils.js'

/**
 * @param {Request} request
 * @param {string} template
 * @returns {Promise<Response>}
 */
export async function respond(request, template) {
  const url = new URL(request.url)
  const normalized = normalize_route(url.pathname)

  if (normalized !== url.pathname) {
    return new Response(undefined, {
      status: 301,
      headers: {
        location: normalized + url.search + url.hash,
      },
    })
  }
}
