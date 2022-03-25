/// <reference types="vite/client" />

import { RouteParams } from 'vue-router'

export interface RequestHandler {
  ({ request, params }: { request: Request; params: RouteParams }):
    | Response
    | Promise<Response>
}

export interface StartClient {
  ({ el }: { el: Element }): void
}

export interface StartServer {
  ({ request }: { request: Request }): Response | Promise<Response>
}
