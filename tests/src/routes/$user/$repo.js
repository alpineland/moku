/** @type {import('pika').RequestHandler} */
export async function get() {
  return new Response(JSON.stringify('$repo response'), {
    status: 200,
    headers: {
      'content-type': 'text/plain',
    },
  })
}
