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

  let webcrypto = crypto
  if (process.version) {
    webcrypto = (await import('node:crypto')).webcrypto;
  }

  return webcrypto.subtle.digest(algo, data).then((buffer) =>
    Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join(''),
  );
}

/**
 * The fnv-1a hash function took from
 * https://deno.land/std@0.140.0/http/file_server.ts#L183
 * @param {string} str
 */
export function fnv1a(str) {
  let hash = 2166136261; // 32-bit FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // Equivalent to `hash *= 16777619` without using BigInt
    // 32-bit FNV prime
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  // 32-bit hex string
  return (hash >>> 0).toString(16);
}
