const encoder = new TextEncoder();

/**
 * @param {string} pathname
 * @param {boolean} trailing_slash false
 */
export function normalize_route(pathname, trailing_slash = false) {
  pathname = pathname.replace(/\/+/g, '/');
  if (pathname === '/') return pathname;

  if (!trailing_slash) return pathname.replace(/\/$/, '');
  if (trailing_slash && !pathname.endsWith('/')) return pathname + '/';
  return pathname;
}

/**
 * @param {Uint8Array | string} data data to hash
 * @param {string} algo default SHA-1
 */
export async function etag(data, algo = 'SHA-1') {
  data = typeof data === 'string' ? encoder.encode(data) : data;

  let webcrypto;
  if (typeof crypto === 'undefined') {
    webcrypto = (await import('crypto')).webcrypto;
  } else {
    webcrypto = crypto;
  }
  // @ts-expect-error .subtle missing type
  return webcrypto.subtle.digest(algo, data).then((buffer) =>
    Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join(''),
  );
}
