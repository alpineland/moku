/// <reference types="vite/client" />

import './ambient';

/**
 * A function exported from an endpoint which can be either `get` or
 * `post` and handle requests with that method.
 */
export interface RequestHandler {
  ({
    request,
    params,
  }: {
    request: Request;
    params: URLPatternComponentResult['groups'];
  }): Response | Promise<Response>;
}

/**
 * SSRContext that needs to be passed to Vue SSR rendering functions.
 */
export interface SSRContext extends SSRManifest {
  /**
   * The url to be used in `router.push`.
   * Must have the form like `/status?name=ryan`.
   */
  url: string;
}

export interface SSRManifest {
  /**
   * URL to the entry client file.
   */
  entryClient: string;
  /**
   * The html template string
   */
  template: string;
}

type Awaitable<T> = Promise<T> | T;

type EndpointModule = {
  [method: string]: RequestHandler;
};

export interface ServerSettings<T = unknown> {
  matcher: Matcher<T>;
  respondView: RespondView;
  respondEndpoint: RespondEndpoint;
  respondError: RespondError;
  routes: T;
  trailingSlash?: boolean;
}

export interface RespondView {
  (request: Request, ctx: SSRContext): Awaitable<Response>;
}

export interface RespondEndpoint {
  (request: Request, ctx: SSRContext, mod: EndpointModule): Awaitable<Response>;
}

export interface RespondError {
  (request: Request, ctx: SSRContext, error: unknown): Awaitable<Response>;
}

export interface Matcher<T = unknown> {
  (request: Request, routes: T): {
    respondView: RespondView;
    respondEndpoint: RespondEndpoint;
    respondError: RespondError;
    mod: EndpointModule;
  };
}

/**
 * The `start` function exported from `entry.client.js` or `entry.client.ts`.
 * This is used for client side hydration.
 */
export interface StartClient {
  ({ el }: { el: Element }): void;
}

/**
 * The `start` function exported from `entry.server.js` or `entry.server.ts`.
 *
 * This is used to customize the response and beyond.
 */
export interface StartServer {
  ({ request, ssrContext }: { request: Request; ssrContext: SSRContext }):
    | Response
    | Promise<Response>;
}

/**
 * The Pika plugin settings.
 */
export interface PluginSettings {
  /**
   * The app directory.
   *
   * @default 'app'
   */
  appDir?: string;
  /**
   * The routes (views + endpoints) directory.
   *
   * @default 'routes'
   */
  routesDir?: string;
}

export interface ViewFn {
  (): Promise<Response>;
}

export interface EndpointFn {
  (): Promise<Response>;
}

export interface Endpoint {
  pathname: string;
  search: string;
  load: () => Promise<void>;
}
