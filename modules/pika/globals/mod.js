import fetch, { Request, Response, Headers } from 'node-fetch';

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
  });
}
