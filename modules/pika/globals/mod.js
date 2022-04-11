import fetch, { Request, Response, Headers } from 'node-fetch';
import { URLPattern } from 'urlpattern-polyfill';

export function installGlobals() {
  Object.defineProperties(globalThis, {
    fetch: {
      enumerable: true,
      configurable: true,
      value: fetch,
    },
    Response: {
      enumerable: true,
      configurable: true,
      value: Response,
    },
    Request: {
      enumerable: true,
      configurable: true,
      value: Request,
    },
    Headers: {
      enumerable: true,
      configurable: true,
      value: Headers,
    },
    // Making `URLPattern` global here as Deno supports OOTB
    URLPattern: {
      enumerable: true,
      configurable: true,
      value: URLPattern,
    },
  });
}
