const encoder = new TextEncoder()

/**
 * @param {string} pathname
 * @param {boolean} trailing_slash false
 */
export function normalize_route(pathname, trailing_slash = false) {
  if (pathname === '/') return pathname
  const has_trailing_slash = pathname.endsWith('/')

  if (trailing_slash && !has_trailing_slash) return pathname + '/'
  if (!trailing_slash && has_trailing_slash) return pathname.slice(0, -1)
  return pathname
}

/**
 * @param {Uint8Array | string} data data to hash
 * @param {string} algo default SHA-256
 */
export async function etag(data, algo = 'SHA-256') {
  data = typeof data === 'string' ? encoder.encode(data) : data
  return crypto.subtle.digest(algo, data).then((buffer) =>
    Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join(''),
  )
}

export async function serialize_payload(payload) {
  payload = JSON.stringify(payload)
  const data_pika = 'data-pika-' + (await etag(payload))
  return `<script type="application/json" ${data_pika}>${payload}</script>`
}
